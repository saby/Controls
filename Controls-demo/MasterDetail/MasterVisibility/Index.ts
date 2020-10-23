import {Control, TemplateFunction} from 'UI/Base';
import template = require('wml!Controls-demo/MasterDetail/MasterVisibility/Index');
import {master} from 'Controls-demo/MasterDetail/Data';
import * as cClone from 'Core/core-clone';
import {Memory} from 'Types/source';
import * as DemoSource from 'Controls-demo/MasterDetail/DemoSource';

export default class extends Control {
   protected _template: TemplateFunction = template;
   protected _markedKey: number = 0;
   protected _detailSource: Memory = null;
   protected _masterSource: Memory = null;
   protected _currentIcon: string = 'ArrangeList04';
   protected _masterVisibility: string = null;

   protected _beforeMount(): void {
      this._detailSource = new DemoSource({keyProperty: 'id'});
      this._masterSource = new Memory({
         keyProperty: 'id',
         data: cClone(master)
      });
   }

   protected _toggleMaster(): void {
      this._currentIcon = this._currentIcon === 'ArrangeList04' ? 'ArrangeList03' : 'ArrangeList04';
      this._masterVisibility = this._masterVisibility === 'hidden' ? 'visible' : 'hidden';
   }

   static _styles: string[] = ['Controls-demo/Controls-demo', 'Controls-demo/MasterDetail/Demo'];
}
