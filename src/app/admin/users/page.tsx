import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/db"
import AdminHeader from "@/components/AdminHeader"
import UserManagement from "./UserManagement"

async function getUsers() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' }
  })
  
  return users.map(user => ({
    ...user,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
    emailVerified: user.emailVerified?.toISOString() || null
  }))
}

export default async function AdminUsers() {
  const session = await getServerSession(authOptions)
  
  if (!session || (session.user as any).role !== "ADMIN") {
    redirect("/")
  }

  const users = await getUsers()

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <AdminHeader userName={session.user?.name || undefined} />

      {/* Users Content */}
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Users</h1>

        <UserManagement initialUsers={users} currentUserId={(session.user as any).id} />
      </div>
    </div>
  )
}
