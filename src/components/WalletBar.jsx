import React from 'react';
import { CHAIN_CONFIG } from '../config/contract';

export default function WalletBar({ wallet, onConnect }) {
  const { address, balance, chainId, chainConfig, isMetaMask, isConnecting, isCorrectChain, error, switchToBase, disconnect } = wallet;

  const truncate = (addr) => addr ? `${addr.slice(0, 6)}…${addr.slice(-4)}` : '';

  return (
    <div className="wallet-bar">
      {/* Left: chain badge */}
      <div className="wallet-chain">
        {chainConfig ? (
          <span
            className="chain-badge"
            style={{ background: chainConfig.color + '22', border: `1px solid ${chainConfig.color}66`, color: chainConfig.color }}
          >
            <span className="chain-dot" style={{ background: chainConfig.color }} />
            {chainConfig.name}
          </span>
        ) : (
          <span className="chain-badge chain-badge--unknown">
            <span className="chain-dot chain-dot--gray" />
            Not Connected
          </span>
        )}
      </div>

      {/* Center: wallet status */}
      <div className="wallet-center">
        {address ? (
          <div className="wallet-info">
            <span className="wallet-address">{truncate(address)}</span>
            {balance && (
              <span className="wallet-balance">{balance} ETH</span>
            )}
          </div>
        ) : (
          error ? (
            <span className="wallet-error" title={error}>⚠ {error.slice(0, 40)}{error.length > 40 ? '…' : ''}</span>
          ) : null
        )}
      </div>

      {/* Right: action button */}
      <div className="wallet-actions">
        {!address ? (
          <button
            className="btn btn--connect"
            onClick={onConnect}
            disabled={isConnecting}
          >
            {isConnecting ? (
              <><span className="spinner" /> Connecting…</>
            ) : (
              isMetaMask ? '🦊 Connect Wallet' : '🦊 Get MetaMask'
            )}
          </button>
        ) : !isCorrectChain ? (
          <button className="btn btn--switch" onClick={switchToBase}>
            ⚡ Switch to Base
          </button>
        ) : (
          <button className="btn btn--disconnect" onClick={disconnect}>
            Disconnect
          </button>
        )}
      </div>
    </div>
  );
}
