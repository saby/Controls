import { TemplateFunction } from 'UI/Base';
import { TreeItem } from 'Controls/display';
import { Model } from 'Types/entity';
import TreeGridDataRow from './TreeGridDataRow';
import {GridRow as Row, GridCell as Cell, IColumn} from 'Controls/grid';

export default class TreeGridNodeFooterRow extends TreeGridDataRow<null> {
    readonly '[Controls/treeGrid:TreeGridNodeFooterRow]': boolean;
    readonly Markable: boolean = false;
    readonly DraggableItem: boolean = false;
    readonly SelectableItem: boolean = false;
    readonly ItemActionsItem: boolean = false;

    // TODO нужно удалить, когда перепишем колспан для футеров узлов https://online.sbis.ru/opendoc.html?guid=76c1ba00-bfc9-4eb8-91ba-3977592e6648
    // Храним колспан, чтобы правильно определять индекс столбца.
    // Он задается на темплейте, поэтмоу в моделе мы о нем не знаем
    private _colspan: boolean;

    get node(): TreeItem<Model> {
        return this.getNode();
    }

    getNode(): TreeItem<Model> {
        return this.getParent();
    }

    // TODO нужно указывать тип TreeGridNodeFooterCell[], но тогда получается циклическая зависимость
    getColumns(colspan?: boolean): any[] {
        this._colspan = colspan;
        let columns = super.getColumns();
        if (colspan !== false) {
            // В данный момент поддержан только один сценарий лесенки и футеров узлов: лесенка для первого столбца.
            // Чтобы поддержать все сценарии нужно переписать nodeFooterTemplate::colspan на Tree::colspanCallback            //  TODO переписать когда перепишем колспан для футеров узлов https://online.sbis.ru/opendoc.html?guid=76c1ba00-bfc9-4eb8-91ba-3977592e6648
            if (this.isSupportLadder() && columns[0]['[Controls/_display/StickyLadderCell]']) {
                columns = columns.slice(1, 2);
            } else {
                columns = columns.slice(0, 1);
            }
        }
        return columns;
    }

    // TODO нужно удалить, когда перепишем колспан для футеров узлов https://online.sbis.ru/opendoc.html?guid=76c1ba00-bfc9-4eb8-91ba-3977592e6648
    getColumnIndex(column: Cell<any, Row<any>>): number {
        return this.getColumns(this._colspan).indexOf(column);
    }

    // TODO нужно удалить, когда перепишем колспан для футеров узлов https://online.sbis.ru/opendoc.html?guid=76c1ba00-bfc9-4eb8-91ba-3977592e6648
    getColumnsCount(): number {
        return this.getColumns(this._colspan).length;
    }

    hasMoreStorage(): boolean {
        return this.getNode().hasMoreStorage();
    }

    getTemplate(): TemplateFunction | string {
        return this._$owner.getNodeFooterTemplate() || 'Controls/treeGrid:NodeFooterTemplate';
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
           'controls-TreeGrid__row-expanderPadding',
           'controls-TreeGrid__node-footer-expanderPadding'
        );

        return classes;
    }

    shouldDisplayVisibleFooter(content: TemplateFunction): boolean {
        return this.hasMoreStorage() || !!content;
    }

    // TODO удалить после https://online.sbis.ru/opendoc.html?guid=76c1ba00-bfc9-4eb8-91ba-3977592e6648
    isSupportLadder(): boolean {
        const ladderProperties = this.getOwner().getLadderProperties();
        return ladderProperties && ladderProperties.length;
    }
}

Object.assign(TreeGridNodeFooterRow.prototype, {
    '[Controls/treeGrid:TreeGridNodeFooterRow]': true,
    _moduleName: 'Controls/treeGrid:TreeGridNodeFooterRow',
    _cellModule: 'Controls/treeGrid:TreeGridNodeFooterCell',
    _instancePrefix: 'tree-grid-node-footer-row-',
    _$supportLadder: false
});
