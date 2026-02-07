'use client'

import { useUserRole } from '@/lib/hooks/usePermissions'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'

export default function DebugPage() {
  const { role, isLoading } = useUserRole()
  const router = useRouter()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p>Loading user information...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <Card className="p-8">
          <h1 className="text-3xl font-bold mb-6">Authorization Debug Info</h1>

          <div className="space-y-6">
            {/* Current Role */}
            <div className="border rounded-lg p-4">
              <h2 className="text-lg font-semibold mb-3">Current User Role</h2>
              {role ? (
                <Badge className="text-base py-2 px-4">{role}</Badge>
              ) : (
                <div className="text-red-600 font-medium">No role found</div>
              )}
            </div>

            {/* Route Access Test */}
            <div className="border rounded-lg p-4">
              <h2 className="text-lg font-semibold mb-4">Test Route Access</h2>
              <div className="space-y-2">
                <TestRouteButton role={role} route="/dashboard" label="Dashboard" />
                <TestRouteButton role={role} route="/members" label="Members" />
                <TestRouteButton role={role} route="/finance" label="Finance" />
                <TestRouteButton role={role} route="/attendance" label="Attendance" />
                <TestRouteButton role={role} route="/shepherding" label="Shepherding" />
                <TestRouteButton role={role} route="/settings" label="Settings" />
                <TestRouteButton role={role} route="/admin" label="Admin" />
              </div>
            </div>

            {/* Role Info */}
            <div className="border rounded-lg p-4">
              <h2 className="text-lg font-semibold mb-3">Role Information</h2>
              {role ? (
                <div className="text-sm text-gray-600 space-y-2">
                  <p><strong>Role:</strong> {role}</p>
                  <p><strong>Access Level:</strong> {getRoleLevel(role)} out of 7</p>
                  <p><strong>Description:</strong> {getRoleDescription(role)}</p>
                </div>
              ) : (
                <p className="text-red-600">Unable to determine role</p>
              )}
            </div>

            {/* Back Button */}
            <Button
              onClick={() => router.back()}
              variant="outline"
              className="w-full"
            >
              Go Back
            </Button>
          </div>
        </Card>
      </div>
    </div>
  )
}

function TestRouteButton({
  role,
  route,
  label,
}: {
  role: string | null
  route: string
  label: string
}) {
  const router = useRouter()
  const allowedRoles: Record<string, string[]> = {
    '/dashboard': ['super_admin', 'pastor', 'admin', 'treasurer', 'dept_leader', 'shepherd', 'member'],
    '/members': ['super_admin', 'pastor', 'admin', 'dept_leader', 'shepherd'],
    '/finance': ['super_admin', 'pastor', 'admin', 'treasurer'],
    '/attendance': ['super_admin', 'pastor', 'admin', 'dept_leader'],
    '/shepherding': ['super_admin', 'pastor', 'admin', 'shepherd', 'dept_leader'],
    '/settings': ['super_admin', 'admin'],
    '/admin': ['super_admin'],
  }

  const canAccess = role ? allowedRoles[route]?.includes(role) : false
  const handleClick = () => {
    if (canAccess) {
      router.push(route)
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={!canAccess}
      className={`w-full p-3 rounded-lg text-left flex justify-between items-center transition-colors ${canAccess
          ? 'bg-green-50 hover:bg-green-100 border border-green-200 cursor-pointer'
          : 'bg-red-50 border border-red-200 cursor-not-allowed opacity-60'
        }`}
    >
      <span className="font-medium">{label}</span>
      <span className={canAccess ? 'text-green-600' : 'text-red-600'}>
        {canAccess ? '✓ Allowed' : '✗ Denied'}
      </span>
    </button>
  )
}

function getRoleLevel(role: string): number {
  const levels: Record<string, number> = {
    super_admin: 7,
    pastor: 6,
    admin: 5,
    treasurer: 4,
    dept_leader: 3,
    shepherd: 2,
    member: 1,
  }
  return levels[role] || 0
}

function getRoleDescription(role: string): string {
  const descriptions: Record<string, string> = {
    super_admin: 'Full system access including user management',
    pastor: 'Strategic oversight with view-only financial access',
    admin: 'Day-to-day operations including member management',
    treasurer: 'Full financial access and expense management',
    dept_leader: 'Department-specific access and management',
    shepherd: 'Assigned member oversight and follow-up management',
    member: 'Personal data access and self-service portal',
  }
  return descriptions[role] || 'Unknown role'
}
