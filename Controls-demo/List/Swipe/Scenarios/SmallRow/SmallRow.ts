import Control = require('Core/Control');
import * as template from 'wml!Controls-demo/List/Swipe/Scenarios/SmallRow/SmallRow';
// @ts-ignore
import { HierarchicalMemory } from 'Types/source';

export default class SmallRow extends Control {
   protected _template: Function = template;
   protected _itemActions: object[];
   protected _header: object[];
   protected _columns: object[];
   protected _source: HierarchicalMemory;

   _beforeMount(): void {
      this._itemActions = [
         {
            id: 1,
            icon: 'icon-PhoneNull',
            title: 'phone',
            showType: 2
         },
         {
            id: 2,
            icon: 'icon-EmptyMessage',
            title: 'message',
            showType: 2
         },
         {
            id: 3,
            icon: 'icon-Profile',
            title: 'profile',
            showType: 0
         },
         {
            id: 4,
            icon: 'icon-Erase',
            iconStyle: 'danger',
            title: 'delete',
            showType: 2
         }
      ];
      this._header = [
         {
            title: '',
            displayProperty: 'title'
         },
         {
            title: 'Ед. изм.',
            displayProperty: 'unit'
         }
      ];
      this._columns = [
         {
            displayProperty: 'title'
         },
         {
            displayProperty: 'unit',
            width: '100px'
         }
      ];
      this._source = new HierarchicalMemory({
         parentProperty: 'parent',
         nodeProperty: 'parent@',
         keyProperty: 'id',
         data: [{
            id: 0,
            title: 'Домашняя птица',
            parent: null,
            'parent@': true
         }, {
            id: 1,
            title: 'Индейка',
            unit: 'кг',
            parent: 0,
            'parent@': null
         }, {
            id: 2,
            title: 'Кура',
            unit: 'кг',
            parent: 0,
            'parent@': null
         }]
      });
   }
}
