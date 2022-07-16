import * as vscode from 'vscode';
import { Drupal } from './drupal';

export class Command {
  static async lookup(context: vscode.ExtensionContext) {
    const config = vscode.workspace.getConfiguration();
    const api = new Drupal(
      config.get('drupalTemplateQuery.baseUrl', ''),
      config.get('drupalTemplateQuery.token', '')
    );
    const filename = vscode.window.activeTextEditor?.document.fileName;
    if (filename?.endsWith('.html.twig')) {
      const entity = api.parseTemplate(filename);
      if (entity) {
        const content = await api.getEntityDisplayInfo(entity);

        // Create and show a new webview.
        const panel = vscode.window.createWebviewPanel(
          'drupaltemplatequery', // Identifies the type of the webview. Used internally
          "Drupal Field Config",
          vscode.ViewColumn.One);
        // Allow scripts.
        panel.webview.options = {
          enableScripts: true,
          localResourceRoots: [vscode.Uri.joinPath(context.extensionUri, 'assets')]
        };

        const contentJson = JSON.stringify(content?.data[0]?.attributes?.content, null, 2);
        const hiddenJson = JSON.stringify(content?.data[0]?.attributes?.hidden, null, 2);

        const scriptPathOnDisk = vscode.Uri.joinPath(context.extensionUri, 'assets', 'json-viewer.js');
        const scriptUri = panel.webview.asWebviewUri(scriptPathOnDisk);
        const stylesPath = vscode.Uri.joinPath(context.extensionUri, 'assets', 'styles.css');
        const stylesUri = panel.webview.asWebviewUri(stylesPath);

        const getNonce = () => {
          let text = '';
          const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
          for (let i = 0; i < 32; i++) {
            text += possible.charAt(Math.floor(Math.random() * possible.length));
          }
          return text;
        };
        const nonce = getNonce();

        panel.webview.html = `
        <!DOCTYPE html>
        <html lang="en">
          <head>
            <meta charset="UTF-8">
            <!--
              Use a content security policy to only allow loading images from https or from our extension directory,
              and only allow scripts that have a specific nonce.
            -->
            <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${panel.webview.cspSource}; img-src ${panel.webview.cspSource} https:; script-src 'nonce-${nonce}';">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <link href="${stylesUri}" rel="stylesheet">
          </head>
          <body>
            <div class="info">
              <h2>Entity info</h2>
              <dl>
                <dt>Entity type</dt>
                <dd>${entity.type}</dd>
                <dt>Bundle</dt>
                <dd>${entity.bundle}</dd>
                <dt>View mode</dt>
                <dd>${entity.viewmode}</dd>
              </dl>
            </div>

            <div class="columns">
              <div class="content">
                <h2>Content fields</h2>
                <pre class="json">${contentJson}</pre>
              </div>

              <div class="hidden">
                <h2>Hidden fields</h2>
                <pre class="json">${hiddenJson}</pre>
              </div>
            </div>

            <script nonce="${nonce}" src="${scriptUri}"></script>
            <script nonce="${nonce}">
              document.querySelectorAll('.json').forEach(el => {
                const jsonViewer = new JSONViewer();
                el.parentNode.appendChild(jsonViewer.getContainer());
                const json = JSON.parse(el.innerText);
                el.parentNode.removeChild(el);
                jsonViewer.showJSON(json);
              });
            </script>
          </body>
        </html>
        `;
      }
    }
  }

}