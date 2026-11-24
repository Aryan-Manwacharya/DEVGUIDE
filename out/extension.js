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
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = __importStar(require("vscode"));
const SidebarProvider_1 = require("./SidebarProvider");
const socraticEngine_1 = require("./socraticEngine");
let currentError = null;
let lastErrorKey = "";
let chatHistory = [];
function activate(context) {
    const sidebarProvider = new SidebarProvider_1.SidebarProvider(context.extensionUri);
    context.subscriptions.push(vscode.window.registerWebviewViewProvider("devguide.chatView", sidebarProvider));
    sidebarProvider.onMessageReceived(async (data) => {
        if (data.command === 'chat') {
            chatHistory.push({ role: "user", content: data.text });
            // Show thinking state in UI
            sidebarProvider.postMessageToWebview({ type: 'bot-response', value: "Thinking..." });
            const response = await (0, socraticEngine_1.getSocraticResponse)(data.text, currentError, chatHistory);
            chatHistory.push({ role: "assistant", content: response });
            sidebarProvider.postMessageToWebview({ type: 'bot-response', value: response });
        }
    });
    context.subscriptions.push(vscode.languages.onDidChangeDiagnostics((e) => {
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
                        const initialMsg = await (0, socraticEngine_1.getSocraticResponse)("INITIAL_TRIGGER", currentError, chatHistory);
                        chatHistory.push({ role: "assistant", content: initialMsg });
                        sidebarProvider.postMessageToWebview({ type: 'bot-response', value: initialMsg });
                    }, 500);
                }
            }
        }
    }));
}
function deactivate() { }
