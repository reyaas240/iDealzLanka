import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/db"

async function getDraws() {
  return prisma.product.findMany({
    where: { isActive: true },
    include: {
      winners: true,
      coupons: true,
    },
    orderBy: { drawDate: 'asc' }
  })
}

export default async function AdminDraws() {
  const session = await getServerSession(authOptions)
  
  if (!session || (session.user as any).role !== "ADMIN") {
    redirect("/")
  }

  const draws = await getDraws()

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
            <a href="/admin" className="text-gray-700 hover:text-blue-600 transition">Dashboard</a>
            <a href="/admin/products" className="text-gray-700 hover:text-blue-600 transition">Products</a>
            <a href="/admin/orders" className="text-gray-700 hover:text-blue-600 transition">Orders</a>
            <a href="/admin/users" className="text-gray-700 hover:text-blue-600 transition">Users</a>
            <a href="/admin/draws" className="text-blue-600 font-medium">Draws</a>
            <a href="/admin/settings" className="text-gray-700 hover:text-blue-600 transition">Settings</a>
          </div>
        </div>
      </nav>

      {/* Draws Content */}
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Draw Management</h1>

        <div className="grid md:grid-cols-2 gap-6">
          {draws.map((draw: any) => (
            <div key={draw.id} className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-gray-900">{draw.name}</h3>
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                  new Date(draw.drawDate) < new Date() ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                }`}>
                  {new Date(draw.drawDate) < new Date() ? 'Past' : 'Upcoming'}
                </span>
              </div>
              
              <div className="space-y-2 text-sm text-gray-600 mb-4">
                <p>Draw Date: {new Date(draw.drawDate).toLocaleDateString()}</p>
                <p>Total Coupons: {draw.coupons.length}</p>
                <p>Winners Announced: {draw.winners.length}</p>
              </div>

              <div className="flex gap-2">
                <a href={`/admin/draws/${draw.id}`} className="flex-1 px-4 py-2 bg-blue-600 text-white text-center rounded-lg hover:bg-blue-700 transition">
                  Manage Draw
                </a>
              </div>
            </div>
          ))}
        </div>

        {draws.length === 0 && (
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <p className="text-gray-600">No active draws found. Create products to set up draws.</p>
          </div>
        )}
      </div>
    </div>
  )
}
