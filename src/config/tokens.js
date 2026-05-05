// Token definitions — maps each PNG filename to a tier, symbol, display name, and reward
// Tiers: common (70%), rare (20%), legendary (10%)

export const TIERS = {
  COMMON: 'common',
  RARE: 'rare',
  LEGENDARY: 'legendary',
};

export const TIER_CONFIG = {
  [TIERS.COMMON]: {
    label: 'COMMON',
    color: '#22d3ee',
    glow: '0 0 20px rgba(34,211,238,0.6), 0 0 40px rgba(34,211,238,0.3)',
    bgGradient: 'linear-gradient(135deg, #164e63 0%, #0e7490 100%)',
    badgeGradient: 'linear-gradient(90deg, #0891b2, #22d3ee)',
    rewardMin: 0.0000005,
    rewardMax: 0.000001,
    probability: 0.9949, // 99.49%
  },
  [TIERS.RARE]: {
    label: 'RARE',
    color: '#a855f7',
    glow: '0 0 20px rgba(168,85,247,0.7), 0 0 50px rgba(168,85,247,0.4)',
    bgGradient: 'linear-gradient(135deg, #3b0764 0%, #6b21a8 100%)',
    badgeGradient: 'linear-gradient(90deg, #7c3aed, #a855f7)',
    rewardMin: 0.001,
    rewardMax: 0.01,
    probability: 0.005, // 0.5%
  },
  [TIERS.LEGENDARY]: {
    label: 'LEGENDARY ⚡',
    color: '#f7c94f',
    glow: '0 0 30px rgba(247,201,79,0.8), 0 0 60px rgba(247,201,79,0.5), 0 0 100px rgba(247,201,79,0.2)',
    bgGradient: 'linear-gradient(135deg, #451a03 0%, #92400e 100%)',
    badgeGradient: 'linear-gradient(90deg, #d97706, #f7c94f, #fbbf24)',
    rewardMin: 0.01,
    rewardMax: 0.05,
    probability: 0.0001, // 0.01%
  },
};

