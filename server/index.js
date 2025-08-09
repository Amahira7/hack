// Express server that proxies requests to Google Gemini API
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const axios = require('axios');

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

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});


