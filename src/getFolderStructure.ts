import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';

// Function to recursively get the folder structure
export function getFolderStructure(dirPath: string, indentLevel: number): string {
  let structure = '';
  const items = fs.readdirSync(dirPath);

  // Get the configuration for excluding files and folders
  const config = vscode.workspace.getConfiguration('ai-helpers');
  const excludeList = (config.get<string>('createFolderFileStructure') || '')
    .split(',')
    .map(item => item.trim())
    .filter(item => item.length > 0);

  console.log('excludeList:', excludeList);

  for (const item of items) {
    console.log(`excludeList.includes(${item})`, excludeList.includes(item));

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
