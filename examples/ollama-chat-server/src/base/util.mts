/* eslint-disable eqeqeq */

import { randomUUID } from "node:crypto";

/* eslint-disable curly */
export function getEnv(name: string): string | undefined;
export function getEnv(name: string, defaultValue: string): string;
export function getEnv(
  name: string,
  defaultValue?: string
): string | undefined {
  const value = process.env[name];
  return value ?? defaultValue;
}

export function safeInteger(value: unknown, defaultValue: number): number {
  if (typeof value === "string") {
    value = parseInt(value, 10);
  }

  if (typeof value === "number") {
    return Number.isSafeInteger(value) ? value : defaultValue;
  }

  return defaultValue;
}

export function stringToArray(
  value: string | undefined,
  separator: string | RegExp = /[ ,;\n]/
): string[] {
  // eslint-disable-next-line eqeqeq
  if (value == null) {
    return [];
  }

  return value
    .split(separator)
    .map((s) => s.trim())
    .filter(Boolean);
}

export function defaultsArray<T>(source: T[], defaultsArray: T[]): T[] {
  return source.length ? source : defaultsArray;
}

export function flushObject(o: Record<string, unknown>) {
  const obj: Record<string, unknown> = {};

  Object.keys(o).forEach((key) => {
    const value = o[key];
    if (value == null) return;

    obj[key] = value;
  });

  return obj;
}

export function randomId(): string {
  return randomUUID().replace(/-/g, "");
}
