import { Control, TemplateFunction } from 'UI/Base';
import { Memory, Query, DataSet } from 'Types/source';
import { fetch } from 'Browser/Transport';
import * as template from 'wml!Controls-demo/dataSource/Tree';
import 'css!Controls-demo/Controls-demo';

interface IFilter {
    parent?: string;
}

class TestSource extends Memory {
    private readonly _parentWithError: string = '0';
    private _isExpandError: boolean = true;
    private _isMoreError: boolean = true;

    query(filter: Query<IFilter>): Promise<DataSet> {
        const parent = filter && filter.getWhere() && (filter.getWhere() as IFilter).parent;

        if (parent === this._parentWithError && this._isExpandError) {
            // При первом раскрытии узла возвращаем ошибку.
            this._isExpandError = false;
            return Promise.reject(new fetch.Errors.HTTP({
                httpError: 403,
                message: '403',
                url: ''
            }));
        }

        if (parent === this._parentWithError && filter && filter.getOffset() > 0 && this._isMoreError) {
            // При первом нажатии "Ещё" возвращаем ошибку.
            this._isMoreError = false;
            return Promise.reject(new fetch.Errors.HTTP({
                httpError: 503,
                message: '503',
                url: ''
            }));
        }

        return super.query(filter);
    }
}

export default class extends Control {
    protected _template: TemplateFunction = template;
    protected _source: TestSource = new TestSource({
        keyProperty: 'id',
        data: [{
            id: '0',
            parent: null,
            title: 'Раскрывается со второй попытки',
            node: true
        }, {
            id: '1',
            parent: '0',
            title: 'Элемент 1',
            node: null
        }, {
            id: '2',
            parent: '0',
            title: 'Элемент 2',
            node: null
        }, {
            id: '3',
            parent: '0',
            title: 'Элемент 3',
            node: null
        }]
    });
}
