'use client'

import { useState, useEffect } from 'react'
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import AdminHeader from "@/components/AdminHeader"

export default function OAuthSettingsPage() {
  const [settings, setSettings] = useState([
    { provider: 'GOOGLE', isEnabled: false, clientId: '', clientSecret: '' },
    { provider: 'FACEBOOK', isEnabled: false, clientId: '', clientSecret: '' },
    { provider: 'APPLE', isEnabled: false, clientId: '', clientSecret: '' }
  ])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [userName, setUserName] = useState('')

  useEffect(() => {
    checkAuth()
    fetchSettings()
  }, [])

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/session')
      const session = await response.json()
      if (!session || session.user?.role !== "ADMIN") {
        redirect("/")
      }
      setUserName(session.user?.name || '')
    } catch {
      redirect("/")
    }
  }

  const fetchSettings = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/settings/oauth')
      const data = await response.json()
      if (data.settings) {
        setSettings(data.settings)
      }
    } catch (error) {
      console.error('Failed to fetch OAuth settings:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    setSuccess(false)

    try {
      const response = await fetch('/api/admin/settings/oauth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings })
      })

      const data = await response.json()
      console.log('API Response:', data)

      if (!response.ok) {
        throw new Error(data.error || data.details || 'Failed to save settings')
      }

      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err: any) {
      console.error('Save error:', err)
      setError(err.message || 'Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  const updateSetting = (index: number, field: string, value: any) => {
    const newSettings = [...settings]
    newSettings[index] = { ...newSettings[index], [field]: value }
    setSettings(newSettings)
  }

  if (loading) {
    return <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <AdminHeader userName={userName} />

      {/* OAuth Settings Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <a href="/admin/settings" className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition">
            ← Back to Settings
          </a>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">OAuth Provider Settings</h1>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 px-4 py-3 rounded-lg mb-6">
            OAuth settings saved successfully!
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {settings.map((setting, index) => (
            <div key={setting.provider} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center text-2xl">
                    {setting.provider === 'GOOGLE' && '🔵'}
                    {setting.provider === 'FACEBOOK' && '📘'}
                    {setting.provider === 'APPLE' && '🍎'}
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {setting.provider}
                  </h2>
                </div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={setting.isEnabled}
                    onChange={(e) => updateSetting(index, 'isEnabled', e.target.checked)}
                    className="w-5 h-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {setting.isEnabled ? 'Enabled' : 'Disabled'}
                  </span>
                </label>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Client ID
                  </label>
                  <input
                    type="text"
                    value={setting.clientId || ''}
                    onChange={(e) => updateSetting(index, 'clientId', e.target.value)}
                    disabled={!setting.isEnabled}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-600 disabled:cursor-not-allowed"
                    placeholder={`Enter ${setting.provider} Client ID`}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Client Secret
                  </label>
                  <input
                    type="password"
                    value={setting.clientSecret || ''}
                    onChange={(e) => updateSetting(index, 'clientSecret', e.target.value)}
                    disabled={!setting.isEnabled}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-600 disabled:cursor-not-allowed"
                    placeholder={`Enter ${setting.provider} Client Secret`}
                  />
                </div>
              </div>

              <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="text-sm text-blue-800 dark:text-blue-300">
                  <strong>Setup Instructions:</strong>
                </p>
                <ul className="text-sm text-blue-700 dark:text-blue-400 mt-2 space-y-1">
                  {setting.provider === 'GOOGLE' && (
                    <>
                      <li>1. Go to Google Cloud Console</li>
                      <li>2. Create OAuth 2.0 credentials</li>
                      <li>3. Add redirect URI: {window.location.origin}/api/auth/callback/google</li>
                    </>
                  )}
                  {setting.provider === 'FACEBOOK' && (
                    <>
                      <li>1. Go to Facebook Developer Portal</li>
                      <li>2. Create a new app</li>
                      <li>3. Add Facebook Login product</li>
                      <li>4. Add redirect URI: {window.location.origin}/api/auth/callback/facebook</li>
                    </>
                  )}
                  {setting.provider === 'APPLE' && (
                    <>
                      <li>1. Go to Apple Developer Portal</li>
                      <li>2. Create App ID with Sign in with Apple</li>
                      <li>3. Add redirect URI: {window.location.origin}/api/auth/callback/apple</li>
                      <li>4. Note: Apple requires HTTPS in production</li>
                    </>
                  )}
                </ul>
              </div>
            </div>
          ))}

          <div>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Saving...' : 'Save OAuth Settings'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
