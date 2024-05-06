const PROVIDER_TYPES = {
	ToolchainContextProvider: "ToolchainContextProvider",
	RelevantCodeProvider: "RelevantCodeProvider",
	BuildToolProvider: "BuildToolProvider",
	TestGenProvider: "TestGenProvider",
	/**
	 * Code structure analysis, for, see in [StructurerProvider](StructurerProvider.ts)
 	 */
	StructurerProvider: "StructurerProvider",
	/// Create VSCode action by Syntax node
	ActionCreator: "ActionCreator"
};

export { PROVIDER_TYPES };
