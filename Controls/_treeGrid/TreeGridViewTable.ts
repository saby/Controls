import TreeGridView from './TreeGridView';
import { TemplateFunction } from 'UI/Base';
import * as TableItem from 'wml!Controls/_treeGrid/render/table/Item';
import { TableTemplate } from 'Controls/grid';

export default class TreeGridViewTable extends TreeGridView {
    protected _template: TemplateFunction = TableTemplate;

    protected _resolveBaseItemTemplate(options: any): TemplateFunction {
        return TableItem;
    }

    protected _getGridViewWrapperClasses(options: any): string {
        return `${super._getGridViewWrapperClasses(options)} controls-Grid__Wrapper_table-layout`;
    }

    protected _getGridViewClasses(options): string {
        const classes = super._getGridViewClasses(options);

        // При горизонтальном скролле ЕДИНСТВЕННО ВЕРНОЕ значение свойства table-layout - это auto.
        // Такая настройка позволяет колонкам тянуться, тогда как fixed жестко ограничивает их ширины.
        const isFixedLayout = options.columnScroll !== true;
        return `${classes} controls-Grid_table-layout controls-Grid_table-layout_${isFixedLayout ? 'fixed' : 'auto'}`;
    }

    protected _getGridViewStyles(): string {
        return '';
    }
}
