declare namespace Remarkable {
    interface StateInline {
        src: string;
        pending: string;
        pendingLevel: number;
        parser: any;
        env: {[name:string]:any};
        tokens: any[];
        pos: number;
        posMax: number;
        level: number;

        push(token:any);
        cacheSet(key:number, value:any);
        cacheGet(key:number, value:any);
    }

    interface Options {
        html?: boolean;
        xhtmlOut?: boolean;
        breaks?: boolean;
        langPrefix?: string;
        linkify?: boolean;
        typographer?: boolean;
        quotes?: string;
        highlight?: (str:string, lang:string) => string;
    }

    type RuleInline = (state:StateInline, silent:boolean) => boolean;

    interface RulerInline {
        enable(rules: Array<string>);
        disable(rules: Array<string>);
        before(beforeName:string, ruleName:string, fn: RuleInline, options?: any);
        after(afterName:string, ruleName:string, fn: RuleInline, options?: any);
        push(ruleName:string, fn: RuleInline, options?: any);
        at(ruleName:string, fn: RuleInline, options?: any);
    }

    interface ParserInline {
        ruler: RulerInline;
    }

    type RenderFn = (tokens: any[], idx: number, options: any, env: any) => string;

    interface Renderer {
        rules: RenderFn[];
    }

    interface utils {
        assign(obj:any);
        isString(obj:any);
        has(obj:any, key:any);
        unescapeMd(str:string);
        isValidEntityCode(c:string);
        fromCodePoint(c:string);
        replaceEntities(str:string);
        escapeHtml(str:string);
    }

    interface Remarkable {
        new(preset: string, opts?: Options): Remarkable;
        new(opts: Options): Remarkable;
        new(): Remarkable;

        set(opts: Options);
        use(plugin: (md:any) => void, opts?: any);
        render(markdown: string, env?: any): string;
        parse(markdown: string, env?: any);

        block: any;
        inline: ParserInline;
        renderer: Renderer;
        utils: utils;
    }
}

declare var Remarkable: Remarkable.Remarkable;

declare module "remarkable" {
    export = Remarkable;
}