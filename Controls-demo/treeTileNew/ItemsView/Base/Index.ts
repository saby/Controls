// tslint:disable-next-line:ban-ts-ignore
// @ts-ignore
import * as Template from 'wml!Controls-demo/treeTileNew/ItemsView/Base/Index';
import {Control, TemplateFunction} from 'UI/Base';
import {Gadgets, IData} from 'Controls-demo/Explorer_new/DataHelpers/DataCatalog';
import {RecordSet} from 'Types/collection';
import {Model} from 'Types/entity';
import { SyntheticEvent } from 'UICommon/Events';

export default class extends Control {
   protected _template: TemplateFunction = Template;
   protected _items: RecordSet;
   protected _root: number = null;

   private _lastId: number;

   protected _beforeMount(): void {
      this._resetItems();
   }

   _onItemClick(event: SyntheticEvent, item: Model): void {
      if (!item.get('parent@')) {
         return;
      }

      this._root = item.getKey();
   }

   protected _addLeaf(): void {
      this._items.append(
          [
              new Model({
                 keyProperty: 'id',
                 rawData: this._generateLeafData()
              })
          ]
      );
   }

   protected _addNode(): void {
      const nodesIndexes = this._items.getIndicesByValue('parent@', true);
      const lastNodeIndex = nodesIndexes.length ? (nodesIndexes[nodesIndexes.length - 1] + 1) : 0;

      this._items.add(
          new Model({
             keyProperty: 'id',
             rawData: this._generateNodeData()
          }),
          lastNodeIndex
      );
   }

   protected _resetItems(): void {
      this._lastId = 1000;
      this._items = new RecordSet({
         keyProperty: 'id',
         rawData: Gadgets.getData()
      });
   }

   private _generateLeafData(): IData {
      const id = ++this._lastId;

      return {
         id,
         parent: null,
         'parent@': null,
         title: `Leaf item with id ${id}`,
         group: 'Файлы',
         isDocument: true,
         discr: '5',
         price: 123
      };
   }

   private _generateNodeData(): IData {
      const data = this._generateLeafData();
      data['parent@'] = true;
      data.title = `Node item with id ${data.id}`;

      return data;
   }

   static _styles: string[] = ['Controls-demo/Controls-demo'];
}
