type TDirection = 'right' | 'left';

export interface IArrowButtonOptions {
    readOnly?: boolean;
    direction?: TDirection;
}

/**
 * Интерфейс кнопки, позволяющая усправлять выбором периода
 *
 * @interface Controls/_buttons/interface/IArrowButton
 * @public
 */

export default interface IArrowButton {
    readonly '[Controls/_dateRange/IArrowButton]': boolean;
}

/**
 * @name Controls/_buttons/interface/IArrowButton#readOnly
 * @cfg {Array} Режим включает readOnly.
 *
 * @remark При значении true, событие по клику не будет происходить.
 * @example
 * <pre>
 *     <Controls.dateRange:ArrowButton readOnly="{{true}}"/>
 * </pre>
 * @demo Controls-demo/Buttons/ArrowButton/ReadOnly/Index
 */

/**
 * @name Controls/_buttons/interface/IArrowButton#direction
 * @cfg {Array} Выбор стороны, куда будет указывтаь стрелка в кнопке.
 * @example
 * <pre>
 *     <Controls.Buttons:ArrowButton direction="left"/>
 * </pre>
 * @demo Controls-demo/Buttons/ArrowButton/Direction/Index
 */
