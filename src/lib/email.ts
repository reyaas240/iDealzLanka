import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendOrderConfirmationEmail(
  email: string,
  orderDetails: any,
  includeCoupons: boolean = false
) {
  try {
    const { order, product, coupons } = orderDetails
    
    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || "noreply@idealsrilanka.com",
      to: email,
      subject: includeCoupons 
        ? "Order Confirmed - Your Coupons Are Ready!" 
        : "Order Received - Awaiting Payment Approval",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #2563eb;">iDealzSrilanka</h1>
          <h2 style="color: #1e40af;">Order Confirmation</h2>
          
          <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Order ID:</strong> ${order.id.slice(0, 8)}...</p>
            <p><strong>Product:</strong> ${product.name}</p>
            <p><strong>Quantity:</strong> ${order.quantity}</p>
            <p><strong>Total:</strong> ${order.currency} ${Number(order.total).toLocaleString()}</p>
            <p><strong>Payment Method:</strong> ${order.paymentMethod}</p>
          </div>

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
              <h3 style="color: #92400e; margin-top: 0;">⏳ Payment Approval Pending</h3>
              <p>Your order is being reviewed. Once your payment is approved, you will receive your coupons via email.</p>
            </div>
          `}

          <p style="color: #6b7280; font-size: 14px;">
            Thank you for supporting iDealzSrilanka!
          </p>
        </div>
      `,
    })
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
    
    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || "noreply@idealsrilanka.com",
      to: email,
      subject: "🎉 Congratulations! You're a Winner!",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #2563eb;">iDealzSrilanka</h1>
          
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
      `,
    })
  } catch (error) {
    console.error("Failed to send winner notification email:", error)
    throw new Error("Failed to send email")
  }
}

export async function sendOTPEmail(email: string, code: string): Promise<void> {
  try {
    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || "noreply@idealsrilanka.com",
      to: email,
      subject: "Your Verification Code",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #2563eb;">iDealzSrilanka</h1>
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
      `,
    })
  } catch (error) {
    console.error("Failed to send OTP email:", error)
    throw new Error("Failed to send OTP email")
  }
}
