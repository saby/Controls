export interface INumberFormatOptions {
    useGrouping?: boolean;
    showEmptyDecimals?: boolean;
}

/**
 * Интерфейс для контролов, которые поддерживают настройку числового формата.
 * @interface Controls/_interface/INumberFormat
 * @public
 * @author Красильников А.С.
 */
interface INumberFormat {
    readonly '[Controls/_interface/INumberFormat]': boolean;
}

export default INumberFormat;

/**
 * @name Controls/_interface/INumberFormat#useGrouping
 * @cfg {Boolean} Определяет, следует ли использовать разделители группы.
 * @remark
 * true - число разделено на группы.
 * false - разделения не происходит.
 */
/**
 * @name Controls/_interface/INumberFormat#showEmptyDecimals
 * @cfg {Boolean} Определяет, отображать ли нули в конце десятичной части.
 * @remark
 * true -  Отображать нули в десятичной части.
 * false - Не отображать нули в десятичной части.
 */