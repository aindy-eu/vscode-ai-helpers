import * as vscode from 'vscode';

const defaultConfig = {
  tokensBeforeSplitting: 8000,
  createFolderFileStructure: [],
};

/**
 * Retrieves a configuration value from the 'ai-helpers' configuration section.
 *
 * @param {string} key - The configuration key to retrieve.
 * @param {any} defaultValue - The default value to use if the configuration key is not set.
 * @returns {any} The configuration value or the default value.
 */
export function getConfigValue<T>(key: string, defaultValue: T): T {
  return vscode.workspace.getConfiguration('ai-helpers').get<T>(key) || defaultValue;
}

/**
 * Retrieves the maximum number of tokens per chunk from the configuration.
 * If the configuration value is not set, it defaults to 8000.
 *
 * @returns {number} The maximum number of tokens per chunk.
 * @throws {Error} If the retrieved configuration value is not a positive number.
 */
export function getMaxTokensPerChunk(): number {
  const maxTokens = getConfigValue<number>('tokensBeforeSplitting', defaultConfig.tokensBeforeSplitting);

  if (maxTokens <= 0) {
    const message = 'Invalid value for tokensBeforeSplitting. Must be a positive number.';
    vscode.window.showErrorMessage(message);
    throw new Error(message);
  }
  return maxTokens;
}

/**
 * Retrieves the list of ignored files and folders from the configuration.
 * If the configuration value is not set, it defaults to an empty array.
 *
 * @returns {string[]} The list of ignored files and folders.
 * @throws {Error} If the retrieved list is empty.
 */
export function getIgnoredFiles(): string[] {
  const ignoredFiles = getConfigValue<string>('createFolderFileStructure', defaultConfig.createFolderFileStructure.join(','))
    .split(',')
    .map(name => name.trim());

  return validateIgnoredFiles(ignoredFiles);
}

/**
 * Validates the list of ignored files and folders.
 *
 * @param {string[]} ignoredFiles - The list of ignored files and folders to validate.
 * @returns {string[]} The validated list of ignored files and folders.
 * @throws {Error} If the list is empty.
 */
function validateIgnoredFiles(ignoredFiles: string[]): string[] {
  if (ignoredFiles.length === 0) {
    const message = 'The ignoredFiles array must not be empty.';
    vscode.window.showErrorMessage(message);
    throw new Error(message);
  }
  return ignoredFiles;
}
