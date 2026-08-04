import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/db"
import AdminHeader from "@/components/AdminHeader"

async function getDraws() {
  return prisma.product.findMany({
    where: { 
      status: { in: ['CLOSED', 'COMPLETED'] }
    },
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <AdminHeader userName={session.user?.name || undefined} />

      {/* Draws Content */}
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Draw Management</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {draws.map((draw: any) => (
            <div key={draw.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{draw.name}</h3>
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                  new Date(draw.drawDate) < new Date() ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                }`}>
                  {new Date(draw.drawDate) < new Date() ? 'Past' : 'Upcoming'}
                </span>
              </div>
              
              <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300 mb-4">
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
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 text-center">
            <p className="text-gray-600 dark:text-gray-400">No closed draws found. Close products to set up draws.</p>
          </div>
        )}
      </div>
    </div>
  )
}
