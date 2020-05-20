/**
 * Интерфейс для контролов, которые поддерживают настройку длины числа.
 *
 * @interface Controls/_input/interface/INumberLength
 * @public
 * @author Красильников А.С.
 */
interface INumberLength {
    readonly '[Controls/_input/interface/INumberLength]': boolean;
}

export interface INumberLengthOptions {
    /**
     * @name Controls/_input/interface/INumberLength#integersLength
     * @cfg {Number} Максимальная длина целой части.
     * @remark
     * Если значение не задано, длина целой части не ограничена.
     */
    integersLength?: number;
    /**
     * @name Controls/_input/interface/INumberLength#precision
     * @cfg {Number} Количество знаков в дробной части.
     * @remark
     * Если значение не задано, количество знаков не ограничено.
     */
    precision?: number;
}

export default INumberLength;