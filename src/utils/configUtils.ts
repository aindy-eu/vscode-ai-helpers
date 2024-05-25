import * as vscode from 'vscode';

const defaultConfig = {
  tokensBeforeSplitting: 8000,
  createFolderFileStructure: [],
};

export function getMaxTokensPerChunk(): number {
  const configValue = vscode.workspace.getConfiguration('ai-helpers').get<number>('tokensBeforeSplitting');
  const maxTokens = configValue || defaultConfig.tokensBeforeSplitting;

  if (maxTokens <= 0) {
    const message = 'Invalid value for tokensBeforeSplitting. Must be a positive number.';
    vscode.window.showErrorMessage(message);
    throw new Error(message);
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
