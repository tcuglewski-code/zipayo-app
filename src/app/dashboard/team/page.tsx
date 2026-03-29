"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
  Loader2, 
  UserPlus, 
  Trash2, 
  Users,
  Shield,
  User,
  Check,
  Clock,
  X
} from "lucide-react"

interface TeamMember {
  id: string
  email: string
  role: string
  accepted: boolean
  createdAt: string
}

export default function TeamPage() {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [loading, setLoading] = useState(true)
  const [showInvite, setShowInvite] = useState(false)
  const [inviting, setInviting] = useState(false)
  const [inviteEmail, setInviteEmail] = useState("")
  const [inviteRole, setInviteRole] = useState("member")
  const [deleting, setDeleting] = useState<string | null>(null)

  useEffect(() => {
    fetchTeam()
  }, [])

  async function fetchTeam() {
    try {
      const res = await fetch("/api/team")
      if (res.ok) {
        const data = await res.json()
        setTeamMembers(data.teamMembers)
      }
    } catch (e) {
      console.error("Error fetching team:", e)
    } finally {
      setLoading(false)
    }
  }

  async function handleInvite() {
    if (!inviteEmail.trim()) return

    setInviting(true)
    try {
      const res = await fetch("/api/team", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: inviteEmail, role: inviteRole }),
      })

      if (res.ok) {
        const data = await res.json()
        setTeamMembers([...teamMembers, data.teamMember])
        setInviteEmail("")
        setShowInvite(false)
        alert("Einladung erstellt!")
      } else {
        const err = await res.json()
        alert(err.error || "Fehler beim Einladen")
      }
    } catch (e) {
      console.error("Error inviting:", e)
      alert("Verbindungsfehler")
    } finally {
      setInviting(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Mitglied wirklich entfernen?")) return

    setDeleting(id)
    try {
      const res = await fetch(`/api/team/${id}`, { method: "DELETE" })
      if (res.ok) {
        setTeamMembers(teamMembers.filter(m => m.id !== id))
      } else {
        const err = await res.json()
        alert(err.error || "Fehler beim Entfernen")
      }
    } catch (e) {
      console.error("Error deleting:", e)
    } finally {
      setDeleting(null)
    }
  }

  function getRoleIcon(role: string) {
    switch (role) {
      case "owner":
        return <Shield className="w-4 h-4 text-purple-600" />
      case "admin":
        return <Shield className="w-4 h-4 text-blue-600" />
      default:
        return <User className="w-4 h-4 text-gray-600" />
    }
  }

  function getRoleLabel(role: string): string {
    switch (role) {
      case "owner": return "Besitzer"
      case "admin": return "Admin"
      case "member": return "Mitglied"
      default: return role
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Team</h1>
          <p className="text-gray-600">Verwalte dein Team und Berechtigungen.</p>
        </div>
        <Button onClick={() => setShowInvite(true)}>
          <UserPlus className="w-4 h-4 mr-2" />
          Einladen
        </Button>
      </div>

      {/* Invite modal */}
      {showInvite && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Team-Mitglied einladen</h2>
              <button onClick={() => setShowInvite(false)}>
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="inviteEmail">Email-Adresse</Label>
                <Input
                  id="inviteEmail"
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="mitarbeiter@example.com"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="inviteRole">Rolle</Label>
                <select
                  id="inviteRole"
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value)}
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent"
                >
                  <option value="member">Mitglied</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  variant="outline"
                  onClick={() => setShowInvite(false)}
                  className="flex-1"
                >
                  Abbrechen
                </Button>
                <Button
                  onClick={handleInvite}
                  disabled={inviting || !inviteEmail.trim()}
                  className="flex-1"
                >
                  {inviting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    "Einladen"
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Team list */}
      <div className="bg-white rounded-xl shadow-sm border">
        {teamMembers.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">Noch keine Team-Mitglieder</p>
            <Button onClick={() => setShowInvite(true)}>
              <UserPlus className="w-4 h-4 mr-2" />
              Erstes Mitglied einladen
            </Button>
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {teamMembers.map((member) => (
              <li key={member.id} className="flex items-center justify-between p-4 hover:bg-gray-50">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                    {getRoleIcon(member.role)}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{member.email}</p>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <span>{getRoleLabel(member.role)}</span>
                      <span>•</span>
                      {member.accepted ? (
                        <span className="flex items-center gap-1 text-green-600">
                          <Check className="w-3 h-3" />
                          Aktiv
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-yellow-600">
                          <Clock className="w-3 h-3" />
                          Einladung ausstehend
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {member.role !== "owner" && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(member.id)}
                    disabled={deleting === member.id}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    {deleting === member.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </Button>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
