
import { Removable, toRemovable } from 'yggdrasil/lib/removable';

export type Extension<T> = (target: T) => (Removable | void);

export function setup<T>(target: T, extensions: Extension<T>[]): Removable {
    return toRemovable(...extensions.map(ext => ext(target)));
}

export default setup;
