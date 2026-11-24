"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.SidebarProvider = void 0;
const vscode = __importStar(require("vscode"));
class SidebarProvider {
    _extensionUri;
    _view;
    constructor(_extensionUri) {
        this._extensionUri = _extensionUri;
    }
    resolveWebviewView(webviewView) {
        this._view = webviewView;
        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [this._extensionUri],
        };
        webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);
    }
    // This function allows us to send messages from the IDE to the Chat UI
    postMessageToWebview(data) {
        if (this._view) {
            this._view.webview.postMessage(data);
        }
    }
    _getHtmlForWebview(webview) {
        return `<!DOCTYPE html>
			<html lang="en">
			<head>
				<meta charset="UTF-8">
				<title>DevGuide</title>
				<style>
					body { font-family: var(--vscode-font-family); color: var(--vscode-foreground); padding: 10px; }
					.hint-card { background: rgba(255,255,255,0.1); padding: 10px; border-radius: 4px; margin-top: 10px; border-left: 3px solid #007acc; }
					button { background: #007acc; color: white; border: none; padding: 5px; width: 100%; cursor: pointer; }
				</style>
			</head>
			<body>
				<h3>DevGuide Chat</h3>
				<div id="message-container">Waiting for code context...</div>
				<div id="hint-display" class="hint-card" style="display:none"></div>
				
				<script>
					const vscode = acquireVsCodeApi();
					window.addEventListener('message', event => {
						const message = event.data;
						if (message.type === 'error-detected') {
							document.getElementById('message-container').innerText = "I noticed a problem: " + message.value;
							document.getElementById('hint-display').style.display = "block";
							document.getElementById('hint-display').innerText = "Socratic Question: What do you think happens when this logic runs?";
						}
					});
				</script>
			</body>
			</html>`;
    }
}
exports.SidebarProvider = SidebarProvider;
//# sourceMappingURL=SidebarProvider.js.map