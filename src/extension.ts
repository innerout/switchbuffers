import * as vscode from 'vscode';
interface OpenTab extends vscode.QuickPickItem {
	label: string;
}

function getFilename(path: string): string {
	let i = path.length - 1;
	while (i >= 0 && path[i] !== '/') {
		i--;
	}
	return path.slice(i + 1);
}

export function activate(context: vscode.ExtensionContext) {
	let disposable = vscode.commands.registerCommand('switchbuffers.switchFiles', () => {
		let openTabs: OpenTab[] = [];
		const editorGroups = vscode.window.tabGroups.all;
		let output = 'Open Tabs:\n';

		editorGroups.forEach(group => {
			group.tabs.forEach(tab => {
				if (tab.input instanceof vscode.TabInputText) {
					const document = tab.input.uri;
					output += `- ${document.path}\n`;
					openTabs.push({
						label: getFilename(document.path),
					});
				}
			});
		});

		vscode.window.showInformationMessage('Check the output for the list of open tabs.');
		const quickPick = vscode.window.createQuickPick<OpenTab>();
		quickPick.items = openTabs;
		quickPick.placeholder = "Switch to file";
		quickPick.canSelectMany = false;
		quickPick.ignoreFocusOut = true;

		quickPick.onDidChangeSelection(([item]) => {
			if (item) {
				let uri = vscode.Uri.file(item.label);
				vscode.window.showTextDocument(uri);
				quickPick.hide();
			}
		});

		quickPick.onDidHide(() => quickPick.dispose());
		quickPick.show();
	});

	context.subscriptions.push(disposable);
}

export function deactivate() { }
