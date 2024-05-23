import * as vscode from 'vscode';
import WebTreeSitter from 'web-tree-sitter';

import { type IPosition, type IRange } from './languages';

export function normalizeTreeSitterPosition(
  point: WebTreeSitter.Point,
): IPosition {
  return {
    line: point.row,
    character: point.column,
  };
}
export function isPositionBefore(
  left: vscode.Position | IPosition,
  right: vscode.Position | IPosition,
) {
  return (
    left.line < right.line ||
    (left.line === right.line && left.character <= right.character)
  );
}

export function serializePosition(content: vscode.Position | IPosition) {
  return 'L' + content.line + 'C' + content.character;
}

export function deserializePosition(content: string): IPosition {
  const [line, char] = content.slice(1).split('C');

  return {
    line: parseInt(line, 10),
    character: parseInt(char, 10),
  };
}

export function getMidPosition(range: vscode.Range | IRange): IPosition {
  return {
    line: Math.floor((range.start.line + range.end.line) / 2),
    character: Math.floor((range.start.character + range.end.character) / 2),
  };
}
