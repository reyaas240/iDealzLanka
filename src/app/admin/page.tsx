import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/db"
import AdminHeader from "@/components/AdminHeader"

async function getAdminStats() {
  const totalProducts = await prisma.product.count()
  const totalOrders = await prisma.order.count()
  const pendingApprovals = await prisma.bankTransfer.count({
    where: { status: "PENDING" }
  })
  const totalUsers = await prisma.user.count()

  return { totalProducts, totalOrders, pendingApprovals, totalUsers }
}

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions)
  
  if (!session || (session.user as any).role !== "ADMIN") {
    redirect("/")
  }

  const stats = await getAdminStats()

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <AdminHeader userName={session.user?.name || undefined} />

      {/* Dashboard Content */}
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Dashboard</h1>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">{stats.totalProducts}</div>
            <div className="text-gray-600 dark:text-gray-300">Total Products</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">{stats.totalOrders}</div>
            <div className="text-gray-600 dark:text-gray-300">Total Orders</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="text-3xl font-bold text-yellow-600 dark:text-yellow-400 mb-2">{stats.pendingApprovals}</div>
            <div className="text-gray-600 dark:text-gray-300">Pending Approvals</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-2">{stats.totalUsers}</div>
            <div className="text-gray-600 dark:text-gray-300">Total Users</div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Recent Activity</h2>
          <p className="text-gray-600 dark:text-gray-300">Recent orders, user registrations, and system events will appear here.</p>
        </div>
      </div>
    </div>
  )
}
