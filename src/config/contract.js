// Contract config — update CONTRACT_ADDRESS after deployment
// ABI includes only the functions used by the frontend

export const CONTRACT_ADDRESS = '0x68547D98C216f14C5FcCD926141281c75443CB63';

export const BOX_PRICE_ETH = '0.000042'; // 0.000042 ETH per box open

export const BASE_CHAIN_ID    = 8453;   // Base Mainnet

// Base Builder Code Integration
// Documentation: https://docs.base.org/apps/builder-codes/builder-codes
export const BUILDER_CODE = 'bc_jk7yfoac';
export const ENCODED_BUILDER_STRING = '0x62635f6a6b3779666f61630b0080218021802180218021802180218021';

export const SUPPORTED_CHAINS = [BASE_CHAIN_ID];

export const CHAIN_CONFIG = {
  [BASE_CHAIN_ID]: {
    name: 'Base Mainnet',
    rpcUrl: 'https://mainnet.base.org',
    blockExplorer: 'https://basescan.org',
    color: '#0052ff',
  },
};

export const CONTRACT_ABI = [
  // State-reading functions
  'function boxPrice() view returns (uint256)',
  'function jackpotPool() view returns (uint256)',
  'function totalBoxesOpened() view returns (uint256)',
  'function claimableRewards(address player) view returns (uint256)',
  'function getPlayerHistory(address player) view returns (tuple(uint8 tier, uint256 reward, string tokenSymbol, uint256 timestamp)[])',

  // State-changing functions
  'function openBox() payable',
  'function claimRewards()',

  // Events
  'event BoxOpened(address indexed player, uint8 tier, uint256 reward, string tokenSymbol)',
  'event RewardsClaimed(address indexed player, uint256 amount)',
];
