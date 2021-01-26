import { IItemTemplateParams } from 'Controls/gridNew';
import { register } from 'Types/di';
import { OptionsToPropertyMixin } from 'Types/entity';
import SearchGridCollection from './SearchGridCollection';

export default class SearchSeparator extends OptionsToPropertyMixin {
    readonly '[Controls/_display/IEditableCollectionItem]': boolean = false;
    readonly '[Controls/_itemActions/interface/IItemActionsItem]': boolean = false;

    readonly Markable: boolean = false;
    readonly SelectableItem: boolean = false;

    protected _$owner: SearchGridCollection;

    getContents(): string {
        return 'search-separator';
    }

    getTemplate(): string {
        return 'Controls/searchBreadcrumbsGrid:SearchSeparatorTemplate';
    }

    isEditing(): boolean {
        return false;
    }

    isActive(): boolean {
        return false;
    }

    isMarked(): boolean {
        return false;
    }

    isSelected(): boolean {
        return false;
    }

    isSwiped(): boolean {
        return false;
    }

    getLevel(): number {
        return 0;
    }

    getItemClasses(params: IItemTemplateParams = { theme: 'default' }): string {
        let classes = `controls-TreeGrid__row__searchSeparator_theme-${params.theme} `;
        classes += `controls-Grid__cell_spacingFirstCol_${this._$owner.getLeftPadding()}_theme-${params.theme} `;
        classes += 'js-controls-ListView__notEditable';
        return classes;
    }

    getItemStyles(): string {
        return 'grid-column: 1 / ' + (this._$owner.getColumnsConfig().length + 1);
    }
}

Object.assign(SearchSeparator.prototype, {
    '[Controls/_searchBreadcrumbsGrid/SearchSeparator]': true,
    _moduleName: 'Controls/searchBreadcrumbsGrid:SearchSeparator',
    _$owner: undefined,
    _instancePrefix: 'search-separator-item-'
});

register('Controls/searchBreadcrumbsGrid:SearchSeparator', SearchSeparator, {instantiate: false});
