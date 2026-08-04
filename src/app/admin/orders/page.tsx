import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/db"
import AdminHeader from "@/components/AdminHeader"

async function getOrders() {
  return prisma.order.findMany({
    include: {
      user: true,
      product: true,
      bankTransfer: true,
    },
    orderBy: { createdAt: 'desc' }
  })
}

export default async function AdminOrders() {
  const session = await getServerSession(authOptions)
  
  if (!session || (session.user as any).role !== "ADMIN") {
    redirect("/")
  }

  const orders = await getOrders()

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <AdminHeader userName={session.user?.name || undefined} />

      {/* Orders Content */}
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Orders</h1>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Order ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Customer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Product</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Total</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Payment</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {orders.map((order: any) => (
                  <tr key={order.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                      {order.id.slice(0, 8)}...
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{order.user.name}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">{order.user.email || order.user.mobile}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-gray-100">{order.product.name}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">Qty: {order.quantity}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                      {order.currency} {Number(order.total).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                      {order.paymentMethod}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        order.status === 'COMPLETED' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                        order.status === 'APPROVED' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                        order.status === 'PENDING_APPROVAL' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' :
                        order.status === 'PENDING_PAYMENT' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400' :
                        order.status === 'CANCELLED' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' :
                        'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                      }`}>
                        {order.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <a href={`/admin/orders/${order.id}`} className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300">
                        View
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card Layout */}
          <div className="md:hidden space-y-4 p-4">
            {orders.map((order: any) => (
              <div key={order.id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Order ID</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{order.id.slice(0, 8)}...</p>
                  </div>
                  <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    order.status === 'COMPLETED' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                    order.status === 'APPROVED' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                    order.status === 'PENDING_APPROVAL' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' :
                    order.status === 'PENDING_PAYMENT' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400' :
                    order.status === 'CANCELLED' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' :
                    'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                  }`}>
                    {order.status.replace('_', ' ')}
                  </span>
                </div>
                <div className="space-y-2 text-sm mb-3">
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Customer</p>
                    <p className="text-gray-900 dark:text-white">{order.user.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{order.user.email || order.user.mobile}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Product</p>
                    <p className="text-gray-900 dark:text-white">{order.product.name} (Qty: {order.quantity})</p>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Total</p>
                      <p className="text-gray-900 dark:text-white">{order.currency} {Number(order.total).toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Payment</p>
                      <p className="text-gray-900 dark:text-white">{order.paymentMethod}</p>
                    </div>
                  </div>
                </div>
                <a href={`/admin/orders/${order.id}`} className="block w-full px-4 py-2 bg-blue-600 text-white text-center rounded-lg hover:bg-blue-700 transition text-sm">
                  View Order
                </a>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
