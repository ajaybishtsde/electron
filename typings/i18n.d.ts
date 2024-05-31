declare function i18n(literals: TemplateStringsArray, ...values: Array<any>) : string;

/**
 * Transforms i18n tagged template literals.
 * 
 * @param group the name of the translation group.
 * @param config the name of the configuration group. This option is recommended for libaries. To avoid configuration override, set a group that is unique to your library.
 * @param literals Template literals.
 * @param values Template values.
 * 
 * @example <caption>with custom translation group:</caption> 
 * 
 *     i18n('components/Clock.js')`Time`;
 * 
 * @example <caption>with file module group and configuration group:</caption> 
 * 
 *     i18n(__translationGroup, 'my-lib')`Welcome`;
 */
declare function i18n(group: string, config?: string) : (literals : TemplateStringsArray, ...values : Array<any>) => string;