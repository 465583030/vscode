/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
'use strict';

import URI from 'vs/base/common/uri';
import * as Types from 'vs/base/common/types';
import { IJSONSchemaMap } from 'vs/base/common/jsonSchema';
import * as Objects from 'vs/base/common/objects';

import { IExtensionDescription } from 'vs/platform/extensions/common/extensions';
import { ProblemMatcher } from 'vs/platform/markers/common/problemMatcher';
import { WorkspaceFolder } from 'vs/platform/workspace/common/workspace';

export interface ShellConfiguration {
	/**
	 * The shell executable.
	 */
	executable: string;
	/**
	 * The arguments to be passed to the shell executable.
	 */
	args?: string[];
}

export namespace ShellConfiguration {
	export function is(value: any): value is ShellConfiguration {
		let candidate: ShellConfiguration = value;
		return candidate && Types.isString(candidate.executable) && (candidate.args === void 0 || Types.isStringArray(candidate.args));
	}
}

export interface CommandOptions {

	/**
	 * The shell to use if the task is a shell command.
	 */
	shell?: ShellConfiguration;

	/**
	 * The current working directory of the executed program or shell.
	 * If omitted VSCode's current workspace root is used.
	 */
	cwd?: string;

	/**
	 * The environment of the executed program or shell. If omitted
	 * the parent process' environment is used.
	 */
	env?: { [key: string]: string; };
}

export enum RevealKind {
	/**
	 * Always brings the terminal to front if the task is executed.
	 */
	Always = 1,

	/**
	 * Only brings the terminal to front if a problem is detected executing the task
	 * (e.g. the task couldn't be started because).
	 */
	Silent = 2,

	/**
	 * The terminal never comes to front when the task is executed.
	 */
	Never = 3
}

export namespace RevealKind {
	export function fromString(value: string): RevealKind {
		switch (value.toLowerCase()) {
			case 'always':
				return RevealKind.Always;
			case 'silent':
				return RevealKind.Silent;
			case 'never':
				return RevealKind.Never;
			default:
				return RevealKind.Always;
		}
	}
}

export enum PanelKind {

	/**
	 * Shares a panel with other tasks. This is the default.
	 */
	Shared = 1,

	/**
	 * Uses a dedicated panel for this tasks. The panel is not
	 * shared with other tasks.
	 */
	Dedicated = 2,

	/**
	 * Creates a new panel whenever this task is executed.
	 */
	New = 3
}

export namespace PanelKind {
	export function fromString(value: string): PanelKind {
		switch (value.toLowerCase()) {
			case 'shared':
				return PanelKind.Shared;
			case 'dedicated':
				return PanelKind.Dedicated;
			case 'new':
				return PanelKind.New;
			default:
				return PanelKind.Shared;
		}
	}
}

export interface PresentationOptions {
	/**
	 * Controls whether the task output is reveal in the user interface.
	 * Defaults to `RevealKind.Always`.
	 */
	reveal: RevealKind;

	/**
	 * Controls whether the command associated with the task is echoed
	 * in the user interface.
	 */
	echo: boolean;

	/**
	 * Controls whether the panel showing the task output is taking focus.
	 */
	focus: boolean;

	/**
	 * Controls if the task panel is used for this task only (dedicated),
	 * shared between tasks (shared) or if a new panel is created on
	 * every task execution (new). Defaults to `TaskInstanceKind.Shared`
	 */
	panel: PanelKind;
}

export enum RuntimeType {
	Shell = 1,
	Process = 2
}

export namespace RuntimeType {
	export function fromString(value: string): RuntimeType {
		switch (value.toLowerCase()) {
			case 'shell':
				return RuntimeType.Shell;
			case 'process':
				return RuntimeType.Process;
			default:
				return RuntimeType.Process;
		}
	}
}

export interface CommandConfiguration {

	/**
	 * The task type
	 */
	runtime: RuntimeType;

	/**
	 * The command to execute
	 */
	name: string;

