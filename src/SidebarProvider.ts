import * as vscode from "vscode";

export class SidebarProvider implements vscode.WebviewViewProvider {
  _view?: vscode.WebviewView;
  private _onMessageReceived?: (data: any) => void;

  constructor(private readonly _extensionUri: vscode.Uri) {}

  public onMessageReceived(callback: (data: any) => void) { this._onMessageReceived = callback; }

  public postMessageToWebview(data: any) {
    if (this._view) { this._view.webview.postMessage(data); }
  }

  public resolveWebviewView(webviewView: vscode.WebviewView) {
    this._view = webviewView;
    webviewView.webview.onDidReceiveMessage((data: any) => {
      if (this._onMessageReceived) { this._onMessageReceived(data); }
    });
    webviewView.webview.options = { enableScripts: true, localResourceRoots: [this._extensionUri] };
    webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);
  }

  private _getHtmlForWebview(webview: vscode.Webview) {
    return `<!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <style>
            body { font-family: var(--vscode-font-family); color: var(--vscode-foreground); padding: 0; display: flex; flex-direction: column; height: 100vh; margin: 0; }
            #chat-container { flex-grow: 1; overflow-y: auto; padding: 15px; display: flex; flex-direction: column; gap: 10px; }
            .message { padding: 10px 14px; border-radius: 12px; max-width: 85%; line-height: 1.4; font-size: 13px; word-wrap: break-word; }
            .bot { background: var(--vscode-editor-inactiveSelectionBackground); align-self: flex-start; border-bottom-left-radius: 2px; }
            .user { background: var(--vscode-button-background); color: var(--vscode-button-foreground); align-self: flex-end; border-bottom-right-radius: 2px; }
            .system-alert { background: rgba(255, 72, 72, 0.1); border: 1px solid var(--vscode-errorForeground); color: var(--vscode-errorForeground); align-self: center; font-size: 11px; padding: 4px 10px; border-radius: 4px; margin: 5px 0; }
            #input-container { padding: 10px; border-top: 1px solid var(--vscode-panel-border); display: flex; gap: 8px; }
            input { flex-grow: 1; background: var(--vscode-input-background); color: var(--vscode-input-foreground); border: 1px solid var(--vscode-input-border); padding: 8px; border-radius: 4px; outline: none; }
            button { background: var(--vscode-button-background); color: var(--vscode-button-foreground); border: none; padding: 0 15px; border-radius: 4px; cursor: pointer; font-weight: bold; }
        </style>
    </head>
    <body>
        <div id="chat-container"><div class="message bot">Hii! I'm DevGuide. I'm watching your code!</div></div>
        <div id="input-container">
            <input type="text" id="user-input" placeholder="Chat with DevGuide..." />
            <button id="send-btn">Send</button>
        </div>
        <script>
            const vscode = acquireVsCodeApi();
            const chatContainer = document.getElementById('chat-container');
            const inputField = document.getElementById('user-input');
            const sendBtn = document.getElementById('send-btn');

            window.addEventListener('message', event => {
                const m = event.data;
                if (m.type === 'error-detected') {
                    addMessage("🚨 System: Error on line " + m.value.line, 'system-alert');
                }
                if (m.type === 'bot-response') {
                    // Replace "Thinking..." with real response
                    const messages = chatContainer.getElementsByClassName('bot');
                    if (messages.length > 0 && messages[messages.length-1].innerText === "Thinking...") {
                        messages[messages.length-1].innerText = m.value;
                    } else {
                        addMessage(m.value, 'bot');
                    }
                }
            });

            function sendMessage() {
                const text = inputField.value.trim();
                if (!text) return;
                addMessage(text, 'user');
                inputField.value = '';
                vscode.postMessage({ command: 'chat', text: text });
            }

            sendBtn.addEventListener('click', sendMessage);
            inputField.addEventListener('keypress', (e) => { if (e.key === 'Enter') sendMessage(); });

            function addMessage(text, type) {
                const div = document.createElement('div');
                div.className = 'message ' + type;
                div.innerText = text;
                chatContainer.appendChild(div);
                chatContainer.scrollTop = chatContainer.scrollHeight;
            }
        </script>
    </body>
    </html>`;
  }
}