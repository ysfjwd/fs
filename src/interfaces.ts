/////////////////////////////////////////////////////////
//
//  Enums
//
export enum ENodeType {
	FILE = <any>'file',
	DIR = <any>'dir',
	SYMLINK = <any>'symlink',
	OTHER = <any>'other',
	BLOCK = <any>'block'
}

export let EError: any = {
	NONE: 'None',
	EXISTS: 'EEXIST',
	PERMISSION: 'EACCES',
	NOEXISTS: 'ENOENT',
	CROSS_DEVICE : 'EXDEV'
};

/////////////////////////////////////////////////////////
//
//  Data structures
//
export interface INode {
	name: string;
	type: ENodeType | string;
	size?: number;
	accessTime?: Date;
	modifyTime?: Date;
	changeTime?: Date;
	absolutePath?: string;
	mode?: number;
	pointsAt?: string;
	relativePath?: string;
	children?: INode[];
	total?: number;
	checksum?: string;
}

export interface IInspectOptions {
	checksum?: string;
	mode?: boolean;
	times?: boolean;
	absolutePath?: boolean;
	symlinks?: boolean;
	size?: boolean;
}

export type ReadWriteDataType = string | Buffer | Object;

export class ErrnoException extends Error {
	errno?: number;
	code?: string;
	path?: string;
	syscall?: string;
	stack?: string;
}
/////////////////////////////////////////////////////////
//
//  File operations : copy
//
export type ItemProgressCallback = (path: string, current: number, total: number, item?: INode) => boolean;

export type ResolveConflictCallback = (path: string, item: INode, err: string) => Promise<IConflictSettings>;

export type WriteProgressCallback = (path: string, current: number, total: number) => void;

export enum EResolveMode {
	SKIP = 0,
	OVERWRITE,
	IF_NEWER,
	IF_SIZE_DIFFERS,
	APPEND,
	THROW,
	ABORT
}

/**
 * Additional flags for copy
 *
 * @export
 * @enum {number}
 */
export enum ECopyFlags {
	/**
	 * Transfer atime and mtime of source to target
	 */
	PRESERVE_TIMES = 2,
	/**
	 * Empty the target folder
	 */
	EMPTY = 4,
	/**
	 * When copying, don't copy symlinks but resolve them instead.
	 */
	FOLLOW_SYMLINKS = 8
}

/**
 * Copy options
 *
 * @export
 * @interface ICopyOptions
 */
export interface ICopyOptions {
	/**
	 * @type {boolean}
	 * @deprecated Use conflict callback instead.
	 * @memberOf ICopyOptions
	 */
	overwrite?: boolean;
	/**
	 * Array of glob minimatch patterns
	 *
	 * @type {string[]}
	 * @memberOf ICopyOptions
	 */
	matching?: string[];
	/**
	 * A function called to reject or accept nodes to be copied. This is used only when matching
	 * has been left empty.
	 * @memberOf ICopyOptions
	 */
	allowedToCopy?: (from: string) => boolean;
	/**
	 * A progress callback for any copied item. Only excecuted in async.
	 */
	progress?: ItemProgressCallback;
	/**
	 * A progress function called for async and larger files only.
	 *
	 * @type {WriteProgressCallback}
	 * @memberOf ICopyOptions
	 */
	writeProgress?: WriteProgressCallback;
	/**
	 * A callback when a conflict or error occurs. This is being called only if the user
	 * didn't provide conflictSettings.
	 *
	 * @type {ResolveConflictCallback}
	 * @memberOf ICopyOptions
	 */
	conflictCallback?: ResolveConflictCallback;
	/**
	 * Ability to set conflict resolver settings in advance, so that no callback will be called.
	 *
	 * @type {IConflictSettings}
	 * @memberOf ICopyOptions
	 */
	conflictSettings?: IConflictSettings;

	/**
	 * Throttel copy for larger files. This will be only used when writeProgress is set and the file is at least 5MB.
	 *
	 * @type {number}
	 * @memberOf ICopyOptions
	 */
	throttel?: number;

	/**
	 * Print console messages.
	 *
	 * @type {boolean}
	 * @memberOf ICopyOptions
	 */
	debug?: boolean;

	/**
	 * The copy flags
	 *
	 * @type {ECopyFlags}
	 * @memberOf ICopyOptions
	 */
	flags?: ECopyFlags;
}
export enum EResolve {
	ALWAYS,
	THIS
}
// conflict settings
export interface IConflictSettings {
	overwrite: EResolveMode;
	mode: EResolve;
}
/////////////////////////////////////////////////////////
//
//  File operations : write
//
export interface IWriteOptions {
	atomic?: boolean;
	jsonIndent?: number;
	mode?: string;
}
