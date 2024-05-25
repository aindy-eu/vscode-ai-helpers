import * as vscode from 'vscode';

const defaultConfig = {
  tokensBeforeSplitting: 8000,
  createFolderFileStructure: [],
};

export function getMaxTokensPerChunk(): number {
  const maxTokens = vscode.workspace.getConfiguration('ai-helpers').get<number>('tokensBeforeSplitting') || defaultConfig.tokensBeforeSplitting;
  return validateMaxTokens(maxTokens);
}

function validateMaxTokens(maxTokens: number): number {
  if (maxTokens <= 0) {
    throw new Error('Invalid value for tokensBeforeSplitting. Must be a positive number.');
  }
  return maxTokens;
}

export function getIgnoredFiles(): string[] {
  const ignoreFolderFiles = vscode.workspace.getConfiguration('ai-helpers').get<string>('createFolderFileStructure')?.split(',') || defaultConfig.createFolderFileStructure;
  return validateIgnoredFiles(ignoreFolderFiles).map(name => name.trim());
}

function validateIgnoredFiles(ignoredFiles: string[]): string[] {
  if (ignoredFiles.length === 0) {
    throw new Error('The ignoredFiles array must not be empty.');
  }
  return ignoredFiles;
}
