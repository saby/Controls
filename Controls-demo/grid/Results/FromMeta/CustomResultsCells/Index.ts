import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/grid/Results/FromMeta/CustomResultsCells/CustomResultsCells';
import * as sqResTpl from 'wml!Controls-demo/grid/Results/FromMeta/CustomResultsCells/resultCell';
import * as defResTpl from 'wml!Controls-demo/grid/Results/FromMeta/CustomResultsCells/resultCellDefault';
import {Memory} from 'Types/source';
import {Model} from 'Types/entity';
import {RecordSet} from 'Types/collection';
import {getCountriesStats} from '../../../DemoHelpers/DataCatalog';

export default class extends Control {
    protected _template: TemplateFunction = Template;
    static _styles: string[] = ['Controls-demo/Controls-demo'];
    private _viewSource: Memory;
    private _header = getCountriesStats().getDefaultHeader();
    private _columns = getCountriesStats().getColumnsWithWidths().map((c, i) => ({
        ...c,
        result: undefined,
        resultTemplate: (i === 4 ? sqResTpl : (i === 5 ? defResTpl : undefined))
    }));
    private _fullResultsIndex = 0;
    private _partialResultsIndex = 0;

    constructor() {
        super({});
        this._dataLoadCallback = this._dataLoadCallback.bind(this);
    }

    protected _beforeMount(): void {
        this._viewSource = new Memory({
            keyProperty: 'id',
            data: getCountriesStats().getData()
        });
    }

    private _dataLoadCallback(items: RecordSet): void {
        items.setMetaData({
            ...items.getMetaData(),
            results: this._generateResults(items)
        });
    }

    private _updateMeta(): void {
        this._children.grid.reload();
    }

    private _setMeta(): void {
        const items = this._children.grid._children.listControl._children.baseControl.getViewModel().getItems();
        items.setMetaData({
            ...items.getMetaData(),
            results: this._generateResults(items)
        });
    }

    private _setResultRow(): void {
        const items = this._children.grid._children.listControl._children.baseControl.getViewModel().getItems();
        const results = items.getMetaData().results;
        results.set('square', getCountriesStats().getResults().partial[this._partialResultsIndex]);
        this._partialResultsIndex = ++this._partialResultsIndex % getCountriesStats().getResults().partial.length;
    }

    private _generateResults(items: RecordSet): Model {
        const results = new Model({

            // Устанавливаем адаптер для работы с данными, он будет соответствовать адаптеру RecordSet'а.
            adapter: items.getAdapter(),

            // Устанавливаем тип полей строки итогов.
            format: [
                { name: 'population', type: 'real' },
                { name: 'square', type: 'real' },
                { name: 'populationDensity', type: 'real'}
            ]
        });

        const data = getCountriesStats().getResults().full[this._fullResultsIndex];

        results.set('population', data.population);
        results.set('square', data.square);
        results.set('populationDensity', data.populationDensity);

        this._fullResultsIndex = ++this._fullResultsIndex % getCountriesStats().getResults().full.length;
        return results;
    }
}
