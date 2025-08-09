import React, { useState } from 'react'

export default function App() {
  const [prompt, setPrompt] = useState('')
  const [responseText, setResponseText] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [file, setFile] = useState(null)
  const [scan, setScan] = useState(null)

  async function handleSubmit() {
    if (!prompt.trim()) return
    
    setIsLoading(true)
    setError('')
    setResponseText('')
    try {
      const res = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      })
      const data = await res.json()
      if (!res.ok) {
        const msg = typeof data?.error === 'string' ? data.error : 'Request failed'
        throw new Error(msg)
      }
      setResponseText(data?.text || JSON.stringify(data, null, 2))
    } catch (err) {
      setError(err.message || 'Unknown error')
    } finally {
      setIsLoading(false)
    }
  }

  async function handleScan() {
    if (!file) {
      setError('Please choose a .pdf or .txt file to scan')
      return
    }
    setIsLoading(true)
    setError('')
    setScan(null)
    try {
      const form = new FormData()
      form.append('file', file)
      const res = await fetch('/api/compliance/scan', {
        method: 'POST',
        body: form
      })
      const data = await res.json()
      if (!res.ok) {
        const msg = typeof data?.error === 'string' ? data.error : 'Scan failed'
        throw new Error(msg)
      }
      setScan(data)
    } catch (err) {
      setError(err.message || 'Unknown error')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 shadow-2xl">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-lg">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white tracking-tight">Compliance Suite</h1>
              <p className="text-slate-300 text-lg mt-1">AI-Powered Regulatory Analysis & Document Processing</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Gemini AI Section */}
          <div className="bg-white/70 backdrop-blur-sm shadow-xl rounded-2xl border border-slate-200/60 overflow-hidden">
            <div className="bg-gradient-to-r from-teal-500 to-emerald-500 px-8 py-6">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">AI Assistant</h2>
                  <p className="text-teal-100 text-sm">Powered by Gemini AI</p>
                </div>
              </div>
            </div>

            <div className="p-8">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-3">
                    Query or Instruction
                  </label>
                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Ask about regulations, compliance requirements, or any legal questions..."
                    className="w-full h-32 resize-none rounded-xl border-2 border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent p-4 text-slate-800 bg-slate-50/50 transition-all duration-200"
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={handleSubmit}
                    disabled={isLoading || !prompt.trim()}
                    className="flex-1 inline-flex items-center justify-center gap-2 bg-gradient-to-r from-teal-500 to-emerald-500 text-white px-6 py-3 rounded-xl hover:from-teal-600 hover:to-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                  >
                    {isLoading ? (
                      <>
                        <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                        </svg>
                        Processing...
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                        Send Query
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => { setPrompt(''); setResponseText(''); setError('') }}
                    className="px-6 py-3 rounded-xl border-2 border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300 font-medium transition-all duration-200"
                  >
                    Clear
                  </button>
                </div>
              </div>

              {error && (
                <div className="mt-6 bg-red-50 border-l-4 border-red-400 text-red-700 rounded-lg p-4">
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div className="font-semibold">Error</div>
                  </div>
                  <div className="text-sm mt-1 ml-7">{error}</div>
                </div>
              )}

              {responseText && (
                <div className="mt-6 bg-gradient-to-r from-slate-50 to-slate-100/80 border border-slate-200 rounded-xl p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <svg className="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <div className="font-semibold text-slate-800">AI Response</div>
                  </div>
                  <div className="bg-white rounded-lg p-4 border border-slate-200">
                    <pre className="whitespace-pre-wrap text-slate-700 text-sm leading-relaxed font-mono">{responseText}</pre>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Compliance Scanner Section */}
          <div className="bg-white/70 backdrop-blur-sm shadow-xl rounded-2xl border border-slate-200/60 overflow-hidden">
            <div className="bg-gradient-to-r from-emerald-500 to-teal-500 px-8 py-6">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.031 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Compliance Scanner</h2>
                  <p className="text-emerald-100 text-sm">GDPR & HIPAA Analysis</p>
                </div>
              </div>
            </div>

            <div className="p-8">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-3">
                    Document Upload
                  </label>
                  <div className="relative">
                    <input
                      type="file"
                      accept=".pdf,.txt"
                      onChange={(e) => setFile(e.target.files?.[0] || null)}
                      className="block w-full text-sm text-slate-700 file:mr-4 file:py-3 file:px-6 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-gradient-to-r file:from-emerald-50 file:to-teal-50 file:text-emerald-700 hover:file:from-emerald-100 hover:file:to-teal-100 border-2 border-slate-200 rounded-xl bg-slate-50/50 p-3 transition-all duration-200"
                    />
                  </div>
                  <p className="text-xs text-slate-500 mt-2">Supported formats: PDF, TXT (Max 10MB)</p>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={handleScan}
                    disabled={isLoading || !file}
                    className="flex-1 inline-flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-6 py-3 rounded-xl hover:from-emerald-600 hover:to-teal-600 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                  >
                    {isLoading ? (
                      <>
                        <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                        </svg>
                        Scanning...
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Start Scan
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => { setFile(null); setScan(null); setError('') }}
                    className="px-6 py-3 rounded-xl border-2 border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300 font-medium transition-all duration-200"
                  >
                    Clear
                  </button>
                </div>
              </div>

              {scan && (
                <div className="mt-8">
                  <div className="flex items-center gap-2 mb-4">
                    <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    <h3 className="text-lg font-semibold text-slate-800">Scan Results</h3>
                  </div>
                  
                  {scan.totalFindings === 0 ? (
                    <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border-2 border-emerald-200 text-emerald-800 rounded-xl p-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                          <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <div>
                          <div className="font-semibold text-lg">All Clear!</div>
                          <div className="text-emerald-700">No compliance issues detected by our analysis rules.</div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-white rounded-xl border-2 border-slate-200 overflow-hidden shadow-sm">
                      <div className="bg-gradient-to-r from-amber-50 to-orange-50 px-6 py-4 border-b border-slate-200">
                        <div className="flex items-center gap-2">
                          <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                          </svg>
                          <span className="font-semibold text-amber-800">
                            {scan.totalFindings} Issue{scan.totalFindings > 1 ? 's' : ''} Found
                          </span>
                        </div>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="min-w-full text-sm">
                          <thead className="bg-slate-50">
                            <tr className="text-left text-slate-700 font-semibold">
                              <th className="px-6 py-4">Regulation</th>
                              <th className="px-6 py-4">Clause</th>
                              <th className="px-6 py-4">Title</th>
                              <th className="px-6 py-4">Recommended Fix</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-200">
                            {scan.findings.map((f, idx) => (
                              <tr key={idx} className="hover:bg-slate-50 transition-colors">
                                <td className="px-6 py-4 font-semibold text-slate-800">
                                  <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                                    f.regulation === 'GDPR' 
                                      ? 'bg-blue-100 text-blue-800' 
                                      : 'bg-purple-100 text-purple-800'
                                  }`}>
                                    {f.regulation}
                                  </span>
                                </td>
                                <td className="px-6 py-4 text-slate-600 font-mono">{f.clauseId}</td>
                                <td className="px-6 py-4 text-slate-800 font-medium">{f.clauseTitle}</td>
                                <td className="px-6 py-4 text-slate-700">{f.remediation}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-16 pt-8 border-t border-slate-200">
          <div className="text-center">
            <p className="text-sm text-slate-500">
              Backend services are proxied through <code className="bg-slate-100 px-2 py-1 rounded text-slate-700">/api</code> endpoints
            </p>
            <div className="flex items-center justify-center gap-6 mt-4">
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                <span>GDPR Compliant</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <div className="w-2 h-2 bg-teal-400 rounded-full"></div>
                <span>HIPAA Ready</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <div className="w-2 h-2 bg-slate-400 rounded-full"></div>
                <span>AI Powered</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}