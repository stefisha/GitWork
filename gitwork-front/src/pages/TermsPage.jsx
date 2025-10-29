export default function TermsPage() {
  return (
    <div 
      className="min-h-screen px-4 sm:px-8 py-8 sm:py-12"
      style={{ background: '#0d1117' }}
    >
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8 sm:mb-12 pt-6 sm:pt-8">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4">
            Terms of Service
          </h1>
          <p className="text-sm sm:text-base text-gray-400">
            Last Updated: October 29, 2025
          </p>
        </div>

        {/* Content */}
        <div className="space-y-6 sm:space-y-8 text-white">
          
          {/* Introduction */}
          <section>
            <p className="text-sm sm:text-base text-gray-300 leading-relaxed">
              Welcome to GitWork. By using our platform, you agree to these Terms of Service. 
              GitWork is a bounty platform that connects repository owners with developers, 
              enabling instant payments via the Solana blockchain for completed work.
            </p>
          </section>

          {/* 1. Platform Overview */}
          <section>
            <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">1. Platform Overview</h2>
            <div className="text-sm sm:text-base text-gray-300 space-y-3 leading-relaxed">
              <p>
                GitWork operates as a bounty management system integrated with GitHub. 
                Repository owners can create bounties on issues, and contributors can claim 
                rewards when their pull requests are merged.
              </p>
              <p>
                All financial transactions are processed on the Solana blockchain using USDC 
                or SOL tokens. GitWork acts as a facilitator but does not hold funds directly.
              </p>
            </div>
          </section>

          {/* 2. Eligibility */}
          <section>
            <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">2. Eligibility</h2>
            <div className="text-sm sm:text-base text-gray-300 space-y-3 leading-relaxed">
              <p>You must:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Be at least 18 years old or have parental consent</li>
                <li>Have a valid GitHub account</li>
                <li>Comply with all applicable laws in your jurisdiction</li>
                <li>Not be located in a country where cryptocurrency transactions are prohibited</li>
              </ul>
            </div>
          </section>

          {/* 3. For Repository Owners */}
          <section>
            <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">3. For Repository Owners</h2>
            <div className="text-sm sm:text-base text-gray-300 space-y-3 leading-relaxed">
              <p><strong>Creating Bounties:</strong></p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>You must fund bounties with the exact amount specified</li>
                <li>Bounties are held in escrow until a pull request is merged or you cancel the bounty</li>
                <li>You are responsible for reviewing and merging pull requests promptly</li>
                <li>Once a PR is merged, the bounty is automatically released to the contributor</li>
              </ul>
              
              <p className="mt-4"><strong>Cancellations:</strong></p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>You can cancel a bounty by removing the bounty label from the issue</li>
                <li>Escrowed funds will be returned to you minus network fees</li>
                <li>You cannot cancel a bounty after a PR has been merged</li>
              </ul>
            </div>
          </section>

          {/* 4. For Contributors */}
          <section>
            <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">4. For Contributors</h2>
            <div className="text-sm sm:text-base text-gray-300 space-y-3 leading-relaxed">
              <p><strong>Claiming Bounties:</strong></p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>You must submit a pull request that resolves the bounty issue</li>
                <li>Your PR must be approved and merged by the repository maintainer</li>
                <li>Only the first merged PR addressing the issue receives the bounty</li>
                <li>You are responsible for providing a valid Solana wallet address</li>
              </ul>
              
              <p className="mt-4"><strong>Work Quality:</strong></p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Submitted work must be original and not infringe on third-party rights</li>
                <li>Code must meet the repository's contribution guidelines</li>
                <li>Spam or low-quality submissions may result in account suspension</li>
              </ul>
            </div>
          </section>

          {/* 5. Payment Terms */}
          <section>
            <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">5. Payment Terms</h2>
            <div className="text-sm sm:text-base text-gray-300 space-y-3 leading-relaxed">
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>All payments are processed on the Solana blockchain</li>
                <li>GitWork charges a small platform fee (deducted from bounty amount)</li>
                <li>Network (gas) fees are paid by the platform</li>
                <li>Transactions are irreversible once confirmed on the blockchain</li>
                <li>You are responsible for any tax obligations in your jurisdiction</li>
              </ul>
            </div>
          </section>

          {/* 6. Prohibited Activities */}
          <section>
            <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">6. Prohibited Activities</h2>
            <div className="text-sm sm:text-base text-gray-300 space-y-3 leading-relaxed">
              <p>You may not:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Create fake bounties or submissions</li>
                <li>Collude with others to manipulate the platform</li>
                <li>Use the platform for money laundering or illegal activities</li>
                <li>Attempt to exploit bugs or vulnerabilities for personal gain</li>
                <li>Harass, threaten, or abuse other users</li>
                <li>Create multiple accounts to abuse the system</li>
              </ul>
            </div>
          </section>

          {/* 7. Disputes */}
          <section>
            <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">7. Disputes</h2>
            <div className="text-sm sm:text-base text-gray-300 space-y-3 leading-relaxed">
              <p>
                Disputes between repository owners and contributors should be resolved directly 
                on GitHub. GitWork does not mediate disputes but may investigate reports of 
                Terms of Service violations.
              </p>
              <p>
                For serious issues, contact us at{' '}
                <a 
                  href="mailto:support@gitwork.io" 
                  className="text-purple-400 hover:text-purple-300 transition-colors"
                >
                  support@gitwork.io
                </a>
              </p>
            </div>
          </section>

          {/* 8. Disclaimers */}
          <section>
            <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">8. Disclaimers</h2>
            <div className="text-sm sm:text-base text-gray-300 space-y-3 leading-relaxed">
              <p>
                <strong>GitWork is provided "AS IS" without warranties of any kind.</strong>
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>We do not guarantee continuous, error-free operation</li>
                <li>Blockchain transactions are irreversible; we cannot reverse payments</li>
                <li>Cryptocurrency values fluctuate; we are not responsible for market changes</li>
                <li>GitHub is a third-party service; we are not responsible for GitHub outages</li>
                <li>You are responsible for securing your wallet and private keys</li>
              </ul>
            </div>
          </section>

          {/* 9. Limitation of Liability */}
          <section>
            <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">9. Limitation of Liability</h2>
            <div className="text-sm sm:text-base text-gray-300 space-y-3 leading-relaxed">
              <p>
                GitWork and its operators shall not be liable for any indirect, incidental, 
                special, consequential, or punitive damages, including lost profits, data loss, 
                or loss of cryptocurrency, even if advised of the possibility of such damages.
              </p>
              <p>
                Our total liability shall not exceed the platform fees paid by you in the 
                12 months preceding the claim.
              </p>
            </div>
          </section>

          {/* 10. Alpha Release */}
          <section>
            <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">10. Alpha Release Notice</h2>
            <div className="text-sm sm:text-base text-gray-300 space-y-3 leading-relaxed">
              <p>
                GitWork is currently in <strong>alpha release</strong>. This means:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Features may be incomplete or change without notice</li>
                <li>Bugs and issues may occur</li>
                <li>The platform is undergoing active development and testing</li>
                <li>Use the platform at your own risk</li>
              </ul>
              <p>
                We appreciate early users and welcome feedback at{' '}
                <a 
                  href="mailto:support@gitwork.io" 
                  className="text-purple-400 hover:text-purple-300 transition-colors"
                >
                  support@gitwork.io
                </a>
              </p>
            </div>
          </section>

          {/* 11. Changes to Terms */}
          <section>
            <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">11. Changes to Terms</h2>
            <div className="text-sm sm:text-base text-gray-300 space-y-3 leading-relaxed">
              <p>
                We reserve the right to modify these Terms at any time. Changes will be 
                posted on this page with an updated "Last Updated" date. Continued use 
                of GitWork after changes constitutes acceptance of the new Terms.
              </p>
            </div>
          </section>

          {/* 12. Termination */}
          <section>
            <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">12. Termination</h2>
            <div className="text-sm sm:text-base text-gray-300 space-y-3 leading-relaxed">
              <p>
                We may suspend or terminate your access to GitWork at any time for violations 
                of these Terms. You may stop using the platform at any time.
              </p>
              <p>
                Upon termination, any pending bounties you created will be returned to you 
                minus applicable fees.
              </p>
            </div>
          </section>

          {/* 13. Governing Law */}
          <section>
            <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">13. Governing Law</h2>
            <div className="text-sm sm:text-base text-gray-300 space-y-3 leading-relaxed">
              <p>
                These Terms shall be governed by and construed in accordance with the laws 
                of the jurisdiction in which GitWork operates, without regard to conflict 
                of law principles.
              </p>
            </div>
          </section>

          {/* Contact */}
          <section className="pt-4 sm:pt-6 border-t border-gray-700">
            <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">Contact Us</h2>
            <div className="text-sm sm:text-base text-gray-300 space-y-2 leading-relaxed">
              <p>
                If you have questions about these Terms of Service, please contact us:
              </p>
              <p>
                Email:{' '}
                <a 
                  href="mailto:support@gitwork.io" 
                  className="text-purple-400 hover:text-purple-300 transition-colors"
                >
                  support@gitwork.io
                </a>
              </p>
            </div>
          </section>

        </div>

        {/* Footer Links */}
        <div className="text-center mt-6 sm:mt-8 mb-4">
          <div className="mb-4">
            <a 
              href="/privacy"
              className="text-sm sm:text-base text-gray-400 hover:text-purple-400 transition-colors"
            >
              View Privacy Policy
            </a>
          </div>
          <a 
            href="/"
            className="inline-block px-4 py-2 sm:px-6 sm:py-3 rounded-lg font-semibold text-sm sm:text-base text-white transition-colors duration-200"
            style={{ background: '#8B5CF6' }}
            onMouseEnter={(e) => e.target.style.background = '#7C3AED'}
            onMouseLeave={(e) => e.target.style.background = '#8B5CF6'}
          >
            Back to Home
          </a>
        </div>
      </div>
    </div>
  );
}

