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
 * @demo Controls-demo/Decorator/Number/UseGrouping/Index
 * @remark
 * * true - число разделено на группы.
 * * false - разделения не происходит.
 */
/**
 * @name Controls/_interface/INumberFormat#showEmptyDecimals
 * @cfg {Boolean} Определяет, отображать ли нули в конце десятичной части.
 * @default false
 * @demo Controls-demo/Decorator/Money/ShowEmptyDecimals/Index
 * @deprecated Опция устарела и в ближайшее время её поддержка будет прекращена. Используйте опцию {@link Controls/_interface/INumberFormat#decimalsVisibility}.
 * @remark
 * * true - отображать нули в десятичной части.
 * * false - не отображать нули в десятичной части.
 */
/**
 * @name Controls/_interface/INumberFormat#stroked
 * @cfg {Boolean} Определяет, должно ли число быть перечеркнутым.
 * @default false
 * @demo Controls-demo/Decorator/Number/Stroked/Index
 * @remark
 * * true - перечеркнуть число.
 * * false - не перечеркивать число.
 */
