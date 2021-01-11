import { Control, TemplateFunction } from 'UI/Base';
import { Memory } from 'Types/source';
import { Model } from 'Types/entity';
import { TColumns, THeader } from 'Controls/grid';
import { RawData, ResultsRawData } from 'Controls-demo/grid/data/ResultsColspan';
import * as Template from 'wml!Controls-demo/grid/ResultsColspan/ResultsColspan';
import * as TotalResult from 'wml!Controls-demo/grid/ResultsColspan/TotalResult';
import * as CountResult from 'wml!Controls-demo/grid/ResultsColspan/CountResult';
import { TColspanCallbackResult } from 'Controls/_display/grid/mixins/Grid';

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _viewSource: Memory;
    protected _itemsReadyCallback: Function;
    protected _columns: TColumns = [
        {
            displayProperty: 'name',
            width: '250px'
        },
        {
            displayProperty: 'count',
            width: '50px',
            resultTemplate: CountResult
        },
        {
            displayProperty: 'price',
            width: '75px',
            align: 'right',
            resultTemplate: TotalResult
        },
        {
            displayProperty: 'total',
            width: '75px',
            align: 'right'
        }
    ];

    protected _header: THeader = [
        {
            caption: 'Наименование'
        },
        {
            caption: 'Кол.'
        },
        {
            caption: 'Цена'
        },
        {
            caption: 'Сумма'
        }
    ];

    protected _resultsColspanCallback(column, columnIndex): TColspanCallbackResult {
        if (columnIndex === 2) {
            return 'end';
        }
    }

    protected _beforeMount(): void {
        this._itemsReadyCallback = this._itemsReadyCallbackFn.bind(this);
        this._viewSource = new Memory({
            keyProperty: 'key',
            data: RawData
        });
    }

    protected _itemsReadyCallbackFn(items): void {
        const results = new Model({
            rawData: ResultsRawData
        });
        items.setMetaData({
            results
        });
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
