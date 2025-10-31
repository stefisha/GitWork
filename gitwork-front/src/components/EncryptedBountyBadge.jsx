import { useState } from 'react';

/**
 * EncryptedBountyBadge Component
 * Shows a badge for encrypted bounties with tooltip/info
 */
export default function EncryptedBountyBadge({ bounty, showAmount = false }) {
  const [showTooltip, setShowTooltip] = useState(false);

  if (!bounty?.encrypted) {
    return null;
  }

  return (
    <div className="relative inline-flex items-center">
      {/* Encrypted Badge */}
      <div
        className="inline-flex items-center gap-1.5 px-3 py-1 bg-purple-500/10 border border-purple-500/30 rounded-full cursor-help"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        {/* Lock Icon */}
        <svg
          className="w-4 h-4 text-purple-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
          />
        </svg>

        {/* Text */}
        <span className="text-sm font-medium text-purple-300">
          {showAmount && bounty.amount ? (
            <>
              {bounty.amount} {bounty.currency?.toUpperCase()}
            </>
          ) : (
            'Encrypted Bounty'
          )}
        </span>

        {/* Arcium Badge */}
        <span className="text-xs text-purple-400/60 font-mono">
          via Arcium
        </span>
      </div>

      {/* Tooltip */}
      {showTooltip && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-64 z-50">
          <div className="bg-gray-900 border border-purple-500/30 rounded-lg p-3 shadow-xl">
            <div className="flex items-start gap-2">
              <svg
                className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div className="text-sm">
                <p className="text-purple-300 font-semibold mb-1">
                  🔐 Encrypted Bounty
                </p>
                <p className="text-gray-300 text-xs leading-relaxed">
                  This bounty amount is encrypted using Arcium's MPC network.
                  Only authorized parties can view the amount.
                </p>
                <p className="text-purple-400/60 text-xs mt-2">
                  Work based on the issue value, not the reward!
                </p>
              </div>
            </div>
          </div>
          {/* Arrow */}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
            <div className="border-8 border-transparent border-t-gray-900"></div>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * EncryptedBountyInfo Component
 * Full info panel about encrypted bounties
 */
export function EncryptedBountyInfo() {
  return (
    <div className="bg-purple-500/5 border border-purple-500/20 rounded-lg p-4">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          <svg
            className="w-6 h-6 text-purple-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            />
          </svg>
        </div>
        
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-purple-300 mb-2">
            What is an Encrypted Bounty?
          </h3>
          
          <p className="text-gray-300 text-sm mb-3">
            Encrypted bounties use <span className="text-purple-400 font-semibold">Arcium's Multi-Party Computation (MPC)</span> to 
            keep the bounty amount private until you claim it.
          </p>
          
          <div className="space-y-2">
            <BenefitItem 
              icon="🎯"
              text="Work on merit, not bounty size"
            />
            <BenefitItem 
              icon="🔒"
              text="Amount hidden from competitors"
            />
            <BenefitItem 
              icon="💎"
              text="Discover the reward when you claim"
            />
            <BenefitItem 
              icon="🏢"
              text="Enterprise-grade privacy"
            />
          </div>

          <div className="mt-4 pt-4 border-t border-purple-500/20">
            <p className="text-xs text-purple-400/60">
              Powered by <span className="font-semibold">Arcium</span> - 
              Confidential Computing on Solana
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function BenefitItem({ icon, text }) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="text-lg">{icon}</span>
      <span className="text-gray-300">{text}</span>
    </div>
  );
}

/**
 * EncryptedAmountDisplay Component
 * Shows encrypted amount with decrypt option for authorized users
 */
export function EncryptedAmountDisplay({ bounty, userPubkey, onDecrypt }) {
  const [decrypting, setDecrypting] = useState(false);
  const [decrypted, setDecrypted] = useState(false);
  const [amount, setAmount] = useState(null);
  const [error, setError] = useState(null);

  const handleDecrypt = async () => {
    if (!userPubkey) {
      setError('Please connect your wallet first');
      return;
    }

    setDecrypting(true);
    setError(null);

    try {
      const response = await fetch('/api/arcium/decrypt-amount', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          encryptedData: bounty.encryptedData,
          requesterPubkey: userPubkey,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setAmount(data.amount);
        setDecrypted(true);
        onDecrypt?.(data.amount);
      } else {
        setError(data.message || 'Unauthorized to decrypt');
      }
    } catch (err) {
      setError('Failed to decrypt amount');
    } finally {
      setDecrypting(false);
    }
  };

  if (decrypted && amount !== null) {
    return (
      <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/30 rounded-lg">
        <svg
          className="w-5 h-5 text-green-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <span className="text-lg font-bold text-green-300">
          {amount} {bounty.currency?.toUpperCase()}
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <EncryptedBountyBadge bounty={bounty} />
      
      {error && (
        <div className="text-sm text-red-400 mt-2">
          {error}
        </div>
      )}
      
      <button
        onClick={handleDecrypt}
        disabled={decrypting || !userPubkey}
        className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
      >
        {decrypting ? (
          <>
            <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            Decrypting...
          </>
        ) : (
          <>
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z"
              />
            </svg>
            {userPubkey ? 'Decrypt Amount' : 'Connect Wallet to Decrypt'}
          </>
        )}
      </button>
    </div>
  );
}

