import React from 'react';
import USDC from '../assets/usd-coin-usdc-logo.svg';

const AboutPage = () => {
  return (
    <div className="min-h-screen" style={{ background: '#0d1117' }}>
      {/* Hero Section */}
      <section className="py-12 px-8">
        <div className="max-w-6xl mx-auto text-center">
          <div className="inline-block px-4 py-2 rounded-full text-sm font-medium mb-6" style={{ background: '#161b22', border: '1px solid #30363d', color: '#8B5CF6' }}>
            🚀 Live on Solana Mainnet
          </div>
          <h1 className="text-6xl font-bold text-white mb-6">
            Making Open Source <span style={{ color: '#8B5CF6' }}>Rewarding</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto mb-8">
            Turn GitHub issues into instant bounties. Pay developers automatically when their contributions are merged. 
            Built on Solana for instant, low-cost payments.
          </p>
          <div className="flex justify-center gap-4 mb-12">
            <a 
              href="https://github.com/apps/gitwork-io" 
              target="_blank" 
              rel="noopener noreferrer"
              className="px-8 py-3 rounded-lg font-semibold text-white transition-colors duration-200"
              style={{ background: '#8B5CF6' }}
            >
              Install GitHub App
            </a>
            <a 
              href="#how-it-works"
              className="px-8 py-3 rounded-lg font-semibold text-white transition-colors duration-200"
              style={{ background: '#161b22', border: '1px solid #30363d' }}
            >
              Learn How It Works
            </a>
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-3xl mx-auto">
            <div>
              <div className="text-3xl font-bold text-white mb-1">Instant</div>
              <div className="text-sm text-gray-400">Payments</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white mb-1">No Fees</div>
              <div className="text-sm text-gray-400">During Beta</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white mb-1">USDC + SOL</div>
              <div className="text-sm text-gray-400">Supported</div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Use Octavian Section */}
      <section className="py-20 px-8" style={{ background: '#161b22' }}>
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-block px-4 py-2 rounded-full text-sm font-medium mb-6" style={{ background: '#161b22', border: '1px solid #30363d', color: '#8B5CF6' }}>
                Meet Octavian
              </div>
              <h2 className="text-4xl font-bold text-white mb-6">Turn Issues Into Opportunities</h2>
              <p className="text-lg text-gray-400 mb-8">
                Octavian - GitWork's bot that turns issues into opportunities. Create bounties with a simple GitHub label, 
                and pay contributors automatically when their work is merged.
              </p>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <svg width="20" height="20" viewBox="0 0 20 20" className="mt-1 flex-shrink-0">
                    <path d="M16.667 5L7.5 14.167 3.333 10" stroke="#8B5CF6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                  </svg>
                  <span className="text-gray-300">Automatic escrow for every bounty</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg width="20" height="20" viewBox="0 0 20 20" className="mt-1 flex-shrink-0">
                    <path d="M16.667 5L7.5 14.167 3.333 10" stroke="#8B5CF6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                  </svg>
                  <span className="text-gray-300">Instant payout on PR merge</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg width="20" height="20" viewBox="0 0 20 20" className="mt-1 flex-shrink-0">
                    <path d="M16.667 5L7.5 14.167 3.333 10" stroke="#8B5CF6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                  </svg>
                  <span className="text-gray-300">Built on Solana - fast & cheap</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg width="20" height="20" viewBox="0 0 20 20" className="mt-1 flex-shrink-0">
                    <path d="M16.667 5L7.5 14.167 3.333 10" stroke="#8B5CF6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                  </svg>
                  <span className="text-gray-300">Works with your existing workflow</span>
                </li>
              </ul>
            </div>
            <div>
              {/* Code Example */}
              <div className="rounded-xl overflow-hidden" style={{ background: '#161b22', border: '1px solid #30363d' }}>
                <div className="flex items-center gap-2 px-4 py-3" style={{ background: '#0d1117', borderBottom: '1px solid #30363d' }}>
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                </div>
                <div className="p-6 font-mono text-sm">
                  <div className="mb-4">
                    <span className="text-gray-500">Label:</span>
                    <span className="text-purple-400 ml-2">octavian:usdc:50</span>
                  </div>
                  <div className="h-px bg-gray-700 my-4"></div>
                  <div className="text-gray-500 mb-2">// Automatic bounty created</div>
                  <div className="mb-1">
                    <span className="text-blue-400">bounty</span>
                    <span className="text-gray-400">: </span>
                    <span className="text-green-400">"50 USDC"</span>
                  </div>
                  <div className="mb-1">
                    <span className="text-blue-400">status</span>
                    <span className="text-gray-400">: </span>
                    <span className="text-green-400">"escrowed"</span>
                  </div>
                  <div>
                    <span className="text-blue-400">network</span>
                    <span className="text-gray-400">: </span>
                    <span className="text-green-400">"solana"</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 px-8" style={{ background: '#161b22' }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">How It Works</h2>
            <p className="text-xl text-gray-400">Simple workflow, powerful results</p>
          </div>

          {/* For Repo Owners */}
          <div className="mb-16">
            <div className="mb-8">
              <div className="inline-block px-4 py-2 rounded-full text-sm font-medium mb-4" style={{ background: '#0d1117', border: '1px solid #30363d', color: '#8B5CF6' }}>
                For Repo Owners
              </div>
              <h3 className="text-3xl font-bold text-white">Create Bounties in Seconds</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="rounded-xl p-6" style={{ background: '#0d1117', border: '1px solid #30363d' }}>
                <div className="w-12 h-12 rounded-full flex items-center justify-center mb-4 text-xl font-bold" style={{ background: '#8B5CF6', color: 'white' }}>
                  1
                </div>
                <h4 className="text-lg font-bold text-white mb-2">Install GitWork</h4>
                <p className="text-gray-400">Add the Octavian GitHub App to your repository in one click</p>
              </div>
              <div className="rounded-xl p-6" style={{ background: '#0d1117', border: '1px solid #30363d' }}>
                <div className="w-12 h-12 rounded-full flex items-center justify-center mb-4 text-xl font-bold" style={{ background: '#8B5CF6', color: 'white' }}>
                  2
                </div>
                <h4 className="text-lg font-bold text-white mb-2">Label Your Issue</h4>
                <p className="text-gray-400">Add a label like <code className="px-2 py-1 rounded text-sm" style={{ background: '#161b22', color: '#8B5CF6' }}>octavian:usdc:50</code> to any GitHub issue</p>
              </div>
              <div className="rounded-xl p-6" style={{ background: '#0d1117', border: '1px solid #30363d' }}>
                <div className="w-12 h-12 rounded-full flex items-center justify-center mb-4 text-xl font-bold" style={{ background: '#8B5CF6', color: 'white' }}>
                  3
                </div>
                <h4 className="text-lg font-bold text-white mb-2">Fund the Escrow</h4>
                <p className="text-gray-400">Octavian creates a secure wallet and requests the bounty amount</p>
              </div>
              <div className="rounded-xl p-6" style={{ background: '#0d1117', border: '1px solid #30363d' }}>
                <div className="w-12 h-12 rounded-full flex items-center justify-center mb-4 text-xl font-bold" style={{ background: '#8B5CF6', color: 'white' }}>
                  4
                </div>
                <h4 className="text-lg font-bold text-white mb-2">Auto-Release</h4>
                <p className="text-gray-400">Funds automatically released when a PR solving the issue is merged</p>
              </div>
            </div>
          </div>

          {/* For Contributors */}
          <div>
            <div className="mb-8">
              <div className="inline-block px-4 py-2 rounded-full text-sm font-medium mb-4" style={{ background: '#0d1117', border: '1px solid #30363d', color: '#8B5CF6' }}>
                For Contributors
              </div>
              <h3 className="text-3xl font-bold text-white">Claim Your Rewards</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="rounded-xl p-6" style={{ background: '#0d1117', border: '1px solid #30363d' }}>
                <div className="w-12 h-12 rounded-full flex items-center justify-center mb-4 text-xl font-bold" style={{ background: '#8B5CF6', color: 'white' }}>
                  1
                </div>
                <h4 className="text-lg font-bold text-white mb-2">Find a Bounty</h4>
                <p className="text-gray-400">Look for issues labeled with Octavian bounties on GitHub</p>
              </div>
              <div className="rounded-xl p-6" style={{ background: '#0d1117', border: '1px solid #30363d' }}>
                <div className="w-12 h-12 rounded-full flex items-center justify-center mb-4 text-xl font-bold" style={{ background: '#8B5CF6', color: 'white' }}>
                  2
                </div>
                <h4 className="text-lg font-bold text-white mb-2">Solve the Issue</h4>
                <p className="text-gray-400">Submit a pull request that references the issue with <code className="px-2 py-1 rounded text-sm" style={{ background: '#161b22', color: '#8B5CF6' }}>#number</code></p>
              </div>
              <div className="rounded-xl p-6" style={{ background: '#0d1117', border: '1px solid #30363d' }}>
                <div className="w-12 h-12 rounded-full flex items-center justify-center mb-4 text-xl font-bold" style={{ background: '#8B5CF6', color: 'white' }}>
                  3
                </div>
                <h4 className="text-lg font-bold text-white mb-2">Get Tagged</h4>
                <p className="text-gray-400">When your PR is merged, Octavian tags you with a claim link</p>
              </div>
              <div className="rounded-xl p-6" style={{ background: '#0d1117', border: '1px solid #30363d' }}>
                <div className="w-12 h-12 rounded-full flex items-center justify-center mb-4 text-xl font-bold" style={{ background: '#8B5CF6', color: 'white' }}>
                  4
                </div>
                <h4 className="text-lg font-bold text-white mb-2">Claim & Cash Out</h4>
                <p className="text-gray-400">Login with GitHub, provide your Solana wallet, get paid instantly</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Why GitWork?</h2>
            <p className="text-xl text-gray-400">Built for the modern open source ecosystem</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="rounded-xl p-8" style={{ background: '#161b22', border: '1px solid #30363d' }}>
              <div className="text-5xl mb-4">⚡</div>
              <h3 className="text-xl font-bold text-white mb-3">Instant Payments</h3>
              <p className="text-gray-400">Powered by Solana - payments settle in seconds, not days</p>
            </div>
            <div className="rounded-xl p-8" style={{ background: '#161b22', border: '1px solid #30363d' }}>
              <div className="text-5xl mb-4">💰</div>
              <h3 className="text-xl font-bold text-white mb-3">No Fees During Beta</h3>
              <p className="text-gray-400">Zero transaction fees while in beta - keep 100% of your bounty</p>
            </div>
            <div className="rounded-xl p-8" style={{ background: '#161b22', border: '1px solid #30363d' }}>
              <div className="text-5xl mb-4">🔒</div>
              <h3 className="text-xl font-bold text-white mb-3">Secure Escrow</h3>
              <p className="text-gray-400">Funds held safely in Privy-managed wallets until work is complete</p>
            </div>
            <div className="rounded-xl p-8" style={{ background: '#161b22', border: '1px solid #30363d' }}>
              <div className="text-5xl mb-4">🤖</div>
              <h3 className="text-xl font-bold text-white mb-3">Fully Automated</h3>
              <p className="text-gray-400">No manual processing - everything happens automatically on PR merge</p>
            </div>
            <div className="rounded-xl p-8" style={{ background: '#161b22', border: '1px solid #30363d' }}>
              <div className="text-5xl mb-4">🌐</div>
              <h3 className="text-xl font-bold text-white mb-3">Global Access</h3>
              <p className="text-gray-400">Pay anyone, anywhere in the world with just a Solana wallet</p>
            </div>
            <div className="rounded-xl p-8" style={{ background: '#161b22', border: '1px solid #30363d' }}>
              <div className="text-5xl mb-4">📊</div>
              <h3 className="text-xl font-bold text-white mb-3">Full Transparency</h3>
              <p className="text-gray-400">All transactions on Solana blockchain - complete audit trail</p>
            </div>
          </div>
        </div>
      </section>

      {/* Supported Currencies */}
      <section className="py-20 px-8" style={{ background: '#161b22' }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Supported Currencies</h2>
            <p className="text-xl text-gray-400">Flexible payment options on Solana</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
            <div className="rounded-xl p-8 text-center" style={{ background: '#0d1117', border: '1px solid #30363d' }}>
              <div className="flex justify-center mb-4">
                <img src={USDC} alt="USDC Logo" className="w-20 h-20" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">USDC</h3>
              <p className="text-gray-400 mb-4">Stablecoin pegged to USD</p>
              <code className="px-4 py-2 rounded text-sm inline-block" style={{ background: '#161b22', color: '#8B5CF6' }}>
                octavian:usdc:50
              </code>
            </div>
            <div className="rounded-xl p-8 text-center" style={{ background: '#0d1117', border: '1px solid #30363d' }}>
              <div className="flex justify-center mb-4">
                <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
                  <defs>
                    <linearGradient id="solanaGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" style={{ stopColor: '#00FFA3', stopOpacity: 1 }} />
                      <stop offset="100%" style={{ stopColor: '#DC1FFF', stopOpacity: 1 }} />
                    </linearGradient>
                  </defs>
                  <circle cx="40" cy="40" r="40" fill="url(#solanaGradient)"/>
                  <path d="M24.5 50.8C24.8 50.5 25.2 50.3 25.6 50.3H57.4C58.2 50.3 58.6 51.3 58 51.9L54.5 55.2C54.2 55.5 53.8 55.7 53.4 55.7H21.6C20.8 55.7 20.4 54.7 21 54.1L24.5 50.8Z" fill="white"/>
                  <path d="M24.5 24.8C24.8 24.5 25.2 24.3 25.6 24.3H57.4C58.2 24.3 58.6 25.3 58 25.9L54.5 29.2C54.2 29.5 53.8 29.7 53.4 29.7H21.6C20.8 29.7 20.4 28.7 21 28.1L24.5 24.8Z" fill="white"/>
                  <path d="M54.5 37.3C54.2 37 53.8 36.8 53.4 36.8H21.6C20.8 36.8 20.4 37.8 21 38.4L24.5 41.7C24.8 42 25.2 42.2 25.6 42.2H57.4C58.2 42.2 58.6 41.2 58 40.6L54.5 37.3Z" fill="white"/>
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">SOL</h3>
              <p className="text-gray-400 mb-4">Native Solana token</p>
              <code className="px-4 py-2 rounded text-sm inline-block" style={{ background: '#161b22', color: '#8B5CF6' }}>
                octavian:sol:0.5
              </code>
            </div>
          </div>
        </div>
      </section>

      {/* Socials Section */}
      <section className="py-20 px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-6">Join Our Community</h2>
          <p className="text-lg text-gray-400 mb-8">Follow us for updates and connect with other developers</p>
          <div className="flex justify-center gap-6 flex-wrap">
            <a 
              href="https://x.com/gitworkio/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-3 px-6 py-3 rounded-lg font-medium text-white transition-all duration-200 hover:scale-105"
              style={{ background: '#161b22', border: '1px solid #30363d' }}
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
              <span>Follow on X</span>
            </a>
            <a 
              href="https://t.me/gitwork" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-3 px-6 py-3 rounded-lg font-medium text-white transition-all duration-200 hover:scale-105"
              style={{ background: '#161b22', border: '1px solid #30363d' }}
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z"/>
              </svg>
              <span>Telegram Channel</span>
            </a>
            <a 
              href="https://discord.gg/ZhsXQBj4" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-3 px-6 py-3 rounded-lg font-medium text-white transition-all duration-200 hover:scale-105"
              style={{ background: '#161b22', border: '1px solid #30363d' }}
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
              </svg>
              <span>Join Discord</span>
            </a>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-8" style={{ background: '#161b22' }}>
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-6">Ready to Make Open Source Rewarding?</h2>
          <p className="text-xl text-gray-400 mb-8">Join the future of open source development. Install GitWork in seconds.</p>
          <div className="flex justify-center gap-4">
            <a 
              href="https://github.com/apps/gitwork-io" 
              target="_blank" 
              rel="noopener noreferrer"
              className="px-8 py-3 rounded-lg font-semibold text-white transition-colors duration-200"
              style={{ background: '#8B5CF6' }}
            >
              Install GitHub App
            </a>
            <a 
              href="mailto:support@gitwork.io" 
              className="px-8 py-3 rounded-lg font-semibold text-white transition-colors duration-200"
              style={{ background: '#0d1117', border: '1px solid #30363d' }}
            >
              Wanna Collaborate?
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
