// Express server that proxies requests to Google Gemini API
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const axios = require('axios');
const multer = require('multer');
const pdfParse = require('pdf-parse');
const path = require('path');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Allow JSON bodies
app.use(express.json());

// CORS for local development (React default Vite port)
app.use(
  cors({
    origin: [
      'http://localhost:5173',
      'http://127.0.0.1:5173'
    ],
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type']
  })
);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// POST /api/gemini
// body: { prompt: string }
app.post('/api/gemini', async (req, res) => {
  try {
    const { prompt } = req.body || {};
    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({ error: 'Invalid or missing "prompt" in request body.' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'Server misconfiguration: Missing GEMINI_API_KEY.' });
    }

    // Gemini Generative Language API endpoint (v1beta)
    const model = 'gemini-1.5-flash';
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    // Request payload per Gemini API spec
    const payload = {
      contents: [
        {
          parts: [
            { text: prompt }
          ]
        }
      ]
    };

    const response = await axios.post(url, payload, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 30000
    });

    // Extract human-friendly text from Gemini response if available
    let text = '';
    try {
      text = response?.data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    } catch (_) {
      // fall back below
    }

    res.json({
      text: text || 'No text response from the model.',
      raw: response.data
    });
  } catch (err) {
    // Normalize error response
    const status = err.response?.status || 500;
    const message = err.response?.data || err.message || 'Unknown error';
    res.status(status).json({ error: message });
  }
});

// File upload setup (store in memory for simplicity)
const upload = multer({ storage: multer.memoryStorage() });

// Simple text extraction for txt and pdf
async function extractTextFromUpload(file) {
  const ext = path.extname(file.originalname).toLowerCase();
  if (ext === '.txt') {
    return file.buffer.toString('utf8');
  }
  if (ext === '.pdf') {
    const data = await pdfParse(file.buffer);
    return data.text || '';
  }
  throw new Error('Unsupported file type. Please upload .pdf or .txt');
}

// Naive MVP rules for GDPR & HIPAA. Modular structure for easy extension.
const regulations = [
  {
    name: 'GDPR',
    clauses: [
      {
        id: 'GDPR-Article-5',
        title: 'Data minimization & purpose limitation',
        check: (txt) => {
          const t = txt.toLowerCase();
          const hasPurpose = t.includes('purpose');
          const hasMin = t.includes('minimization') || t.includes('minimize');
          return hasPurpose && hasMin;
        },
        remediation: 'State clear purposes and data minimization practices.'
      },
      {
        id: 'GDPR-Article-6',
        title: 'Lawfulness of processing',
        check: (txt) => {
          const lawfulBasis = ['consent', 'contract', 'legal obligation', 'vital interests', 'public task', 'legitimate interests'];
          return lawfulBasis.some(k => txt.toLowerCase().includes(k));
        },
        remediation: 'Specify at least one lawful basis for processing under Article 6.'
      },
      {
        id: 'GDPR-Article-7',
        title: 'Conditions for consent',
        check: (txt) => {
          const t = txt.toLowerCase();
          return t.includes('consent') && (t.includes('withdraw') || t.includes('withdrawal'));
        },
        remediation: 'Include explicit consent language and withdrawal instructions.'
      }
    ]
  },
  {
    name: 'HIPAA',
    clauses: [
      {
        id: 'HIPAA-Privacy',
        title: 'Privacy Rule',
        check: (txt) => {
          const t = txt.toLowerCase();
          return t.includes('protected health information') || t.includes('phi');
        },
        remediation: 'Identify and protect PHI; disclose only as permitted by HIPAA Privacy Rule.'
      },
      {
        id: 'HIPAA-Security',
        title: 'Security Rule',
        check: (txt) => {
          const t = txt.toLowerCase();
          return t.includes('encryption') || t.includes('access control') || t.includes('audit');
        },
        remediation: 'Document administrative, physical, and technical safeguards (e.g., encryption, access controls).'
      },
      {
        id: 'HIPAA-Breach',
        title: 'Breach Notification Rule',
        check: (txt) => {
          const t = txt.toLowerCase();
          return t.includes('breach notification') || (t.includes('breach') && t.includes('notify'));
        },
        remediation: 'Define breach detection and notification processes per HIPAA requirements.'
      }
    ]
  }
];

function analyzeTextAgainstRegulations(text) {
  const findings = [];
  for (const reg of regulations) {
    for (const clause of reg.clauses) {
      const ok = clause.check(text);
      if (!ok) {
        findings.push({
          regulation: reg.name,
          clauseId: clause.id,
          clauseTitle: clause.title,
          remediation: clause.remediation
        });
      }
    }
  }
  return findings;
}

// POST /api/compliance/scan
app.post('/api/compliance/scan', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded. Use multipart/form-data with field "file".' });
    }
    const text = await extractTextFromUpload(req.file);
    const findings = analyzeTextAgainstRegulations(text);
    res.json({
      ok: true,
      totalFindings: findings.length,
      findings
    });
  } catch (err) {
    const status = err.response?.status || 500;
    res.status(status).json({ error: err.message || 'Scan failed' });
  }
});

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});


