
export interface IScrollbarsOptions {
    scrollbarVisible: boolean;
}

export function getDefaultOptions(): IScrollbarsOptions {
    return {
        scrollbarVisible: true
    };
}

/**
 * Интерфейс для контролов со скролбарами.
 *
 * @interface Controls/_scroll/Container/Interface/IScrollbars
 * @public
 * @author Миронов А.Ю.
 */

export interface IScrollbars {
    readonly '[Controls/_scroll/Container/Interface/IScrollbars]': boolean;
}

/**
 * @name Controls/_scroll/Container/Interface/IScrollbars#scrollbarVisible
 * @cfg {Boolean} Следует ли отображать скролл.
 * @demo Controls-demo/Scroll/ScrollbarVisible/Index
 */

/*
 * @name Controls/_scroll/Container/Interface/IScrollbars#scrollbarVisible
 * @cfg {Boolean} Whether scrollbar should be shown.
 */
