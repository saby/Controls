import { Control, TemplateFunction } from 'UI/Base';
import template = require('wml!Controls-demo/List/ScrollToEnd/ScrollToEnd');
import { Memory } from 'Types/source';
import {CursorDirection} from 'Controls/list';

const ITEMS_COUNT = 1000;
const PAGE_SIZE = 40;

export default class ScrollToEnd extends Control {
    protected _template: TemplateFunction = template;

    protected _viewSourcePage: Memory;
    protected _navigationPage = {
        source: 'page',
        view: 'infinity',
        sourceConfig: {
            pageSize: PAGE_SIZE,
            direction: CursorDirection.bothways,
            page: 0,
            hasMore: false
        },
        viewConfig: {
            pagingMode: 'basic',
            showEndButton: true
        }
    };

    protected _viewSourcePosition: Memory;
    protected _navigationPosition = {
        source: 'position',
        view: 'infinity',
        sourceConfig: {
            limit: PAGE_SIZE,
            field: 'id',
            position: 0,
            direction: CursorDirection.bothways
        },
        viewConfig: {
            pagingMode: 'basic',
            showEndButton: true
        }
    };

    protected _beforeMount() {
        this._viewSourcePage = new Memory({
            keyProperty: 'id',
            data: this._createItems(ITEMS_COUNT)
        });

        this._viewSourcePosition = new Memory({
            keyProperty: 'id',
            data: this._createItems(ITEMS_COUNT),
            filter: (item, filter) => {
                // MemorySource не умеет работать с навигацией по курсору,
                // эмулируем это поведение фильтром
                if (!filter) {
                    return true;
                }

                const id = item.get('id');
                let rangeStart = 0;
                let rangeEnd = ITEMS_COUNT;

                if (typeof filter['id>='] !== 'undefined') {
                    rangeStart = filter['id>='];
                    rangeEnd = rangeStart + PAGE_SIZE;
                } else if (typeof filter['id<='] !== 'undefined') {
                    rangeEnd = filter['id<='];
                    rangeStart = rangeEnd - PAGE_SIZE;
                } else if (typeof filter._lastPage !== 'undefined') {
                    rangeEnd = ITEMS_COUNT;
                    rangeStart = rangeEnd - PAGE_SIZE;
                }

                return id >= rangeStart && id <= rangeEnd;
            }
        });
        const originalQueryFn = this._viewSourcePosition.query;
        this._viewSourcePosition.query = function(cursorQuery) {
            // MemorySource не работает с отрицательными offset'ами,
            // для демо выставим флаг последней страницы, который проверим
            // в фильтре
            if (cursorQuery.getOffset() === -1) {
                cursorQuery
                    .offset(0)
                    .where({
                        ...cursorQuery.getWhere(),
                        _lastPage: true
                    });
            }
            return originalQueryFn.apply(this, arguments).then((result) => {
                const resultData = result.getRawData();

                const nextKey = resultData.items[resultData.items.length - 1].id + 1;
                const prevKey = resultData.items[0].id - 1;

                // Чтобы правильно работала навигация по курсору, нужно выставить
                // ключи предыдущей/следующей записи и наличие оставшихся записей
                const filter = cursorQuery.getWhere() || {};
                if (typeof filter['id>='] !== 'undefined') {
                    resultData.meta.more = nextKey < ITEMS_COUNT;
                    resultData.meta.nextPosition = nextKey < ITEMS_COUNT ? [nextKey] : [];
                } else if (typeof filter['id<='] !== 'undefined') {
                    resultData.meta.more = prevKey >= 0;
                    resultData.meta.nextPosition = prevKey >= 0 ? [prevKey] : [];
                } else {
                    resultData.meta.more = {
                        before: prevKey >= 0,
                        after: nextKey < ITEMS_COUNT
                    };
                    resultData.meta.nextPosition = {
                        before: prevKey >= 0 ? [prevKey] : [],
                        after: nextKey < ITEMS_COUNT ? [nextKey] : []
                    };
                }
                return result;
            });
        };
    }

    private _createItems(count: number): unknown[] {
        const items = [];
        while (count--) {
            items.unshift({
                id: count,
                title: `item #${count}`
            });
        }
        return items;
    }
}
