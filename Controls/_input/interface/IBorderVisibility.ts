import {descriptor} from 'Types/entity';

export type TBorderVisibility = 'visible' | 'partial' | 'hidden';

export interface IBorderVisibilityOptions {
    borderVisibility: TBorderVisibility;
}

export function getDefaultBorderVisibilityOptions(): Partial<IBorderVisibilityOptions> {
    return {
        borderVisibility: 'partial'
    };
}

export function getOptionBorderVisibilityTypes(): object {
    return {
        borderVisibility: descriptor<string>(String).oneOf([
            'visible', 'partial', 'hidden'
        ])
    };
}

export interface IBorderVisibility {
    readonly '[Controls/interface/IBorderVisibility]': boolean;
}

/**
 * Интерфейс для контролов, которые поддерживают разное количество видимых границ.
 * @interface Controls/_input/interface/IBorderVisibility
 * @public
 * @author Красильников А.С.
 */

/**
 * @typedef {String} Controls/_input/interface/IBorderVisibility/TBorderVisibility
 * @variant visible
 * @variant partial
 * @variant hidden
 */
/**
 * @name Controls/_input/interface/IBorderVisibility#borderVisibility
 * @cfg {Controls/_input/interface/IBorderVisibility/TBorderVisibility.typedef} Видимость границ контрола.
 * @default partial
 * @demo Controls-demo/Input/BorderVisibility/Index
 */
