import {descriptor, DescriptorValidator} from 'Types/entity';

/**
 * @typedef TFontWeight
 * @variant default
 * @variant bold
 */
export type TFontWeight = 'default' | 'bold';

/**
 * @interface Controls/_interface/IFontWeightOptions
 * @public
 * @author Красильников А.С.
 */
export interface IFontWeightOptions {
    /**
     * Начертание шрифта.
     * @type TFontWeight
     * @default default
     * @demo Controls-demo/Decorator/Money/FontWeight/Index
     */
    fontWeight: TFontWeight;
}

export function getFontWeightTypes(): Record<keyof IFontWeightOptions, DescriptorValidator> {
    return {
        fontWeight: descriptor<string>(String).oneOf(['default', 'bold'])
    };
}

/**
 * Интерфейс для контролов, которые поддерживают разные начертания шрифта.
 *
 * @interface Controls/_interface/IFontWeight
 * @public
 * @author Красильников А.С.
 */
export default interface IFontWeight {
    readonly '[Controls/_interface/IFontWeight]': boolean;
}
