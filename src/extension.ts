import * as vscode from 'vscode';
import { Command } from './command';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	console.log('"drupal-template-query" is now active');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	const commands = [
		vscode.commands.registerCommand('drupalTemplateQuery.lookup', async () => await Command.lookup(context))
	];
	context.subscriptions.push(...commands);
}

// this method is called when your extension is deactivated
export function deactivate() {}
