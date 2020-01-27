interface IShouldAddActionsCellArgs {
    shouldUseTableLayout: boolean;
    hasColumnScroll: boolean;
    disableCellStyles: boolean;
}

export function shouldAddActionsCell(opts: IShouldAddActionsCellArgs): boolean {
    return opts.hasColumnScroll && opts.disableCellStyles && !opts.shouldUseTableLayout;
}
