// tslint:disable-next-line:ban-ts-ignore
// @ts-ignore
import * as template from 'wml!Controls-demo/list_new/ItemsView/Base/Index';
import {Model} from 'Types/entity';
import {RecordSet} from 'Types/collection';
import {Control, IControlOptions, TemplateFunction} from 'UI/Base';

interface IRawData {
    id: number;
    title: string;
}

const format = {
    id: 'integer',
    title: 'string'
};

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

    protected _beforeMount(): void {
        this._resetRows();
    }

    /**
     * Добавляет новую строку в конец _items
     */
    protected _addRow(): void {
        this._items.add(new Model({
            format,
            rawData: this._generateRow()
        }));
    }

    /**
     * Удаляет первую запись из _items
     */
    protected _delRow(): void {
        if (!this._items.getCount()) {
            return;
        }

        this._items.removeAt(0);
    }

    /**
     * Пересоздает RecordSet данные которого отображаются списком
     */
    protected _resetRows(): void {
        this._lastRowId = 0;
        this._items = new RecordSet({
            format,
            keyProperty: 'id',
            rawData: [
                this._generateRow(),
                this._generateRow()
            ]
        });
    }

    /**
     * Генерирует сырые данные для новой строки
     */
    private _generateRow(): IRawData {
        const id = ++this._lastRowId;
        return {
            id,
            title: `row with id ${id}`
        };
    }

    static _styles: string[] = [
        'Controls-demo/Controls-demo',
        'Controls-demo/list_new/ItemsView/Base/Index'
    ];
}
