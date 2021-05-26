import GridView from './GridView';
import { TemplateFunction } from 'UI/Base';
import * as TableTemplate from 'wml!Controls/_grid/Render/table/GridView';
import * as TableItem from 'wml!Controls/_grid/Render/table/Item';
import {detection} from 'Env/Env';

const GridViewTable = GridView.extend({
    _template: TableTemplate,

    _resolveItemTemplate(options): TemplateFunction {
        return options.itemTemplate || this._resolveBaseItemTemplate(options);
    },

    _resolveBaseItemTemplate(options): TemplateFunction {
        return TableItem;
    },

    _getGridViewClasses(options): string {
        const classes = GridViewTable.superclass._getGridViewClasses.apply(this, arguments);
        return `${classes} controls-Grid_table-layout controls-Grid_table-layout_fixed`;
    },

    _getGridViewStyles(): string {
        return '';
    }
});

export default GridViewTable;
