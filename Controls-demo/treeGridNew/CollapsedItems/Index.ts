import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/treeGridNew/CollapsedItems/CollapsedItems';
import {CrudEntityKey, HierarchicalMemory} from 'Types/source';
import {Gadgets} from '../DemoHelpers/DataCatalog';
import { IColumn } from 'Controls/grid';

export default class extends Control {
   protected _template: TemplateFunction = Template;
   protected _viewSource: HierarchicalMemory;
   protected _columns: IColumn[] = Gadgets.getColumnsForFlat();
   protected _collapsedItems: CrudEntityKey[] = [1];
   protected _expandedItems: CrudEntityKey[] = [null];

   protected _beforeMount(): void {
      const data = [
         {
            id: 1, title: 'Node', Раздел: null, 'Раздел@': true, Раздел$: null, hasChild: true
         }, {
            id: 11, title: 'Node', Раздел: 1, 'Раздел@': true, Раздел$: null
         }, {
            id: 111, title: 'Leaf', Раздел: 11, 'Раздел@': null, Раздел$: null
         }, {
            id: 12, title: 'Hidden node', Раздел: 1, 'Раздел@': false, Раздел$: true, hasChild: false
         }, {
            id: 13, title: 'Leaf', Раздел: 1, 'Раздел@': null, Раздел$: null
         }, {
            id: 2, title: 'Node 2', Раздел: null, 'Раздел@': true, Раздел$: null, hasChild: true
         }, {
            id: 21, title: 'Leaf 21', Раздел: 2, 'Раздел@': null, Раздел$: null
         }, {
            id: 3, title: 'Node 3', Раздел: null, 'Раздел@': true, Раздел$: null, hasChild: false
         }, {
            id: 31, title: 'Leaf 31', Раздел: 3, 'Раздел@': null, Раздел$: null
         }
      ];

      this._viewSource = new HierarchicalMemory({
         keyProperty: 'id',
         parentProperty: 'parent',
         data
      });
   }

   static _styles: string[] = ['Controls-demo/Controls-demo'];
}
