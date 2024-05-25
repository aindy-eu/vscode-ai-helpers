import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";
import { getFolderStructure } from "./getFolderStructure"; // Adjust the import path as needed

// Function to create the folder structure and save it to a file
export async function createFolderStructure() {
  // Prompt the user to enter the folder name
  let folderName = await vscode.window.showInputBox({ prompt: "Enter the folder name" });

  if (folderName) {
    const workspaceFolders = vscode.workspace.workspaceFolders;

    if (workspaceFolders && workspaceFolders.length > 0) {
      const workspaceRoot = workspaceFolders[0].uri.fsPath;
      const folderPath = path.join(workspaceRoot, folderName);

      // Check if the folder exists
      if (fs.existsSync(folderPath)) {
        // Get the folder structure
        const structure = getFolderStructure(folderPath, 0);

        // Write the folder structure to a file
        fs.writeFileSync(path.join(workspaceRoot, "folder-structure.txt"), structure);
        vscode.window.showInformationMessage("Folder structure saved.");
      } else {
        vscode.window.showErrorMessage(`Folder "${folderName}" does not exist.`);
      }
    } else {
      vscode.window.showErrorMessage("No workspace open.");
    }
  } else {
    vscode.window.showErrorMessage("No folder name entered.");
  }
}
