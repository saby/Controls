import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/grid/Results/FromMeta/CustomResultsRow/CustomResultsRow';
import {Memory} from 'Types/source';
import {RecordSet} from 'Types/collection';
import {getCountriesStats} from '../../../DemoHelpers/DataCatalog';
import {Model} from 'Types/entity';

export default class extends Control {
    protected _template: TemplateFunction = Template;
    private _viewSource: Memory;
    private _header = getCountriesStats().getDefaultHeader();
    private _columns = getCountriesStats().getColumnsWithWidths();
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

    private _setResultRow(): void {
        const items = this._children.grid._children.listControl._children.baseControl.getViewModel().getItems();
        const results = items.getMetaData().results;
        results.set('population', getCountriesStats().getResults().partial[this._partialResultsIndex]);
        this._partialResultsIndex = ++this._partialResultsIndex % getCountriesStats().getResults().partial.length;
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

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
