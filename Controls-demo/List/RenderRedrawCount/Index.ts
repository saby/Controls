import { Control, TemplateFunction } from 'UI/Base';
import template = require('wml!Controls-demo/List/RenderRedrawCount/RenderRedrawCount');

import { Memory } from 'Types/source';
import { debounce } from 'Types/function';

interface IListItem {
    key: number;
    title: string;
}

const LIST_ITEMS_COUNT = 180;
const COUNTERS_REQUERY_DELAY = 200;

export default class RenderRedrawDemo extends Control {
    protected _template: TemplateFunction = template;

    private _nextKey: number = 0;

    protected _viewSource: Memory;
    protected _navigation: any;

    private _counters = [];

    private _debouncedRedrawCounters: Function;

    protected _beforeMount(): void {
        this._viewSource = new Memory({
            keyProperty: 'key',
            data: this._generateListItems(LIST_ITEMS_COUNT)
        });
        this._navigation = {
            source: 'page',
            view: 'infinity',
            sourceConfig: {
                page: 0,
                pageSize: 60,
                hasMore: false
            }
        };
        this._debouncedRedrawCounters = debounce(this._redrawCounters, COUNTERS_REQUERY_DELAY);
    }

    protected _afterMount(): void {
        const baseControl = this._children.listView._children.listControl._children.baseControl;
        const model = baseControl.getViewModel();

        const originalAfterUpdate = baseControl._afterUpdate;
        baseControl._afterUpdate = (...args) => {
            originalAfterUpdate.apply(baseControl, args);
            this._debouncedRedrawCounters(model);
        };
    }

    protected _redrawCounters(model): void {
        this._counters =
            model.getItemCounters()
                .map((item, index) => {
                    const oldCount = this._counters[index] && this._counters[index].count;
                    const newCount = item.counters.ItemTemplate;
                    return {
                        key: item.key,
                        count: newCount,
                        updated: oldCount !== newCount
                    };
                })
                .filter((item) => !!item.count);
    }

    private _generateListItems(count: number): IListItem[] {
        const result = [];
        while (count--) {
            result.push(this._generateListItem());
        }
        return result;
    }

    private _generateListItem(): IListItem {
        const key = this._nextKey++;
        return {
            key,
            title: `${key} list element`
        };
    }
}
