import { prisma } from "@/lib/db"
import { notFound } from "next/navigation"
import Link from "next/link"
import ProductDetailClient from "./ProductDetailClient"

async function getProduct(id: string) {
  const product = await prisma.product.findUnique({
    where: { id }
  })
  return product
}

export default async function ProductDetailPage({ params }: { params: { id: string } }) {
  const product = await getProduct(params.id)

  if (!product) {
    notFound()
  }

  const availableItems = product.totalItems - product.soldItems
  const isSoldOut = availableItems <= 0

  return <ProductDetailClient product={product} availableItems={availableItems} isSoldOut={isSoldOut} />
}
