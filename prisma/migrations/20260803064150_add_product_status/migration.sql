-- CreateEnum
CREATE TYPE "ProductStatus" AS ENUM ('ACTIVE', 'CLOSED', 'COMPLETED');

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "status" "ProductStatus" NOT NULL DEFAULT 'ACTIVE';
