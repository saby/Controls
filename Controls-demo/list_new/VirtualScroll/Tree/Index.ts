import {Control, TemplateFunction} from 'UI/Base';
import * as template from 'wml!Controls-demo/list_new/VirtualScroll/Tree/Tree';
import {DataSet, Memory, Query} from 'Types/source';

interface IItem {
    id: number;
    title: string;
    node: boolean;
    parent: number;
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
        const originPosition = position;
        position += filter.parent || 0;

        if (isPrepend) {
            position -= limit;
        }

        for (let i = 0; i < limit; i++, position++) {
            items.push({
                id: position,
                title: `Запись #${position}`,
                parent: position > 20 ? 20 : undefined,
                node: position === 20 ? true : null
            });
        }

        return Promise.resolve(this._prepareQueryResult({
            items,
            meta: {
                total: isPosition ? { before: true, after: true } : originPosition <= 20
            }
        }, null));
    }
}

export default class extends Control {
    protected _template: TemplateFunction = template;
    static _styles: string[] = ['Controls-demo/Controls-demo'];
    protected _source: PositionSourceMock;

    protected _beforeMount(): void {
        this._source = new PositionSourceMock({ keyProperty: 'id' });
    }
}
