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
    console.log('Creating SMTP transporter:', {
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      user: process.env.SMTP_USER,
      secure: parseInt(process.env.SMTP_PORT || "587") === 465
    })
    
    smtpTransporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || "587"),
      secure: parseInt(process.env.SMTP_PORT || "587") === 465, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
      tls: {
        rejectUnauthorized: false, // Allow self-signed certificates if needed
      },
      debug: process.env.NODE_ENV === 'development', // Enable debug logging in development
    })
    
    // Verify connection
    smtpTransporter.verify((error, success) => {
      if (error) {
        console.error('SMTP connection verification failed:', error)
      } else {
        console.log('SMTP server is ready to send emails')
      }
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

async function sendEmailViaSMTP(to: string, subject: string, html: string, text: string) {
  const transporter = getSMTPTransporter()
  if (!transporter) {
    console.error('SMTP not configured - missing SMTP_HOST, SMTP_USER, or SMTP_PASSWORD')
    throw new Error('SMTP not configured')
  }

  const fromEmail = process.env.SMTP_FROM_EMAIL || "noreply@idealio.lanka"
  const fromName = process.env.SMTP_FROM_NAME || "iDealioLanka"
  const replyTo = process.env.SMTP_REPLY_TO || fromEmail
  const unsubscribeUrl = `${process.env.NEXTAUTH_URL}/unsubscribe`

  console.log('Attempting to send email via SMTP:', { to, subject, fromEmail })
  
  try {
    const info = await transporter.sendMail({
      from: `"${fromName}" <${fromEmail}>`,
      to,
      replyTo,
      subject,
      html,
      text,
      headers: {
        'X-Priority': '3',
        'X-Mailer': 'iDealioLanka',
        'List-Unsubscribe': `<mailto:${fromEmail}?subject=unsubscribe>, <${unsubscribeUrl}>`,
        'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
      },
    })
    console.log('Email sent successfully via SMTP:', info.messageId)
  } catch (error) {
    console.error('SMTP send failed:', error)
    throw error
  }
}

async function sendEmailViaResend(to: string, subject: string, html: string, text: string) {
  const client = getResendClient()
  if (!client) {
    console.error('Resend API key not configured')
    throw new Error('Resend not configured')
  }

  const fromEmail = process.env.RESEND_FROM_EMAIL || "noreply@idealio.lanka"
  const replyTo = process.env.RESEND_REPLY_TO || fromEmail
  const unsubscribeUrl = `${process.env.NEXTAUTH_URL}/unsubscribe`

  console.log('Attempting to send email via Resend:', { to, subject, fromEmail })
  
  try {
    const result = await client.emails.send({
      from: fromEmail,
      to,
      replyTo,
      subject,
      html,
      text,
      headers: {
        'List-Unsubscribe': `<mailto:${fromEmail}?subject=unsubscribe>, <${unsubscribeUrl}>`,
        'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
      },
    })
    console.log('Email sent successfully via Resend:', result)
  } catch (error) {
    console.error('Resend send failed:', error)
    throw error
  }
}

async function sendEmail(to: string, subject: string, html: string, text: string) {
  console.log('sendEmail called:', { to, subject, hasSMTP: !!process.env.SMTP_HOST, hasResend: !!process.env.RESEND_API_KEY })
  
  // Try SMTP first, fallback to Resend
  try {
    if (process.env.SMTP_HOST && process.env.SMTP_USER) {
      await sendEmailViaSMTP(to, subject, html, text)
    } else if (process.env.RESEND_API_KEY) {
      await sendEmailViaResend(to, subject, html, text)
    } else {
      throw new Error('No email service configured (SMTP or Resend)')
    }
  } catch (error) {
    console.error("Failed to send email:", error)
    throw new Error("Failed to send email: " + (error as Error).message)
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
              <img src="${logoUrl}" alt="iDealioLanka Logo" style="max-height: 60px; width: auto;" />
            </div>
          ` : `
            <h1 style="color: #2563eb; text-align: center;">iDealioLanka</h1>
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
            Thank you for supporting iDealioLanka!
          </p>
        </div>
      `
    
    const text = `Order Confirmation

Order ID: ${order.id}
Product: ${product.name}
Quantity: ${order.quantity}
Total: ${order.currency} ${Number(order.total).toLocaleString()}
Payment Method: ${order.paymentMethod}
Payment Status: ${!includeCoupons ? (order.status === 'PENDING_PAYMENT' ? 'PENDING PAYMENT' : 'Pending Approval') : 'Paid'}

${!includeCoupons && bankTransfer ? `Bank Transfer Details:
Transaction ID: ${bankTransfer.transactionId}
Status: ${bankTransfer.status}
${bankTransfer.adminNotes ? `Admin Notes: ${bankTransfer.adminNotes}` : ''}

` : ''}${includeCoupons ? `Your Coupons Are Ready!
You have received ${coupons.length} coupon(s) for the draw.
Log in to your dashboard to view and download your QR codes: ${process.env.NEXTAUTH_URL}/dashboard/coupons

` : `Payment/Order Approval Pending
Your order is being reviewed. Once your payment is approved, you will receive your coupons via email. If we cannot process your payment, your order will be cancelled within 24 hours.

`}Thank you for supporting iDealioLanka!

---
To unsubscribe, visit: ${process.env.NEXTAUTH_URL}/unsubscribe`
    
    const subject = includeCoupons 
      ? "Order Confirmed - Your Coupons Are Ready!" 
      : "Order Received - Awaiting Payment Approval"
    
    await sendEmail(email, subject, html, text)
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
              <img src="${logoUrl}" alt="iDealioLanka Logo" style="max-height: 60px; width: auto;" />
            </div>
          ` : `
            <h1 style="color: #2563eb; text-align: center;">iDealioLanka</h1>
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
            Thank you for participating in iDealioLanka!
          </p>
        </div>
      `
    
    const text = `🎉 Congratulations! You're a Winner!

Product: ${product.name}
Coupon Code: ${coupon.couponCode}
Prize: ${prize}

Our team will contact you shortly to arrange prize delivery.

Thank you for participating in iDealioLanka!

---
To unsubscribe, visit: ${process.env.NEXTAUTH_URL}/unsubscribe`
    
    await sendEmail(email, "🎉 Congratulations! You're a Winner!", html, text)
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
              <img src="${logoUrl}" alt="iDealioLanka Logo" style="max-height: 60px; width: auto;" />
            </div>
          ` : `
            <h1 style="color: #2563eb; text-align: center;">iDealioLanka</h1>
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
    
    const text = `Your Verification Code

Your verification code is: ${code}

This code will expire in 10 minutes.

If you didn't request this code, please ignore this email.

---
To unsubscribe, visit: ${process.env.NEXTAUTH_URL}/unsubscribe`
    
    await sendEmail(email, "Your Verification Code", html, text)
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
              <img src="${logoUrl}" alt="iDealioLanka Logo" style="max-height: 60px; width: auto;" />
            </div>
          ` : `
            <h1 style="color: #2563eb; text-align: center;">iDealioLanka</h1>
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
            Thank you for supporting iDealioLanka!
          </p>
        </div>
      `
    
    const text = `Order Approved! 🎉

Your payment has been approved! Your coupons are now ready for the draw.

Order ID: ${order.id}
Product: ${product.name}
Quantity: ${order.quantity}
Total: ${order.currency} ${Number(order.total).toLocaleString()}

Your Coupons Are Ready!
You have received ${coupons.length} coupon(s) for the draw.
Log in to your dashboard to view and download your QR codes: ${process.env.NEXTAUTH_URL}/dashboard/coupons

Thank you for supporting iDealioLanka!

---
To unsubscribe, visit: ${process.env.NEXTAUTH_URL}/unsubscribe`
    
    await sendEmail(email, "Order Approved - Your Coupons Are Ready!", html, text)
  } catch (error) {
    console.error("Failed to send order approval email:", error)
    throw new Error("Failed to send email")
  }
}
