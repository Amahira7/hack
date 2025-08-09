import React, { useState } from 'react'

export default function App() {
  const [prompt, setPrompt] = useState('')
  const [responseText, setResponseText] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [file, setFile] = useState(null)
  const [scan, setScan] = useState(null)

  async function handleSubmit(e) {
    e.preventDefault()
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

  async function handleScan(e) {
    e.preventDefault()
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
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="bg-white shadow-lg rounded-xl p-6">
          <h1 className="text-2xl font-semibold text-gray-800">Gemini Prompt UI</h1>
          <p className="text-sm text-gray-500 mt-1">Ask anything, the backend will call Gemini and return the result.</p>

          <form onSubmit={handleSubmit} className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Prompt</label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Type your question or instruction..."
              className="w-full h-32 resize-y rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent p-3 text-gray-800"
            />

            <div className="mt-4 flex gap-3">
              <button
                type="submit"
                disabled={isLoading || !prompt.trim()}
                className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                    </svg>
                    Sending
                  </>
                ) : (
                  'Send'
                )}
              </button>
              <button
                type="button"
                onClick={() => { setPrompt(''); setResponseText(''); setError('') }}
                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Clear
              </button>
            </div>
          </form>

          {error && (
            <div className="mt-6 bg-red-50 border border-red-200 text-red-700 rounded-lg p-4">
              <div className="font-medium">Error</div>
              <div className="text-sm mt-1">{error}</div>
            </div>
          )}

          {responseText && (
            <div className="mt-6 bg-gray-50 border border-gray-200 rounded-lg p-4">
              <div className="font-medium text-gray-800">Response</div>
              <pre className="whitespace-pre-wrap text-gray-700 text-sm mt-2">{responseText}</pre>
            </div>
          )}
        </div>
        
        <div className="bg-white shadow-lg rounded-xl p-6 mt-6">
          <h2 className="text-xl font-semibold text-gray-800">Automation Compliance Checker (MVP)</h2>
          <p className="text-sm text-gray-500 mt-1">Upload a .pdf or .txt file to scan for basic GDPR and HIPAA compliance elements.</p>

          <form onSubmit={handleScan} className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Upload document</label>
            <input
              type="file"
              accept=".pdf,.txt"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="block w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />

            <div className="mt-4 flex gap-3">
              <button
                type="submit"
                disabled={isLoading || !file}
                className="inline-flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                    </svg>
                    Scanning
                  </>
                ) : (
                  'Scan for Compliance'
                )}
              </button>
              <button
                type="button"
                onClick={() => { setFile(null); setScan(null); setError('') }}
                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Clear
              </button>
            </div>
          </form>

          {scan && (
            <div className="mt-6">
              <div className="text-gray-800 font-medium">Findings</div>
              {scan.totalFindings === 0 ? (
                <div className="mt-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-lg p-4">
                  No issues detected by the MVP rules.
                </div>
              ) : (
                <div className="mt-3 overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="text-left bg-gray-100 text-gray-700">
                        <th className="p-2">Regulation</th>
                        <th className="p-2">Clause</th>
                        <th className="p-2">Title</th>
                        <th className="p-2">Recommended Fix</th>
                      </tr>
                    </thead>
                    <tbody>
                      {scan.findings.map((f, idx) => (
                        <tr key={idx} className="border-b border-gray-100">
                          <td className="p-2 font-medium">{f.regulation}</td>
                          <td className="p-2">{f.clauseId}</td>
                          <td className="p-2">{f.clauseTitle}</td>
                          <td className="p-2 text-gray-700">{f.remediation}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>

        <p className="text-xs text-gray-400 mt-3 text-center">Backend routes are proxied from the client to the Express server at <code>/api</code>.</p>
      </div>
    </div>
  )
}


