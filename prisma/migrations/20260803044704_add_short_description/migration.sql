-- AlterEnum
ALTER TYPE "OrderStatus" ADD VALUE 'PENDING_PAYMENT';

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "shortDescription" TEXT NOT NULL DEFAULT '';
