import React from 'react';

/**
 * Bounty Card Component
 * Displays a bounty with MagicBlock fast claim indicator
 */
export default function BountyCard({ bounty }) {
  const hasEphemeralSession = bounty.status === 'ready_to_claim';

  return (
    <div className="p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-200">
      {/* Fast claim badge */}
      {hasEphemeralSession && (
        <div className="mb-3">
          <span className="inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold text-purple-700 bg-purple-100 rounded-full">
            ⚡ Instant Claim Available
          </span>
        </div>
      )}

      {/* Bounty title */}
      <h3 className="mb-2 text-xl font-bold text-gray-900">
        {bounty.title || `Issue #${bounty.github_issue_number}`}
      </h3>

      {/* Repository info */}
      <div className="mb-3 text-sm text-gray-600">
        <a
          href={`https://github.com/${bounty.github_repo_owner}/${bounty.github_repo_name}/issues/${bounty.github_issue_number}`}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-purple-600 transition-colors"
        >
          {bounty.github_repo_owner}/{bounty.github_repo_name} #{bounty.github_issue_number}
        </a>
      </div>

      {/* Amount */}
      <div className="mb-4">
        <div className="text-3xl font-bold text-purple-600">
          {bounty.bounty_amount} {bounty.currency}
        </div>
        {bounty.currency === 'USDC' && (
          <div className="text-sm text-gray-500">
            ≈ ${bounty.bounty_amount} USD
          </div>
        )}
      </div>

      {/* Status badge */}
      <div className="mb-4">
        <StatusBadge status={bounty.status} />
      </div>

      {/* Action button */}
      {bounty.status === 'ready_to_claim' && (
        <a
          href={`/claim/${bounty.id}`}
          className="inline-flex items-center justify-center w-full px-4 py-3 text-sm font-semibold text-white bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors"
        >
          {hasEphemeralSession && <span className="mr-2">⚡</span>}
          Claim Bounty Now
        </a>
      )}

      {hasEphemeralSession && (
        <div className="mt-3 text-xs text-center text-gray-500">
          Powered by MagicBlock Ephemeral Rollup - Instant settlement
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }) {
  const statusConfig = {
    pending_deposit: { color: 'yellow', text: 'Awaiting Deposit' },
    deposit_confirmed: { color: 'blue', text: 'Funded' },
    ready_to_claim: { color: 'green', text: 'Ready to Claim' },
    claimed: { color: 'gray', text: 'Claimed' },
    cancelled: { color: 'red', text: 'Cancelled' },
  };

  const config = statusConfig[status] || { color: 'gray', text: status };
  
  const colorClasses = {
    yellow: 'text-yellow-700 bg-yellow-100',
    blue: 'text-blue-700 bg-blue-100',
    green: 'text-green-700 bg-green-100',
    gray: 'text-gray-700 bg-gray-100',
    red: 'text-red-700 bg-red-100',
  };

  return (
    <span className={`inline-flex px-3 py-1 text-xs font-medium rounded-full ${colorClasses[config.color]}`}>
      {config.text}
    </span>
  );
}

