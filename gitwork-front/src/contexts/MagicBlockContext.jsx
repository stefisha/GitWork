import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { Connection } from '@solana/web3.js';
import { ConnectionProvider, WalletProvider, useConnection, useWallet } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { PhantomWalletAdapter, SolflareWalletAdapter } from '@solana/wallet-adapter-wallets';

// Import wallet adapter CSS
import '@solana/wallet-adapter-react-ui/styles.css';

const MagicBlockContext = createContext({});

/**
 * MagicBlock Provider Component
 * Provides MagicBlock ephemeral rollup connection and session management
 */
export function MagicBlockProvider({ children }) {
  const [useMagicBlock, setUseMagicBlock] = useState(true);
  const [sessionInfo, setSessionInfo] = useState(null);
  const [isHealthy, setIsHealthy] = useState(false);

  // MagicBlock RPC URL
  const magicBlockRpcUrl = import.meta.env.VITE_MAGICBLOCK_RPC_URL || 'https://devnet.magicblock.app';
  const solanaRpcUrl = import.meta.env.VITE_SOLANA_RPC_URL || 'https://api.devnet.solana.com';

  // Choose RPC endpoint based on preference
  const endpoint = useMagicBlock ? magicBlockRpcUrl : solanaRpcUrl;

  // Configure wallets
  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter(),
    ],
    []
  );

  // Check MagicBlock health on mount
  useEffect(() => {
    const checkHealth = async () => {
      try {
        const connection = new Connection(magicBlockRpcUrl, 'confirmed');
        const version = await connection.getVersion();
        console.log('✅ MagicBlock is healthy:', version);
        setIsHealthy(true);
      } catch (error) {
        console.warn('⚠️  MagicBlock health check failed:', error.message);
        setIsHealthy(false);
        setUseMagicBlock(false); // Fallback to base layer
      }
    };

    checkHealth();
  }, [magicBlockRpcUrl]);

  const value = {
    useMagicBlock,
    setUseMagicBlock,
    sessionInfo,
    setSessionInfo,
    isHealthy,
    magicBlockRpcUrl,
    solanaRpcUrl,
  };

  return (
    <MagicBlockContext.Provider value={value}>
      <ConnectionProvider endpoint={endpoint}>
        <WalletProvider wallets={wallets} autoConnect>
          <WalletModalProvider>
            {children}
          </WalletModalProvider>
        </WalletProvider>
      </ConnectionProvider>
    </MagicBlockContext.Provider>
  );
}

/**
 * Hook to use MagicBlock context
 */
export function useMagicBlock() {
  const context = useContext(MagicBlockContext);
  if (!context) {
    throw new Error('useMagicBlock must be used within MagicBlockProvider');
  }
  return context;
}

/**
 * Hook to get the connection (with MagicBlock awareness)
 */
export function useMagicBlockConnection() {
  const { connection } = useConnection();
  const { useMagicBlock, isHealthy } = useMagicBlock();
  
  return {
    connection,
    isMagicBlock: useMagicBlock && isHealthy,
  };
}

/**
 * Hook to get wallet with MagicBlock support
 */
export function useMagicBlockWallet() {
  const wallet = useWallet();
  const { useMagicBlock, isHealthy } = useMagicBlock();
  
  return {
    ...wallet,
    isMagicBlock: useMagicBlock && isHealthy,
  };
}

export default MagicBlockContext;

