import { Resend } from "resend"
import { prisma } from "@/lib/db"
import nodemailer from "nodemailer"

let resend: Resend | null = null
let smtpTransporter: nodemailer.Transporter | null = null

function getResendClient() {
  if (!resend && process.env.RESEND_API_KEY) {
    resend = new Resend(process.env.RESEND_API_KEY)
  }
  return resend
}

function getSMTPTransporter() {
  if (!smtpTransporter && process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASSWORD) {
    smtpTransporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || "587"),
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    })
  }
  return smtpTransporter
}

async function getLogoUrl(): Promise<string | null> {
  try {
    const settings = await prisma.siteSettings.findFirst()
    return settings?.logoUrl || null
  } catch {
    return null
  }
}

async function sendEmailViaSMTP(to: string, subject: string, html: string) {
  const transporter = getSMTPTransporter()
  if (!transporter) {
    console.warn('SMTP not configured, skipping email')
    return
  }

  await transporter.sendMail({
    from: `"${process.env.SMTP_FROM_NAME || "iDealz Lanka"}" <${process.env.SMTP_FROM_EMAIL}>`,
    to,
    subject,
    html,
  })
}

async function sendEmailViaResend(to: string, subject: string, html: string) {
  const client = getResendClient()
  if (!client) {
    console.warn('Resend API key not configured, skipping email')
    return
  }

  await client.emails.send({
    from: process.env.RESEND_FROM_EMAIL || "noreply@idealsrilanka.com",
    to,
    subject,
    html,
  })
}

async function sendEmail(to: string, subject: string, html: string) {
  // Try SMTP first, fallback to Resend
  try {
    if (process.env.SMTP_HOST && process.env.SMTP_USER) {
      await sendEmailViaSMTP(to, subject, html)
    } else {
      await sendEmailViaResend(to, subject, html)
    }
  } catch (error) {
    console.error("Failed to send email:", error)
    throw new Error("Failed to send email")
  }
}

export async function sendOrderConfirmationEmail(
  email: string,
  orderDetails: any,
  includeCoupons: boolean = false
) {
  try {
    const { order, product, coupons, bankTransfer } = orderDetails
    const logoUrl = await getLogoUrl()
    
    const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          ${logoUrl ? `
            <div style="text-align: center; margin-bottom: 20px;">
              <img src="${logoUrl}" alt="iDealzSrilanka Logo" style="max-height: 60px; width: auto;" />
            </div>
          ` : `
            <h1 style="color: #2563eb; text-align: center;">iDealzSrilanka</h1>
          `}
          <h2 style="color: #1e40af; text-align: center;">Order Confirmation</h2>
          
          <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0;"><strong>Order ID:</strong> <span style="font-weight: bold; color: #1e40af; font-size: 16px;">${order.id}</span></p>
            <p style="margin: 10px 0 0;"><strong>Product:</strong> ${product.name}</p>
            <p style="margin: 10px 0 0;"><strong>Quantity:</strong> ${order.quantity}</p>
            <p style="margin: 10px 0 0;"><strong>Total:</strong> ${order.currency} ${Number(order.total).toLocaleString()}</p>
            <p style="margin: 10px 0 0;"><strong>Payment Method:</strong> ${order.paymentMethod}</p>
            ${!includeCoupons ? `
              ${order.status === 'PENDING_PAYMENT' ? `
                <p style="margin: 10px 0 0;"><strong>Payment Status:</strong> <span style="color: #d97706; font-weight: bold;">⏳ PENDING PAYMENT</span></p>
              ` : `
                <p style="margin: 10px 0 0;"><strong>Payment Status:</strong> <span style="color: #d97706; font-weight: bold;">⏳ Pending Approval</span></p>
              `}
            ` : `
              <p style="margin: 10px 0 0;"><strong>Payment Status:</strong> <span style="color: #059669; font-weight: bold;">✅ Paid</span></p>
            `}
          </div>

          ${!includeCoupons && bankTransfer ? `
            <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #92400e; margin-top: 0;">🏦 Bank Transfer Details</h3>
              <p style="margin: 10px 0;"><strong>Transaction ID:</strong> ${bankTransfer.transactionId}</p>
              <p style="margin: 10px 0;"><strong>Status:</strong> ${bankTransfer.status}</p>
              ${bankTransfer.adminNotes ? `<p style="margin: 10px 0;"><strong>Admin Notes:</strong> ${bankTransfer.adminNotes}</p>` : ''}
            </div>
          ` : ''}

          ${includeCoupons ? `
            <div style="background: #dbeafe; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #1e40af; margin-top: 0;">🎉 Your Coupons Are Ready!</h3>
              <p>You have received ${coupons.length} coupon(s) for the draw.</p>
              <p>Log in to your dashboard to view and download your QR codes.</p>
              <a href="${process.env.NEXTAUTH_URL}/dashboard/coupons" 
                 style="display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 10px;">
                View My Coupons
              </a>
            </div>
          ` : `
            <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #92400e; margin-top: 0;">⏳ Payment/Order Approval Pending</h3>
              <p>Your order is being reviewed. Once your payment is approved, you will receive your coupons via email. If we cannot process your payment, your order will be cancelled within 24 hours.</p>
            </div>
          `}

          <p style="color: #6b7280; font-size: 14px;">
            Thank you for supporting iDealzSrilanka!
          </p>
        </div>
      `
    
    const subject = includeCoupons 
      ? "Order Confirmed - Your Coupons Are Ready!" 
      : "Order Received - Awaiting Payment Approval"
    
    await sendEmail(email, subject, html)
  } catch (error) {
    console.error("Failed to send order confirmation email:", error)
    throw new Error("Failed to send email")
  }
}

export async function sendWinnerNotificationEmail(
  email: string,
  winnerDetails: any
) {
  try {
    const { product, coupon, prize } = winnerDetails
    const logoUrl = await getLogoUrl()
    
    const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          ${logoUrl ? `
            <div style="text-align: center; margin-bottom: 20px;">
              <img src="${logoUrl}" alt="iDealzSrilanka Logo" style="max-height: 60px; width: auto;" />
            </div>
          ` : `
            <h1 style="color: #2563eb; text-align: center;">iDealzSrilanka</h1>
          `}
          
          <div style="background: #dbeafe; padding: 30px; border-radius: 8px; margin: 20px 0; text-align: center;">
            <div style="font-size: 60px; margin-bottom: 10px;">🎉</div>
            <h2 style="color: #1e40af; margin-top: 0;">Congratulations!</h2>
            <p style="font-size: 18px; color: #1e40af;">You've won a prize!</p>
          </div>

          <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Product:</strong> ${product.name}</p>
            <p><strong>Coupon Code:</strong> ${coupon.couponCode}</p>
            <p><strong>Prize:</strong> ${prize}</p>
          </div>

          <p style="color: #6b7280; font-size: 14px;">
            Our team will contact you shortly to arrange prize delivery.
          </p>
          
          <p style="color: #6b7280; font-size: 14px;">
            Thank you for participating in iDealzSrilanka!
          </p>
        </div>
      `
    
    await sendEmail(email, "🎉 Congratulations! You're a Winner!", html)
  } catch (error) {
    console.error("Failed to send winner notification email:", error)
    throw new Error("Failed to send email")
  }
}

