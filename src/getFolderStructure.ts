import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';

/**
 * Recursively gets the folder structure starting from the specified directory path.
 *
 * @param {string} dirPath - The path of the directory to start from.
 * @param {number} indentLevel - The current indentation level for nested items.
 * @returns {string} A string representing the folder structure.
 */
export function getFolderStructure(dirPath: string, indentLevel: number): string {
  let structure = '';
  const items = fs.readdirSync(dirPath);

  // Get the configuration for excluding files and folders
  const config = vscode.workspace.getConfiguration('ai-helpers');
  const excludeList = (config.get<string>('createFolderFileStructure') || '')
    .split(',')
    .map(item => item.trim())
    .filter(item => item.length > 0);

  for (const item of items) {
    if (excludeList.includes(item)) {
      continue;
    }

    // Indent for nested items
    structure += ' '.repeat(indentLevel * 4);

    const itemPath = path.join(dirPath, item);

    if (fs.lstatSync(itemPath).isDirectory()) {
      structure += `+ ${item}\n`;
      structure += getFolderStructure(itemPath, indentLevel + 1);
    } else {
      structure += `- ${item}\n`;
    }
  }

  return structure;
}
