import * as vscode from "vscode";

let _context: vscode.ExtensionContext | undefined;

/**
 * 设置扩展上下文
 *
 * @param context 扩展上下文对象
 */
export function setExtensionContext(context: vscode.ExtensionContext) {
  _context = context;
}

/**
 * 获取扩展程序的URI。
 *
 * @returns 返回扩展程序的URI。
 */
export function getExtensionUri() {
  return _context?.extensionUri!;
}


/**
 * 获取扩展上下文对象
 *
 * @returns 扩展上下文对象
 */
export function getExtensionContext() {
  return _context!;
}

/**
 * 移除扩展上下文
 *
 * 将扩展上下文 `_context` 设置为 `undefined`，以清除扩展上下文信息。
 */
export function removeExtensionContext() {
  _context = undefined;
}
