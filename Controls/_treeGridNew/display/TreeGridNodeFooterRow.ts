import TreeGridRow from 'Controls/_treeGridNew/display/TreeGridRow';
import { TemplateFunction } from 'UI/Base';
import { TreeItem } from 'Controls/display';
import TreeGridNodeFooterCell from 'Controls/_treeGridNew/display/TreeGridNodeFooterCell';

export default class TreeGridNodeFooterRow<S> extends TreeGridRow<S> {
    readonly Markable: boolean = false;

    readonly '[Controls/treeGrid:TreeGridNodeFooterRow]': boolean;

    getNode(): TreeItem<S> {
        return this.getParent();
    }

    getColumns(colspan: boolean|undefined): Array<TreeGridNodeFooterCell<S, TreeGridNodeFooterRow<S>>> {
        const columns = super.getColumns();
        return colspan !== false ? [columns[0]] : columns;
    }

    hasMoreStorage(): boolean {
        return this.getNode().hasMoreStorage();
    }

    getTemplate(): TemplateFunction | string {
        return this._$owner.getNodeFooterTemplate() || 'Controls/treeGridNew:NodeFooterTemplate';
    }

    getNodeFooterTemplateMoreButton(): TemplateFunction {
        return this._$owner.getNodeFooterTemplateMoreButton();
    }

    getItemClasses(): string {
        return 'controls-Grid__row controls-TreeGrid__nodeFooter';
    }
}

Object.assign(TreeGridNodeFooterRow.prototype, {
    '[Controls/treeGrid:TreeGridNodeFooterRow]': true,
    _moduleName: 'Controls/treeGrid:TreeGridNodeFooterRow',
    _cellModule: 'Controls/treeGrid:TreeGridNodeFooterCell',
    _instancePrefix: 'tree-grid-node-footer-row-'
});
