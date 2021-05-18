import TreeGridView from './TreeGridView';
import { TemplateFunction } from 'UI/Base';
import * as TableItem from 'wml!Controls/_treeGrid/render/table/Item';
import { TableTemplate } from 'Controls/grid';

export default class TreeGridViewTable extends TreeGridView {
    protected _template: TemplateFunction = TableTemplate;

    protected _resolveBaseItemTemplate(options: any): TemplateFunction {
        return TableItem;
    }

    protected _getGridViewClasses(options: any): string {
        const classes = super._getGridViewClasses(options);
        return `${classes} controls-Grid_table-layout controls-Grid_table-layout_${options.columnScroll !== true ? 'fixed' : 'auto'}`;
    }

    protected _getGridViewStyles(): string {
        return '';
    }
}
