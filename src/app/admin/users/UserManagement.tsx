'use client'

import { useState } from 'react'

interface User {
  id: string
  name: string
  email: string | null
  mobile: string | null
  country: string | null
  role: 'ADMIN' | 'STAFF' | 'CUSTOMER'
  createdAt: string
}

interface UserManagementProps {
  initialUsers: User[]
  currentUserId: string
}

export default function UserManagement({ initialUsers, currentUserId }: UserManagementProps) {
  const [users, setUsers] = useState<User[]>(initialUsers)
  const [loading, setLoading] = useState<string | null>(null)
  const [error, setError] = useState('')

  const updateRole = async (userId: string, newRole: 'ADMIN' | 'STAFF' | 'CUSTOMER') => {
    setLoading(userId)
    setError('')

    try {
      const response = await fetch(`/api/admin/users/${userId}/role`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole })
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to update role')
      }

      // Update local state
      setUsers(users.map(user => 
        user.id === userId ? { ...user, role: newRole } : user
      ))
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(null)
    }
  }

  return (
    <>
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Mobile</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Country</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Joined</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {users.map((user) => (
                <tr key={user.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                    {user.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {user.email || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {user.mobile || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {user.country || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      user.role === 'ADMIN' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400' :
                      user.role === 'STAFF' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' :
                      'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {new Date(user.createdAt).toLocaleDateString('en-US')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {user.id !== currentUserId ? (
                      <select
                        value={user.role}
                        onChange={(e) => updateRole(user.id, e.target.value as 'ADMIN' | 'STAFF' | 'CUSTOMER')}
                        disabled={loading === user.id}
                        className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md text-sm focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white disabled:opacity-50"
                      >
                        <option value="CUSTOMER">Customer</option>
                        <option value="STAFF">Staff</option>
                        <option value="ADMIN">Admin</option>
                      </select>
                    ) : (
                      <span className="text-gray-400 dark:text-gray-500 text-sm italic">Current user</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Card Layout */}
        <div className="md:hidden space-y-4 p-4">
          {users.map((user) => (
            <div key={user.id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white">{user.name}</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Joined: {new Date(user.createdAt).toLocaleDateString('en-US')}</p>
                </div>
                <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                  user.role === 'ADMIN' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400' :
                  user.role === 'STAFF' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' :
                  'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                }`}>
                  {user.role}
                </span>
              </div>
              <div className="space-y-2 text-sm mb-3">
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Email</p>
                  <p className="text-gray-900 dark:text-white">{user.email || '-'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Mobile</p>
                  <p className="text-gray-900 dark:text-white">{user.mobile || '-'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Country</p>
                  <p className="text-gray-900 dark:text-white">{user.country || '-'}</p>
                </div>
              </div>
              {user.id !== currentUserId ? (
                <select
                  value={user.role}
                  onChange={(e) => updateRole(user.id, e.target.value as 'ADMIN' | 'STAFF' | 'CUSTOMER')}
                  disabled={loading === user.id}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white disabled:opacity-50"
                >
                  <option value="CUSTOMER">Customer</option>
                  <option value="STAFF">Staff</option>
                  <option value="ADMIN">Admin</option>
                </select>
              ) : (
                <div className="text-gray-400 dark:text-gray-500 text-sm italic text-center py-2">
                  Current user
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
