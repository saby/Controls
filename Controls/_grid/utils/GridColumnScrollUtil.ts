interface IShouldAddActionsCellArgs {
    // legacy для работы со старыми браузерами
    isFullGridSupport: boolean;

    // Дополнительная колонка нужна только если есть скролл
    hasColumnScroll: boolean;

    // Не нужно ничего добавлять, когда колонок нет.
    // Всегда, когда нет колонок мы ничего больше не добавляем.
    // PS. Эта опция не учитывает, что в таблицу был передан header.
    hasColumns: boolean;
}

export function shouldAddActionsCell(opts: IShouldAddActionsCellArgs): boolean {
    return opts.hasColumns && opts.hasColumnScroll && opts.isFullGridSupport;
}
