'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase-client'
import { debugAuth } from '@/lib/debug-auth'

export default function AuthTestPage() {
  const [clientAuth, setClientAuth] = useState<any>(null)
  const [serverAuth, setServerAuth] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const testAuth = async () => {
      // Test client-side auth
      const supabase = createClient()
      const { data: { user: clientUser }, error: clientError } = await supabase.auth.getUser()
      const { data: { session: clientSession } } = await supabase.auth.getSession()
      
      setClientAuth({
        user: clientUser ? { id: clientUser.id, email: clientUser.email } : null,
        hasSession: !!clientSession,
        error: clientError?.message
      })

      // Test server-side auth
      try {
        const serverResult = await debugAuth()
        setServerAuth(serverResult)
      } catch (error) {
        setServerAuth({ error: 'Server auth check failed' })
      }

      setLoading(false)
    }

    testAuth()
  }, [])

  if (loading) {
    return <div className="p-8">Loading auth test...</div>
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Authentication Debug</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-blue-50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4 text-blue-800">Client-Side Auth</h2>
          <pre className="text-sm bg-white p-4 rounded border overflow-auto">
            {JSON.stringify(clientAuth, null, 2)}
          </pre>
        </div>

        <div className="bg-green-50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4 text-green-800">Server-Side Auth</h2>
          <pre className="text-sm bg-white p-4 rounded border overflow-auto">
            {JSON.stringify(serverAuth, null, 2)}
          </pre>
        </div>
      </div>

      <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
        <h3 className="font-semibold text-yellow-800 mb-2">What to Check:</h3>
        <ul className="text-sm text-yellow-700 space-y-1">
          <li>• Both client and server should show the same user</li>
          <li>• Both should have hasSession: true</li>
          <li>• If they differ, there's a cookie/session sync issue</li>
          <li>• If both are null, you need to log in first</li>
        </ul>
      </div>
    </div>
  )
}
