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

/**
 * Интерфейс для контролов, которые поддерживают разное количество видимых границ.
 * @public
 * @author Красильников А.С.
 */
export interface IBorderVisibility {
    readonly '[Controls/interface/IBorderVisibility]': boolean;
}

/**
 * @typedef {String} Controls/_input/interface/IBorderVisibility/TBorderVisibility
 * @variant visible
 * @variant partial
 * @variant hidden
 */
/**
 * @name Controls/_input/interface/IBorderVisibility#borderVisibility
 * @cfg {Controls/_input/interface/IBorderVisibility/TBorderVisibility.typedef} Видимость границ контрола.
 * @demo Controls-demo/Input/BorderVisibility/Index
 */
