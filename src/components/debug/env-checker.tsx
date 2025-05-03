'use client'

import { useEffect, useState } from 'react'

export function EnvChecker() {
  const [envVars, setEnvVars] = useState<Record<string, boolean>>({})
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    // Confirm we're on the client
    setIsClient(true)
    
    // Check Firebase environment variables
    const firebaseVars = {
      'NEXT_PUBLIC_FIREBASE_API_KEY': !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN': !!process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      'NEXT_PUBLIC_FIREBASE_PROJECT_ID': !!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET': !!process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID': !!process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      'NEXT_PUBLIC_FIREBASE_APP_ID': !!process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
      'NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID': !!process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
    }
    
    setEnvVars(firebaseVars)
    
    // Log to console for debugging
    console.log('Environment check:', firebaseVars)
  }, [])

  if (!isClient) {
    return <div>Loading environment check...</div>
  }

  return (
    <div className="p-4 my-4 border rounded-md bg-background">
      <h2 className="text-lg font-bold mb-2">Firebase Environment Variables Check</h2>
      <div className="space-y-1">
        {Object.entries(envVars).map(([key, isDefined]) => (
          <div key={key} className="flex items-center">
            <span className="font-mono text-sm">{key}: </span>
            <span className={`ml-2 px-2 py-0.5 text-xs rounded ${isDefined ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {isDefined ? 'Defined' : 'Not defined'}
            </span>
          </div>
        ))}
      </div>
      <div className="mt-4 text-sm text-gray-500">
        <p>Next.js Environment: {process.env.NODE_ENV}</p>
        <p className="mt-1">Note: This component only checks if the variables are defined in the browser environment.</p>
      </div>
    </div>
  )
}

