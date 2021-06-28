import {GridTableHeader} from "Controls/grid";
import TreeGridHeaderRow from "Controls/_treeGrid/display/TreeGridHeaderRow";

export default class TreeGridTableHeader extends GridTableHeader<null> {
    /**
     * Размер экспандера
     */
    protected _$expanderSize: string;

    setDisplayExpanderPadding(displayExpanderPadding: boolean): void {
        this._$rows.forEach((row) => {
            (row as TreeGridHeaderRow).setDisplayExpanderPadding(displayExpanderPadding);
        });
    }

    protected _getRowsFactory(): (options: any) => TreeGridHeaderRow {
        const superFactory = super._getRowsFactory();
        return (options: any) => {
            options.expanderSize = this._$expanderSize;
            return superFactory.call(this, options);
        };
    }
}

Object.assign(TreeGridTableHeader.prototype, {
    'Controls/treeGrid:TreeGridTableHeader': true,
    _moduleName: 'Controls/treeGrid:TreeGridTableHeader',
    _instancePrefix: 'tree-grid-table-header-',
    _rowModule: 'Controls/treeGrid:TreeGridTableHeaderRow',
    _$expanderSize: 'default'
});