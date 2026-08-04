import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/db"
import AdminHeader from "@/components/AdminHeader"
import WinnerForm from "./WinnerForm"

async function getProductDraw(productId: string) {
  return prisma.product.findUnique({
    where: { id: productId },
    include: {
      winners: {
        include: {
          coupon: true,
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

export default async function ManageDrawPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await getServerSession(authOptions)
  
  if (!session || (session.user as any).role !== "ADMIN") {
    redirect("/")
  }

  const draw = await getProductDraw(id)

  if (!draw) {
    redirect("/admin/draws")
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <AdminHeader userName={session.user?.name || undefined} />

      {/* Draw Management Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <a href="/admin/draws" className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition">
            ← Back to Draws
          </a>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{draw.name}</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">Draw Date: {new Date(draw.drawDate).toLocaleDateString()}</p>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Available Coupons */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Available Coupons ({draw.coupons.length})
            </h2>
            
            {draw.coupons.length === 0 ? (
              <p className="text-gray-600 dark:text-gray-400">No available coupons for this draw.</p>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {draw.coupons.map((coupon: any) => (
                  <div key={coupon.id} className="border dark:border-gray-700 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-mono font-semibold text-blue-600 dark:text-blue-400">{coupon.couponCode}</span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">{coupon.order.user.name}</span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{coupon.order.user.email}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{coupon.order.user.mobile}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Winners */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Announced Winners ({draw.winners.length})
            </h2>
            
            {draw.winners.length === 0 ? (
              <p className="text-gray-600 dark:text-gray-400">No winners announced yet.</p>
            ) : (
              <div className="space-y-3">
                {draw.winners.map((winner: any) => (
                  <div key={winner.id} className="border dark:border-gray-700 rounded-lg p-4 bg-green-50 dark:bg-green-900/20">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-mono font-semibold text-green-600 dark:text-green-400">{winner.coupon.couponCode}</span>
                      <span className="text-sm text-green-800 dark:text-green-300 font-semibold">🎉 Winner</span>
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-300 mb-1">{winner.order.user.name}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{winner.order.user.email}</p>
                    <div className="bg-white dark:bg-gray-700 rounded p-2">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">Prize: {winner.prize}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Select Winner Form */}
            <div className="mt-6 pt-6 border-t dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Select New Winner</h3>
              <WinnerForm 
                productId={draw.id} 
                coupons={draw.coupons.map((coupon: any) => ({
                  ...coupon,
                  order: {
                    ...coupon.order,
                    total: coupon.order.total ? Number(coupon.order.total) : null
                  }
                }))}
                productStatus={draw.status}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
