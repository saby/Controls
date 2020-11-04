import { Control, TemplateFunction } from 'UI/Base';
import { Memory } from 'Types/source';
import { getData } from '../resources/DataSource';

// @ts-ignore
import template = require('wml!Controls-demo/List/HotKeysContainer/WithoutHotkeys/Template');

class ListWithoutHotKey extends Control {
   _template: TemplateFunction = template;

   protected _viewSource: Memory;

   protected _beforeMount(): void {
      this._viewSource = new Memory({
         keyProperty: 'id',
         data: getData(10)
      });
   }

}

ListWithoutHotKey._styles = ['Controls-demo/List/HotKeysContainer/resources/HotKeys'];

export default ListWithoutHotKey;
