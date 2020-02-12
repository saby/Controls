import {IControlOptions} from 'UI/Base';

export interface ILoadingIndicatorOptions extends IControlOptions {
    delay?: number;
    message?: string;
    mods?: Array<string> | string;
    overlay?: string;
    scroll?: string;
    small?: string;
    id?: string;
}

/**
 * Интерфейс индикатора загрузки.
 *
 * @interface Controls/_interface/ILoadingIndicator
 * @public
 */

/*
 * Interface of Loading Indicator.
 *
 * @interface Controls/_interface/ILoadingIndicator
 * @public
 */
export default interface ILoadingIndicator {
    readonly '[Controls/_interface/ILoadingIndicator]': boolean;
}

/*
 * @name Controls/_interface/ILoadingIndicator#isGlobal
 * @cfg {Boolean} Показать индикатор над всей страницей или только над собственным контентом.
 * @remark
 * true — индикатор позиционируется через position: fixed;
 * false — индикатор позиционируется через position: absolute.
 * @default true
 */

/*
 * @name Controls/_interface/ILoadingIndicator#isGlobal
 * @cfg {Boolean} show indicator covering whole page (global) or covering just own content
 * @remark
 * * true — It means position: fixed of indicator's container
 * * false — It means position: absolute of indicator's container
 * @default true
 */

/**
 * @name Controls/_interface/ILoadingIndicator#message
 * @cfg {String} Текст сообщения индикатора.
 * @default '' (пустая строка)
 * @demo Controls-demo/LoadingIndicator/Message/Index
 */

/*
 * @name Controls/_interface/ILoadingIndicator#message
 * @cfg {String} message of indicator
 * @default '' (empty string)
 * @demo Controls-demo/LoadingIndicator/Message/Index
 */

/**
 * @typedef {String} Scroll
 * @description Значения, которыми настраивается градиент для прокручивания объекта привязки.
 * @variant '' Без градиента.
 * @variant left Градиент слева направо (увелечение цветового наполнения).
 * @variant right Градиент справа налево.
 * @variant top Градиент сверху вниз.
 * @variant bottom Градиент снизу вверх.
 */

/*
 * @typedef {String} Scroll
 * @variant '' (empty string) no gradient
 * @variant left gradient from left to right (increase of fullness)
 * @variant right gradient from right to left
 * @variant top gradient from top to bottom
 * @variant bottom gradient from bottom to top
 */

/**
 * @name Controls/_interface/ILoadingIndicator#scroll
 * @cfg {Scroll} Добавляет градиент к фону индикатора для прокручивания объекта привязки.
 * @default '' (пустая строка)
 * @demo Controls-demo/LoadingIndicator/Scroll/Index
 */

/*
 * @name Controls/_interface/ILoadingIndicator#scroll
 * @cfg {Scroll} add gradient of indicator's background
 * @default '' (empty string)
 * @demo Controls-demo/LoadingIndicator/Scroll/Index
 */

/**
 * @typedef {String} Small
 * @description Значения, которыми настраивается размер индикатора.
 * @variant '' Стандартный размер индикатора
 * @variant small Делает индикатор меньше.
 */

/*
 * @typedef {String} Small
 * @variant '' (empty string) standard size of indicator
 * @variant 'small' make indicator smaller
 */

/**
 * @name Controls/_interface/ILoadingIndicator#small
 * @cfg {Small} Размер параметров индикатора (полей, фона, границы, ширины, высоты).
 * @default '' (пустая строка)
 * @demo Controls-demo/LoadingIndicator/Small/Index
 */

/*
 * @name Controls/_interface/ILoadingIndicator#small
 * @cfg {Small} size of some styles of indicator (tuning of margin, background, border, width, height styles)
 * @default '' (empty string)
 * @demo Controls-demo/LoadingIndicator/Small/Index
 */

/**
 * @typedef {Srting} Overlay
 * @description Значения, которыми настраивается оверлей индикатора.
 * @variant default Невидимый фон, индикатор блокирует клики.
 * @variant dark Темный фон, индикатор блокирует клики.
 * @variant none Невидимый фон, индикатор не блокирует клики.
 */

/**
 * @name Controls/_interface/ILoadingIndicator#overlay
 * @cfg {Overlay} Настройка оверлея индикатора.
 * @default default
 * @demo Controls-demo/LoadingIndicator/Overlay/Index
 */

/*
 * @name Controls/_interface/ILoadingIndicator#overlay
 * @cfg {Overlay} setting of indicator's overlay
 * @default default
 * @demo Controls-demo/LoadingIndicator/Overlay/Index
 */

/**
 * @name Controls/_interface/ILoadingIndicator#mods
 * @cfg {Array.<String>|String} Параметр может использоваться для пользовательской настройки индикатора.
 * @remark
 * Параметр mods содержит слова, которые будут добавлены в качестве стиля "controls-loading-indicator_mod-[mod]" в контейнер индикатора.
 * * [] — без использования параметра mods
 * * ['gray'] — серый цвет градиента. Используется с настройками скролла.
 * @default []
 */

/*
 * @name Controls/_interface/ILoadingIndicator#mods
 * @cfg {Array.<String>|String} It can be using for custom tuning of indicator.
 * mods contains words what will be adding as "controls-loading-indicator_mod-[mod]" style in indicator's container
 * * [] — no mods
 * * ['gray'] — gray color of gradient. it's using with scroll property
 * @default []
 */

/**
 * @name Controls/_interface/ILoadingIndicator#delay
 * @cfg {Number} Задержка перед началом показа индикатора.
 * @remark
 * Значение задаётся в миллисекундах.
 * @default 2000
 * @demo Controls-demo/LoadingIndicator/Delay/Index
 */

/*
 * @name Controls/_interface/ILoadingIndicator#delay
 * @cfg {Number} timeout before indicator will be visible
 * @default 2000
 * @demo Controls-demo/LoadingIndicator/Delay/Index
 */
