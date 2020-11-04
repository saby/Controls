import {Control, TemplateFunction} from "UI/Base";
import {Memory} from 'Types/source';
import {_companies} from 'Controls-demo/Lookup/DemoHelpers/DataCatalog';
import * as MemorySourceFilter from 'Controls-demo/Utils/MemorySourceFilter';
import {factory} from 'Types/chain';
import controlTemplate = require('wml!Controls-demo/Lookup/Selector/Index');
import selectorTemplate = require('Controls-demo/Lookup/FlatListSelector/FlatListSelector');
import selectorTemplateWithTabs = require('Controls-demo/Lookup/FlatListSelectorWithTabs/FlatListSelectorWithTabs');

export default class extends Control {
   protected _template: TemplateFunction = controlTemplate;
   protected _source: Memory = null;
   protected _tabSource: Memory = null;
   protected _listSource: Memory = null;
   protected _switchableAreaItems: any = null;
   protected _text: string =  'Выбраны ключи: ';
   protected _selectedKeys2: any = null;
   protected _selectorTemplate: object = null;
   protected _selectorTemplateWithTabs: object = null;

   private _textMultiply: string;
   private _textMultiply2: string;
   private _textMultiply3: string;
   private _textSingle1: string;

   protected _beforeMount() {
      this._source = new Memory({
         data: _companies,
         filter: function(item, queryFilter) {
            var selectionFilterFn = function(item, filter) {
               var isSelected = false;
               var itemId = item.get('id');

               filter.selection.get('marked').forEach(function(selectedId) {
                  if (selectedId === itemId || (selectedId === null && filter.selection.get('excluded').indexOf(itemId) === -1)) {
                     isSelected = true;
                  }
               });

               return isSelected;
            };
            var normalFilterFn = MemorySourceFilter();
            return queryFilter.selection ? selectionFilterFn(item, queryFilter) : normalFilterFn(item, queryFilter);
         },
         idProperty: 'id'
      });
      this._sourceButton = new Memory({
         data: _companies,
         idProperty: 'id'
      });

      this._selectedKeys = [];
      this._selectedKeys2 = ['Сбербанк-Финанс, ООО', 'Петросоюз-Континент, ООО'];
      this._selectedKeys3 = [];
      this._selectedKeys4 = [];
      this._selectedKeys5 = [];
      this._selectedKeys6 = ['Альфа Директ сервис, ОАО'];
      this._selectedKeysAll = factory(_companies).map(function(item) {
         return item.id;
      }).value();
      this._selectedKeysAll2 = this._selectedKeysAll.slice();
      this._selectorTemplate = {
         templateName: selectorTemplate,
         templateOptions: {
            headingCaption: 'Выберите организацию (+длинный текст для проверки, что caption обрезается)'
         },
         popupOptions: {
            width: 600
         }
      };
      this._selectorTemplateWithTabs = {
         templateName: selectorTemplateWithTabs,
         popupOptions: {
            width: 770
         },
         templateOptions: {
            multiSelect: true,
            source: this._source
         }
      };
   }

   protected selectedKeysChanged1(e, key) {
      this._textSingle1 = 'Выбран ключ: ' + key;
   }

   protected selectedKeysChanged2(e, keys) {
      this._textMultiply = 'Выбраны ключи: ' + keys.join(', ');
   }

   protected selectedKeysChanged3(e, keys) {
      this._textMultiply2 = 'Выбраны ключи: ' + keys.join(', ');
   }

   protected selectedKeysChanged4(e, keys) {
      this._textMultiply3 = 'Выбраны ключи: ' + keys.join(', ');
   }

   static _styles: string[] = ['Controls-demo/Controls-demo', 'Controls-demo/Lookup/Index'];
}
