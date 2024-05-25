import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";
import { getFolderStructure } from "./getFolderStructure";

/**
 * Prompts the user for a folder name, generates the folder structure for the specified folder,
 * and saves it to a file named 'folder-structure.txt' in the workspace root.
 */
export async function createFolderStructure() {
  // Prompt the user to enter the folder name
  let folderName = await vscode.window.showInputBox({ prompt: "Enter the folder name" });

  if (folderName) {
    const workspaceFolders = vscode.workspace.workspaceFolders;

    // Check if there is an open workspace
    if (workspaceFolders && workspaceFolders.length > 0) {
      const workspaceRoot = workspaceFolders[0].uri.fsPath;
      const folderPath = path.join(workspaceRoot, folderName);

      // Check if the specified folder exists
      if (fs.existsSync(folderPath)) {
        // Get the folder structure
        const structure = getFolderStructure(folderPath, 0);

        // Write the folder structure to a file
        fs.writeFileSync(path.join(workspaceRoot, "folder-structure.txt"), structure);
        vscode.window.showInformationMessage("Folder structure saved.");
      } else {
        // Show an error message if the folder does not exist
        vscode.window.showErrorMessage(`Folder "${folderName}" does not exist.`);
      }
    } else {
      // Show an error message if no workspace is open
      vscode.window.showErrorMessage("No workspace open.");
    }
  } else {
    // Show an error message if no folder name is entered
    vscode.window.showErrorMessage("No folder name entered.");
  }
}
