import {DataSet, Memory, Query} from 'Types/source';

interface IItem {
    key: number;
    title: string;
}

export default class PositionSourceMemory extends Memory {
    query(query?: Query<unknown>): Promise<DataSet> {
        const filter = query.getWhere();
        const limit = query.getLimit();

        const isSearch = query.getWhere().title !== undefined;
        const isPrepend = typeof filter['key<='] !== 'undefined';
        const isPosition = typeof filter['key~'] !== 'undefined';
        let position = filter['key<='] || filter['key>='] || filter['key~'] || 0;

        if (isPrepend) {
            position -= limit;
        }

        if (!isSearch) {
            const items = this._getItems(position, limit);
            const result = this._prepareQueryResult({
                items,
                meta: {
                    total: isPosition ? { before: true, after: true } : true
                }
            }, null);
            return Promise.resolve(result);
        } else {
            return this._getSearchItems(position)
                .then((items) => this._prepareQueryResult({
                    items,
                    meta: {
                        total: isPosition ? { before: true, after: true } : true,
                        iterative: true
                    }
                }, null)
            );
        }
    }

    private _getItems(position: number, limit: number): IItem[] {
        const items: IItem[] = [];

        for (let i = 0; i < limit; i++, position++) {
            items.push({
                key: position,
                title: `Запись #${position}`
            });
        }

        return items;
    }

    private _getSearchItems(position: number): Promise<IItem[]> {
        return new Promise((resolve) => {
            setTimeout(() => {
                const items = this._getItems(position, 3);
                resolve(items);
            }, 2500);
        });
    }
}