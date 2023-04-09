import path = require('path');
import * as vscode from 'vscode';
interface OpenTab extends vscode.QuickPickItem {
	document: vscode.TextDocument;
}

export function activate(context: vscode.ExtensionContext) {

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
}

export function deactivate() { }
