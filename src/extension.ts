// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import path = require('path');
import * as vscode from 'vscode';
interface OpenTab extends vscode.QuickPickItem {
	document: vscode.TextDocument;
}

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "switchbuffers" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let openTabs = [];

	for (const editor of vscode.window.visibleTextEditors) {
		openTabs.push(editor.document.uri.toString());
	}

	console.log(openTabs);
	let disposable = vscode.commands.registerCommand('switchbuffers.switchFiles', () => {
		let openTabs: OpenTab[] = [];

		for (const document of vscode.workspace.textDocuments) {
			const uri = document.uri;
			if (uri.scheme !== 'git') {
				openTabs.push({
					description: vscode.workspace.asRelativePath(document.fileName),
					label: path.basename(document.fileName),
					document: document
				});
			}
		}

		const quickPick = vscode.window.createQuickPick<OpenTab>();
		quickPick.items = openTabs;
		quickPick.placeholder = "Switch to file";
		quickPick.canSelectMany = false;
		quickPick.ignoreFocusOut = true;

		quickPick.onDidChangeSelection(([item]) => {
			if (item) {
				vscode.window.showTextDocument(item.document);
				quickPick.hide();
			}
		});

		quickPick.onDidHide(() => quickPick.dispose());
		quickPick.show();

	});

	context.subscriptions.push(disposable);

	vscode.window.showInformationMessage('Switchbuffers is now active!');

}

// This method is called when your extension is deactivated
export function deactivate() { }
