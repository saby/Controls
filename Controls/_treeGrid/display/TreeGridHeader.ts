import {GridHeader} from 'Controls/grid';
import TreeGridHeaderRow from "Controls/_treeGrid/display/TreeGridHeaderRow";

export default class TreeGridHeader extends GridHeader<null> {
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

Object.assign(TreeGridHeader.prototype, {
    'Controls/treeGrid:TreeGridHeader': true,
    _moduleName: 'Controls/treeGrid:TreeGridHeader',
    _instancePrefix: 'tree-grid-header-',
    _rowModule: 'Controls/treeGrid:TreeGridHeaderRow',
    _cellModule: 'Controls/treeGrid:TreeGridHeaderCell',
    _$expanderSize: 'default'
});