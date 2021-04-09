import SearchView from './SearchView';

export default class SearchViewTable extends SearchView {
    protected _getGridViewClasses(options: any): string {
        const classes = super._getGridViewClasses(options);
        return classes + ' controls-Grid_table-layout controls-Grid_table-layout_fixed';
    }

    protected _getGridViewStyles(): string {
        return '';
    }
}
