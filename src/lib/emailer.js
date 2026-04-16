import nodemailer from 'nodemailer';

let transporter = null;

async function getTransporter() {
  if (transporter) return transporter;

  // If provided in .env, use real SMTP
  if (process.env.EMAIL_HOST && process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT || 587,
      secure: process.env.EMAIL_PORT === '465', // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
    return transporter;
  }

  // Otherwise, fallback to Ethereal Email (Auto-generated for testing)
  console.log('Generating Ethereal email test account...');
  const testAccount = await nodemailer.createTestAccount();
  
  transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: testAccount.user, // generated ethereal user
      pass: testAccount.pass, // generated ethereal password
    },
  });

  return transporter;
}

export async function sendEmail({ to, subject, html }) {
  try {
    const t = await getTransporter();
    const info = await t.sendMail({
      from: '"Glamour Cosmetics" <noreply@glamour.local>',
      to,
      subject,
      html,
    });

    console.log('Message sent: %s', info.messageId);
    
    // Log the Ethereal URL if we are using the test account
    const testUrl = nodemailer.getTestMessageUrl(info);
    if (testUrl) {
      console.log('*** Preview Ethereal Email: %s ***', testUrl);
    }
    return { success: true, info, testUrl };
  } catch (error) {
    console.error('Email sending failed:', error);
    return { success: false, error };
  }
}

export async function sendPasswordResetEmail(email, token) {
  const resetUrl = `http://localhost:3000/reset-password?token=${token}`;
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e8e4e1;">
      <h2 style="font-family: serif; color: #1a1a1a;">Reset Your Password</h2>
      <p>We received a request to reset the password for your Glamour Cosmetics account.</p>
      <p>Click the button below to choose a new password. This link will expire in 15 minutes.</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${resetUrl}" style="background-color: #1a1a1a; color: #ffffff; padding: 12px 24px; text-decoration: none; text-transform: uppercase; font-size: 14px; letter-spacing: 1px;">Reset Password</a>
      </div>
      <p style="font-size: 12px; color: #8a8a8a;">If you did not request a password reset, please ignore this email.</p>
    </div>
  `;
  return sendEmail({ to: email, subject: 'Password Reset - Glamour Cosmetics', html });
}

export async function sendOrderReceiptEmail(email, orderData) {
  const itemsHtml = orderData.items.map(item => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.product_name}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">₹${item.unit_price}</td>
    </tr>
  `).join('');

  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e8e4e1;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="font-family: serif; color: #1a1a1a; letter-spacing: 2px;">GLAMOUR</h1>
        <p style="color: #8a8a8a;">Order Receipt</p>
      </div>
      
      <p>Thank you for your order! Your payment has been processed and your cosmetics are on their way.</p>
      
      <div style="background-color: #f5f0eb; padding: 15px; margin: 20px 0;">
        <p style="margin: 0;"><strong>Order Number:</strong> ${orderData.orderNumber}</p>
      </div>

      <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
        <thead>
          <tr>
            <th style="padding: 10px; border-bottom: 2px solid #ccc; text-align: left;">Product</th>
            <th style="padding: 10px; border-bottom: 2px solid #ccc; text-align: center;">Qty</th>
            <th style="padding: 10px; border-bottom: 2px solid #ccc; text-align: right;">Price</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
          <tr>
            <td colspan="2" style="padding: 15px 10px; text-align: right; font-weight: bold;">Total:</td>
            <td style="padding: 15px 10px; text-align: right; font-weight: bold;">₹${parseFloat(orderData.totalAmount).toLocaleString('en-IN')}</td>
          </tr>
        </tbody>
      </table>
      
      <p style="font-size: 12px; color: #8a8a8a; text-align: center;">Thank you for shopping at Glamour Cosmetics.</p>
    </div>
  `;
  return sendEmail({ to: email, subject: `Your Order Receipt - ${orderData.orderNumber}`, html });
}
