import express from 'express';
import nodemailer from 'nodemailer';

const router = express.Router();

// Create transporter for sending emails
const createTransporter = () => {
  // For now, we'll use a simple SMTP configuration
  // In production, you might want to use a service like SendGrid, Mailgun, etc.
  return nodemailer.createTransporter({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: process.env.SMTP_PORT || 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER || 'support@gitwork.io',
      pass: process.env.SMTP_PASS || process.env.EMAIL_PASSWORD
    }
  });
};

/**
 * POST /api/contact
 * Send contact form email
 */
router.post('/', async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    // Validate required fields
    if (!name || !email || !subject || !message) {
      return res.status(400).json({
        success: false,
        error: 'All fields are required'
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid email format'
      });
    }

    // Create email content
    const emailContent = `
New contact form submission from GitWork.io

Name: ${name}
Email: ${email}
Subject: ${subject}

Message:
${message}

---
Sent from GitWork.io contact form
    `.trim();

    // Try to send email
    try {
      const transporter = createTransporter();
      
      const mailOptions = {
        from: process.env.SMTP_FROM || 'support@gitwork.io',
        to: 'support@gitwork.io',
        subject: `[GitWork Contact] ${subject}`,
        text: emailContent,
        replyTo: email
      };

      await transporter.sendMail(mailOptions);
      
      console.log('✅ Contact form email sent successfully');
      
      res.json({
        success: true,
        message: 'Email sent successfully'
      });

    } catch (emailError) {
      console.error('❌ Error sending contact form email:', emailError);
      
      // Log the contact form data for manual follow-up
      console.log('📧 Contact form data (email failed):', {
        name,
        email,
        subject,
        message,
        timestamp: new Date().toISOString()
      });

      // Still return success to user, but log the issue
      res.json({
        success: true,
        message: 'Message received (email service temporarily unavailable)'
      });
    }

  } catch (error) {
    console.error('❌ Error processing contact form:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process contact form'
    });
  }
});

export default router;
