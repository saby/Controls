import {IControlOptions, TemplateFunction} from 'UI/Base';
import {IItemTemplateOptions, IHierarchyOptions, IIconSizeOptions, IMultiSelectableOptions} from 'Controls/interface';
import {IGroupedOptions} from 'Controls/dropdown';

interface IItemPadding {
    left: string;
    right: string;
}

export interface IMenuBaseOptions extends IControlOptions, IHierarchyOptions, IIconSizeOptions,
        IGroupedOptions, IItemTemplateOptions, IMultiSelectableOptions {
    keyProperty: string;
    displayProperty: string;
    emptyText?: string;
    emptyKey?: string|number;
    itemPadding: IItemPadding;
    multiSelect?: boolean;
    emptyTemplate: TemplateFunction;
}

/**
 * Интерфейс контрола, отображающего список меню
 * @interface Controls/_menu/interface/IMenuBase
 * @public
 * @author Золотова Э.Е.
 */

export default interface IMenuBase {
    readonly '[Controls/_menu/interface/IMenuBase]': boolean;
}
