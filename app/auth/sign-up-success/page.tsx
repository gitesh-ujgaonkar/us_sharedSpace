'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'

export default function SignUpSuccessPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkEmailConfirmation = async () => {
      const supabase = createClient()
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (session) {
        router.push('/dashboard')
      } else {
        setLoading(false)
      }
    }

    checkEmailConfirmation()
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-400 mx-auto mb-4"></div>
          <p className="text-slate-600">Checking email confirmation...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-slate-50 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-3xl shadow-lg p-8 text-center">
          <div className="mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-rose-100 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-slate-800">Check your email</h2>
          </div>

          <p className="text-slate-600 mb-8">
            We've sent you a confirmation link. Please check your email and click the link to verify your account.
          </p>

          <Button
            onClick={() => router.push('/auth/login')}
            className="w-full bg-gradient-to-r from-rose-400 to-pink-400 hover:from-rose-500 hover:to-pink-500 text-white font-semibold py-3 rounded-lg"
          >
            Back to Login
          </Button>
        </div>
      </div>
    </div>
  )
}
