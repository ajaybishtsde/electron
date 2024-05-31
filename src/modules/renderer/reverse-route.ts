import pathToRegex, { PathFunction } from 'path-to-regexp';

const COMPILATION_CACHE: { [path: string]: PathFunction } = {};

export default function reverseRoute(path: string, params: { [name: string]: string }): string {
    return COMPILATION_CACHE[path] ? COMPILATION_CACHE[path](params) : (COMPILATION_CACHE[path] = pathToRegex.compile(path))(params);
}
