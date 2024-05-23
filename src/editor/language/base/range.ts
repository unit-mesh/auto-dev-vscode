import * as vscode from 'vscode';
import WebTreeSitter from 'web-tree-sitter';

import { type IPosition, type IRange } from './languages';
import {
  deserializePosition,
  isPositionBefore,
  normalizeTreeSitterPosition,
  serializePosition,
} from './position';

export function normalizeTreeSitterRange(
  left: WebTreeSitter.Point,
  right: WebTreeSitter.Point,
): IRange {
  return {
    start: normalizeTreeSitterPosition(left),
    end: normalizeTreeSitterPosition(right),
  };
}

export function isRangeEqual(
  left: vscode.Range | IRange,
  right: vscode.Range | IRange,
) {
  return (
    left.start.line === right.start.line &&
    left.end.line === right.end.line &&
    left.start.character === right.start.character &&
    left.end.character === right.end.character
  );
}

export function isInRange(
  left: vscode.Position | IPosition,
  right: vscode.Range | IRange,
) {
  return (
    isPositionBefore(right.start, left) && isPositionBefore(left, right.end)
  );
}

export function isWithinRange(
  left: vscode.Range | IRange,
  right: vscode.Range | IRange,
) {
  return (
    isPositionBefore(left.start, right.start) &&
    isPositionBefore(right.end, left.end)
  );
}

export function serializeRange(range: vscode.Range | IRange) {
  return serializePosition(range.start) + '-' + serializePosition(range.end);
}

export function deserializeRange(value: string): IRange {
  const [start, end] = value.split('-');

  return {
    start: deserializePosition(start),
    end: deserializePosition(end),
  };
}
