import {IUnderlineOptions} from 'Controls/interface';

export interface INumberFormatOptions extends IUnderlineOptions {
    useGrouping?: boolean;
    showEmptyDecimals?: boolean;
    stroked?: boolean;
}

/**
 * Интерфейс для контролов, которые поддерживают настройку числового формата.
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
 * @default true
 * @remark
 * * true - число разделено на группы.
 * * false - разделения не происходит.
 */
/**
 * @name Controls/_interface/INumberFormat#showEmptyDecimals
 * @cfg {Boolean} Определяет, отображать ли нули в конце десятичной части.
 * @default false
 * @remark
 * * true - отображать нули в десятичной части.
 * * false - не отображать нули в десятичной части.
 */
