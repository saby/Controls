import {descriptor} from 'Types/entity';

/**
 * @typedef TFontWeight
 * @variant default
 * @variant bold
 */
export type TFontWeight = 'default' | 'bold';

export interface IFontWeightOptions {
    /**
     * Начертание шрифта.
     * @type TFontWeight
     * @default default
     * @demo Controls-demo/Decorator/Money/FontWeight/Index
     */
    fontWeight: TFontWeight;
}

/**
 * Поменять Function а нормальный тип после выполнения
 * https://online.sbis.ru/opendoc.html?guid=30df718d-9d01-4ae0-b5b9-983bdf93cb4d
 */
export function getFontWeightTypes(): Record<keyof IFontWeightOptions, Function> {
    return {
        fontWeight: descriptor<string>(String).oneOf(['default', 'bold'])
    };
}

/**
 * Интерфейс для контролов, которые поддерживают разные начертания шрифта.
 *
 * @interface Controls/_interface/IFontWeight
 * @public
 */
export default interface IFontWeight {
    readonly '[Controls/_interface/IFontWeight]': boolean;
}
