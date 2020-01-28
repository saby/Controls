export interface IFontWeightOptions {
    fontWeight?: string;
}

/**
 * Интерфейс для контролов, которые поддерживают разные начертания шрифта.
 *
 * @interface Controls/_interface/IFontWeight
 * @public
 */

/*
 * Interface for control, which has different font weight
 *
 * @interface Controls/_interface/IFontWeight
 * @public
 */
export default interface IFontWeight {
    readonly '[Controls/_interface/IFontWeight]': boolean;
}
/**
 * @name Controls/_interface/IFontWeight#fontWeight
 * @cfg {Enum} Начертание шрифта.
 * @variant bold
 * @variant normal
 * @default normal
 * @demo Controls-demo/Decorator/Money/FontWeight/Index
 */

/*
 * @name Controls/_interface/IFontWeight#fontWeight
 * @cfg {Enum} Font weight
 * @variant inherit
 * @variant bold
 * @variant normal
 * @default normal
 * @demo Controls-demo/Decorator/Money/FontWeight/Index
 */
