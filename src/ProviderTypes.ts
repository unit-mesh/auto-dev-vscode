const PROVIDER_TYPES = {
	ToolchainContextProvider: "ToolchainContextProvider",
	RelevantCodeProvider: "RelevantCodeProvider",
	BuildToolProvider: "BuildToolProvider",
	TestGenProvider: "TestGenProvider",
	/**
	 * Code structure analysis, parse source code to structure data
	 * see in {@link StructurerProvider#parseFile}
	 * structure data for {@link CodeElement} which can be {@link CodeFile}, {@link CodeFunction}, {@link CodeVariable}
 	 */
	StructurerProvider: "StructurerProvider",
	/**
	 * {@link ActionCreator#build} is a provider to create VSCode action by Syntax node
	 */
	ActionCreator: "ActionCreator"
};

export { PROVIDER_TYPES };
