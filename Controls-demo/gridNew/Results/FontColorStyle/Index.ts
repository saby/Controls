import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/gridNew/Results/FontColorStyle/FontColorStyle';
import * as SuccessCellTemplate from 'wml!Controls-demo/gridNew/Results/FontColorStyle/SuccessCell';
import * as DangerCellTemplate from 'wml!Controls-demo/gridNew/Results/FontColorStyle/DangerCell';
import {Memory} from 'Types/source';
import {Model} from 'Types/entity';
import {RecordSet} from 'Types/collection';
import { IColumn } from 'Controls/grid';
import { IHeaderCell } from 'Controls/grid';
import { Countries } from 'Controls-demo/gridNew/DemoHelpers/Data/Countries';

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _viewSource: Memory;
    protected _header: IHeaderCell[] = Countries.getHeader();
    protected _columns: IColumn[] = [
        {
            displayProperty: 'number',
            width: '40px'
        },
        {
            displayProperty: 'country',
            width: '300px'
        },
        {
            displayProperty: 'population',
            width: 'max-content',
            resultTemplate: DangerCellTemplate,
            compatibleWidth: '118px'
        },
        {
            displayProperty: 'square',
            width: 'max-content',
            resultTemplate: SuccessCellTemplate,
            compatibleWidth: '156px'
        }
    ];

    constructor() {
        super({});
        this._dataLoadCallback = this._dataLoadCallback.bind(this);
    }

    protected _beforeMount(): void {
        this._viewSource = new Memory({
            keyProperty: 'key',
            data: Countries.getData().splice(0, 5)
        });
    }

    private _dataLoadCallback(items: RecordSet): void {
        const results = new Model({
            // Устанавливаем адаптер для работы с данными, он будет соответствовать адаптеру RecordSet'а.
            adapter: items.getAdapter(),

            // Устанавливаем тип полей строки итогов.
            format: [
                { name: 'population', type: 'real' },
                { name: 'square', type: 'real' }
            ],

            // Устанавливаем значения полей
            rawData: {
                population: 3660205559.49,
                square: 19358447.87
            }
        });

        items.setMetaData({
            ...items.getMetaData(),
            results
        });
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
