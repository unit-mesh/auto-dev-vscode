/**
 * The PROVIDER_TYPES object is a collection of string constants that represent different types of providers
 * in the system. Each property in the object corresponds to a specific provider type.
 */
const PROVIDER_TYPES = {
	/**
	 * {@link ToolchainContextProvider#collect} is a provider to collect context for test generation
	 */
	ToolchainContextProvider: "ToolchainContextProvider",
	/**
	 * {@link RelevantCodeProvider#getMethodFanInAndFanOut} is a provider to look up relevant code
	 */
	RelevantCodeProvider: "RelevantCodeProvider",
	/**
	 * {@link BuildToolProvider#getDependencies} is a provider to collect context for test generation
	 */
	BuildToolProvider: "BuildToolProvider",
	/**
	 * {@link TestGenProvider#setupTestFile} is a provider to generate test code
	 */
	TestGenProvider: "TestGenProvider",
	/**
	 * Code structure analysis, parse source code to structure data
	 * see in {@link StructurerProvider#parseFile}
	 * structure data for {@link CodeElement} which can be {@link CodeFile}, {@link CodeFunction}, {@link CodeVariable}
	 */
	StructurerProvider: "StructurerProvider",
	/**
	 * {@link ActionCreator#buildActions} is a provider to create VSCode action by Syntax node
	 */
	ActionCreator: "ActionCreator",

	/**
	 * {@link LanguageProfile} is a provider to get language specific information
	 */
	LanguageProfile: "LanguageProfile",
};

export { PROVIDER_TYPES };
