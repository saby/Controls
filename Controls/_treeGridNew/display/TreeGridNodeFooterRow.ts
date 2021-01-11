import { TemplateFunction } from 'UI/Base';
import { TreeItem } from 'Controls/display';
import { Model } from 'Types/entity';
import TreeGridDataRow from './TreeGridDataRow';
import Row from 'Controls/_display/grid/Row';
import Cell from 'Controls/_display/grid/Cell';

export default class TreeGridNodeFooterRow extends TreeGridDataRow<null> {
    readonly '[Controls/treeGrid:TreeGridNodeFooterRow]': boolean;
    readonly Markable: boolean = false;
    readonly DraggableItem: boolean = false;
    readonly SelectableItem: boolean = false;

    // TODO нужно удалить, когда перепишем колспан для футеров узлов
    // Храним колспан, чтобы правильно определять индекс столбца.
    // Он задается на темплейте, поэтмоу в моделе мы о нем не знаем
    private _colspan: boolean;

    getNode(): TreeItem<Model> {
        return this.getParent();
    }

    // TODO нужно указывать тип TreeGridNodeFooterCell[], но тогда получается циклическая зависимость
    getColumns(colspan?: boolean): any[] {
        this._colspan = colspan;
        const columns = super.getColumns();
        return colspan !== false ? [columns[0]] : columns;
    }

    // TODO нужно удалить, когда перепишем колспан для футеров узлов
    getColumnIndex(column: Cell<any, Row<any>>): number {
        return this.getColumns(this._colspan).indexOf(column);
    }

    // TODO нужно удалить, когда перепишем колспан для футеров узлов
    getColumnsCount(): number {
        return this.getColumns(this._colspan).length;
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

    getExpanderPaddingClasses(tmplExpanderSize?: string, theme: string = 'default'): string {
        let classes = super.getExpanderPaddingClasses(tmplExpanderSize, theme);

        classes = classes.replace(
           `controls-TreeGrid__row-expanderPadding_theme-${theme}`,
           `controls-TreeGrid__node-footer-expanderPadding_theme-${theme}`
        );

        return classes;
    }

    shouldDisplayVisibleFooter(content: TemplateFunction): boolean {
        return this.hasMoreStorage() || !!content;
    }
}

Object.assign(TreeGridNodeFooterRow.prototype, {
    '[Controls/treeGrid:TreeGridNodeFooterRow]': true,
    _moduleName: 'Controls/treeGrid:TreeGridNodeFooterRow',
    _cellModule: 'Controls/treeGrid:TreeGridNodeFooterCell',
    _instancePrefix: 'tree-grid-node-footer-row-'
});
