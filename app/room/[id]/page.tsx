'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Link from 'next/link'
import { DailyMemoryReveal } from '@/components/daily-memory-reveal'

interface Room {
  id: string
  name: string
  join_code: string
  created_by: string
}

interface RoomMember {
  user_id: string
  joined_at: string
}

interface Presence {
  user_id: string
  is_online: boolean
  last_seen: string
}

interface Memory {
  id: string
  content: string
  emotion: string
  created_by: string
  created_at: string
  revealed_at: string | null
}

interface User {
  id: string
  user_metadata?: {
    username?: string
  }
}

export default function RoomPage() {
  const router = useRouter()
  const params = useParams()
  const roomId = params.id as string

  const [user, setUser] = useState<User | null>(null)
  const [room, setRoom] = useState<Room | null>(null)
  const [members, setMembers] = useState<RoomMember[]>([])
  const [presence, setPresence] = useState<Presence[]>([])
  const [memories, setMemories] = useState<Memory[]>([])
  const [loading, setLoading] = useState(true)
  const [newMemory, setNewMemory] = useState('')
  const [selectedEmotion, setSelectedEmotion] = useState('happy')
  const [showNudge, setShowNudge] = useState(false)
  const [showDailyReveal, setShowDailyReveal] = useState(false)

  const supabase = createClient()
  const emotions = ['happy', 'excited', 'grateful', 'loved', 'peaceful']

  useEffect(() => {
    const initRoom = async () => {
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser()

      if (!authUser) {
        router.push('/auth/login')
        return
      }

      setUser(authUser)

      // Fetch room
      const { data: roomData } = await supabase
        .from('rooms')
        .select('*')
        .eq('id', roomId)
        .single()

      if (roomData) {
        setRoom(roomData)
      }

      // Fetch members
      const { data: membersData } = await supabase
        .from('room_members')
        .select('*')
        .eq('room_id', roomId)

      if (membersData) {
        setMembers(membersData)
      }

      // Fetch memories
      await fetchMemories()

      // Show daily reveal if not already shown
      const today = new Date().toDateString()
      const revealKey = `daily-reveal-shown-${roomId}-${today}`
      if (!localStorage.getItem(revealKey)) {
        setShowDailyReveal(true)
        localStorage.setItem(revealKey, 'true')
      }

      // Set user online
      await supabase.from('presence').upsert(
        {
          user_id: authUser.id,
          room_id: roomId,
          is_online: true,
          last_seen: new Date().toISOString(),
        },
        { onConflict: 'user_id,room_id' }
      )

      // Fetch presence
      await fetchPresence()

      // Subscribe to real-time updates
      const channel = supabase
        .channel(`room:${roomId}`)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'memories' }, () => {
          fetchMemories()
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'presence' }, () => {
          fetchPresence()
        })
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'nudges' }, (payload) => {
          if (payload.new.to_user_id === authUser.id) {
            setShowNudge(true)
            setTimeout(() => setShowNudge(false), 3000)
          }
        })
        .subscribe()

      setLoading(false)

      return () => {
        supabase.removeChannel(channel)
      }
    }

    initRoom()
  }, [roomId])

  const fetchMemories = async () => {
    const { data } = await supabase
      .from('memories')
      .select('*')
      .eq('room_id', roomId)
      .order('created_at', { ascending: false })

    setMemories(data || [])
  }

  const fetchPresence = async () => {
    const { data } = await supabase
      .from('presence')
      .select('*')
      .eq('room_id', roomId)

    setPresence(data || [])
  }

  const handleAddMemory = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user || !newMemory.trim()) return

    await supabase.from('memories').insert({
      room_id: roomId,
      created_by: user.id,
      content: newMemory,
      emotion: selectedEmotion,
    })

    setNewMemory('')
    await fetchMemories()
  }

  const handleNudge = async (toUserId: string) => {
    if (!user) return

    await supabase.from('nudges').insert({
      room_id: roomId,
      from_user_id: user.id,
      to_user_id: toUserId,
    })
  }

  const getPartnerPresence = () => {
    if (!user) return false
    const partnerPresence = presence.find((p) => p.user_id !== user.id)
    return partnerPresence?.is_online || false
  }

  const getPartner = () => {
    if (!user) return null
    return members.find((m) => m.user_id !== user.id)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-400 mx-auto mb-4"></div>
        </div>
      </div>
    )
  }

  const partnerOnline = getPartnerPresence()
  const partner = getPartner()

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-slate-50 to-blue-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <Link href="/dashboard" className="text-rose-400 hover:text-rose-500 font-semibold flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </Link>
          <h1 className="text-3xl font-bold text-slate-800">{room?.name}</h1>
          <div className="w-12"></div>
        </div>

        <div className="grid gap-6">
          {/* Partner Status Card */}
          {partner && (
            <div className="bg-white rounded-3xl shadow-lg p-8">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-slate-800 mb-2">Your Partner</h2>
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-4 h-4 rounded-full ${
                        partnerOnline ? 'bg-green-400' : 'bg-slate-300'
                      }`}
                    ></div>
                    <p className="text-slate-600">
                      {partnerOnline ? 'Online now' : 'Offline'}
                    </p>
                  </div>
                </div>
                {partnerOnline && (
                  <Button
                    onClick={() => handleNudge(partner.user_id)}
                    className="bg-gradient-to-r from-yellow-300 to-orange-300 hover:from-yellow-400 hover:to-orange-400 text-slate-800 font-semibold rounded-2xl px-6 py-3 animate-bounce"
                  >
                    💛 Nudge
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* Add Memory Card */}
          <div className="bg-white rounded-3xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-slate-800 mb-6">Add a Memory</h2>
            <form onSubmit={handleAddMemory} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  What are you thinking about?
                </label>
                <textarea
                  value={newMemory}
                  onChange={(e) => setNewMemory(e.target.value)}
                  placeholder="Share a sweet moment..."
                  rows={4}
                  className="w-full px-4 py-3 rounded-lg border border-rose-200 focus:border-rose-400 focus:ring-2 focus:ring-rose-200 resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-3">
                  How does this make you feel?
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {emotions.map((emotion) => (
                    <button
                      key={emotion}
                      type="button"
                      onClick={() => setSelectedEmotion(emotion)}
                      className={`py-2 px-3 rounded-lg font-medium text-sm transition capitalize ${
                        selectedEmotion === emotion
                          ? 'bg-rose-400 text-white shadow-lg'
                          : 'bg-rose-100 text-slate-700 hover:bg-rose-200'
                      }`}
                    >
                      {emotion}
                    </button>
                  ))}
                </div>
              </div>

              <Button
                type="submit"
                disabled={!newMemory.trim()}
                className="w-full bg-gradient-to-r from-rose-400 to-pink-400 hover:from-rose-500 hover:to-pink-500 text-white font-semibold py-3 rounded-lg disabled:opacity-50"
              >
                Save Memory
              </Button>
            </form>
          </div>

          {/* Memories Feed */}
          <div className="bg-white rounded-3xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-slate-800 mb-6">Memories</h2>
            {memories.length === 0 ? (
              <p className="text-slate-600 text-center py-8">No memories yet. Start adding them!</p>
            ) : (
              <div className="space-y-4">
                {memories.map((memory) => (
                  <div
                    key={memory.id}
                    className="bg-gradient-to-br from-rose-50 to-blue-50 rounded-2xl p-6 border border-rose-100"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <span className="text-sm font-medium text-slate-600">
                        {new Date(memory.created_at).toLocaleDateString()}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${
                        memory.emotion === 'happy'
                          ? 'bg-yellow-100 text-yellow-700'
                          : memory.emotion === 'excited'
                          ? 'bg-orange-100 text-orange-700'
                          : memory.emotion === 'grateful'
                          ? 'bg-green-100 text-green-700'
                          : memory.emotion === 'loved'
                          ? 'bg-rose-100 text-rose-700'
                          : 'bg-blue-100 text-blue-700'
                      }`}>
                        {memory.emotion}
                      </span>
                    </div>
                    <p className="text-slate-700">{memory.content}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Nudge Animation */}
      {showNudge && (
        <div className="fixed bottom-8 right-8 animate-bounce">
          <div className="bg-gradient-to-br from-yellow-300 to-orange-300 rounded-full w-20 h-20 flex items-center justify-center text-4xl shadow-xl">
            💛
          </div>
        </div>
      )}

      {/* Daily Memory Reveal */}
      {showDailyReveal && (
        <DailyMemoryReveal roomId={roomId} onClose={() => setShowDailyReveal(false)} />
      )}
    </div>
  )
}
