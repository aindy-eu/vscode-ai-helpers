import { getConfigValue } from './configUtils';

/**
 * Retrieves the token estimation factor from the configuration.
 * If the configuration value is not set, it defaults to 4.5.
 *
 * @returns {number} The token estimation factor.
 */
function getTokenEstimationFactor(): number {
  return getConfigValue<number>('tokenEstimationFactor', 4.5);
}

/**
 * Estimates the number of tokens in the given content.
 *
 * @param {string} content - The content to estimate tokens for.
 * @returns {number} The estimated number of tokens.
 */
export function estimateTokens(content: string): number {
  const tokenEstimationFactor = getTokenEstimationFactor();
  const words = content.split(' ').length;
  return Math.round(words * tokenEstimationFactor);
}

/**
 * Gets a part of the content based on the start position and maximum number of tokens.
 *
 * @param {string} content - The content to get a part from.
 * @param {number} start - The starting index for the part.
 * @param {number} maxTokens - The maximum number of tokens for the part.
 * @returns {string} The substring representing the part of the content.
 */
export function getPartContent(content: string, start: number, maxTokens: number): string {
  const tokenEstimationFactor = getTokenEstimationFactor();
  const end = start + Math.floor(maxTokens / tokenEstimationFactor);
  return content.substring(start, end);
}
