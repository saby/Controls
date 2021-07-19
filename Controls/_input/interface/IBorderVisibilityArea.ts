import {IBorderVisibility, TBorderVisibility} from 'Controls/_input/interface/IBorderVisibility';
import {descriptor} from 'Types/entity';

export type TBorderVisibilityArea = TBorderVisibility & 'bottom';

export interface IBorderVisibilityArea extends IBorderVisibility {
    borderVisibility: TBorderVisibilityArea;
}

export function getOptionBorderVisibilityAreaTypes(): object {
    return {
        borderVisibility: descriptor<string>(String).oneOf([
            'visible', 'partial', 'hidden', 'bottom'
        ])
    };
}

export interface IBorderVisibilityArea {
    readonly '[Controls/interface/IBorderVisibilityArea]': boolean;
}

/**
 * Интерфейс для многострочного поля ввода, которое поддерживают разное количество видимых границ.
 * @interface Controls/_input/interface/IBorderVisibilityArea
 * @public
 * @author Красильников А.С.
 */

/**
 * @typedef {String} Controls/_input/interface/IBorderVisibilityArea/TBorderVisibilityArea
 * @variant visible
 * @variant partial
 * @variant hidden
 * @variant bottom
 */

/**
 * @name Controls/_input/interface/IBorderVisibilityArea#borderVisibility
 * @cfg {Controls/_input/interface/IBorderVisibilityArea/TBorderVisibilityArea.typedef} Видимость границ контрола.
 * @default partial
 * @demo Controls-demo/Input/Area/BorderVisibility/Index
 */
