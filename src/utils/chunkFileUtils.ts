import { TextDecoder, TextEncoder } from 'util';
import * as vscode from 'vscode';
import { getRelativePath } from './pathUtils';
import { estimateTokens, getPartContent } from './chunkUtils';
import { writeChunkToFile } from './fileUtils';

/**
 * Processes a single file, estimating tokens and appending content to chunks.
 *
 * @param {string} rootPath - The root directory path.
 * @param {vscode.Uri} fileUri - The URI of the file.
 * @param {string} chunkContent - The current chunk content.
 * @param {number} tokensForThisChunk - The current token count for the chunk.
 * @param {number} totalTokenCount - The total token count.
 * @param {number} maxTokensPerChunk - The maximum number of tokens per chunk.
 * @param {number} chunkIndex - The current chunk index.
 * @param {Array} largeFiles - Array to hold large file information.
 * @returns {Promise<{chunkContent: string, tokensForThisChunk: number, totalTokenCount: number, chunkIndex: number}>} - Updated chunk content, token counts, and chunk index.
 */
export async function processFile(
  rootPath: string,
  fileUri: vscode.Uri,
  chunkContent: string,
  tokensForThisChunk: number,
  totalTokenCount: number,
  maxTokensPerChunk: number,
  chunkIndex: number,
  largeFiles: { fileUri: vscode.Uri, fileContent: string, relativePath: string }[]
): Promise<{ chunkContent: string, tokensForThisChunk: number, totalTokenCount: number, chunkIndex: number }> {
  try {
    const fileContent = await vscode.workspace.fs.readFile(fileUri);
    const content = new TextDecoder("utf-8").decode(fileContent);
    const relativePath = getRelativePath(rootPath, fileUri);
    const fileTokenCount = estimateTokens(content);

    if (fileTokenCount > maxTokensPerChunk) {
      largeFiles.push({ fileUri, fileContent: content, relativePath });
      return { chunkContent, tokensForThisChunk, totalTokenCount, chunkIndex };
    }

    if ((tokensForThisChunk + fileTokenCount) > maxTokensPerChunk) {
      await writeChunkToFile(rootPath, chunkIndex, chunkContent, '-----');
      chunkContent = '';
      chunkIndex++;
      tokensForThisChunk = 0;
    }

    tokensForThisChunk += fileTokenCount;
    totalTokenCount += fileTokenCount;
    chunkContent += `// ${relativePath}\n${content}\n-----\n`;
  } catch (error) {
    vscode.window.showInformationMessage(`Error while reading file content: ${error}`);
  }

  return { chunkContent, tokensForThisChunk, totalTokenCount, chunkIndex };
}

/**
 * Processes large files by splitting them into smaller parts.
 *
 * @param {string} rootPath - The root directory path.
 * @param {Array} largeFiles - Array containing large file information.
 * @param {number} maxTokensPerChunk - The maximum number of tokens per chunk.
 * @param {number} chunkIndex - The current chunk index.
 * @param {number} totalTokenCount - The total token count.
 * @returns {Promise<{chunkIndex: number, totalTokenCount: number}>} - Updated chunk index and total token count.
 */
export async function processLargeFiles(
  rootPath: string,
  largeFiles: { fileContent: string, relativePath: string }[],
  maxTokensPerChunk: number,
  chunkIndex: number,
  totalTokenCount: number
): Promise<{ chunkIndex: number, totalTokenCount: number }> {
  for (const { fileContent, relativePath } of largeFiles) {
    let start = 0;
    let partContent = getPartContent(fileContent, start, maxTokensPerChunk);
    let partTokenCount = estimateTokens(partContent);
    let partIndex = 1;
    let nextPartContent = getPartContent(fileContent, start + partContent.length, maxTokensPerChunk);

    while (partContent) {
      const separator = nextPartContent ? '********' : '--------';
      const chunkContent = `// ${relativePath}\n${partContent}\n${separator}\n`;
      await writeChunkToFile(rootPath, chunkIndex, chunkContent, separator, partIndex);
      partIndex++;
      totalTokenCount += partTokenCount;
      start += partContent.length;
      partContent = nextPartContent;
      nextPartContent = getPartContent(fileContent, start + partContent.length, maxTokensPerChunk);
      partTokenCount = estimateTokens(partContent);
    }
    chunkIndex++;
  }

  return { chunkIndex, totalTokenCount };
}

/**
 * Updates the first chunk file with the total token count if configured to do so.
 *
 * @param {string} rootPath - The root directory path.
 * @param {number} totalTokenCount - The total token count.
 */
export async function updateFirstChunkFileWithTotalTokenCount(rootPath: string, totalTokenCount: number): Promise<void> {
  const includeTokenInfo = vscode.workspace.getConfiguration('ai-helpers').get<boolean>('includeTokenInfo');
  if (includeTokenInfo) {
    const firstChunkFilePath = `${rootPath}/Chunk-1.txt`;
    const firstChunkFileContent = await vscode.workspace.fs.readFile(vscode.Uri.file(firstChunkFilePath));
    const totalTokensContent = `Total tokens for all chunks: ${totalTokenCount}\n` + new TextDecoder("utf-8").decode(firstChunkFileContent);
    await vscode.workspace.fs.writeFile(vscode.Uri.file(firstChunkFilePath), new TextEncoder().encode(totalTokensContent));
  }
}
