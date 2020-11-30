import CollectionItem, {IOptions as ICollectionItemOptions} from './CollectionItem';
import ExpandableMixin, {IOptions as IExpandableMixinOptions} from './ExpandableMixin';
import {mixin} from 'Types/util';
import {TemplateFunction} from 'UI/Base';

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
    readonly '[Controls/_display/IEditableCollectionItem]': boolean = false;
    readonly '[Controls/_display/GroupItem]': true;

    readonly MarkableItem: boolean = false;
    readonly SelectableItem: boolean = false;

    protected _$multiSelectVisibility: string;

    constructor(options?: IOptions<T>) {
        super(options);
        ExpandableMixin.call(this);
    }

    get key(): T {
        return this._$contents;
    }

    isHiddenGroup(): boolean {
        return this._$contents === 'CONTROLS_HIDDEN_GROUP';
    }

    setMultiSelectVisibility(multiSelectVisibility: string): boolean {
        const multiSelectVisibilityUpdated = this._$multiSelectVisibility !== multiSelectVisibility;
        if (multiSelectVisibilityUpdated) {
            this._$multiSelectVisibility = multiSelectVisibility;
            this._nextVersion();
            return true;
        }
        return false;
    }

    getGroupPaddingClasses(theme: string, side: 'left' | 'right'): string {
        if (side === 'left') {
            const spacing = this.getOwner().getLeftPadding().toLowerCase();
            const hasMultiSelect = this.getOwner().getMultiSelectVisibility() !== 'hidden';
            return `controls-ListView__groupContent__leftPadding_${hasMultiSelect ? 'withCheckboxes' : spacing}_theme-${theme}`;
        } else {
            const spacing = this.getOwner().getRightPadding().toLowerCase();
            return `controls-ListView__groupContent__rightPadding_${spacing}_theme-${theme}`;
        }
    }

    getTemplate(itemTemplateProperty: string,
                    userItemTemplate: TemplateFunction | string,
                    userGroupTemplate?: TemplateFunction | string): TemplateFunction | string {
        return userGroupTemplate || 'Controls/listRender:groupTemplate';
    }

    setExpanded(expanded: boolean, silent?: boolean): void {
        super.setExpanded(expanded, silent);
        this._nextVersion();
    }
}

Object.assign(GroupItem.prototype, {
    '[Controls/_display/GroupItem]': true,
    _moduleName: 'Controls/display:GroupItem',
    _instancePrefix: 'group-item-',
    _$multiSelectVisibility: null
});
