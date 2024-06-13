export interface EdgeKind {}

export class ScopeToScope implements EdgeKind {}

export class DefToScope implements EdgeKind {}

export class ImportToScope implements EdgeKind {}

export class RefToDef implements EdgeKind {}

export class RefToImport implements EdgeKind {}
