import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/db"
import Image from "next/image"
import Logo from "@/components/Logo"
import LanguageSwitcher from "@/components/LanguageSwitcher"
import ThemeSwitcher from "@/components/ThemeSwitcher"
import SignOutButton from "@/components/SignOutButton"

async function getUserCoupons(userId: string) {
  const orders = await prisma.order.findMany({
    where: { 
      userId,
      status: { in: ['COMPLETED', 'APPROVED'] }
    },
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="border-b bg-white dark:bg-gray-900 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Logo />
          <div className="flex items-center gap-4">
            <span className="text-gray-700 dark:text-gray-300">{session.user?.name}</span>
            <div className="flex items-center gap-2">
              <LanguageSwitcher />
              <ThemeSwitcher />
            </div>
            <SignOutButton />
          </div>
        </div>
      </header>

      {/* User Navigation */}
      <nav className="bg-white dark:bg-gray-900 border-b dark:border-gray-700">
        <div className="container mx-auto px-4">
          <div className="flex gap-6 py-4">
            <a href="/dashboard" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition">My Orders</a>
            <a href="/dashboard/coupons" className="text-blue-600 dark:text-blue-400 font-medium">My Coupons</a>
            <a href="/dashboard/profile" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition">Profile</a>
          </div>
        </div>
      </nav>

      {/* Coupons Content */}
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">My Coupons</h1>

        {coupons.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 text-center">
            <div className="text-6xl mb-4">🎫</div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No coupons yet</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">Complete your first order to receive your coupons</p>
            <a href="/products" className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
              Browse Products
            </a>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {coupons.map((coupon: any) => (
              <div key={coupon.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
                <div className="bg-gradient-to-br from-blue-100 to-blue-200 dark:from-gray-700 dark:to-gray-600 p-6 flex items-center justify-center min-h-[200px]">
                  {coupon.qrCodeUrl ? (
                    <img 
                      src={coupon.qrCodeUrl} 
                      alt="QR Code"
                      className="w-48 h-48 object-contain"
                    />
                  ) : (
                    <div className="text-center text-blue-800 dark:text-blue-200">
                      <div className="text-6xl mb-2">📱</div>
                      <p className="text-sm">QR Code</p>
                    </div>
                  )}
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{coupon.productName}</h3>
                  <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-3 mb-4">
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Coupon Code</p>
                    <p className="text-xl font-mono font-bold text-blue-600 dark:text-blue-400">{coupon.couponCode}</p>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                    Generated: {new Date(coupon.createdAt).toLocaleDateString()}
                  </p>
                  {coupon.qrCodeUrl && (
                    <a
                      href={coupon.qrCodeUrl}
                      download={`coupon-${coupon.couponCode}.png`}
                      className="block w-full px-4 py-2 bg-blue-600 text-white text-center rounded-lg hover:bg-blue-700 transition font-medium"
                    >
                      Download QR Code
                    </a>
                  )}
                  {coupon.winner && (
                    <div className="mt-3 p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                      <p className="text-sm text-green-800 dark:text-green-400 font-semibold">🎉 Winner!</p>
                      <p className="text-sm text-green-700 dark:text-green-300">{coupon.winner.prize}</p>
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
