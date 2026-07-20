# iDealzSrilanka Implementation Plan

This plan outlines building a Next.js web application for selling draw campaign products with OTP verification, bank transfer approval, and QR coupon generation.

## Tech Stack
- **Frontend**: Next.js 14+ (App Router, TypeScript, TailwindCSS, shadcn/ui)
- **Backend**: Next.js API Routes with tRPC for type-safety
- **Database**: PostgreSQL on Neon.tech with Prisma ORM
- **Authentication**: NextAuth.js with email/mobile OTP
- **File Storage**: Local folder storage with Vercel Blob fallback for product images and receipt uploads
- **Email**: Resend for winner notifications
- **SMS**: Twilio for OTP verification
- **Payment**: Stripe integration (optional), Bank Transfer workflow

## Core Features

### 1. Public Website
- Homepage with logo, hero section (image, title, subtitle)
- Notice banner (configurable by admin)
- Product listing page with images and campaign details
- Product detail pages with draw information
- User registration/login with OTP (email or mobile)
- Shopping cart and checkout flow
- Bank transfer submission form (receipt upload, transaction ID)
- Order tracking page
- Contact page with contact details
- About Us, Terms & Conditions, Privacy Policy pages

### 2. Admin Panel
- Dashboard with statistics
- Product management (CRUD for draw campaigns)
- Order management (view, approve bank transfers)
- User management (view users, assign roles)
- Draw management (select winners, publish results)
- QR coupon generation and viewing
- Site Settings management (logo, hero images, notices, contact details, social links, legal pages)

### 3. User Portal
- Order history
- View QR coupons for purchased items
- Winner announcements

## Database Schema

### Users Table
```prisma
model User {
  id        String   @id @default(cuid())
  name      String
  email     String?  @unique
  mobile    String?  @unique
  country   String?
  role      UserRole @default(CUSTOMER)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  orders    Order[]
  otps      Otp[]
}

enum UserRole {
  ADMIN
  STAFF
  CUSTOMER
}
```

### Products Table
```prisma
model Product {
  id           String    @id @default(cuid())
  name         String
  description  String
  images       String[]  // Array of file URLs
  price        Decimal
  currency     String    @default("LKR") // Sri Lankan Rupees
  itemPrefix   String    @unique // e.g., "CHARITY"
  drawDate     DateTime
  isActive     Boolean   @default(true)
  totalItems   Int       @default(0)
  soldItems    Int       @default(0)
  createdAt    DateTime  @default(now())
  updatedAt    DateTime  @updatedAt
  orders       Order[]
  coupons      Coupon[]
  winners      Winner[]
}
```

### Orders Table
```prisma
model Order {
  id            String        @id @default(cuid())
  userId        String
  user          User          @relation(fields: [userId], references: [id])
  productId     String
  product       Product       @relation(fields: [productId], references: [id])
  quantity      Int
  status        OrderStatus   @default(PENDING)
  total         Decimal
  currency      String        @default("LKR") // Sri Lankan Rupees
  paymentMethod PaymentMethod
  paymentDetails Json?
  createdAt     DateTime      @default(now())
  updatedAt     DateTime      @updatedAt
  coupons       Coupon[]
  bankTransfer  BankTransfer?
  winner        Winner?
}

enum OrderStatus {
  PENDING
  PENDING_APPROVAL
  APPROVED
  COMPLETED
  CANCELLED
}

enum PaymentMethod {
  BANK_TRANSFER
  ONLINE_PAYMENT
}
```

**Note:** Each order can contain only one product type, but can have multiple quantities. Each quantity purchased generates a separate coupon.

### Coupons Table
```prisma
model Coupon {
  id          String    @id @default(cuid())
  orderId     String
  order       Order     @relation(fields: [orderId], references: [id])
  couponCode  String    @unique // Format: PREFIX-RANDOM-MOBILE4
  qrCodeUrl   String?   // File URL of QR code
  createdAt   DateTime  @default(now())
  winner      Winner?
}
```

**Note:** Each purchased quantity creates a separate Coupon record with its own unique couponCode and qrCodeUrl. If a user buys 5 items, 5 Coupon records are created, each with individual coupon codes.

### BankTransfers Table
```prisma
model BankTransfer {
  id           String              @id @default(cuid())
  orderId      String              @unique
  order        Order               @relation(fields: [orderId], references: [id])
  receiptUrl   String              // File URL (local or Vercel Blob)
  transactionId String
  status       BankTransferStatus @default(PENDING)
  adminNotes   String?
  reviewedAt   DateTime?
  reviewedBy   String?
  createdAt    DateTime           @default(now())
  updatedAt    DateTime           @updatedAt
}

enum BankTransferStatus {
  PENDING
  APPROVED
  REJECTED
}
```

### Winners Table
```prisma
model Winner {
  id        String    @id @default(cuid())
  productId String
  product   Product   @relation(fields: [productId], references: [id])
  orderId   String
  order     Order     @relation(fields: [orderId], references: [id])
  couponId  String    @unique
  coupon    Coupon    @relation(fields: [couponId], references: [id])
  prize     String
  announcedAt DateTime @default(now())
  notifiedAt  DateTime?
  createdAt   DateTime  @default(now())
}
```

### OTP Table (for verification)
```prisma
model Otp {
  id         String   @id @default(cuid())
  userId     String
  user       User     @relation(fields: [userId], references: [id])
  code       String   // 6-digit code
  type       OtpType
  expiresAt  DateTime
  used       Boolean  @default(false)
  createdAt  DateTime @default(now())
}

enum OtpType {
  EMAIL
  MOBILE
}
```

