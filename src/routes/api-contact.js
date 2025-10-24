import express from 'express';

const router = express.Router();

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

    // Log the contact form data for manual follow-up
    console.log('📧 NEW CONTACT FORM SUBMISSION:');
    console.log('================================');
    console.log(`Name: ${name}`);
    console.log(`Email: ${email}`);
    console.log(`Subject: ${subject}`);
    console.log(`Message: ${message}`);
    console.log(`Timestamp: ${new Date().toISOString()}`);
    console.log('================================');
    
    // For now, we'll just log the data and return success
    // You can set up email forwarding later or use a service like:
    // - EmailJS (client-side)
    // - SendGrid (server-side with API key)
    // - Mailgun (server-side with API key)
    // - Or just check the server logs for new submissions
    
    res.json({
      success: true,
      message: 'Message received! We\'ll get back to you soon.'
    });

  } catch (error) {
    console.error('❌ Error processing contact form:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process contact form'
    });
  }
});

export default router;
