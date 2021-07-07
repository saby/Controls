import { GridHeaderRow } from "Controls/grid";
import TreeGridHeaderCell from "Controls/_treeGrid/display/TreeGridHeaderCell";

export default class TreeGridHeaderRow extends GridHeaderRow<null> {
    /**
     * Признак, означающий что нужно рисовать отступ вместо экспандеров
     * @protected
     */
    protected _$displayExpanderPadding: boolean;

    /**
     * Размер экспандера
     */
    protected _$expanderSize: string;

    // region DisplayExpanderPadding

    setDisplayExpanderPadding(displayExpanderPadding: boolean): void {
        if (this._$displayExpanderPadding !== displayExpanderPadding) {
            this._$displayExpanderPadding = displayExpanderPadding;

            this._updateColumnsDisplayExpanderPadding(displayExpanderPadding);

            this._nextVersion();
        }
    }

    protected _updateColumnsDisplayExpanderPadding(displayExpanderPadding: boolean): void {
        // После пересчета displayExpanderPadding _$columnItems могут быть не созданы, т.к. они создаются лениво
        if (this._$columnItems) {
            this._$columnItems.forEach((cell: TreeGridHeaderCell) => {
                if (cell['[Controls/treeGrid:TreeGridFooterCell]']) {
                    cell.setDisplayExpanderPadding(displayExpanderPadding);
                }
            });
        }
    }

    // endregion DisplayExpanderPadding

    getColumnsFactory(staticOptions?: object): (options: any) => TreeGridHeaderCell {
        const superFactory = super.getColumnsFactory();
        return (options: any) => {
            options.displayExpanderPadding = this._$displayExpanderPadding;
            options.expanderSize = this._$expanderSize;
            return superFactory.call(this, options);
        };
    }

}

Object.assign(TreeGridHeaderRow.prototype, {
    'Controls/treeGrid:TreeGridHeaderRow': true,
    _moduleName: 'Controls/treeGrid:TreeGridHeaderRow',
    _instancePrefix: 'tree-grid-header-row-',
    _cellModule: 'Controls/treeGrid:TreeGridHeaderCell',
    _$displayExpanderPadding: true,
    _$expanderSize: 'default'
});