### Cart Table (for guest users)
```prisma
model Cart {
  id        String      @id @default(cuid())
  sessionId String      @unique
  items     Json        // Array of {productId, quantity}
  createdAt DateTime    @default(now())
  updatedAt DateTime    @updatedAt
}
```

### SiteSettings Table (for configurable website elements)
```prisma
model SiteSettings {
  id              String   @id @default(cuid())
  logoUrl         String?  // File URL
  heroImageUrl    String?  // File URL
  heroTitle       String?
  heroSubtitle    String?
  noticeText      String?
  noticeIsActive  Boolean  @default(false)
  contactEmail    String?
  contactPhone    String?
  contactAddress  String?
  socialLinks     Json?    // {facebook, twitter, instagram, etc.}
  aboutUs         String?
  termsAndConditions String?
  privacyPolicy   String?
  updatedAt       DateTime @updatedAt
}
```

## Implementation Phases

### Phase 1: Project Setup
- Initialize Next.js project with TypeScript and TailwindCSS
- Set up shadcn/ui components
- Configure Prisma with Neon PostgreSQL
- Set up NextAuth.js authentication
- Configure environment variables

### Phase 2: Database & Authentication
- Create Prisma schema with all models
- Run database migrations
- Implement OTP verification flow (email/SMS)
- Create user registration and login pages
- Set up role-based access control

### Phase 3: Public Features
- Product listing and detail pages
- Shopping cart functionality
- Checkout flow with user creation
- Bank transfer submission form
- Order confirmation page

### Phase 4: Admin Panel
- Admin layout and navigation
- Product CRUD operations
- Order management with bank transfer approval
- User management interface
- Dashboard with statistics

### Phase 5: QR Coupons & Draw System
- QR code generation library integration
- Coupon code generation logic (prefix + random + user info)
- Draw management interface
- Winner selection and publishing
- Email notification system for winners

### Phase 6: Testing & Deployment
- Local testing with PostgreSQL
- Configure Vercel deployment
- Set up Neon production database
- Configure environment variables for production
- Deploy and test end-to-end

## Key Implementation Details

### UI/UX Design & Responsive Layout
- **Mobile-First Approach**: Design for mobile screens first, then scale up
- **Responsive Breakpoints**: 
  - Mobile: < 640px
  - Tablet: 640px - 1024px
  - Desktop: > 1024px
- **TailwindCSS**: Use responsive utilities (sm:, md:, lg:, xl:)
- **Touch-Friendly**: Large tap targets (minimum 44px), proper spacing
- **Navigation**: Mobile hamburger menu, desktop horizontal nav
- **Images**: Responsive images with proper sizing and optimization
- **Forms**: Mobile-friendly input fields, proper keyboard types
- **Performance**: Optimized loading, lazy loading for images
- **Accessibility**: WCAG AA compliance, proper contrast ratios

### File Storage Strategy
- **Local Development**: Store files in `/public/uploads` folder
- **Production**: Use Vercel Blob if `BLOB_READ_WRITE_TOKEN` is configured
- **Fallback**: If Vercel Blob is not configured, use local storage
- **File Types**: Product images, bank transfer receipts, QR code images
- **Implementation**: Use conditional logic to check for Vercel Blob availability

### Image Compression for Receipts
- **Client-side Compression**: Compress images before upload using browser APIs
- **Library**: Use `browser-image-compression` or similar library
- **Compression Settings**: 
  - Max file size: 2MB
  - Quality: 0.7 (70%)
  - Resize to max 1920px width/height
  - Convert to JPEG format
- **Benefits**: Faster uploads, reduced storage costs, better performance
- **Validation**: Check file size and dimensions before compression

### QR Coupon Generation
- Format: `{ITEM_PREFIX}-{RANDOM_6CHAR}-{MOBILE_LAST4}`
- Each purchased quantity creates a separate Coupon record with unique couponCode
- If user buys 5 items, 5 individual coupons are generated with different codes
- Store in Coupons table
- Generate QR code image URL using library like qrcode
- Display in user portal and admin panel

### Bank Transfer Approval Flow
1. User completes checkout, selects bank transfer
2. Uploads receipt and enters transaction ID
3. Order status = "pending_approval"
4. Send confirmation email WITHOUT coupons to user
5. Admin reviews in admin panel
6. Admin approves/rejects with notes
7. If approved, generate QR coupons
8. Send email WITH downloadable coupons to user

### OTP Verification
- Email: Use Resend to send OTP
- SMS: Use Twilio for mobile OTP
- OTP valid for 10 minutes
- Store in database with expiration

### Online Payment Flow (IPG)
1. User completes checkout, selects online payment
2. User completes payment via payment gateway
3. Order status = "completed"
4. Generate QR coupons immediately
5. Send email WITH downloadable coupons to user

### Draw Management
- Admin selects winners from valid coupons
- System publishes winners on website
- Send email notification to winners with prize details
- Manual draw process supported

## File Structure
```
/app
  /api - API routes and tRPC endpoints
  /auth - NextAuth configuration
  /(public) - Public pages
  /(admin) - Admin panel pages
  /(user) - User portal pages
/lib
  /db - Prisma client
  /auth - Authentication utilities
  /utils - Helper functions
/components
  /ui - shadcn components
  /admin - Admin-specific components
  /public - Public-facing components
/prisma - Schema and migrations
```

## Environment Variables Required
- DATABASE_URL (Neon PostgreSQL)
- NEXTAUTH_SECRET
- NEXTAUTH_URL
- RESEND_API_KEY (email)
- TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN (SMS)
- BLOB_READ_WRITE_TOKEN (Vercel Blob - optional, falls back to local storage)
- STRIPE_SECRET_KEY (optional, for online payments)
