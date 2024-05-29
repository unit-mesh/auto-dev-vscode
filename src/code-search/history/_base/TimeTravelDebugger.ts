/**
 * TimeTravelDebugger 接口定义了一个时间旅行调试器的行为
 */
export interface TimeTravelDebugger<Snapshot> {
	/**
	 * 捕获当前状态快照
	 */
	takeSnapshot(): Snapshot;

	/**
	 * 恢复到指定状态快照
	 * @param snapshot - 要恢复的状态快照
	 */
	restoreSnapshot(snapshot: Snapshot): void;

	/**
	 * 回溯指定步数
	 * @param steps - 要回溯的步数
	 */
	rewind(steps: number): void;

	/**
	 * 快进指定步数
	 * @param steps - 要快进的步数
	 */
	fastForward(steps: number): void;

	/**
	 * 暂停代码执行
	 */
	pause(): void;

	/**
	 * 重新执行代码
	 */
	replay(): void;
}