import {descriptor} from 'Types/entity';

export type THorizontalPadding = 'xs' | 'm' | 'null';

export interface IPaddingOptions {
    horizontalPadding: THorizontalPadding;
}

export function getDefaultPaddingOptions(): Partial<IPaddingOptions> {
    return {
        horizontalPadding: 'xs'
    };
}

export function getOptionPaddingTypes(): object {
    return {
        horizontalPadding: descriptor<string>(String).oneOf([
            'xs', 'm', 'null'
        ])
    };
}

/**
 * Интерфейс для контролов, которые поддерживают разные размеры отступов текста от контейнера.
 *
 * @interface Controls/_input/interface/IPadding
 * @public
 * @author Красильников А.С.
 */
export interface IPadding {
    readonly '[Controls/interface/IPadding]': boolean;
}

/**
 * @typedef {String} THorizontalPadding
 * @variant xs
 * @variant m
 * @variant null
 */
/**
 * @name Controls/_input/interface/IPadding#horizontalPadding
 * @cfg {THorizontalPadding} Размер отступов контрола по горизонтали.
 */
