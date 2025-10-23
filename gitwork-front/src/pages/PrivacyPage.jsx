import React from 'react';

const PrivacyPage = () => {
  return (
    <div className="min-h-screen p-3 sm:p-6 md:p-8 -mt-12 sm:-mt-16" style={{ background: '#0d1117' }}>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8 md:mb-12">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-3 sm:mb-4">
            Privacy Policy
          </h1>
          <div className="text-gray-400 text-xs sm:text-sm md:text-base space-y-1 px-2">
            <p>Last updated: October 23, 2025</p>
            <p>Website: <a href="https://gitwork.io" className="text-purple-400 hover:text-purple-300 break-all">https://gitwork.io</a></p>
            <p>Contact: <a href="mailto:support@gitwork.io" className="text-purple-400 hover:text-purple-300 break-all">support@gitwork.io</a></p>
          </div>
        </div>

        {/* Content */}
        <div 
          className="rounded-lg p-4 sm:p-6 md:p-8 lg:p-10 space-y-4 sm:space-y-6 md:space-y-8"
          style={{ background: '#161b22', border: '1px solid #30363d' }}
        >
          {/* Section 1 */}
          <section>
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-white mb-2 sm:mb-3">1. Introduction</h2>
            <div className="text-gray-300 text-xs sm:text-sm md:text-base space-y-2 sm:space-y-3">
              <p>
                Welcome to GitWork.io ("we," "our," "us"). We operate a platform and GitHub app that connects developers to open-source bounties and contribution opportunities.
              </p>
              <p>
                This Privacy Policy explains how we collect, use, and protect your information when you use our website, app, or related services. By using GitWork.io, you agree to this Privacy Policy.
              </p>
            </div>
          </section>

          {/* Section 2 */}
          <section>
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-white mb-2 sm:mb-3">2. Information We Collect</h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-base sm:text-lg md:text-xl font-semibold text-white mb-2">A. Information You Provide</h3>
                <p className="text-gray-300 text-xs sm:text-sm md:text-base mb-2">We may collect:</p>
                <ul className="list-disc list-inside text-gray-300 text-xs sm:text-sm md:text-base space-y-1 ml-3 sm:ml-4">
                  <li>Email address</li>
                  <li>First and last name</li>
                  <li>GitHub username and public profile</li>
                  <li>Optional social links (e.g. X/Twitter, LinkedIn, Telegram)</li>
                  <li>Payment information (processed via secure third parties)</li>
                </ul>
              </div>

              <div>
                <h3 className="text-base sm:text-lg md:text-xl font-semibold text-white mb-2">B. Information Automatically Collected</h3>
                <p className="text-gray-300 text-xs sm:text-sm md:text-base mb-2">When you access our site, we may automatically collect:</p>
                <ul className="list-disc list-inside text-gray-300 text-xs sm:text-sm md:text-base space-y-1 ml-3 sm:ml-4">
                  <li>IP address and browser type</li>
                  <li>Device data (OS, screen size, time zone)</li>
                  <li>Usage data (pages visited, actions taken, referral URLs)</li>
                </ul>
                <p className="text-gray-300 text-sm sm:text-base mt-2">
                  We also use Google Analytics and related tools to understand how users interact with our platform.
                </p>
              </div>

              <div>
                <h3 className="text-base sm:text-lg md:text-xl font-semibold text-white mb-2">C. Information from Third-Party Integrations</h3>
                <p className="text-gray-300 text-xs sm:text-sm md:text-base mb-2">When you connect your GitHub account, we access limited public data through GitHub's API:</p>
                <ul className="list-disc list-inside text-gray-300 text-xs sm:text-sm md:text-base space-y-1 ml-3 sm:ml-4">
                  <li>Public repositories, commits, and pull request activity</li>
                  <li>GitHub profile name, username, and avatar</li>
                  <li>Repository metadata (issues, stars, forks)</li>
                </ul>
                <p className="text-gray-300 text-sm sm:text-base mt-2">
                  We only request permissions necessary to enable GitWork's core functionality. We never access or store private repositories without explicit consent.
                </p>
              </div>
            </div>
          </section>

          {/* Section 3 */}
          <section>
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-white mb-2 sm:mb-3">3. How We Use Your Information</h2>
            <p className="text-gray-300 text-sm sm:text-base mb-2">We use your data to:</p>
            <ul className="list-disc list-inside text-gray-300 text-sm sm:text-base space-y-1 ml-4">
              <li>Operate and improve the GitWork platform</li>
              <li>Authenticate your GitHub connection</li>
              <li>Display relevant bounties and contribution opportunities</li>
              <li>Send optional email updates or community news</li>
              <li>Process payments for premium features</li>
              <li>Ensure security, compliance, and prevent abuse</li>
            </ul>
            <p className="text-gray-300 text-sm sm:text-base mt-3 font-semibold">
              We never sell or rent personal data to third parties.
            </p>
          </section>

          {/* Section 4 */}
          <section>
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-white mb-2 sm:mb-3">4. Cookies and Tracking</h2>
            <p className="text-gray-300 text-sm sm:text-base mb-2">GitWork.io uses cookies and similar technologies for:</p>
            <ul className="list-disc list-inside text-gray-300 text-sm sm:text-base space-y-1 ml-4">
              <li>Session management</li>
              <li>Security and authentication</li>
              <li>Analytics and user experience improvements</li>
              <li>Personalized content and ads</li>
            </ul>
            <p className="text-gray-300 text-sm sm:text-base mt-2">
              You can control or delete cookies via your browser settings.
            </p>
          </section>

          {/* Section 5 */}
          <section>
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-white mb-2 sm:mb-3">5. Advertising and Remarketing</h2>
            <p className="text-gray-300 text-xs sm:text-sm md:text-base">
              We may use remarketing tools (e.g. Google Ads, X Ads) to show GitWork-related content to users who have previously interacted with our site.
            </p>
          </section>

          {/* Section 6 */}
          <section>
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-white mb-2 sm:mb-3">6. Payments</h2>
            <p className="text-gray-300 text-xs sm:text-sm md:text-base">
              When you make a payment, transactions are processed securely via Stripe, PayPal, or crypto payment providers. We do not store credit card or wallet information on our servers.
            </p>
          </section>

          {/* Section 7 */}
          <section>
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-white mb-2 sm:mb-3">7. Legal Bases (GDPR)</h2>
            <p className="text-gray-300 text-sm sm:text-base mb-2">If you are in the EEA, we process your data under these legal bases:</p>
            <ul className="list-disc list-inside text-gray-300 text-sm sm:text-base space-y-1 ml-4">
              <li>Consent (for GitHub connection or email subscriptions)</li>
              <li>Contractual necessity (to deliver services)</li>
              <li>Legitimate interest (analytics, security, service improvements)</li>
              <li>Legal obligation (regulatory compliance)</li>
            </ul>
          </section>

          {/* Section 8 */}
          <section>
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-white mb-2 sm:mb-3">8. CCPA/CPRA (California Users)</h2>
            <p className="text-gray-300 text-sm sm:text-base mb-2">If you're a California resident, you have the right to:</p>
            <ul className="list-disc list-inside text-gray-300 text-sm sm:text-base space-y-1 ml-4">
              <li>Access or delete your personal data</li>
              <li>Opt out of data sharing (we do not sell personal data)</li>
              <li>Receive equal service regardless of exercising privacy rights</li>
            </ul>
            <p className="text-gray-300 text-sm sm:text-base mt-2">
              To make a request, email us at <a href="mailto:support@gitwork.io" className="text-purple-400 hover:text-purple-300">support@gitwork.io</a>.
            </p>
          </section>

          {/* Section 9 */}
          <section>
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-white mb-2 sm:mb-3">9. Data Retention</h2>
            <p className="text-gray-300 text-xs sm:text-sm md:text-base">
              We retain data only as long as necessary to provide services or as required by law. You can request deletion at any time.
            </p>
          </section>

          {/* Section 10 */}
          <section>
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-white mb-2 sm:mb-3">10. Data Security</h2>
            <p className="text-gray-300 text-xs sm:text-sm md:text-base">
              We protect your information using encryption, secure hosting, and restricted access controls. While no online system is 100% secure, we take all reasonable steps to protect your data.
            </p>
          </section>

          {/* Section 11 */}
          <section>
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-white mb-2 sm:mb-3">11. Children's Privacy</h2>
            <p className="text-gray-300 text-xs sm:text-sm md:text-base">
              GitWork.io is not directed toward children under 13, and we do not knowingly collect data from them.
            </p>
          </section>

          {/* Section 12 */}
          <section>
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-white mb-2 sm:mb-3">12. Links to Other Sites</h2>
            <p className="text-gray-300 text-xs sm:text-sm md:text-base">
              Our platform may include links to GitHub, X (Twitter), or other third-party sites. We are not responsible for their content or privacy practices.
            </p>
          </section>

          {/* Section 13 */}
          <section>
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-white mb-2 sm:mb-3">13. Your Rights and Choices</h2>
            <p className="text-gray-300 text-sm sm:text-base mb-2">You may:</p>
            <ul className="list-disc list-inside text-gray-300 text-sm sm:text-base space-y-1 ml-4">
              <li>Access, correct, or delete your personal data</li>
              <li>Withdraw consent for processing</li>
              <li>Disable analytics or cookies</li>
            </ul>
            <p className="text-gray-300 text-sm sm:text-base mt-2">
              To exercise your rights, contact us at <a href="mailto:support@gitwork.io" className="text-purple-400 hover:text-purple-300">support@gitwork.io</a>.
            </p>
          </section>

          {/* Section 14 */}
          <section>
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-white mb-2 sm:mb-3">14. Updates to This Policy</h2>
            <p className="text-gray-300 text-xs sm:text-sm md:text-base">
              We may update this Privacy Policy periodically. The latest version will always be available at <a href="https://gitwork.io/privacy" className="text-purple-400 hover:text-purple-300">https://gitwork.io/privacy</a>.
            </p>
          </section>

          {/* Section 15 */}
          <section>
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-white mb-2 sm:mb-3">15. Contact Us</h2>
            <div className="text-gray-300 text-sm sm:text-base space-y-2">
              <p className="font-semibold text-white">GitWork.io Team</p>
              <p>📧 <a href="mailto:support@gitwork.io" className="text-purple-400 hover:text-purple-300">support@gitwork.io</a></p>
              <p>🌐 <a href="https://gitwork.io" className="text-purple-400 hover:text-purple-300">https://gitwork.io</a></p>
            </div>
          </section>
        </div>

        {/* Back to Home */}
        <div className="text-center mt-6 sm:mt-8 mb-4">
          <a 
            href="/"
            className="inline-block px-4 py-2 sm:px-6 sm:py-3 rounded-lg font-semibold text-sm sm:text-base text-white transition-colors duration-200 hover:bg-purple-700"
            style={{ background: '#8B5CF6' }}
          >
            Back to Home
          </a>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPage;

