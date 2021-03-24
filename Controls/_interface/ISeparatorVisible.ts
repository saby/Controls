export interface ISeparatorVisibleOptions {
    separatorVisible?: boolean;
}

/**
 * Интерфейс для контролов в которых присутствует разделительная линия между элементами
 * @public
 * @author Красильников А.С.
 */

export default interface ISeparatorVisible {
    readonly '[Controls/_interface/ISeparatorVisible]': boolean;
}
/**
 * @name Controls/_interface/ISeparatorVisible#separatorVisible
 * @cfg {Boolean} Определяет наличие разделителя
 * @default true
 */