export const TOKENS = [
  // ── COMMON (99.49%) ─────────────────────────────────────────────────────────
  { file: 'meme-meme-logo.png',                symbol: 'MEME',      name: 'Meme Coin',       tier: TIERS.COMMON },
  { file: 'dogecoin-doge-logo.png',            symbol: 'DOGE',      name: 'Dogecoin',        tier: TIERS.COMMON },
  { file: 'shiba-inu-shib-logo.png',           symbol: 'SHIB',      name: 'Shiba Inu',       tier: TIERS.COMMON },
  { file: 'floki-inu-floki-logo.png',          symbol: 'FLOKI',     name: 'Floki Inu',       tier: TIERS.COMMON },
  { file: 'bone-shibaswap-bone-logo.png',      symbol: 'BONE',      name: 'Bone ShibaSwap',  tier: TIERS.COMMON },
  { file: 'bonk1-bonk-logo.png',               symbol: 'BONK',      name: 'Bonk',            tier: TIERS.COMMON },
  { file: 'book-of-meme-bome-logo.png',        symbol: 'BOME',      name: 'Book of Meme',    tier: TIERS.COMMON },
  { file: 'baby-doge-coin-babydoge-logo.png',  symbol: 'BABYDOGE',  name: 'Baby Doge Coin',  tier: TIERS.COMMON },
  { file: 'ponke-ponke-logo.png',              symbol: 'PONKE',     name: 'Ponke',           tier: TIERS.COMMON },
  { file: 'poocoin-poocoin-logo.png',          symbol: 'POOCOIN',   name: 'PooCoin',         tier: TIERS.COMMON },
  { file: 'catcoin-token-cats-logo.png',       symbol: 'CATS',      name: 'Cat Coin',        tier: TIERS.COMMON },
  { file: 'dogebonk-dobo-logo.png',            symbol: 'DOBO',      name: 'DogeBonk',       tier: TIERS.COMMON },
  { file: 'dogelon-elon-logo.png',             symbol: 'ELON',      name: 'Dogelon Mars',    tier: TIERS.COMMON },
  { file: 'yooshi-yooshi-logo.png',            symbol: 'YOOSHI',    name: 'YooShi',          tier: TIERS.COMMON },
  { file: 'simonscat-cat-logo.png',            symbol: 'CAT',       name: "Simon's Cat",     tier: TIERS.COMMON },
  { file: 'mew-mew-logo.png',                  symbol: 'MEW',       name: 'Cat in a Dogs World', tier: TIERS.COMMON },
  { file: 'popcat-sol-popcat-logo.png',        symbol: 'POPCAT',    name: 'Popcat',          tier: TIERS.COMMON },
  { file: 'bean-cash-bitb-logo.png',           symbol: 'BITB',      name: 'Bean Cash',       tier: TIERS.COMMON },
  { file: 'bakerytoken-bake-logo.png',         symbol: 'BAKE',      name: 'BakeryToken',     tier: TIERS.COMMON },
  { file: 'dinolfg-dino-logo.png',             symbol: 'DINO',      name: 'DinoLFG',         tier: TIERS.COMMON },

  // ── RARE (0.5%) ──────────────────────────────────────────────────────────
  { file: 'arbitrum-arb-logo.png',             symbol: 'ARB',       name: 'Arbitrum',        tier: TIERS.RARE },
  { file: 'polygon-matic-logo.png',            symbol: 'MATIC',     name: 'Polygon',         tier: TIERS.RARE },
  { file: 'sui-sui-logo.png',                  symbol: 'SUI',       name: 'Sui',             tier: TIERS.RARE },
  { file: 'pancakeswap-cake-logo.png',         symbol: 'CAKE',      name: 'PancakeSwap',     tier: TIERS.RARE },
  { file: 'tron-trx-logo.png',                 symbol: 'TRX',       name: 'TRON',            tier: TIERS.RARE },
  { file: 'xrp-xrp-logo.png',                  symbol: 'XRP',       name: 'XRP',             tier: TIERS.RARE },
  { file: 'degen-base-degen-logo.png',         symbol: 'DEGEN',     name: 'Degen',           tier: TIERS.RARE },
  { file: 'based-brett-brett-logo.png',        symbol: 'BRETT',     name: 'Brett',           tier: TIERS.RARE },
  { file: 'aptos-apt-logo.png',                symbol: 'APT',       name: 'Aptos',           tier: TIERS.RARE },
  { file: 'tether-usdt-logo.png',              symbol: 'USDT',      name: 'Tether',          tier: TIERS.RARE },
  { file: 'usd-coin-usdc-logo.png',            symbol: 'USDC',      name: 'USD Coin',        tier: TIERS.RARE },
  { file: 'sushiswap-sushi-logo.png',          symbol: 'SUSHI',     name: 'SushiSwap',       tier: TIERS.RARE },
  { file: 'orca-orca-logo.png',                symbol: 'ORCA',      name: 'Orca',            tier: TIERS.RARE },
  { file: 'nakamoto-games-naka-logo.png',      symbol: 'NAKA',      name: 'Nakamoto Games',  tier: TIERS.RARE },
  { file: 'ravencoin-rvn-logo.png',            symbol: 'RVN',       name: 'Ravencoin',       tier: TIERS.RARE },
  { file: 'substratum-sub-logo.png',           symbol: 'SUB',       name: 'Substratum',      tier: TIERS.RARE },
  { file: 'xdai-stake-logo.png',               symbol: 'STAKE',     name: 'xDAI Stake',      tier: TIERS.RARE },
  { file: 'pepe-pepe-logo.png',                symbol: 'PEPE',      name: 'Pepe',            tier: TIERS.RARE },
  { file: 'virtual-protocol-virtual-logo.png', symbol: 'VIRTUAL',   name: 'Virtual Protocol',tier: TIERS.RARE },
  { file: 'dragonchain-drgn-logo.png',         symbol: 'DRGN',      name: 'Dragonchain',     tier: TIERS.RARE },
  { file: 'shibadoge-shibdoge-logo.png',       symbol: 'SHIBDOGE',  name: 'ShibaDoge',       tier: TIERS.RARE },
  { file: 'bitget-token-new-bgb-logo.png',     symbol: 'BGB',       name: 'Bitget Token',    tier: TIERS.RARE },
  { file: 'beefy-finance-bifi-logo.png',       symbol: 'BIFI',      name: 'Beefy Finance',   tier: TIERS.RARE },
  { file: 'osaka-protocol-osak-logo.png',      symbol: 'OSAK',      name: 'Osaka Protocol',  tier: TIERS.RARE },
  { file: 'naga-ngc-logo.png',                 symbol: 'NGC',       name: 'NAGA Coin',       tier: TIERS.RARE },

  // ── LEGENDARY (0.01%) ─────────────────────────────────────────────────────
  { file: 'bitcoin-btc-logo.png',              symbol: 'BTC',       name: 'Bitcoin',         tier: TIERS.LEGENDARY },
  { file: 'ethereum-eth-logo.png',             symbol: 'ETH',       name: 'Ethereum',        tier: TIERS.LEGENDARY },
  { file: 'solana-sol-logo.png',               symbol: 'SOL',       name: 'Solana',          tier: TIERS.LEGENDARY },
];

// Pre-split by tier for fast lookup
export const COMMON_TOKENS    = TOKENS.filter(t => t.tier === TIERS.COMMON);
export const RARE_TOKENS      = TOKENS.filter(t => t.tier === TIERS.RARE);
export const LEGENDARY_TOKENS = TOKENS.filter(t => t.tier === TIERS.LEGENDARY);
