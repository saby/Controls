// tslint:disable-next-line:ban-ts-ignore
// @ts-ignore
import * as template from 'wml!Controls-demo/list_new/ItemsView/Grouping/Index';
import {RecordSet} from 'Types/collection';
import {Control, IControlOptions, TemplateFunction} from 'UI/Base';

interface IRawData {
    key: number;
    title: string;
    group: string;
}

export default class Index extends Control<IControlOptions> {

    protected _template: TemplateFunction = template;

    /**
     * RecordSet данные которого отображает список
     */
    protected _items: RecordSet;

    /**
     * id последней созданной строки
     */
    private _lastRowId: number = 0;

    private _lastGroupId: number = 0;

    protected _beforeMount(): void {
        this._resetRows();
    }

    /**
     * Пересоздает RecordSet данные которого отображаются списком
     */
    protected _resetRows(): void {
        this._lastRowId = 0;
        this._items = new RecordSet({
            keyProperty: 'key',
            rawData: [
                this._generateRow(),
                this._generateRow(),
                this._generateRow(),
                this._generateRow()
            ]
        });
    }

    /**
     * Генерирует сырые данные для новой строки
     */
    private _generateRow(): IRawData {
        const key = ++this._lastRowId;
        if (key % 3 === 0) {
            this._lastGroupId += 1;
        }

        return {
            key,
            title: `row with id ${key}`,
            group: `group ${this._lastGroupId}`
        };
    }

    static _styles: string[] = [
        'Controls-demo/Controls-demo'
    ];
}
