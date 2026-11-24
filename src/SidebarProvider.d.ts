import * as vscode from "vscode";
export declare class SidebarProvider implements vscode.WebviewViewProvider {
    private readonly _extensionUri;
    _view?: vscode.WebviewView;
    constructor(_extensionUri: vscode.Uri);
    resolveWebviewView(webviewView: vscode.WebviewView): void;
    postMessageToWebview(data: any): void;
    private _getHtmlForWebview;
}
//# sourceMappingURL=SidebarProvider.d.ts.map