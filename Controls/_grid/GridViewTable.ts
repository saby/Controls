import GridView from './GridView';
import { TemplateFunction } from 'UI/Base';
import * as TableTemplate from 'wml!Controls/_grid/Render/table/GridView';
import * as TableItem from 'wml!Controls/_grid/Render/table/Item';

const GridViewTable = GridView.extend({
    _template: TableTemplate,

    _resolveItemTemplate(options): TemplateFunction {
        return options.itemTemplate || this._resolveBaseItemTemplate(options);
    },

    _resolveBaseItemTemplate(options): TemplateFunction {
        return TableItem;
    },

    _getGridViewWrapperClasses(options): string {
        const classes = GridViewTable.superclass._getGridViewWrapperClasses.apply(this, arguments);
        return `${classes} controls-Grid__Wrapper_table-layout`;
    },

    _getGridViewClasses(options): string {
        const classes = GridViewTable.superclass._getGridViewClasses.apply(this, arguments);

        // При горизонтальном скролле ЕДИНСТВЕННО ВЕРНОЕ значение свойства table-layout - это auto.
        // Такая настройка позволяет колонкам тянуться, тогда как fixed жестко ограничивает их ширины.
        const isFixedLayout = options.columnScroll !== true;
        return `${classes} controls-Grid_table-layout controls-Grid_table-layout_${isFixedLayout ? 'fixed' : 'auto'}`;
    },

    _getGridViewStyles(): string {
        return '';
    }
});

export default GridViewTable;
