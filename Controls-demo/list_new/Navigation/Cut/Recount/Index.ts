import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import {CrudEntityKey, DataSet, Memory, Query} from 'Types/source';
import {INavigationOptionValue, INavigationPageSourceConfig} from 'Controls/interface';
import * as template from 'wml!Controls-demo/list_new/Navigation/Cut/Recount/Recount';
import {RecordSet} from "Types/collection";
import {Model} from "Types/entity";

interface IItem {
    key: number;
    title: string;
}

class SortingMemory extends Memory {
    query(query?: Query): Promise<DataSet> {
        // берем элементы с конца, чтобы добавленные элементы были в начале списка,
        // как это нужно в стандартах
        const countAllItems = this.data.length;
        query.offset(countAllItems - query.getLimit());

        return super.query(query).then((dataSet) => {
            const newData: {items: IItem[], meta: any} = {...dataSet.getRawData()};
            // сортируем элементы в обратном порядке, чтобы добавленные элементы были в начале списка,
            // как это нужно в стандартах
            newData.items = newData.items.sort((a, b) => b.key - a.key)
                .filter((it) => !!it);
            return this._prepareQueryResult(newData, query);
        });
    }
}

export default class Index extends Control {
   protected _template: TemplateFunction = template;
   protected _source: SortingMemory;
   protected _navigation: INavigationOptionValue<INavigationPageSourceConfig>;
   private _items: RecordSet;
   private _newKey: number = 3;

   constructor(options: IControlOptions) {
       super(options);
       this._itemsReadyCallback = this._itemsReadyCallback.bind(this);
   }

   protected _beforeMount(): void {
        this._source = new SortingMemory({
            keyProperty: 'key',
            data: [
                {key: 1, title: `Запись #1`},
                {key: 2, title: `Запись #2`},
                {key: 3, title: `Запись #3`}
            ]
        });
        this._navigation = {
            source: 'page',
            view: 'cut',
            sourceConfig: {
                pageSize: 3,
                hasMore: false,
                page: 0
            }
        };
   }

   protected _itemsReadyCallback(items: RecordSet): void {
       this._items = items;
   }

   protected _onAddItem(): void {
       this._newKey++;
       const newItem = new Model({
           keyProperty: 'key',
           rawData: { key: this._newKey, title: `Запись #${this._newKey}` }
       });
       this._source.update(newItem).then(() => this._items.add(newItem, 0));
   }

   protected _onRemoveItemByStart(): void {
       const firstItemKey = this._items.at(0).getKey();
       this._children.list.removeItems({selected: [firstItemKey], excluded: []})
           .then(() => this._children.list.reload());
   }

   protected _onRemoveItemByEnd(): void {
       const lastIndex = this._items.getCount() - 1;
       const lastItemKey = this._items.at(lastIndex).getKey();
       this._children.list.removeItems({selected: [lastItemKey], excluded: []})
           .then(() => this._children.list.reload());
   }

   static _styles: string[] = ['Controls-demo/Controls-demo'];
}