	/**
	 * Additional command options.
	 */
	options?: CommandOptions;

	/**
	 * Command arguments.
	 */
	args?: string[];

	/**
	 * The task selector if needed.
	 */
	taskSelector?: string;

	/**
	 * Whether to suppress the task name when merging global args
	 *
	 */
	suppressTaskName?: boolean;

	/**
	 * Describes how the task is presented in the UI.
	 */
	presentation: PresentationOptions;
}

export namespace TaskGroup {
	export const Clean: 'clean' = 'clean';

	export const Build: 'build' = 'build';

	export const Rebuild: 'rebuild' = 'rebuild';

	export const Test: 'test' = 'test';

	export function is(value: string): value is string {
		return value === Clean || value === Build || value === Rebuild || value === Test;
	}
}

export type TaskGroup = 'clean' | 'build' | 'rebuild' | 'test';


export enum TaskScope {
	Global = 1,
	Workspace = 2,
	Folder = 3
}

export namespace TaskSourceKind {
	export const Workspace: 'workspace' = 'workspace';
	export const Extension: 'extension' = 'extension';
	export const Composite: 'composite' = 'composite';
}

export interface TaskSourceConfigElement {
	workspaceFolder: WorkspaceFolder;
	file: string;
	index: number;
	element: any;
}

export interface WorkspaceTaskSource {
	readonly kind: 'workspace';
	readonly label: string;
	readonly config: TaskSourceConfigElement;
	readonly customizes?: TaskIdentifier;
}

export interface ExtensionTaskSource {
	readonly kind: 'extension';
	readonly label: string;
	readonly extension: string;
	readonly scope: TaskScope;
	readonly workspaceFolder: WorkspaceFolder | undefined;
}

export interface ExtensionTaskSourceTransfer {
	__workspaceFolder: URI;
}

export interface CompositeTaskSource {
	readonly kind: 'composite';
	readonly label: string;
}

export type TaskSource = WorkspaceTaskSource | ExtensionTaskSource | CompositeTaskSource;

export interface TaskIdentifier {
	_key: string;
	type: string;
}

export interface TaskDependency {
	workspaceFolder: WorkspaceFolder;
	task: string;
}

export interface ConfigurationProperties {

	/**
	 * The task's name
	 */
	name?: string;

	/**
	 * The task's name
	 */
	identifier?: string;

	/**
	 * the task's group;
	 */
	group?: string;

	/**
	 * Whether this task is a primary task in the task group.
	 */
	isDefaultGroupEntry?: boolean;

	/**
	 * The presentation options
	 */
	presentation?: PresentationOptions;

	/**
	 * Whether the task is a background task or not.
	 */
	isBackground?: boolean;

	/**
	 * Whether the task should prompt on close for confirmation if running.
	 */
	promptOnClose?: boolean;

	/**
	 * The other tasks this task depends on.
	 */
	dependsOn?: TaskDependency[];

	/**
	 * The problem watchers to use for this task
	 */
	problemMatchers?: (string | ProblemMatcher)[];
}

export interface CommonTask {

	/**
	 * The task's internal id
	 */
	_id: string;

	/**
	 * The cached label.
	 */
	_label: string;

	type: string;
}

export interface CustomTask extends CommonTask, ConfigurationProperties {

	type: 'custom';

	/**
	 * Indicated the source of the task (e.g tasks.json or extension)
	 */
	_source: WorkspaceTaskSource;

	name: string;

	identifier: string;

	/**
	 * The command configuration
	 */
	command: CommandConfiguration;
}

export namespace CustomTask {
	export function is(value: any): value is CustomTask {
		let candidate: CustomTask = value;
		return candidate && candidate.type === 'custom';
	}
}

export interface ConfiguringTask extends CommonTask, ConfigurationProperties {

	/**
	 * Indicated the source of the task (e.g tasks.json or extension)
	 */
	_source: WorkspaceTaskSource;

