'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'

interface Memory {
  id: string
  content: string
  emotion: string
  created_by: string
  created_at: string
}

interface DailyMemoryRevealProps {
  roomId: string
  onClose: () => void
}

export function DailyMemoryReveal({ roomId, onClose }: DailyMemoryRevealProps) {
  const [memory, setMemory] = useState<Memory | null>(null)
  const [loading, setLoading] = useState(true)
  const [hasRevealed, setHasRevealed] = useState(false)

  useEffect(() => {
    const fetchDailyMemory = async () => {
      // Check if user has already revealed today's memory
      const today = new Date().toDateString()
      const revealedKey = `memory-revealed-${roomId}-${today}`
      const alreadyRevealed = localStorage.getItem(revealedKey)

      if (alreadyRevealed) {
        setHasRevealed(true)
        setLoading(false)
        return
      }

      const supabase = createClient()

      // Fetch all memories from this room
      const { data: memories } = await supabase
        .from('memories')
        .select('*')
        .eq('room_id', roomId)
        .not('revealed_at', 'is', null)
        .order('created_at', { ascending: false })

      if (memories && memories.length > 0) {
        // Get a random memory
        const randomIndex = Math.floor(Math.random() * memories.length)
        const selectedMemory = memories[randomIndex]
        setMemory(selectedMemory)
      }

      setLoading(false)
    }

    fetchDailyMemory()
  }, [roomId])

  const handleReveal = async () => {
    if (!memory) return

    const supabase = createClient()

    // Mark memory as revealed today
    await supabase
      .from('memories')
      .update({ revealed_at: new Date().toISOString() })
      .eq('id', memory.id)

    // Store reveal date in localStorage
    const today = new Date().toDateString()
    const revealedKey = `memory-revealed-${roomId}-${today}`
    localStorage.setItem(revealedKey, 'true')

    setHasRevealed(true)
  }

  if (loading) {
    return null
  }

  if (hasRevealed || !memory) {
    return null
  }

  const emotionColors: { [key: string]: string } = {
    happy: 'from-yellow-300 to-yellow-400',
    excited: 'from-orange-300 to-orange-400',
    grateful: 'from-green-300 to-green-400',
    loved: 'from-rose-300 to-rose-400',
    peaceful: 'from-blue-300 to-blue-400',
  }

  const emotionBgColors: { [key: string]: string } = {
    happy: 'bg-yellow-50',
    excited: 'bg-orange-50',
    grateful: 'bg-green-50',
    loved: 'bg-rose-50',
    peaceful: 'bg-blue-50',
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div
        className={`bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full ${emotionBgColors[memory.emotion] || 'bg-rose-50'}`}
      >
        <div className="text-center">
          <div className="mb-6">
            <div
              className={`inline-block bg-gradient-to-br ${emotionColors[memory.emotion] || 'from-rose-300 to-rose-400'} rounded-full px-6 py-2`}
            >
              <p className="text-sm font-bold text-white capitalize">
                {memory.emotion} Memory
              </p>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-slate-800 mb-4">
            A Memory From {new Date(memory.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
          </h2>

          <div className="bg-white rounded-2xl p-6 mb-6">
            <p className="text-slate-700 leading-relaxed text-lg">
              "{memory.content}"
            </p>
          </div>

          <p className="text-slate-600 text-sm mb-8">
            From {new Date(memory.created_at).toLocaleDateString()}
          </p>

          <div className="flex gap-4">
            <Button
              onClick={handleReveal}
              className={`flex-1 bg-gradient-to-r ${emotionColors[memory.emotion] || 'from-rose-400 to-pink-400'} hover:opacity-90 text-white font-semibold py-3 rounded-lg`}
            >
              Cherish This
            </Button>
            <Button
              onClick={onClose}
              variant="outline"
              className="flex-1 rounded-lg border-slate-200"
            >
              Maybe Later
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
