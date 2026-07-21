import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/db"

async function getUserOrders(userId: string) {
  return prisma.order.findMany({
    where: { userId },
    include: {
      product: true,
      coupons: true,
    },
    orderBy: { createdAt: 'desc' }
  })
}

export default async function UserDashboard() {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    redirect("/auth/signin")
  }

  const orders = await getUserOrders((session.user as any).id)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="text-2xl font-bold text-blue-600">iDealzSrilanka</div>
          <div className="flex items-center gap-4">
            <span className="text-gray-700">{session.user?.name}</span>
            <a href="/api/auth/signout" className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition">
              Sign Out
            </a>
          </div>
        </div>
      </header>

      {/* User Navigation */}
      <nav className="bg-white border-b">
        <div className="container mx-auto px-4">
          <div className="flex gap-6 py-4">
            <a href="/dashboard" className="text-blue-600 font-medium">My Orders</a>
            <a href="/dashboard/coupons" className="text-gray-700 hover:text-blue-600 transition">My Coupons</a>
            <a href="/dashboard/profile" className="text-gray-700 hover:text-blue-600 transition">Profile</a>
          </div>
        </div>
      </nav>

      {/* Dashboard Content */}
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">My Orders</h1>

        {orders.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <div className="text-6xl mb-4">📦</div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No orders yet</h2>
            <p className="text-gray-600 mb-6">Start shopping to see your orders here</p>
            <a href="/products" className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
              Browse Products
            </a>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order: any) => (
              <div key={order.id} className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{order.product.name}</h3>
                    <p className="text-sm text-gray-500">Order ID: {order.id.slice(0, 8)}...</p>
                    <p className="text-sm text-gray-500">Date: {new Date(order.createdAt).toLocaleDateString()}</p>
                  </div>
                  <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    order.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                    order.status === 'PENDING_APPROVAL' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {order.status.replace('_', ' ')}
                  </span>
                </div>

                <div className="grid md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-500">Quantity</p>
                    <p className="font-semibold text-gray-900">{order.quantity}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Total</p>
                    <p className="font-semibold text-gray-900">{order.currency} {Number(order.total).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Payment Method</p>
                    <p className="font-semibold text-gray-900">{order.paymentMethod}</p>
                  </div>
                </div>

                {order.status === 'COMPLETED' && (
                  <div className="border-t pt-4">
                    <p className="text-sm text-green-600 font-medium mb-2">
                      ✓ {order.coupons.length} coupon(s) generated
                    </p>
                    <a href="/dashboard/coupons" className="text-blue-600 hover:text-blue-700 text-sm">
                      View your coupons →
                    </a>
                  </div>
                )}

                {order.status === 'PENDING_APPROVAL' && (
                  <div className="border-t pt-4">
                    <p className="text-sm text-yellow-600">
                      ⏳ Waiting for bank transfer approval
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
