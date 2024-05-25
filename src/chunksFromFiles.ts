import * as vscode from 'vscode';
import { getMaxTokensPerChunk } from './utils/configUtils';
import { writeChunkToFile, addFilesInDir } from './utils/fileUtils';
import { getRootPath } from './utils/pathUtils';
import { processFile, processLargeFiles, updateFirstChunkFileWithTotalTokenCount } from './utils/chunkFileUtils';

/**
 * Handles splitting files into chunks for AI prompts.
 *
 * @param {vscode.Uri} contextSelection - The URI of the context selection.
 * @param {vscode.Uri[]} allSelections - The URIs of all selections.
 */
export async function chunksFromFiles(contextSelection: vscode.Uri, allSelections: vscode.Uri[]) {
  // Ensure allSelections is an array
  if (!Array.isArray(allSelections)) {
    allSelections = [allSelections];
  }

  // Configuration and initialization
  const maxTokensPerChunk = getMaxTokensPerChunk();
  const rootPath = getRootPath();
  if (!rootPath) {
    vscode.window.showInformationMessage('No root path defined');
    return;
  }

  let chunkContent = '';
  let chunkIndex = 1;
  let totalTokenCount = 0;
  let tokensForThisChunk = 0;
  const largeFiles: { fileUri: vscode.Uri, fileContent: string, relativePath: string }[] = [];
  let allFileUris: vscode.Uri[] = [];

  // Collect all file URIs from the provided selections
  for (const uri of allSelections) {
    const files = await addFilesInDir(uri);
    allFileUris.push(...files);
  }

  // Process each file URI
  for (const fileUri of allFileUris) {
    const result = await processFile(rootPath, fileUri, chunkContent, tokensForThisChunk, totalTokenCount, maxTokensPerChunk, chunkIndex, largeFiles);
    chunkContent = result.chunkContent;
    tokensForThisChunk = result.tokensForThisChunk;
    totalTokenCount = result.totalTokenCount;
    chunkIndex = result.chunkIndex;
  }

  // Write remaining content to a new chunk
  if (chunkContent) {
    await writeChunkToFile(rootPath, chunkIndex, chunkContent, '-----');
    chunkIndex++;
  }

  // Handle large files by splitting them into smaller parts
  const largeFilesResult = await processLargeFiles(rootPath, largeFiles, maxTokensPerChunk, chunkIndex, totalTokenCount);
  chunkIndex = largeFilesResult.chunkIndex;
  totalTokenCount = largeFilesResult.totalTokenCount;

  // Update the first chunk file with the total token count if the configuration is enabled
  await updateFirstChunkFileWithTotalTokenCount(rootPath, totalTokenCount);
}
