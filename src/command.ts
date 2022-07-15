import * as vscode from 'vscode';
import { Drupal } from './drupal';

export class Command {
  static async lookup(context: vscode.ExtensionContext) {
    const filename = vscode.window.activeTextEditor?.document.fileName;
    if (filename?.endsWith('.html.twig')) {
      const entity = Drupal.parseTemplate(filename);
      if (entity) {
        const fields = await Drupal.getEntityFieldInfo(entity);
        const content = await Drupal.getEntityDisplayInfo(entity);

        const columnToShowIn = vscode.window.activeTextEditor ? vscode.window.activeTextEditor.viewColumn : undefined;

        let currentPanel: vscode.WebviewPanel | undefined;
        if (currentPanel) {
          // If we already have a panel, show it in the target column
          currentPanel.reveal(columnToShowIn);
        }
        else {
          // Create and show a new webview
          currentPanel = vscode.window.createWebviewPanel(
            'drupaltemplatequery', // Identifies the type of the webview. Used internally
            "Drupal Field Config",
            vscode.ViewColumn.One);
        }

        currentPanel.webview.html = '<pre>' + JSON.stringify(content?.data[0]?.attributes?.content, null, 2) + '</pre>'
        currentPanel.onDidDispose(() => {
            currentPanel = undefined;
        }, null, context.subscriptions);
      }
    }
  }

}