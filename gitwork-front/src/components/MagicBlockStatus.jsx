import React from 'react';
import { useMagicBlock } from '../contexts/MagicBlockContext';

/**
 * MagicBlock Status Component
 * Shows the current connection status (MagicBlock ephemeral rollup or base layer)
 */
export default function MagicBlockStatus() {
  const { useMagicBlock, setUseMagicBlock, isHealthy } = useMagicBlock();

  const statusColor = isHealthy && useMagicBlock ? 'text-green-500' : 'text-yellow-500';
  const statusIcon = isHealthy && useMagicBlock ? '⚡' : '🌐';
  const statusText = isHealthy && useMagicBlock 
    ? 'MagicBlock Ephemeral Rollup' 
    : 'Solana Base Layer';

  return (
    <div className="flex items-center gap-3 p-4 bg-gray-800 rounded-lg border border-gray-700">
      <div className="flex items-center gap-2">
        <span className="text-2xl">{statusIcon}</span>
        <div>
          <div className="text-sm text-gray-400">Network</div>
          <div className={`font-semibold ${statusColor}`}>
            {statusText}
          </div>
        </div>
      </div>

      {isHealthy && (
        <div className="ml-auto">
          <button
            onClick={() => setUseMagicBlock(!useMagicBlock)}
            className="px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors"
          >
            {useMagicBlock ? 'Switch to Base Layer' : 'Use MagicBlock'}
          </button>
        </div>
      )}

      {!isHealthy && (
        <div className="ml-auto">
          <span className="px-3 py-1 text-xs font-medium text-yellow-600 bg-yellow-100 rounded-full">
            MagicBlock Unavailable
          </span>
        </div>
      )}
    </div>
  );
}

