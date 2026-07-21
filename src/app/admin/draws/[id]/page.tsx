import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/db"

async function getProductDraw(productId: string) {
  return prisma.product.findUnique({
    where: { id: productId },
    include: {
      winners: {
        include: {
          order: {
            include: {
              user: true
            }
          }
        }
      },
      coupons: {
        where: {
          winner: null
        },
        include: {
          order: {
            include: {
              user: true
            }
          }
        }
      }
    }
  })
}

export default async function ManageDrawPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  
  if (!session || (session.user as any).role !== "ADMIN") {
    redirect("/")
  }

  const draw = await getProductDraw(params.id)

  if (!draw) {
    redirect("/admin/draws")
  }

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

      {/* Draw Management Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <a href="/admin/draws" className="text-blue-600 hover:text-blue-700 transition">
            ← Back to Draws
          </a>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-2">{draw.name}</h1>
        <p className="text-gray-600 mb-8">Draw Date: {new Date(draw.drawDate).toLocaleDateString()}</p>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Available Coupons */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Available Coupons ({draw.coupons.length})
            </h2>
            
            {draw.coupons.length === 0 ? (
              <p className="text-gray-600">No available coupons for this draw.</p>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {draw.coupons.map((coupon: any) => (
                  <div key={coupon.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-mono font-semibold text-blue-600">{coupon.couponCode}</span>
                      <span className="text-sm text-gray-500">{coupon.order.user.name}</span>
                    </div>
                    <p className="text-sm text-gray-600">{coupon.order.user.email}</p>
                    <p className="text-sm text-gray-500">{coupon.order.user.mobile}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Winners */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Announced Winners ({draw.winners.length})
            </h2>
            
            {draw.winners.length === 0 ? (
              <p className="text-gray-600">No winners announced yet.</p>
            ) : (
              <div className="space-y-3">
                {draw.winners.map((winner: any) => (
                  <div key={winner.id} className="border rounded-lg p-4 bg-green-50">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-mono font-semibold text-green-600">{winner.coupon.couponCode}</span>
                      <span className="text-sm text-green-800 font-semibold">🎉 Winner</span>
                    </div>
                    <p className="text-sm text-gray-700 mb-1">{winner.order.user.name}</p>
                    <p className="text-sm text-gray-600 mb-2">{winner.order.user.email}</p>
                    <div className="bg-white rounded p-2">
                      <p className="text-sm font-semibold text-gray-900">Prize: {winner.prize}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Select Winner Form */}
            <div className="mt-6 pt-6 border-t">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Select New Winner</h3>
              <form action={`/api/admin/draws/${draw.id}/winners`} method="POST">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Coupon
                    </label>
                    <select
                      name="couponId"
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select a coupon...</option>
                      {draw.coupons.map((coupon: any) => (
                        <option key={coupon.id} value={coupon.id}>
                          {coupon.couponCode} - {coupon.order.user.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Prize Description
                    </label>
                    <input
                      type="text"
                      name="prize"
                      required
                      placeholder="e.g., LKR 100,000 Cash Prize"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold"
                  >
                    Announce Winner
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
