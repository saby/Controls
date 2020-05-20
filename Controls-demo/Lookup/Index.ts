import {Control, TemplateFunction} from "UI/Base";
import {Memory} from 'Types/source';
import * as MemorySourceFilter from 'Controls-demo/Utils/MemorySourceFilter';
import {_companies, _equipment, _departmentsDataLong} from 'Controls-demo/Lookup/DemoHelpers/DataCatalog';
import controlTemplate = require('wml!Controls-demo/Lookup/Index');
import suggestTemplate = require('wml!Controls-demo/Lookup/resources/SuggestTemplate');
import selectorTemplate = require('Controls-demo/Lookup/FlatListSelector/FlatListSelector');
import selectorTemplateWithTabs = require('Controls-demo/Lookup/FlatListSelectorWithTabs/FlatListSelectorWithTabs');

export default class extends Control{
   protected _template: TemplateFunction = controlTemplate;
   protected _suggestTemplate: TemplateFunction = suggestTemplate;
   protected _selectorTemplate: TemplateFunction = null;
   protected _selectedKeyWithComment: any = ['Иванова Зинаида Михайловна, ИП'];
   protected _selectedKeyCustomPlaceholder: any = [];
   protected _selectedKeysReadOnly: any = ['Иванова Зинаида Михайловна, ИП'];
   protected _selectedKeysMultiSelectReadOnly: any = ['Иванова Зинаида Михайловна, ИП', 'Все юридические лица', 'Наша компания'];
   protected _selectedKeysMultiLineReadOnly = ['Иванова Зинаида Михайловна, ИП', 'Все юридические лица', 'Наша компания',
      'Сбербанк-Финанс, ООО', 'Петросоюз-Континент, ООО', 'Альфа Директ сервис, ОАО', 'АК "ТРАНСНЕФТЬ", ОАО', 'Ромашка, ООО'];
   protected _selectedKeyLink: any = [];
   protected _selectedKeysDirectories: any = [];
   protected _source: Memory;
   protected _navigation: object;
   protected _beforeMount() {
      this._source = new Memory({
         data: _companies,
         idProperty: 'id',
         filter: MemorySourceFilter()
      });

      this._departmentsSource = new Memory({
         data: _departmentsDataLong,
         idProperty: 'id',
         filter: MemorySourceFilter()
      });

      this._eqiupmentSource = new Memory({
         data: _equipment,
         idProperty: 'id',
         filter: MemorySourceFilter()
      });
      this._navigation = {
         source: 'page',
         view: 'page',
         sourceConfig: {
            pageSize: 2,
            page: 0,
            hasMore: false
         }
      };

      this._selectorTemplate = {
         templateName: selectorTemplate,
         templateOptions: {
            headingCaption: 'Выберите организацию (+длинный текст для проверки, что caption обрезается)'
         },
         popupOptions: {
            width: 500
         }
      };

      this._selectorTemplateWithTabs = {
         templateName: selectorTemplateWithTabs,
         popupOptions: {
            width: 500
         }
      };

      this._itemsStyle = new Memory({
         idProperty: 'id',
         data: [
            {id: 'bold', title: 'bold' },
            {id: 'accent', title: 'accent'},
            {id: 'primary', title: 'primary'}
         ]
      });
      this._itemsSize = new Memory({
         idProperty: 'id',
         data: [
            {id: 'm', title: 'm' },
            {id: 'l', title: 'l'},
            {id: 'xl', title: 'xl'},
            {id: '2xl', title: '2xl'},
            {id: '3xl', title: '3xl'}
         ]
      });

      this._selectorTemplateEqiupment = {
         templateName: selectorTemplate,
         templateOptions: {
            headingCaption: 'Выберите оборудование',
            source: this._eqiupmentSource
         },
         popupOptions: {
            width: 300
         }
      };
   }

   protected showSelectorInsideLabel() {
      this._children.lookupInsideLabel.showSelector();
   }

   protected showSelectorLabelAbove() {
      this._children.lookupLabelAbove.showSelector();
   }

   protected showSelectorLabelBeside() {
      this._children.lookupLabelBeside.showSelector();
   }

   protected _placeholderKeyCallback(selectedItems) {
      return ['manufacturer', 'category', 'model'][selectedItems.getCount()];
   }

   protected showSelector(event, selectedTab) {
      this._children.directoriesLookup.showSelector({
         templateOptions: {
            selectedTab: selectedTab
         }
      });
   }

   protected showSelectorCustomPlaceholder(event, type) {
      var
          items = this._itemsCustomPlaceholder,
          countItems = items && items.getCount(),
          parent = countItems ? items.at(countItems - 1).get('id') : null,
          templateOptions = {
             parent: parent,
             type: type,
             multiSelect: false
          };

      this._children.lookupCustomPlaceholder.showSelector({
         templateOptions: templateOptions
      });
   }

   protected showSelectorCustomPlaceholder2(event, type) {
      var
          templatesOptions = {
             company: {
                headingCaption: 'Выберите организацию (+длинный текст для проверки, что caption обрезается)',
                source:  this._source
             },
             department: {
                headingCaption: 'Выберите подразделение',
                source:  this._departmentsSource
             }
          };

      this._children.lookupCustomPlaceholder2.showSelector({
         template: selectorTemplate,
         templateOptions: templatesOptions[type]
      });
   }

   protected _itemsChanged(event, items) {
      let
          parentId,
          correctKeys = [];
      if (items.at(0) && items.at(0).get('parent')) {
         items.clear();
      } else {
         items.each(function (item) {
            correctKeys.push(item.get('id'));
            parentId = item.get('parent');
            if (parentId) {
               correctKeys.push(parentId);
            }
         });
      }
      this._selectedKeyCustomPlaceholder = correctKeys;
   }

   protected _placeholderKeyCallback2(items, linkName) {
      var placeholderKey = 'all';

      if (items && items.getCount()) {
         if (items.at(0).has('department')) {
            placeholderKey = 'company';
         } else {
            placeholderKey = 'department';
         }
      }

      return placeholderKey;
   }

   protected selectorCallback(event, currentItems, newItems) {
      var
          indexForReplace = -1,
          newItem = newItems.at(newItems.getCount() - 1),
          propName = newItem.getIdProperty() === 'id' ? 'city' : 'department';

      // Определяем, добавить элемент или заменить
      currentItems.each(function(item, index) {
         if (item.has(propName)) {
            indexForReplace = index;
         }
      });

      if (indexForReplace === - 1) {
         currentItems.add(newItem);
      } else {
         currentItems.replace(newItem, indexForReplace);
      }

      return currentItems;
   }

   static _styles: string[] = ['Controls-demo/Controls-demo'];
}
