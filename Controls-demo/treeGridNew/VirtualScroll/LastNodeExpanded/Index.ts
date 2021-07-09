import {Control, TemplateFunction} from 'UI/Base';
import {HierarchicalMemory} from 'Types/source';
import {Guid, Model} from 'Types/entity';

import { IColumn, TColspanCallbackResult } from 'Controls/grid';

import {generateData, getColumns} from './DataCatalog';

import * as Template from 'wml!Controls-demo/treeGridNew/VirtualScroll/LastNodeExpanded/LastNodeExpanded';

export default class extends Control {
   protected _template: TemplateFunction = Template;
   protected _viewSource: HierarchicalMemory;
   protected _columns: IColumn[] = getColumns();

   protected _beforeMount(): void {
      const sourceData = generateData();
      this._viewSource = new HierarchicalMemory({
         keyProperty: 'key',
         parentProperty: 'parent',
         data: sourceData
      });
   }

   protected _colspanCallback(item, column, columnIndex, isEditing): TColspanCallbackResult {
      return 'end';
   }

   protected _beginAdd(): void {
      const guid = Guid.create();
      this._children.list.beginAdd({
         item: new Model({
            keyProperty: 'key',
            rawData: {
               key: guid,
               title: `Запись первого уровня с id = ${guid}. Отменяет поведение скролла вместо кнопки "Ещё".`,
               parent: null,
               type: null
            }
         })
      }).then(() => {
         this._children.list.commitEdit();
      });
   }

   static _styles: string[] = ['Controls-demo/Controls-demo'];
}
