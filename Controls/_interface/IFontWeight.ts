/**
 * @typedef {String} TFontWeight
 * @variant default
 * @variant bold
 */
export type TFontWeight = 'default' | 'bold';

export interface IFontWeightOptions {
    fontWeight: TFontWeight;
}

/**
 * Интерфейс для контролов, которые поддерживают разные начертания шрифта.
 * @public
 * @author Красильников А.С.
 */
export default interface IFontWeight {
    readonly '[Controls/_interface/IFontWeight]': boolean;
}

/**
 * @name Controls/_interface/IFontWeight#fontWeight
 * @cfg {TFontWeight} Начертание шрифта
 * @default default
 * @demo Controls-demo/Decorator/Money/FontWeight/Index
 */
