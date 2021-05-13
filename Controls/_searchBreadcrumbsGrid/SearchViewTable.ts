import SearchView from './SearchView';
import {TemplateFunction} from 'UI/Base';
import {TableTemplate} from 'Controls/grid';
import {TableItemTemplate} from 'Controls/treeGrid';

export default class SearchViewTable extends SearchView {
    protected _template: TemplateFunction = TableTemplate;

    protected _resolveBaseItemTemplate(options: any): TemplateFunction {
        return TableItemTemplate;
    }

    protected _getGridViewClasses(options: any): string {
        const classes = super._getGridViewClasses(options);
        return classes + ' controls-Grid_table-layout controls-Grid_table-layout_fixed';
    }

    protected _getGridViewStyles(): string {
        return '';
    }
}
