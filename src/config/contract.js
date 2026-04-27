// Contract config — update CONTRACT_ADDRESS after deployment
// ABI includes only the functions used by the frontend

export const CONTRACT_ADDRESS = '0x0000000000000000000000000000000000000000'; // TODO: Deploy and paste address here

export const BOX_PRICE_ETH = '0.001'; // 0.001 ETH per box open

export const BASE_CHAIN_ID    = 8453;   // Base Mainnet
export const BASE_SEPOLIA_ID  = 84532;  // Base Sepolia (testnet)

export const SUPPORTED_CHAINS = [BASE_CHAIN_ID, BASE_SEPOLIA_ID];

export const CHAIN_CONFIG = {
  [BASE_CHAIN_ID]: {
    name: 'Base',
    rpcUrl: 'https://mainnet.base.org',
    blockExplorer: 'https://basescan.org',
    color: '#0052ff',
  },
  [BASE_SEPOLIA_ID]: {
    name: 'Base Sepolia',
    rpcUrl: 'https://sepolia.base.org',
    blockExplorer: 'https://sepolia.basescan.org',
    color: '#6366f1',
  },
};

export const CONTRACT_ABI = [
  // State-reading functions
  'function boxPrice() view returns (uint256)',
  'function jackpotPool() view returns (uint256)',
  'function totalBoxesOpened() view returns (uint256)',
  'function getPlayerHistory(address player) view returns (tuple(uint8 tier, uint256 reward, string tokenSymbol, uint256 timestamp)[])',

  // State-changing functions
  'function openBox() payable',

  // Events
  'event BoxOpened(address indexed player, uint8 tier, uint256 reward, string tokenSymbol)',
];
