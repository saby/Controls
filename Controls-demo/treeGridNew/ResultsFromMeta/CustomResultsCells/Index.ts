import {Control, TemplateFunction, IControlOptions} from 'UI/Base';
import * as Template from 'wml!Controls-demo/treeGridNew/ResultsFromMeta/CustomResultsCells/CustomResultsCells';
import * as resTpl from 'wml!Controls-demo/treeGridNew/ResultsFromMeta/CustomResultsCells/resultCell';
import {Memory} from 'Types/source';
import {RecordSet} from 'Types/collection';
import {Gadgets} from '../../DemoHelpers/DataCatalog';
import {Model} from 'Types/entity';
import { IColumn } from 'Controls/grid';
import { IHeader } from 'Controls-demo/types';

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _viewSource: Memory;
    protected _header: IHeader[] = Gadgets.getHeaderForFlat();
    protected _columns: IColumn[] = Gadgets.getGridColumnsForFlat().map((c, i) => ({
        ...c,
        result: undefined,
        resultTemplate: i === 1 ? resTpl : undefined
    }));
    private _fullResultsIndex: number = 0;

    constructor() {
        super({});
        this._dataLoadCallback = this._dataLoadCallback.bind(this);
    }

    protected _beforeMount(): void {
        this._viewSource = new Memory({
            keyProperty: 'id',
            data: Gadgets.getFlatData()
        });
    }

    private _dataLoadCallback(items: RecordSet): void {
        items.setMetaData({
            ...items.getMetaData(),
            results: this._generateResults(items)
        });
    }

    private _updateMeta(): void {
        this._children.tree.reload();
    }

    private _setMeta(): void {
        const items = this._children.tree._children.listControl._children.baseControl.getViewModel().getItems();
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
                { name: 'rating', type: 'real' }
            ]
        });

        const data = Gadgets.getResults().full[this._fullResultsIndex];
        results.set('rating', data.rating);
        this._fullResultsIndex = ++this._fullResultsIndex % Gadgets.getResults().full.length;
        return results;
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
