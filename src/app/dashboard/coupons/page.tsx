import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/db"
import Image from "next/image"

async function getUserCoupons(userId: string) {
  const orders = await prisma.order.findMany({
    where: { userId, status: 'COMPLETED' },
    include: {
      coupons: true,
      product: true,
    },
    orderBy: { createdAt: 'desc' }
  })

  return orders.flatMap((order: any) => 
    order.coupons.map((coupon: any) => ({
      ...coupon,
      productName: order.product.name,
      orderDate: order.createdAt,
    }))
  )
}

export default async function UserCoupons() {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    redirect("/auth/signin")
  }

  const coupons = await getUserCoupons((session.user as any).id)

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
            <a href="/dashboard" className="text-gray-700 hover:text-blue-600 transition">My Orders</a>
            <a href="/dashboard/coupons" className="text-blue-600 font-medium">My Coupons</a>
            <a href="/dashboard/profile" className="text-gray-700 hover:text-blue-600 transition">Profile</a>
          </div>
        </div>
      </nav>

      {/* Coupons Content */}
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">My Coupons</h1>

        {coupons.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <div className="text-6xl mb-4">🎫</div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No coupons yet</h2>
            <p className="text-gray-600 mb-6">Complete your first order to receive your coupons</p>
            <a href="/products" className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
              Browse Products
            </a>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {coupons.map((coupon: any) => (
              <div key={coupon.id} className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="bg-gradient-to-br from-blue-100 to-blue-200 p-6 flex items-center justify-center min-h-[200px]">
                  {coupon.qrCodeUrl ? (
                    <img 
                      src={coupon.qrCodeUrl} 
                      alt="QR Code"
                      className="w-48 h-48 object-contain"
                    />
                  ) : (
                    <div className="text-center text-blue-800">
                      <div className="text-6xl mb-2">📱</div>
                      <p className="text-sm">QR Code</p>
                    </div>
                  )}
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{coupon.productName}</h3>
                  <div className="bg-gray-100 rounded-lg p-3 mb-4">
                    <p className="text-sm text-gray-500 mb-1">Coupon Code</p>
                    <p className="text-xl font-mono font-bold text-blue-600">{coupon.couponCode}</p>
                  </div>
                  <p className="text-sm text-gray-500">
                    Generated: {new Date(coupon.createdAt).toLocaleDateString()}
                  </p>
                  {coupon.winner && (
                    <div className="mt-3 p-3 bg-green-100 rounded-lg">
                      <p className="text-sm text-green-800 font-semibold">🎉 Winner!</p>
                      <p className="text-sm text-green-700">{coupon.winner.prize}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
