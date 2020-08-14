import CollectionItem, {IOptions as ICollectionItemOptions} from './CollectionItem';
import ExpandableMixin, {IOptions as IExpandableMixinOptions} from './ExpandableMixin';
import {mixin} from 'Types/util';
import { TemplateFunction } from 'UI/Base';

interface IOptions<T> extends ICollectionItemOptions<T>, IExpandableMixinOptions {
}

/**
 * Элемент коллекции "Группа"
 * @class Controls/_display/GroupItem
 * @extends Controls/_display/CollectionItem
 * @mixes Controls/_display/ExpandableMixin
 * @public
 * @author Мальцев А.А.
 */
export default class GroupItem<T> extends mixin<
    CollectionItem<any>,
    ExpandableMixin
    >(
    CollectionItem,
    ExpandableMixin
) {
    readonly '[Types/_interface/IEditableItem]': boolean = false;

    constructor(options?: IOptions<T>) {
        super(options);
        ExpandableMixin.call(this);
    }

    isHiddenGroup(): boolean {
        return this._$contents === 'CONTROLS_HIDDEN_GROUP';
    }

    getItemTemplate(
        userItemTemplate: TemplateFunction|string,
        userGroupTemplate?: TemplateFunction|string
    ): TemplateFunction|string {
        return userGroupTemplate || 'Controls/listRender:groupTemplate';
    }
}

Object.assign(GroupItem.prototype, {
    '[Controls/_display/GroupItem]': true,
    _moduleName: 'Controls/display:GroupItem',
    _instancePrefix: 'group-item-'
});

