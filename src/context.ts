import * as vscode from "vscode";

let _context: vscode.ExtensionContext | undefined;

export function setExtensionContext(context: vscode.ExtensionContext) {
  _context = context;
}

export function getExtensionUri() {
  return _context?.extensionUri!;
}

export function getExtensionContext() {
  return _context!;
}

export function removeExtensionContext() {
  _context = undefined;
}