	configures: TaskIdentifier;
}

export namespace ConfiguringTask {
	export function is(value: any): value is ConfiguringTask {
		let candidate: ConfiguringTask = value;
		return candidate && candidate.configures && Types.isString(candidate.configures.type) && value.command === void 0;
	}
}

export interface ContributedTask extends CommonTask, ConfigurationProperties {

	/**
	 * Indicated the source of the task (e.g tasks.json or extension)
	 */
	_source: ExtensionTaskSource;

	defines: TaskIdentifier;

	hasDefinedMatchers: boolean;

	/**
	 * The command configuration
	 */
	command: CommandConfiguration;
}

export namespace ContributedTask {
	export function is(value: any): value is ContributedTask {
		let candidate: ContributedTask = value;
		return candidate && candidate.defines && Types.isString(candidate.defines.type) && candidate.command !== void 0;
	}
}

export interface CompositeTask extends CommonTask, ConfigurationProperties {
	/**
	 * Indicated the source of the task (e.g tasks.json or extension)
	 */
	_source: CompositeTaskSource;

	type: 'composite';

	identifier: string;
}

export namespace CompositeTask {
	export function is(value: any): value is CompositeTask {
		let candidate = value as CompositeTask;
		return candidate && candidate._source && candidate._source.kind === TaskSourceKind.Composite;
	}
}

export type Task = CustomTask | ContributedTask | CompositeTask;

export namespace Task {
	export function getKey(task: Task): string {
		if (CustomTask.is(task) || CompositeTask.is(task)) {
			return task.identifier;
		} else {
			return task.defines._key;
		}
	}

	export function getWorkspaceFolder(task: Task): WorkspaceFolder | undefined {
		if (CustomTask.is(task)) {
			return task._source.config.workspaceFolder;
		} else if (ContributedTask.is(task)) {
			return task._source.workspaceFolder;
		} else {
			return undefined;
		}
	}

	export function clone(task: Task): Task {
		return Objects.assign({}, task);
	}

	export function getTelemetryKind(task: Task): string {
		if (ContributedTask.is(task)) {
			return 'extension';
		} else if (CustomTask.is(task)) {
			if (task._source.customizes) {
				return 'workspace>extension';
			} else {
				return 'workspace';
			}
		} else if (CompositeTask.is(task)) {
			return 'composite';
		} else {
			return 'unknown';
		}
	}

	export function matches(task: Task, alias: string): boolean {
		return alias === task._label || alias === task.identifier;
	}
}


export enum ExecutionEngine {
	Process = 1,
	Terminal = 2
}

export namespace ExecutionEngine {
	export const _default: ExecutionEngine = ExecutionEngine.Terminal;
}

export enum JsonSchemaVersion {
	V0_1_0 = 1,
	V2_0_0 = 2
}

export interface TaskSet {
	tasks: Task[];
	extension?: IExtensionDescription;
}

export interface TaskDefinition {
	taskType: string;
	required: string[];
	properties: IJSONSchemaMap;
}

export class TaskSorter {

	private _order: Map<string, number> = new Map();

	constructor(workspaceFolders: WorkspaceFolder[]) {
		for (let i = 0; i < workspaceFolders.length; i++) {
			this._order.set(workspaceFolders[i].uri.toString(), i);
		}
	}

	public compare(a: Task, b: Task): number {
		let aw = Task.getWorkspaceFolder(a);
		let bw = Task.getWorkspaceFolder(b);
		if (aw && bw) {
			let ai = this._order.get(aw.uri.toString());
			ai = ai === void 0 ? 0 : ai + 1;
			let bi = this._order.get(bw.uri.toString());
			bi = bi === void 0 ? 0 : bi + 1;
			if (ai === bi) {
				return a._label.localeCompare(b._label);
			} else {
				return ai - bi;
			}
		} else if (!aw && bw) {
			return -1;
		} else if (aw && !bw) {
			return +1;
		} else {
			return 0;
		}
	}
}