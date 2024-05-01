import { TaskFlow } from "../BuiltinFlow";
import { UserProjectComponent } from "./UserProjectComponent";


/**
 * FrontendFlow is an interface that represents the flow of tasks in a frontend application.
 * It provides methods for retrieving routes, components, design settings components, remote calls, and state management.
 *
 * Based on our workflow design rules: [Workflow](http://ide.unitmesh.cc/workflow)
 *
 * 1. Functional bootstrap
 * 2. Request Transform / Data validation, IO Handing.
 * 3. Process IPC/RPC Calling
 * 4. Output Transform / Render
 */
export interface AutoPage extends TaskFlow<string> {
	userTask: string;

	/**
	 * Retrieves all routes in the project, including the routes in the submodules.
	 *
	 * @return A map of routes, where the key represents the route name and the value represents the route URL.
	 */
	getRoutes(): Map<string, string>;

	/**
	 * Get all pages in the project, based on the naming convention, like the PascalCase under `src/pages`
	 * @return list of pages
	 */
	getPages(): UserProjectComponent[];

	/**
	 * Get all components in the project, based on the naming convention, like the PascalCase under `src/components`
	 * @return list of components
	 */
	getComponents(): UserProjectComponent[];

	/**
	 * Get the design settings components, like the Ant Design in React.
	 * Which will load the design settings components from the remote
	 * @return list of design settings components
	 */
	getDesignSystemComponents(): UserProjectComponent[];

	/**
	 * Get remote call as a sample, like the axios in Vue, the fetch in React
	 * @return list of services
	 */
	sampleRemoteCall(): string;

	/**
	 * Get the state management as a sample, like the Vuex in Vue, the Redux in React, maybe Empty
	 * @return list of state management
	 */
	sampleStateManagement(): string | null;
}

