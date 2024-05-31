declare module 'spellchecker' {
    export function isMisspelled(word:string): boolean;
    export function getCorrectionsForMisspelling(word:string): string[];
    export function add(word:string);
}