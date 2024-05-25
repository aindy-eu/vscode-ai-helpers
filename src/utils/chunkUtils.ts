import * as vscode from 'vscode';

export function estimateTokens(content: string): number {
  const tokenEstimationFactor = vscode.workspace.getConfiguration('ai-helpers').get<number>('tokenEstimationFactor') || 4.5;
  const words = content.split(' ').length;
  return words * tokenEstimationFactor;
}

export function getPartContent(content: string, start: number, maxTokens: number): string {
  const tokenEstimationFactor = vscode.workspace.getConfiguration('ai-helpers').get<number>('tokenEstimationFactor') || 4.5;
  const end = start + Math.floor(maxTokens / tokenEstimationFactor);
  return content.substring(start, end);
}
