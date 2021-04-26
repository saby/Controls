import { GridRow, TColspanCallbackResult } from 'Controls/grid';
import SearchGridCollection from './SearchGridCollection';
import { IColumn } from 'Controls/interface';

export default class SearchSeparatorRow extends GridRow<string> {
    readonly '[Controls/_display/IEditableCollectionItem]': boolean = false;
    readonly '[Controls/_itemActions/interface/IItemActionsItem]': boolean = false;

    readonly Markable: boolean = false;

    protected _$owner: SearchGridCollection;

    getContents(): string {
        return 'search-separator';
    }

    getUid(): string {
        return 'search-separator';
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

    isVisibleCheckbox(): boolean {
        return false;
    }

    isLastItem(): boolean {
        return false;
    }

    protected _getColspan(column: IColumn, columnIndex: number): TColspanCallbackResult {
        return 'end';
    }
}

Object.assign(SearchSeparatorRow.prototype, {
    '[Controls/_searchBreadcrumbsGrid/SearchSeparatorRow]': true,
    '[Controls/_display/SearchSeparator]': true,
    _moduleName: 'Controls/searchBreadcrumbsGrid:SearchSeparatorRow',
    _instancePrefix: 'search-separator-row-',
    _cellModule: 'Controls/searchBreadcrumbsGrid:SearchSeparatorCell'
});
