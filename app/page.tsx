'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function LandingPage() {
  const router = useRouter()

  useEffect(() => {
    // Check if already logged in
    const checkAuth = async () => {
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        router.push('/dashboard')
      }
    }

    checkAuth()
  }, [router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-slate-50 to-blue-50">
      {/* Navigation */}
      <nav className="flex justify-between items-center px-6 py-4 max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-rose-400 to-blue-400 bg-clip-text text-transparent">
          Us
        </h1>
        <div className="flex gap-4">
          <Link href="/auth/login">
            <Button variant="outline" className="rounded-lg border-rose-200 text-slate-700 hover:bg-rose-50">
              Sign In
            </Button>
          </Link>
          <Link href="/auth/sign-up">
            <Button className="bg-gradient-to-r from-rose-400 to-pink-400 hover:from-rose-500 hover:to-pink-500 text-white rounded-lg">
              Get Started
            </Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-6xl mx-auto px-6 py-20 text-center">
        <h2 className="text-5xl md:text-6xl font-bold text-slate-800 mb-6 leading-tight">
          Share memories,{' '}
          <span className="bg-gradient-to-r from-rose-400 to-blue-400 bg-clip-text text-transparent">
            stay connected
          </span>
        </h2>
        <p className="text-xl text-slate-600 mb-12 max-w-2xl mx-auto">
          Us is the intimate space for couples to cherish memories, send love, and stay present with each other. Every moment matters.
        </p>
        <Link href="/auth/sign-up">
          <Button className="bg-gradient-to-r from-rose-400 to-pink-400 hover:from-rose-500 hover:to-pink-500 text-white px-8 py-4 text-lg rounded-lg">
            Start Your Journey Together
          </Button>
        </Link>
      </div>

      {/* Features Grid */}
      <div className="max-w-6xl mx-auto px-6 py-20">
        <h3 className="text-3xl font-bold text-slate-800 text-center mb-16">Why couples love Us</h3>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <div className="bg-white rounded-3xl shadow-lg p-8 hover:shadow-xl transition">
            <div className="w-16 h-16 bg-gradient-to-br from-rose-100 to-pink-100 rounded-2xl flex items-center justify-center mb-6">
              <svg className="w-8 h-8 text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <h4 className="text-xl font-bold text-slate-800 mb-3">Create Moments</h4>
            <p className="text-slate-600">
              Capture memories together with emotional context. Every moment deserves to be cherished.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="bg-white rounded-3xl shadow-lg p-8 hover:shadow-xl transition">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-2xl flex items-center justify-center mb-6">
              <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h-2m2 0h2m-2 0v2m0-2v-2m6 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h4 className="text-xl font-bold text-slate-800 mb-3">Feel the Connection</h4>
            <p className="text-slate-600">
              See when your partner is online and send them a nudge. Presence that matters.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="bg-white rounded-3xl shadow-lg p-8 hover:shadow-xl transition">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl flex items-center justify-center mb-6">
              <svg className="w-8 h-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h4 className="text-xl font-bold text-slate-800 mb-3">Daily Reveals</h4>
            <p className="text-slate-600">
              Rediscover your memories each day. A special moment from your story, waiting to surprise you.
            </p>
          </div>
        </div>
      </div>

      {/* Social Proof */}
      <div className="max-w-6xl mx-auto px-6 py-20 text-center">
        <h3 className="text-2xl font-bold text-slate-800 mb-12">Loved by couples everywhere</h3>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            { name: 'Sarah & Alex', quote: 'Us helped us reconnect during busy times.' },
            { name: 'Emma & James', quote: 'Our memories are safe and beautifully preserved here.' },
            { name: 'Lily & David', quote: 'The nudges make me smile every single day.' },
          ].map((testimonial, i) => (
            <div key={i} className="bg-white rounded-2xl p-6">
              <p className="text-slate-600 mb-4">"{testimonial.quote}"</p>
              <p className="font-semibold text-slate-800">{testimonial.name}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-br from-rose-400 to-pink-400 rounded-3xl max-w-4xl mx-auto px-8 py-16 text-center mb-20">
        <h3 className="text-3xl font-bold text-white mb-6">Ready to treasure your moments?</h3>
        <p className="text-white text-lg mb-8">Join thousands of couples connecting on a deeper level.</p>
        <Link href="/auth/sign-up">
          <Button className="bg-white text-rose-500 hover:bg-rose-50 px-8 py-4 text-lg rounded-lg font-semibold">
            Create Your Room
          </Button>
        </Link>
      </div>

      {/* Footer */}
      <footer className="border-t border-rose-100 py-8 text-center text-slate-600 max-w-6xl mx-auto">
        <p>Made with love for couples. © 2024 Us.</p>
      </footer>
    </div>
  )
}
