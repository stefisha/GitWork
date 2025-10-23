import React, { useState } from 'react';
import emailjs from '@emailjs/browser';

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      // Initialize EmailJS with your public key
      emailjs.init('8pr5zlixwWjlJhXzE');
      
      // Send email using EmailJS
      const result = await emailjs.send(
        'service_fscd3dl', // Your Gmail service ID
        'template_default', // Default template (should exist)
        {
          from_name: formData.name,
          from_email: formData.email,
          subject: formData.subject,
          message: formData.message,
          to_email: 'support@gitwork.io'
        }
      );

      if (result.status === 200) {
        setSubmitStatus('success');
        setFormData({ name: '', email: '', subject: '', message: '' });
      } else {
        setSubmitStatus('error');
      }
    } catch (error) {
      console.error('Contact form error:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4 sm:p-8"
      style={{ background: '#0d1117' }}
    >
      <div className="max-w-2xl w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div 
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center"
              style={{ background: '#161b22', border: '1px solid #30363d' }}
            >
              <svg 
                className="w-8 h-8 sm:w-10 sm:h-10 text-white" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" 
                />
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" 
                />
              </svg>
            </div>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
            Contact Us
          </h1>
          <p className="text-gray-400 text-sm sm:text-base">
            Have questions or want to get your project listed? We'd love to hear from you.
          </p>
        </div>

        {/* Contact Form */}
        <div 
          className="rounded-lg p-6 sm:p-8"
          style={{ background: '#161b22', border: '1px solid #30363d' }}
        >
          {submitStatus === 'success' && (
            <div className="mb-6 p-4 rounded-lg" style={{ background: '#1a472a', border: '1px solid #238636' }}>
              <p className="text-green-400 text-sm sm:text-base">
                ✅ Thank you! Your message has been sent successfully. We'll get back to you soon.
              </p>
            </div>
          )}

          {submitStatus === 'error' && (
            <div className="mb-6 p-4 rounded-lg" style={{ background: '#5d1a1a', border: '1px solid #da3633' }}>
              <p className="text-red-400 text-sm sm:text-base">
                ❌ Sorry, there was an error sending your message. Please try again or email us directly at support@gitwork.io
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            {/* Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-white mb-2">
                Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-lg text-white placeholder-gray-400 bg-transparent border border-gray-600 focus:outline-none focus:border-purple-500 transition-colors duration-200"
                placeholder="Your name"
              />
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-white mb-2">
                Email *
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-lg text-white placeholder-gray-400 bg-transparent border border-gray-600 focus:outline-none focus:border-purple-500 transition-colors duration-200"
                placeholder="your.email@example.com"
              />
            </div>

            {/* Subject */}
            <div>
              <label htmlFor="subject" className="block text-sm font-medium text-white mb-2">
                Subject *
              </label>
              <input
                type="text"
                id="subject"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-lg text-white placeholder-gray-400 bg-transparent border border-gray-600 focus:outline-none focus:border-purple-500 transition-colors duration-200"
                placeholder="What's this about?"
              />
            </div>

            {/* Message */}
            <div>
              <label htmlFor="message" className="block text-sm font-medium text-white mb-2">
                Message *
              </label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                required
                rows={6}
                className="w-full px-4 py-3 rounded-lg text-white placeholder-gray-400 bg-transparent border border-gray-600 focus:outline-none focus:border-purple-500 transition-colors duration-200 resize-none"
                placeholder="Tell us more about your question or project..."
              />
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full px-6 py-3 rounded-lg font-semibold text-white transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ background: '#8B5CF6' }}
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Sending...</span>
                  </div>
                ) : (
                  'Send Message'
                )}
              </button>
            </div>
          </form>

          {/* Alternative Contact */}
          <div className="mt-6 pt-6 border-t border-gray-700">
            <p className="text-gray-400 text-xs sm:text-sm text-center">
              Prefer email? You can also reach us directly at{' '}
              <a 
                href="mailto:support@gitwork.io" 
                className="text-purple-400 hover:text-purple-300 transition-colors duration-200"
              >
                support@gitwork.io
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