export async function sendOTPEmail(email: string, code: string): Promise<void> {
  try {
    const logoUrl = await getLogoUrl()
    
    const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          ${logoUrl ? `
            <div style="text-align: center; margin-bottom: 20px;">
              <img src="${logoUrl}" alt="iDealzSrilanka Logo" style="max-height: 60px; width: auto;" />
            </div>
          ` : `
            <h1 style="color: #2563eb; text-align: center;">iDealzSrilanka</h1>
          `}
          <h2 style="color: #1e40af;">Your Verification Code</h2>
          
          <div style="background: #f3f4f6; padding: 30px; border-radius: 8px; margin: 20px 0; text-align: center;">
            <p style="font-size: 14px; color: #6b7280; margin-bottom: 10px;">Your verification code is:</p>
            <p style="font-size: 36px; font-weight: bold; color: #1e40af; letter-spacing: 5px;">${code}</p>
          </div>

          <p style="color: #6b7280; font-size: 14px;">
            This code will expire in 10 minutes.
          </p>
          
          <p style="color: #6b7280; font-size: 14px;">
            If you didn't request this code, please ignore this email.
          </p>
        </div>
      `
    
    await sendEmail(email, "Your Verification Code", html)
  } catch (error) {
    console.error("Failed to send OTP email:", error)
    throw new Error("Failed to send OTP email")
  }
}

export async function sendOrderApprovalEmail(
  email: string,
  orderDetails: any
) {
  try {
    const { order, product, coupons } = orderDetails
    const logoUrl = await getLogoUrl()
    
    const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          ${logoUrl ? `
            <div style="text-align: center; margin-bottom: 20px;">
              <img src="${logoUrl}" alt="iDealzSrilanka Logo" style="max-height: 60px; width: auto;" />
            </div>
          ` : `
            <h1 style="color: #2563eb; text-align: center;">iDealzSrilanka</h1>
          `}
          <h2 style="color: #1e40af; text-align: center;">Order Approved! 🎉</h2>
          
          <div style="background: #dbeafe; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="color: #1e40af; font-weight: bold;">Your payment has been approved!</p>
            <p>Your coupons are now ready for the draw.</p>
          </div>
          
          <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0;"><strong>Order ID:</strong> <span style="font-weight: bold; color: #1e40af; font-size: 16px;">${order.id}</span></p>
            <p style="margin: 10px 0 0;"><strong>Product:</strong> ${product.name}</p>
            <p style="margin: 10px 0 0;"><strong>Quantity:</strong> ${order.quantity}</p>
            <p style="margin: 10px 0 0;"><strong>Total:</strong> ${order.currency} ${Number(order.total).toLocaleString()}</p>
          </div>

          <div style="background: #dbeafe; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #1e40af; margin-top: 0;">🎫 Your Coupons Are Ready!</h3>
            <p>You have received ${coupons.length} coupon(s) for the draw.</p>
            <p>Log in to your dashboard to view and download your QR codes.</p>
            <a href="${process.env.NEXTAUTH_URL}/dashboard/coupons" 
               style="display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 10px;">
              View My Coupons
            </a>
          </div>

          <p style="color: #6b7280; font-size: 14px;">
            Thank you for supporting iDealzSrilanka!
          </p>
        </div>
      `
    
    await sendEmail(email, "Order Approved - Your Coupons Are Ready!", html)
  } catch (error) {
    console.error("Failed to send order approval email:", error)
    throw new Error("Failed to send email")
  }
}
