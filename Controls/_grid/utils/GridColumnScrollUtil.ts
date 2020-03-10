interface IShouldAddActionsCellArgs {
    shouldUseTableLayout: boolean;
    hasColumnScroll: boolean;
}

export function shouldAddActionsCell(opts: IShouldAddActionsCellArgs): boolean {
    return opts.hasColumnScroll && !opts.shouldUseTableLayout;
}
