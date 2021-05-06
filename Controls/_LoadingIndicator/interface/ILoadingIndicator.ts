import {IControlOptions} from 'UI/Base';

export interface ILoadingIndicatorOptions extends IControlOptions {
    delay?: number;
    message?: string;
    mods?: Array<string> | string;
    overlay?: string;
    scroll?: string;
    small?: string;
    isGlobal?: boolean;
    id?: string;
    visible?: boolean;
}

/**
 * Интерфейс индикатора загрузки.
 * @author Красильников А.С.
 * @interface Controls/LoadingIndicator/interface/ILoadingIndicator
 * @public
 */

export default interface ILoadingIndicator {
    readonly '[Controls/_LoadingIndicator/interface/ILoadingIndicator]': boolean;
    show(config: ILoadingIndicatorOptions, waitPromise: Promise<any>): string;
    hide(id?: string): void;
}

/**
 * @name Controls/LoadingIndicator/interface/ILoadingIndicator#isGlobal
 * @cfg {Boolean} Определяет, показать индикатор над всей страницей или только над собственным контентом.
 * @remark
 * true — индикатор позиционируется через position: fixed;
 * false — индикатор позиционируется через position: absolute.
 * @default true
 */

/**
 * @name Controls/LoadingIndicator/interface/ILoadingIndicator#message
 * @cfg {String} Текст сообщения индикатора.
 * @default '' (пустая строка)
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

/**
 * @name Controls/LoadingIndicator/interface/ILoadingIndicator#scroll
 * @cfg {Scroll} Добавляет градиент к фону индикатора для прокручивания объекта привязки.
 * @default '' (пустая строка)
 * @demo Controls-demo/LoadingIndicator/Scroll/Index
 */

/**
 * @typedef {String} Controls/LoadingIndicator/interface/ILoadingIndicator/Small
 * @description Значения, которыми настраивается размер индикатора.
 * @variant '' Стандартный размер индикатора
 * @variant small Делает индикатор меньше.
 */

/**
 * @name Controls/LoadingIndicator/interface/ILoadingIndicator#small
 * @cfg {Controls/LoadingIndicator/interface/ILoadingIndicator/Small.typedef} Размер параметров индикатора (полей, фона, границы, ширины, высоты).
 * @default '' (пустая строка)
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
 * @name Controls/LoadingIndicator/interface/ILoadingIndicator#overlay
 * @cfg {Overlay} Настройка оверлея индикатора.
 * @default default
 * @demo Controls-demo/LoadingIndicator/Overlay/Index
 */

/**
 * @name Controls/LoadingIndicator/interface/ILoadingIndicator#delay
 * @cfg {Number} Задержка перед началом показа индикатора.
 * @remark
 * Значение задаётся в миллисекундах.
 * @default 2000
 * @demo Controls-demo/LoadingIndicator/Delay/Index
 */

/**
 * @name Controls/LoadingIndicator/interface/ILoadingIndicator#visible
 * @cfg {Boolean} Определяет видимость индикатора загрузки.
 * @default false
 * @demo Controls-demo/LoadingIndicator/Visible/Index
 */
