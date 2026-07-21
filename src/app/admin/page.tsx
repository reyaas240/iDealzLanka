import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/db"

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
    <div className="min-h-screen bg-gray-50">
      {/* Admin Header */}
      <header className="bg-white border-b shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="text-2xl font-bold text-blue-600">iDealzSrilanka Admin</div>
          <div className="flex items-center gap-4">
            <span className="text-gray-700">{session.user?.name}</span>
            <a href="/api/auth/signout" className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition">
              Sign Out
            </a>
          </div>
        </div>
      </header>

      {/* Admin Navigation */}
      <nav className="bg-white border-b">
        <div className="container mx-auto px-4">
          <div className="flex gap-6 py-4">
            <a href="/admin" className="text-blue-600 font-medium">Dashboard</a>
            <a href="/admin/products" className="text-gray-700 hover:text-blue-600 transition">Products</a>
            <a href="/admin/orders" className="text-gray-700 hover:text-blue-600 transition">Orders</a>
            <a href="/admin/users" className="text-gray-700 hover:text-blue-600 transition">Users</a>
            <a href="/admin/draws" className="text-gray-700 hover:text-blue-600 transition">Draws</a>
            <a href="/admin/settings" className="text-gray-700 hover:text-blue-600 transition">Settings</a>
          </div>
        </div>
      </nav>

      {/* Dashboard Content */}
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard</h1>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="text-3xl font-bold text-blue-600 mb-2">{stats.totalProducts}</div>
            <div className="text-gray-600">Total Products</div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="text-3xl font-bold text-green-600 mb-2">{stats.totalOrders}</div>
            <div className="text-gray-600">Total Orders</div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="text-3xl font-bold text-yellow-600 mb-2">{stats.pendingApprovals}</div>
            <div className="text-gray-600">Pending Approvals</div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="text-3xl font-bold text-purple-600 mb-2">{stats.totalUsers}</div>
            <div className="text-gray-600">Total Users</div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Activity</h2>
          <p className="text-gray-600">Recent orders, user registrations, and system events will appear here.</p>
        </div>
      </div>
    </div>
  )
}
