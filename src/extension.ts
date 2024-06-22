import * as vscode from 'vscode';
import * as fuzzysort from 'fuzzysort';
import * as path from 'path';
interface OpenTab extends vscode.QuickPickItem {
	label: string;
	filePath: string;
	alwaysShow: boolean;
}

function getFilename(filePath: string): string {
	return path.basename(filePath);
}

export function activate(context: vscode.ExtensionContext) {
	let disposable = vscode.commands.registerCommand('switchbuffers.switchFiles', () => {
		let openTabs: OpenTab[] = [];
		const editorGroups = vscode.window.tabGroups.all;

		editorGroups.forEach(group => {
			group.tabs.forEach(tab => {
				if (tab.input instanceof vscode.TabInputText) {
					const document = tab.input.uri;
					openTabs.push({
						label: getFilename(document.path),
						filePath: document.fsPath,
						alwaysShow: true,
					});
				}
			});
		});

		const quickPick = vscode.window.createQuickPick<OpenTab>();
		quickPick.items = openTabs;
		quickPick.placeholder = "Switch to file";
		quickPick.canSelectMany = false;
		quickPick.ignoreFocusOut = true;

		quickPick.onDidChangeValue(value => {
			if (value) {
				const words = value.split(' ').filter(word => word.trim() !== '');
				let results = [] as any[];

				for (const word of words) {
					const wordResults = fuzzysort.go(word, openTabs, {
						keys: ['label'],
						threshold: -10000,
						all: true,
					});
					results = results.concat(wordResults);
				}

				const uniqueResults = Array.from(new Map(results.map(result => [result.obj?.filePath, result])).values());

				uniqueResults.sort((a, b) => b.score - a.score);

				const items: OpenTab[] = uniqueResults.map(result => ({
					label: result.obj?.label || '',
					filePath: result.obj?.filePath || '',
					alwaysShow: result.obj?.alwaysShow || false,
				}));
				quickPick.items = items;
			} else {
				quickPick.items = openTabs;
			}
		});

		quickPick.onDidChangeSelection(async ([item]) => {
			if (item) {
				const documentUri = vscode.Uri.file(item.filePath);
				await vscode.window.showTextDocument(documentUri);
				quickPick.hide();
			}
		});

		quickPick.onDidChangeSelection(([item]) => {
			if (item) {
				const uri = vscode.Uri.file(item.filePath);
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
