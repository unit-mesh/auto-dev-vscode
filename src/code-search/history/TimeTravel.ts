import { GitCommit } from '../../git/model/GitCommit';
import { HistoryAgent } from './_base/HistoryAgent';
import { TimeTravelDebugger } from './_base/TimeTravelDebugger';

/**
 * The TimeTravel class is a debugging tool that allows developers to navigate through the history of their codebase.
 * It uses the Record And Replay (RPA) pattern to record changes made to the codebase and replay them.
 *
 */
export class TimeTravel extends HistoryAgent implements TimeTravelDebugger<GitCommit> {
	name: string = 'TimeTravel';
	description: string = 'Time travel will through the history of your codebase';

	private commitHistory: GitCommit[];
	private currentIndex: number;

	constructor(commitHistory: GitCommit[]) {
		super();
		this.commitHistory = commitHistory;
		this.currentIndex = commitHistory.length - 1;
	}

	takeSnapshot(): GitCommit {
		return this.commitHistory[this.currentIndex];
	}

	restoreSnapshot(snapshot: GitCommit): void {}

	rewind(steps: number): void {
		const newIndex = this.currentIndex - steps;
		if (newIndex >= 0) {
			this.currentIndex = newIndex;
			console.log(`Rewind ${steps} steps.`);
			console.log('Current commit:', this.commitHistory[this.currentIndex]);
		} else {
			console.log('Cannot rewind further.');
		}
	}

	fastForward(steps: number): void {
		const newIndex = this.currentIndex + steps;
		if (newIndex < this.commitHistory.length) {
			this.currentIndex = newIndex;
			console.log(`Fast forward ${steps} steps.`);
			console.log('Current commit:', this.commitHistory[this.currentIndex]);
		} else {
			console.log('Already at the latest commit.');
		}
	}

	pause(): void {
		console.log('Code execution paused.');
	}

	replay(): void {
		console.log('Code execution replayed.');
	}
}
