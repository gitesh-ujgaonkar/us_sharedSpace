'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Link from 'next/link'

interface Room {
  id: string
  name: string
  join_code: string
  created_by: string
  created_at: string
}

interface User {
  id: string
  user_metadata?: {
    username?: string
  }
}

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [rooms, setRooms] = useState<Room[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateRoom, setShowCreateRoom] = useState(false)
  const [showJoinRoom, setShowJoinRoom] = useState(false)
  const [newRoomName, setNewRoomName] = useState('')
  const [joinCode, setJoinCode] = useState('')
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient()

  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser()

      if (!authUser) {
        router.push('/auth/login')
      } else {
        setUser(authUser)
        await fetchRooms()
      }
      setLoading(false)
    }

    checkAuth()
  }, [router])

  const fetchRooms = async () => {
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser()

    if (!authUser) return

    const { data: roomMembers } = await supabase
      .from('room_members')
      .select('room_id')
      .eq('user_id', authUser.id)

    if (roomMembers && roomMembers.length > 0) {
      const roomIds = roomMembers.map((rm) => rm.room_id)
      const { data: roomsData } = await supabase
        .from('rooms')
        .select('*')
        .in('id', roomIds)

      setRooms(roomsData || [])
    }
  }

  const generateJoinCode = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase()
  }

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!user) return

    const joinCode = generateJoinCode()

    const { data: newRoom, error: createError } = await supabase
      .from('rooms')
      .insert({
        name: newRoomName,
        created_by: user.id,
        join_code: joinCode,
      })
      .select()
      .single()

    if (createError) {
      setError(createError.message)
      return
    }

    if (newRoom) {
      await supabase.from('room_members').insert({
        room_id: newRoom.id,
        user_id: user.id,
      })

      await fetchRooms()
      setNewRoomName('')
      setShowCreateRoom(false)
    }
  }

  const handleJoinRoom = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!user) return

    const { data: roomData, error: queryError } = await supabase
      .from('rooms')
      .select('id')
      .eq('join_code', joinCode.toUpperCase())
      .single()

    if (queryError || !roomData) {
      setError('Invalid join code')
      return
    }

    const { error: joinError } = await supabase
      .from('room_members')
      .insert({
        room_id: roomData.id,
        user_id: user.id,
      })

    if (joinError) {
      setError(joinError.message)
      return
    }

    await fetchRooms()
    setJoinCode('')
    setShowJoinRoom(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-400 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-slate-50 to-blue-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-slate-800">Us</h1>
            <p className="text-slate-600">Welcome, {user?.user_metadata?.username || 'friend'}</p>
          </div>
          <Button
            onClick={() => supabase.auth.signOut().then(() => router.push('/auth/login'))}
            variant="outline"
            className="rounded-lg border-rose-200 text-slate-700 hover:bg-rose-50"
          >
            Sign Out
          </Button>
        </div>

        <div className="grid gap-6 mb-8">
          <div className="bg-white rounded-3xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-slate-800 mb-6">Your Relationships</h2>

            {rooms.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-slate-600 mb-6">You haven't joined any rooms yet. Create one or join your partner!</p>
                <div className="flex gap-4 justify-center">
                  <Button
                    onClick={() => setShowCreateRoom(true)}
                    className="bg-gradient-to-r from-rose-400 to-pink-400 hover:from-rose-500 hover:to-pink-500 text-white rounded-lg"
                  >
                    Create Room
                  </Button>
                  <Button
                    onClick={() => setShowJoinRoom(true)}
                    variant="outline"
                    className="rounded-lg border-rose-200 text-rose-600 hover:bg-rose-50"
                  >
                    Join Room
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <div className="grid gap-4 mb-6">
                  {rooms.map((room) => (
                    <Link
                      key={room.id}
                      href={`/room/${room.id}`}
                      className="block"
                    >
                      <div className="bg-gradient-to-br from-rose-50 to-blue-50 rounded-2xl p-6 hover:shadow-lg transition cursor-pointer border border-rose-100">
                        <h3 className="text-xl font-semibold text-slate-800">{room.name}</h3>
                        <p className="text-sm text-slate-600 mt-2">Join code: {room.join_code}</p>
                        <p className="text-xs text-slate-500 mt-1">
                          Created {new Date(room.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>

                <div className="flex gap-4">
                  <Button
                    onClick={() => setShowCreateRoom(true)}
                    className="bg-gradient-to-r from-rose-400 to-pink-400 hover:from-rose-500 hover:to-pink-500 text-white rounded-lg"
                  >
                    Create New Room
                  </Button>
                  <Button
                    onClick={() => setShowJoinRoom(true)}
                    variant="outline"
                    className="rounded-lg border-rose-200 text-rose-600 hover:bg-rose-50"
                  >
                    Join Room
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>

        {showCreateRoom && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-3xl p-8 max-w-md w-full">
              <h2 className="text-2xl font-bold text-slate-800 mb-4">Create a Room</h2>
              <form onSubmit={handleCreateRoom} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Room Name
                  </label>
                  <Input
                    type="text"
                    value={newRoomName}
                    onChange={(e) => setNewRoomName(e.target.value)}
                    placeholder="Our Love Story"
                    required
                    className="rounded-lg border-rose-200"
                  />
                </div>
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                    {error}
                  </div>
                )}
                <div className="flex gap-4">
                  <Button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-rose-400 to-pink-400 text-white rounded-lg"
                  >
                    Create
                  </Button>
                  <Button
                    type="button"
                    onClick={() => setShowCreateRoom(false)}
                    variant="outline"
                    className="flex-1 rounded-lg"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {showJoinRoom && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-3xl p-8 max-w-md w-full">
              <h2 className="text-2xl font-bold text-slate-800 mb-4">Join a Room</h2>
              <form onSubmit={handleJoinRoom} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Join Code
                  </label>
                  <Input
                    type="text"
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                    placeholder="ABCD12"
                    required
                    maxLength={6}
                    className="rounded-lg border-rose-200 uppercase"
                  />
                </div>
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                    {error}
                  </div>
                )}
                <div className="flex gap-4">
                  <Button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-rose-400 to-pink-400 text-white rounded-lg"
                  >
                    Join
                  </Button>
                  <Button
                    type="button"
                    onClick={() => setShowJoinRoom(false)}
                    variant="outline"
                    className="flex-1 rounded-lg"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
