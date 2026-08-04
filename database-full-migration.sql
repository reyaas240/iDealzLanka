-- Complete Database Migration Script
-- Includes full schema structure and all data

-- ============================================
-- SCHEMA STRUCTURE
-- ============================================

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'STAFF', 'CUSTOMER');

-- CreateEnum
CREATE TYPE "ProductStatus" AS ENUM ('ACTIVE', 'CLOSED', 'COMPLETED');

-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('PENDING', 'PENDING_PAYMENT', 'PENDING_APPROVAL', 'APPROVED', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('BANK_TRANSFER', 'ONLINE_PAYMENT');

-- CreateEnum
CREATE TYPE "BankTransferStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "OtpType" AS ENUM ('EMAIL', 'MOBILE');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "mobile" TEXT,
    "password" TEXT,
    "country" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'CUSTOMER',
    "image" TEXT,
    "emailVerified" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Product" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "shortDescription" TEXT NOT NULL DEFAULT '',
    "description" TEXT NOT NULL,
    "images" TEXT[],
    "price" DECIMAL(65,30) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'LKR',
    "itemPrefix" TEXT NOT NULL,
    "drawDate" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "status" "ProductStatus" NOT NULL DEFAULT 'ACTIVE',
    "totalItems" INTEGER NOT NULL DEFAULT 0,
    "soldItems" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Order" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "status" "OrderStatus" NOT NULL DEFAULT 'PENDING',
    "total" DECIMAL(65,30) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'LKR',
    "paymentMethod" "PaymentMethod" NOT NULL,
    "paymentDetails" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Coupon" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "couponCode" TEXT NOT NULL,
    "qrCodeUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Coupon_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BankTransfer" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "receiptUrl" TEXT NOT NULL,
    "transactionId" TEXT NOT NULL,
    "status" "BankTransferStatus" NOT NULL DEFAULT 'PENDING',
    "adminNotes" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "reviewedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BankTransfer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Winner" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "couponId" TEXT NOT NULL,
    "prize" TEXT NOT NULL,
    "announcedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notifiedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Winner_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Otp" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "type" "OtpType" NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "used" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Otp_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Cart" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "items" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Cart_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SiteSettings" (
    "id" TEXT NOT NULL,
    "logoUrl" TEXT,
    "heroImageUrl" TEXT,
    "heroTitle" TEXT,
    "heroSubtitle" TEXT,
    "noticeText" TEXT,
    "noticeIsActive" BOOLEAN NOT NULL DEFAULT false,
    "contactEmail" TEXT,
    "contactPhone" TEXT,
    "contactAddress" TEXT,
    "socialLinks" JSONB,
    "aboutUs" TEXT,
    "termsAndConditions" TEXT,
    "privacyPolicy" TEXT,
    "bankName" TEXT,
    "bankAccountNumber" TEXT,
    "bankAccountName" TEXT,
    "bankBranch" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SiteSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OAuthSettings" (
    "id" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "isEnabled" BOOLEAN NOT NULL DEFAULT false,
    "clientId" TEXT,
    "clientSecret" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OAuthSettings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_mobile_key" ON "User"("mobile");

-- CreateIndex
CREATE UNIQUE INDEX "Product_itemPrefix_key" ON "Product"("itemPrefix");

-- CreateIndex
CREATE UNIQUE INDEX "Coupon_couponCode_key" ON "Coupon"("couponCode");

-- CreateIndex
CREATE UNIQUE INDEX "BankTransfer_orderId_key" ON "BankTransfer"("orderId");

-- CreateIndex
CREATE UNIQUE INDEX "Winner_orderId_key" ON "Winner"("orderId");

-- CreateIndex
CREATE UNIQUE INDEX "Winner_couponId_key" ON "Winner"("couponId");

-- CreateIndex
CREATE UNIQUE INDEX "Cart_sessionId_key" ON "Cart"("sessionId");

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "OAuthSettings_provider_key" ON "OAuthSettings"("provider");

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Coupon" ADD CONSTRAINT "Coupon_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Coupon" ADD CONSTRAINT "Coupon_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BankTransfer" ADD CONSTRAINT "BankTransfer_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Winner" ADD CONSTRAINT "Winner_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Winner" ADD CONSTRAINT "Winner_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Winner" ADD CONSTRAINT "Winner_couponId_fkey" FOREIGN KEY ("couponId") REFERENCES "Coupon"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Otp" ADD CONSTRAINT "Otp_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ============================================
-- DATA INSERTION
-- ============================================

-- Data for User
INSERT INTO "User" ("id", "name", "email", "mobile", "password", "country", "role", "image", "emailVerified", "createdAt", "updatedAt") VALUES ('cmscpnqwo0000v935rlpcyznb', 'Reyaas Admin', 'reyaas240@gmail.com', '+94771234567', '$2b$10$Rc1vP7EbNt/3aif0uXOUde.UwG..n1UT45RZmgcspw8ITd5Zx4iLm', 'Sri Lanka', 'ADMIN', NULL, NULL, '2026-08-03T04:10:07.991Z', '2026-08-03T04:14:10.169Z');
INSERT INTO "User" ("id", "name", "email", "mobile", "password", "country", "role", "image", "emailVerified", "createdAt", "updatedAt") VALUES ('cmscshb5m0004v9r4w7hkno3y', 'test two', 'test2@mail.com', '+94783843832', '$2b$10$3sVPcBD93gwQ9eS6moNFLOfqbrlGZVQuqS2fvO.jU2Bn.iCY9YFQa', 'Sri Lanka', 'CUSTOMER', NULL, NULL, '2026-08-03T05:29:06.489Z', '2026-08-03T05:45:18.210Z');
INSERT INTO "User" ("id", "name", "email", "mobile", "password", "country", "role", "image", "emailVerified", "createdAt", "updatedAt") VALUES ('cmsctq4nb0017v9r47a1jvhwe', 'Test three', 'test3@mail.com', '+94768843298', '$2b$10$KegJGOJ9b7fu3WMcV9IUie.tAyT5IEaSzFkp76oKb1BPythoXc9KW', 'Sri Lanka', 'CUSTOMER', NULL, NULL, '2026-08-03T06:03:57.575Z', '2026-08-03T06:04:25.541Z');
INSERT INTO "User" ("id", "name", "email", "mobile", "password", "country", "role", "image", "emailVerified", "createdAt", "updatedAt") VALUES ('cmscrw2hy0001v9r400pzdcoh', 'test one', 'test1@mail.com', '+94782472883', '$2b$10$JX9S/EofiN8Tw0quINFt3uAjefIkhdE/eHdDIQ2AaYGbgZMTK4ISy', 'Sri Lanka', 'CUSTOMER', NULL, NULL, '2026-08-03T05:12:35.494Z', '2026-08-03T06:13:49.781Z');

-- Data for Product
INSERT INTO "Product" ("id", "name", "shortDescription", "description", "images", "price", "currency", "itemPrefix", "drawDate", "isActive", "status", "totalItems", "soldItems", "createdAt", "updatedAt") VALUES ('cmscqutqc0001v9migz86s9oz', 'CR Book - Buy, Donate and Win Cash Prizes', 'test', '*** READ THIS CAREFULLY BEFORE YOUR PURCHASES***

After the draw, one of the schools will be selected to hand over the donation (CR Book); all the details will be transparent and will be published on the website to verify.

Note: If sales are not completed on or before the draw date, the date will be extended to another week. If the targetted sales not successful again, the product will be closed, and the draw will be conducted based on the extended date specified, and the prize amount will be changed based on the percentage mentioned accordingly after covering operational charges of 20% to maintain proper distribution.

1st Prize : Rs 10,000 (17% from total sales)
2nd Prize : Rs 5,000 (8% from total sales)
3rd Prize : Rs 3,000 (3% from total sales)', '[]', '"200"', 'LKR', 'CRB', '2026-08-22T00:00:00.000Z', true, 'ACTIVE', 200, 32, '2026-08-03T04:43:37.734Z', '2026-08-04T01:32:54.585Z');

-- Data for Order
INSERT INTO "Order" ("id", "userId", "productId", "quantity", "status", "total", "currency", "paymentMethod", "paymentDetails", "createdAt", "updatedAt") VALUES ('cmscshmez0008v9r4mir5vw0r', 'cmscshb5m0004v9r4w7hkno3y', 'cmscqutqc0001v9migz86s9oz', 1, 'APPROVED', '"200"', 'LKR', 'BANK_TRANSFER', '{"transactionId":"435435435"}', '2026-08-03T05:29:21.083Z', '2026-08-03T05:39:27.848Z');
INSERT INTO "Order" ("id", "userId", "productId", "quantity", "status", "total", "currency", "paymentMethod", "paymentDetails", "createdAt", "updatedAt") VALUES ('cmsct24y6000gv9r4ofbv0but', 'cmscshb5m0004v9r4w7hkno3y', 'cmscqutqc0001v9migz86s9oz', 5, 'APPROVED', '"1000"', 'LKR', 'BANK_TRANSFER', '{"transactionId":"45635235234"}', '2026-08-03T05:45:18.222Z', '2026-08-03T05:48:48.933Z');
INSERT INTO "Order" ("id", "userId", "productId", "quantity", "status", "total", "currency", "paymentMethod", "paymentDetails", "createdAt", "updatedAt") VALUES ('cmsctjr7v000uv9r4p3i4fwgu', 'cmscrw2hy0001v9r400pzdcoh', 'cmscqutqc0001v9migz86s9oz', 5, 'APPROVED', '"1000"', 'LKR', 'BANK_TRANSFER', '{"transactionId":"324324324"}', '2026-08-03T05:59:00.235Z', '2026-08-03T05:59:20.922Z');
INSERT INTO "Order" ("id", "userId", "productId", "quantity", "status", "total", "currency", "paymentMethod", "paymentDetails", "createdAt", "updatedAt") VALUES ('cmsctqq88001bv9r4a4xca2dm', 'cmsctq4nb0017v9r47a1jvhwe', 'cmscqutqc0001v9migz86s9oz', 5, 'APPROVED', '"1000"', 'LKR', 'BANK_TRANSFER', '{"transactionId":"45645345345"}', '2026-08-03T06:04:25.545Z', '2026-08-03T06:05:24.215Z');
INSERT INTO "Order" ("id", "userId", "productId", "quantity", "status", "total", "currency", "paymentMethod", "paymentDetails", "createdAt", "updatedAt") VALUES ('cmscu2tlk001rv9r4ecaxc89x', 'cmscrw2hy0001v9r400pzdcoh', 'cmscqutqc0001v9migz86s9oz', 2, 'APPROVED', '"400"', 'LKR', 'BANK_TRANSFER', '{"transactionId":"453242334234"}', '2026-08-03T06:13:49.785Z', '2026-08-03T06:35:49.760Z');
INSERT INTO "Order" ("id", "userId", "productId", "quantity", "status", "total", "currency", "paymentMethod", "paymentDetails", "createdAt", "updatedAt") VALUES ('cmscsxhze000ev9r46i6lb2k8', 'cmscrw2hy0001v9r400pzdcoh', 'cmscqutqc0001v9migz86s9oz', 3, 'APPROVED', '"600"', 'LKR', 'BANK_TRANSFER', '{"transactionId":"432432432"}', '2026-08-03T05:41:41.833Z', '2026-08-03T06:36:01.021Z');

-- Data for Coupon
INSERT INTO "Coupon" ("id", "orderId", "productId", "couponCode", "qrCodeUrl", "createdAt") VALUES ('cmscsumlf000cv9r4v8sefvan', 'cmscshmez0008v9r4mir5vw0r', 'cmscqutqc0001v9migz86s9oz', 'CRB-8Q2JZN-3832', '/uploads/qrcodes/CRB-8Q2JZN-3832.png', '2026-08-03T05:39:27.844Z');
INSERT INTO "Coupon" ("id", "orderId", "productId", "couponCode", "qrCodeUrl", "createdAt") VALUES ('cmsct6nim000kv9r4grh3kgu5', 'cmsct24y6000gv9r4ofbv0but', 'cmscqutqc0001v9migz86s9oz', 'CRB-L5J0D4-3832', '/uploads/qrcodes/CRB-L5J0D4-3832.png', '2026-08-03T05:48:48.910Z');
INSERT INTO "Coupon" ("id", "orderId", "productId", "couponCode", "qrCodeUrl", "createdAt") VALUES ('cmsct6niu000mv9r4e1gp751p', 'cmsct24y6000gv9r4ofbv0but', 'cmscqutqc0001v9migz86s9oz', 'CRB-36LRV8-3832', '/uploads/qrcodes/CRB-36LRV8-3832.png', '2026-08-03T05:48:48.918Z');
INSERT INTO "Coupon" ("id", "orderId", "productId", "couponCode", "qrCodeUrl", "createdAt") VALUES ('cmsct6niz000ov9r44tz6t2cm', 'cmsct24y6000gv9r4ofbv0but', 'cmscqutqc0001v9migz86s9oz', 'CRB-0JTWAE-3832', '/uploads/qrcodes/CRB-0JTWAE-3832.png', '2026-08-03T05:48:48.924Z');
INSERT INTO "Coupon" ("id", "orderId", "productId", "couponCode", "qrCodeUrl", "createdAt") VALUES ('cmsct6nj3000qv9r4hr9hf93c', 'cmsct24y6000gv9r4ofbv0but', 'cmscqutqc0001v9migz86s9oz', 'CRB-KGLV81-3832', '/uploads/qrcodes/CRB-KGLV81-3832.png', '2026-08-03T05:48:48.928Z');
INSERT INTO "Coupon" ("id", "orderId", "productId", "couponCode", "qrCodeUrl", "createdAt") VALUES ('cmsct6nj6000sv9r495i5eeyj', 'cmsct24y6000gv9r4ofbv0but', 'cmscqutqc0001v9migz86s9oz', 'CRB-5MYW8C-3832', '/uploads/qrcodes/CRB-5MYW8C-3832.png', '2026-08-03T05:48:48.931Z');
INSERT INTO "Coupon" ("id", "orderId", "productId", "couponCode", "qrCodeUrl", "createdAt") VALUES ('cmsctk762000yv9r447a05clg', 'cmsctjr7v000uv9r4p3i4fwgu', 'cmscqutqc0001v9migz86s9oz', 'CRB-25TCGZ-2883', '/uploads/qrcodes/CRB-25TCGZ-2883.png', '2026-08-03T05:59:20.906Z');
INSERT INTO "Coupon" ("id", "orderId", "productId", "couponCode", "qrCodeUrl", "createdAt") VALUES ('cmsctk7670010v9r4ahb48net', 'cmsctjr7v000uv9r4p3i4fwgu', 'cmscqutqc0001v9migz86s9oz', 'CRB-6WRAA3-2883', '/uploads/qrcodes/CRB-6WRAA3-2883.png', '2026-08-03T05:59:20.912Z');
INSERT INTO "Coupon" ("id", "orderId", "productId", "couponCode", "qrCodeUrl", "createdAt") VALUES ('cmsctk76a0012v9r4idkghs0q', 'cmsctjr7v000uv9r4p3i4fwgu', 'cmscqutqc0001v9migz86s9oz', 'CRB-1Y2K2C-2883', '/uploads/qrcodes/CRB-1Y2K2C-2883.png', '2026-08-03T05:59:20.915Z');
INSERT INTO "Coupon" ("id", "orderId", "productId", "couponCode", "qrCodeUrl", "createdAt") VALUES ('cmsctk76d0014v9r4sacny9kj', 'cmsctjr7v000uv9r4p3i4fwgu', 'cmscqutqc0001v9migz86s9oz', 'CRB-6OM4BT-2883', '/uploads/qrcodes/CRB-6OM4BT-2883.png', '2026-08-03T05:59:20.918Z');
INSERT INTO "Coupon" ("id", "orderId", "productId", "couponCode", "qrCodeUrl", "createdAt") VALUES ('cmsctk76g0016v9r4sk9wcc94', 'cmsctjr7v000uv9r4p3i4fwgu', 'cmscqutqc0001v9migz86s9oz', 'CRB-6HCLWJ-2883', '/uploads/qrcodes/CRB-6HCLWJ-2883.png', '2026-08-03T05:59:20.920Z');
INSERT INTO "Coupon" ("id", "orderId", "productId", "couponCode", "qrCodeUrl", "createdAt") VALUES ('cmsctrzhd001fv9r45we393p3', 'cmsctqq88001bv9r4a4xca2dm', 'cmscqutqc0001v9migz86s9oz', 'CRB-NMSWSN-3298', '/uploads/qrcodes/CRB-NMSWSN-3298.png', '2026-08-03T06:05:24.194Z');
INSERT INTO "Coupon" ("id", "orderId", "productId", "couponCode", "qrCodeUrl", "createdAt") VALUES ('cmsctrzhl001hv9r4rpkx7l9b', 'cmsctqq88001bv9r4a4xca2dm', 'cmscqutqc0001v9migz86s9oz', 'CRB-8IV0IF-3298', '/uploads/qrcodes/CRB-8IV0IF-3298.png', '2026-08-03T06:05:24.202Z');
INSERT INTO "Coupon" ("id", "orderId", "productId", "couponCode", "qrCodeUrl", "createdAt") VALUES ('cmsctrzhq001jv9r4zp4haud8', 'cmsctqq88001bv9r4a4xca2dm', 'cmscqutqc0001v9migz86s9oz', 'CRB-ZE7QN5-3298', '/uploads/qrcodes/CRB-ZE7QN5-3298.png', '2026-08-03T06:05:24.207Z');
INSERT INTO "Coupon" ("id", "orderId", "productId", "couponCode", "qrCodeUrl", "createdAt") VALUES ('cmsctrzhu001lv9r4dyjhvmfk', 'cmsctqq88001bv9r4a4xca2dm', 'cmscqutqc0001v9migz86s9oz', 'CRB-HA5HYS-3298', '/uploads/qrcodes/CRB-HA5HYS-3298.png', '2026-08-03T06:05:24.210Z');
INSERT INTO "Coupon" ("id", "orderId", "productId", "couponCode", "qrCodeUrl", "createdAt") VALUES ('cmsctrzhx001nv9r4n1fsyaaz', 'cmsctqq88001bv9r4a4xca2dm', 'cmscqutqc0001v9migz86s9oz', 'CRB-UAGJMF-3298', '/uploads/qrcodes/CRB-UAGJMF-3298.png', '2026-08-03T06:05:24.213Z');
INSERT INTO "Coupon" ("id", "orderId", "productId", "couponCode", "qrCodeUrl", "createdAt") VALUES ('cmscuv43b001vv9r4motoau8j', 'cmscu2tlk001rv9r4ecaxc89x', 'cmscqutqc0001v9migz86s9oz', 'CRB-BWQ6OE-2883', '/uploads/qrcodes/CRB-BWQ6OE-2883.png', '2026-08-03T06:35:49.751Z');
INSERT INTO "Coupon" ("id", "orderId", "productId", "couponCode", "qrCodeUrl", "createdAt") VALUES ('cmscuv43i001xv9r401soebly', 'cmscu2tlk001rv9r4ecaxc89x', 'cmscqutqc0001v9migz86s9oz', 'CRB-VWI49X-2883', '/uploads/qrcodes/CRB-VWI49X-2883.png', '2026-08-03T06:35:49.759Z');
INSERT INTO "Coupon" ("id", "orderId", "productId", "couponCode", "qrCodeUrl", "createdAt") VALUES ('cmscuvcry001zv9r4mbarqx2b', 'cmscsxhze000ev9r46i6lb2k8', 'cmscqutqc0001v9migz86s9oz', 'CRB-O0MP9Z-2883', '/uploads/qrcodes/CRB-O0MP9Z-2883.png', '2026-08-03T06:36:01.006Z');
INSERT INTO "Coupon" ("id", "orderId", "productId", "couponCode", "qrCodeUrl", "createdAt") VALUES ('cmscuvcs40021v9r45ip8laos', 'cmscsxhze000ev9r46i6lb2k8', 'cmscqutqc0001v9migz86s9oz', 'CRB-PJJGX0-2883', '/uploads/qrcodes/CRB-PJJGX0-2883.png', '2026-08-03T06:36:01.013Z');
INSERT INTO "Coupon" ("id", "orderId", "productId", "couponCode", "qrCodeUrl", "createdAt") VALUES ('cmscuvcsa0023v9r4pdkdysq4', 'cmscsxhze000ev9r46i6lb2k8', 'cmscqutqc0001v9migz86s9oz', 'CRB-66TDQI-2883', '/uploads/qrcodes/CRB-66TDQI-2883.png', '2026-08-03T06:36:01.018Z');

-- Data for BankTransfer
INSERT INTO "BankTransfer" ("id", "orderId", "receiptUrl", "transactionId", "status", "adminNotes", "reviewedAt", "reviewedBy", "createdAt", "updatedAt") VALUES ('cmscsu1m3000av9r496t0h6e0', 'cmscshmez0008v9r4mir5vw0r', '/uploads/receipts/receipt-1785735540647-smartbyteslogo.png', '435435435', 'APPROVED', '', '2026-08-03T05:39:27.828Z', 'cmscpnqwo0000v935rlpcyznb', '2026-08-03T05:39:00.650Z', '2026-08-03T05:39:27.828Z');
INSERT INTO "BankTransfer" ("id", "orderId", "receiptUrl", "transactionId", "status", "adminNotes", "reviewedAt", "reviewedBy", "createdAt", "updatedAt") VALUES ('cmsct24yd000iv9r47yjilf4s', 'cmsct24y6000gv9r4ofbv0but', '/uploads/receipts/receipt-1785735918203-blob', '45635235234', 'APPROVED', '', '2026-08-03T05:48:48.886Z', 'cmscpnqwo0000v935rlpcyznb', '2026-08-03T05:45:18.230Z', '2026-08-03T05:48:48.887Z');
INSERT INTO "BankTransfer" ("id", "orderId", "receiptUrl", "transactionId", "status", "adminNotes", "reviewedAt", "reviewedBy", "createdAt", "updatedAt") VALUES ('cmsctjr83000wv9r415uzw1f4', 'cmsctjr7v000uv9r4p3i4fwgu', '/uploads/receipts/receipt-1785736740222-blob', '324324324', 'APPROVED', '', '2026-08-03T05:59:20.892Z', 'cmscpnqwo0000v935rlpcyznb', '2026-08-03T05:59:00.243Z', '2026-08-03T05:59:20.893Z');
INSERT INTO "BankTransfer" ("id", "orderId", "receiptUrl", "transactionId", "status", "adminNotes", "reviewedAt", "reviewedBy", "createdAt", "updatedAt") VALUES ('cmsctr4gw001dv9r4me4zp1kz', 'cmsctqq88001bv9r4a4xca2dm', '/uploads/receipts/receipt-1785737083998-coupon-EBC1-VPGTA7-3290.png', '45645345345', 'APPROVED', '', '2026-08-03T06:05:24.177Z', 'cmscpnqwo0000v935rlpcyznb', '2026-08-03T06:04:44.001Z', '2026-08-03T06:05:24.178Z');
INSERT INTO "BankTransfer" ("id", "orderId", "receiptUrl", "transactionId", "status", "adminNotes", "reviewedAt", "reviewedBy", "createdAt", "updatedAt") VALUES ('cmscu37nd001tv9r4xe4e8xrj', 'cmscu2tlk001rv9r4ecaxc89x', '/uploads/receipts/receipt-1785737647980-coupon-EBC1-VPGTA7-3290.png', '453242334234', 'APPROVED', '', '2026-08-03T06:35:49.732Z', 'cmscpnqwo0000v935rlpcyznb', '2026-08-03T06:14:07.993Z', '2026-08-03T06:35:49.733Z');
INSERT INTO "BankTransfer" ("id", "orderId", "receiptUrl", "transactionId", "status", "adminNotes", "reviewedAt", "reviewedBy", "createdAt", "updatedAt") VALUES ('cmscu1lrs001pv9r409nkfyy3', 'cmscsxhze000ev9r46i6lb2k8', '/uploads/receipts/receipt-1785737572980-smartbyteslogo.png', '432432432', 'APPROVED', '', '2026-08-03T06:36:00.989Z', 'cmscpnqwo0000v935rlpcyznb', '2026-08-03T06:12:52.983Z', '2026-08-03T06:36:00.990Z');

-- Data for Winner
INSERT INTO "Winner" ("id", "productId", "orderId", "couponId", "prize", "announcedAt", "notifiedAt", "createdAt") VALUES ('cmscwcuzd0001v9mqwhvwm34j', 'cmscqutqc0001v9migz86s9oz', 'cmsct24y6000gv9r4ofbv0but', 'cmsct6niz000ov9r44tz6t2cm', '1st Prize - 10,000', '2026-08-03T07:17:37.369Z', NULL, '2026-08-03T07:17:37.369Z');
INSERT INTO "Winner" ("id", "productId", "orderId", "couponId", "prize", "announcedAt", "notifiedAt", "createdAt") VALUES ('cmscwf3n30003v9mqglairbln', 'cmscqutqc0001v9migz86s9oz', 'cmsctqq88001bv9r4a4xca2dm', 'cmsctrzhq001jv9r4zp4haud8', '2nd Prize - Rs 8,000', '2026-08-03T07:19:21.903Z', NULL, '2026-08-03T07:19:21.903Z');
INSERT INTO "Winner" ("id", "productId", "orderId", "couponId", "prize", "announcedAt", "notifiedAt", "createdAt") VALUES ('cmscwfodj0005v9mq5zorlq7i', 'cmscqutqc0001v9migz86s9oz', 'cmscsxhze000ev9r46i6lb2k8', 'cmscuvcsa0023v9r4pdkdysq4', '3rd Prize - Rs 3,000', '2026-08-03T07:19:48.776Z', NULL, '2026-08-03T07:19:48.776Z');

-- Data for Otp
INSERT INTO "Otp" ("id", "userId", "code", "type", "expiresAt", "used", "createdAt") VALUES ('cmscrw2i70003v9r4453dt556', 'cmscrw2hy0001v9r400pzdcoh', '320784', 'EMAIL', '2026-08-03T05:22:35.502Z', false, '2026-08-03T05:12:35.503Z');
INSERT INTO "Otp" ("id", "userId", "code", "type", "expiresAt", "used", "createdAt") VALUES ('cmscshb5y0006v9r4dqn16drq', 'cmscshb5m0004v9r4w7hkno3y', '532065', 'EMAIL', '2026-08-03T05:39:06.501Z', false, '2026-08-03T05:29:06.502Z');
INSERT INTO "Otp" ("id", "userId", "code", "type", "expiresAt", "used", "createdAt") VALUES ('cmsctq4nl0019v9r440atde79', 'cmsctq4nb0017v9r47a1jvhwe', '343913', 'EMAIL', '2026-08-03T06:13:57.584Z', false, '2026-08-03T06:03:57.585Z');

-- Data for Cart
INSERT INTO "Cart" ("id", "sessionId", "items", "createdAt", "updatedAt") VALUES ('cmscruz360000v9r4m4d4thnu', 'd7d31c39-b6ee-4ef8-b888-7d5a34c5d16a', '[]', '2026-08-03T05:11:44.418Z', '2026-08-04T01:37:41.807Z');

-- Data for SiteSettings
INSERT INTO "SiteSettings" ("id", "logoUrl", "heroImageUrl", "heroTitle", "heroSubtitle", "noticeText", "noticeIsActive", "contactEmail", "contactPhone", "contactAddress", "socialLinks", "aboutUs", "termsAndConditions", "privacyPolicy", "bankName", "bankAccountNumber", "bankAccountName", "bankBranch", "updatedAt") VALUES ('cmscpov470000v9miqmv2b0se', '/uploads/1785730249887-VisuraLogo (3).png', '/uploads/1785776089701-Copy of buywin (1).gif', 'BUY - DONATE  and WIN', 'Donate your purchases and get a chance to win cash prizes.', '', false, '', '', '', NULL, '', '', '', 'Commercial Bank', '808003839432', 'R. M. Reyaas', 'Matale', '2026-08-03T16:54:53.020Z');

-- Data for OAuthSettings
INSERT INTO "OAuthSettings" ("id", "provider", "isEnabled", "clientId", "clientSecret", "updatedAt") VALUES ('cmsdz9vfz0002v94et3n7rm51', 'APPLE', false, NULL, NULL, '2026-08-04T01:27:48.656Z');
INSERT INTO "OAuthSettings" ("id", "provider", "isEnabled", "clientId", "clientSecret", "updatedAt") VALUES ('cmsdz9vfm0001v94e1fqxp7of', 'FACEBOOK', false, NULL, NULL, '2026-08-04T01:27:48.677Z');
INSERT INTO "OAuthSettings" ("id", "provider", "isEnabled", "clientId", "clientSecret", "updatedAt") VALUES ('cmsdz9ve20000v94elja389c8', 'GOOGLE', true, 'YOUR_GOOGLE_CLIENT_ID', 'YOUR_GOOGLE_CLIENT_SECRET', '2026-08-04T01:27:48.678Z');

