export interface ITemplateDelegate<T = any> {
    (context: T, options?: IRuntimeOptions): string;
}

export interface IHandlebars {
    create(): IHandlebars;
    compile<T = any>(input: any, options?: ICompileOptions): ITemplateDelegate<T>;
}

export interface IRuntimeOptions {
    partial?: boolean;
    depths?: any[];
    helpers?: { [name: string]: Function };
    partials?: { [name: string]: ITemplateDelegate };
    decorators?: { [name: string]: Function };
    data?: any;
    blockParams?: any[];
}

export interface ICompileOptions {
    data?: boolean;
    compat?: boolean;
    knownHelpers?: {
        helperMissing?: boolean;
        blockHelperMissing?: boolean;
        each?: boolean;
        if?: boolean;
        unless?: boolean;
        with?: boolean;
        log?: boolean;
        lookup?: boolean;
    };
    knownHelpersOnly?: boolean;
    noEscape?: boolean;
    strict?: boolean;
    assumeObjects?: boolean;
    preventIndent?: boolean;
    ignoreStandalone?: boolean;
    explicitPartialContext?: boolean;
}
