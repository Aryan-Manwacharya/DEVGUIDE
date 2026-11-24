import * as vscode from 'vscode';
import { SidebarProvider } from './SidebarProvider';
import { getSocraticResponse } from './socraticEngine';

let currentError: any = null;
let lastErrorKey = "";
let chatHistory: any[] = [];

export function activate(context: vscode.ExtensionContext) {
    const sidebarProvider = new SidebarProvider(context.extensionUri);
    context.subscriptions.push(vscode.window.registerWebviewViewProvider("devguide.chatView", sidebarProvider));

    sidebarProvider.onMessageReceived(async (data) => {
        if (data.command === 'chat') {
            chatHistory.push({ role: "user", content: data.text });
            
            // Show thinking state in UI
            sidebarProvider.postMessageToWebview({ type: 'bot-response', value: "Thinking..." });

            const response = await getSocraticResponse(data.text, currentError, chatHistory);
            
            chatHistory.push({ role: "assistant", content: response });
            sidebarProvider.postMessageToWebview({ type: 'bot-response', value: response });
        }
    });

    context.subscriptions.push(
        vscode.languages.onDidChangeDiagnostics((e) => {
            for (const uri of e.uris) {
                const diagnostics = vscode.languages.getDiagnostics(uri);
                const errors = diagnostics.filter(d => d.severity === vscode.DiagnosticSeverity.Error);

                if (errors.length > 0) {
                    const err = errors[0];
                    const key = `${err.message}-${err.range.start.line}`;

                    if (key !== lastErrorKey) {
                        lastErrorKey = key;
                        currentError = {
                            message: err.message,
                            line: err.range.start.line + 1,
                            code: vscode.window.activeTextEditor?.document.getText(err.range) || ""
                        };
                        sidebarProvider.postMessageToWebview({ type: 'error-detected', value: currentError });

                        setTimeout(async () => {
                            const initialMsg = await getSocraticResponse("INITIAL_TRIGGER", currentError, chatHistory);
                            chatHistory.push({ role: "assistant", content: initialMsg });
                            sidebarProvider.postMessageToWebview({ type: 'bot-response', value: initialMsg });
                        }, 500);
                    }
                }
            }
        })
    );
}

export function deactivate() {}