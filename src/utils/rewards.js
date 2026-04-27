// Client-side reward simulation — mirrors the on-chain probability distribution.
// Used in demo mode (no contract needed).

import { TIERS, TIER_CONFIG, COMMON_TOKENS, RARE_TOKENS, LEGENDARY_TOKENS } from '../config/tokens';

/**
 * Pick a random item from an array.
 */
function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * Generate a random reward amount within the tier's min/max range.
 * Returns a string formatted to 4 decimal places.
 */
function randomReward(tier) {
  const cfg = TIER_CONFIG[tier];
  const val = cfg.rewardMin + Math.random() * (cfg.rewardMax - cfg.rewardMin);
  return parseFloat(val.toFixed(4));
}

/**
 * Roll a random reward.
 * Returns { token, tier, reward, isJackpot }
 *
 * Probability distribution:
 *   Common:    70%
 *   Rare:      20%
 *   Legendary: 10%
 */
export function rollReward(currentJackpot = 0) {
  const roll = Math.random();

  let tier;
  if (roll < 0.70) {
    tier = TIERS.COMMON;
  } else if (roll < 0.90) {
    tier = TIERS.RARE;
  } else {
    tier = TIERS.LEGENDARY;
  }

  let tokens;
  if (tier === TIERS.COMMON)    tokens = COMMON_TOKENS;
  else if (tier === TIERS.RARE) tokens = RARE_TOKENS;
  else                          tokens = LEGENDARY_TOKENS;

  const token = pick(tokens);

  // For legendary, there's a 30% chance to win the jackpot
  const isJackpot = tier === TIERS.LEGENDARY && Math.random() < 0.30 && currentJackpot > 0;
  const reward = isJackpot ? parseFloat(currentJackpot.toFixed(4)) : randomReward(tier);

  return { token, tier, reward, isJackpot };
}

/**
 * How much of the box price goes to the jackpot pool (20%).
 */
export const JACKPOT_CONTRIBUTION = 0.20;

/**
 * Box price in ETH.
 */
export const BOX_PRICE = 0.001;
