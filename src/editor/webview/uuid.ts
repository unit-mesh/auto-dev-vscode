import crypto from "node:crypto";

export function uuid(): string {
	return crypto.randomUUID();
}