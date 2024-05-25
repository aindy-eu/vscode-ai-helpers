import * as vscode from 'vscode';
import { TextDecoder, TextEncoder } from 'util';
import { getMaxTokensPerChunk } from './utils/configUtils';
import { writeChunkToFile, addFilesInDir } from './utils/fileUtils';
import { estimateTokens, getPartContent } from './utils/chunkUtils';
import { getRootPath, getRelativePath } from './utils/pathUtils';

// Function to handle splitting files into chunks for AI prompts
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
        try {
            const fileContent = await vscode.workspace.fs.readFile(fileUri);
            const content = new TextDecoder("utf-8").decode(fileContent);
            const relativePath = getRelativePath(rootPath, fileUri);
            const fileTokenCount = estimateTokens(content);

            // Handle large files separately
            if (fileTokenCount > maxTokensPerChunk) {
                largeFiles.push({ fileUri, fileContent: content, relativePath });
                continue;
            }

            // Write current chunk if adding this file would exceed the token limit
            if ((tokensForThisChunk + fileTokenCount) > maxTokensPerChunk) {
                await writeChunkToFile(rootPath, chunkIndex, chunkContent, '-----');
                chunkContent = '';
                chunkIndex++;
                tokensForThisChunk = 0;
            }

            // Add file content to the current chunk
            tokensForThisChunk += fileTokenCount;
            totalTokenCount += fileTokenCount;
            chunkContent += `// ${relativePath}\n${content}\n-----\n`;
        } catch (error) {
            vscode.window.showInformationMessage(`Error while reading file content: ${error}`);
        }
    }

    // Write remaining content to a new chunk
    if (chunkContent) {
        await writeChunkToFile(rootPath, chunkIndex, chunkContent, '-----');
        chunkIndex++;
    }

    // Handle large files by splitting them into smaller parts
    for (const { fileContent, relativePath } of largeFiles) {
        let start = 0;
        let partContent = getPartContent(fileContent, start, maxTokensPerChunk);
        let partTokenCount = estimateTokens(partContent);
        let partIndex = 1;
        let nextPartContent = getPartContent(fileContent, start + partContent.length, maxTokensPerChunk);

        while (partContent) {
            const separator = nextPartContent ? '********' : '--------';
            chunkContent = `// ${relativePath}\n${partContent}\n${separator}\n`;
            await writeChunkToFile(rootPath, chunkIndex, chunkContent, separator, partIndex);
            partIndex++;
            tokensForThisChunk = partTokenCount;
            totalTokenCount += partTokenCount;
            start += partContent.length;
            partContent = nextPartContent;
            nextPartContent = getPartContent(fileContent, start + partContent.length, maxTokensPerChunk);
            partTokenCount = estimateTokens(partContent);
        }
        chunkIndex++;
    }

    // Update the first chunk file with the total token count if the configuration is enabled
    const includeTokenInfo = vscode.workspace.getConfiguration('ai-helpers').get<boolean>('includeTokenInfo');
    if (includeTokenInfo) {
        const firstChunkFilePath = `${rootPath}/Chunk-1.txt`;
        const firstChunkFileContent = await vscode.workspace.fs.readFile(vscode.Uri.file(firstChunkFilePath));
        const totalTokensContent = `Total tokens for all chunks: ${totalTokenCount}\n` + new TextDecoder("utf-8").decode(firstChunkFileContent);
        await vscode.workspace.fs.writeFile(vscode.Uri.file(firstChunkFilePath), new TextEncoder().encode(totalTokensContent));
    }
}
