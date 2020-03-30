
type TDirection = 'right' | 'left';

export interface IArrowButtonOptions {
    readOnly?: boolean;
    direction?: TDirection;
}

/**
 * Интерфейс кнопки, позволяющая усправлять выбором периода
 *
 * @interface Controls/_dateRange/IArrowButton
 * @public
 */

export default interface IArrowButton {
    readonly '[Controls/_dateRange/IArrowButton]': boolean;
}

/**
 * @name Controls/_dateRange/IArrowButton#readOnly
 * @cfg {Array} Режим включает readOnly.
 *
 * @remark При значении true, событие по клику не будет происходить.
 * @example
 * <pre>
 *     <Controls.dateRange:ArrowButton readOnly="{{true}}"/>
 * </pre>
 * @demo Controls-demo/dateRange/ArrowButton/ReadOnly/Index
 */

/**
 * @name Controls/_dateRange/IArrowButton#direction
 * @cfg {Array} Выбор стороны, куда будет указывтаь стрелка в кнопке.
 * @example
 * <pre>
 *     <Controls.dateRange:ArrowButton direction="left"/>
 * </pre>
 * @demo Controls-demo/dateRange/ArrowButton/direction/Index
 */
