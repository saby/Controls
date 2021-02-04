export interface INumberLengthOptions {
    integersLength?: number;
    precision?: number;
}

/**
 * Интерфейс для контролов, которые поддерживают настройку длины числа.
 *
 * @interface Controls/_input/interface/INumberLength
 * @public
 * @author Красильников А.С.
 */
export interface INumberLength {
    readonly '[Controls/_input/interface/INumberLength]': boolean;
}

/**
 * @name Controls/_input/interface/INumberLength#integersLength
 * @cfg {Number} Максимальная длина целой части.
 * @remark
 * Если значение не задано, длина целой части не ограничена.
 */
/**
 * @name Controls/_input/interface/INumberLength#precision
 * @cfg {Number} Количество знаков в дробной части.
 * @remark
 * Если значение не задано, количество знаков не ограничено. Если задано значение 0, то можно вводить только целые числа.
 */
