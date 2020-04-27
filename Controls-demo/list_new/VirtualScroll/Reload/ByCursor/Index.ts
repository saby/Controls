import {Control, TemplateFunction} from 'UI/Base';
import * as template from 'wml!Controls-demo/list_new/VirtualScroll/Reload/ByCursor/ByCursor';
import {DataSet, Memory, Query} from 'Types/source';

interface IItem {
    id: number;
    title: string;
}

class PositionSourceMock extends Memory {
    query(query?: Query<unknown>): Promise<DataSet> {
        const filter = query.getWhere();
        const limit = query.getLimit();

        const isPrepend = typeof filter['id<='] !== 'undefined';
        const isAppend = typeof filter['id>='] !== 'undefined';
        const isPosition = typeof filter['id~'] !== 'undefined';
        const items: IItem[] = [];
        let position = filter['id<='] || filter['id>='] || filter['id~'] || 0;

        if (isPrepend) {
            position -= limit;
        }

        for (let i = 0; i < limit; i++, position++) {
            items.push({
                id: position,
                title: `Запись #${position}`
            });
        }

        return Promise.resolve(this._prepareQueryResult({
            items,
            meta: {
                total: isPosition ? { before: true, after: true } : true
            }
        }, null));
    }
}

export default class extends Control {
    protected _template: TemplateFunction = template;
    protected _source: PositionSourceMock;
    protected _position: number = 0;

    protected _beforeMount(): void {
        this._source = new PositionSourceMock({keyProperty: 'id'});
    }

    protected _changePosition(): void {
        this._position = 60;
        // @ts-ignore
        this._children.list.reload();
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
