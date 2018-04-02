define('Controls/Filter/FastFilter',
   [
      'Core/Control',
      'Controls/Dropdown/DropdownUtils',
      'tmpl!Controls/Filter/FastFilter/FastFilter',
      'Controls/Controllers/SourceController',
      'WS.Data/Chain',
      'WS.Data/Collection/RecordSet',
      'Core/core-instance',
      'Core/ParallelDeferred',
      'Core/Deferred',
      'css!Controls/Filter/FastFilter/FastFilter',
      'css!Controls/Input/Dropdown/Dropdown'

   ],
   function (Control, DropdownUtils, template, SourceController, Chain, RecordSet, cInstance, pDeferred, Deferred) {

      'use strict';

      /**
       *
       * @class Controls/Filter/FastData
       * @extends Controls/Control
       * @control
       * @public
       * @author Золотова Э.Е.
       */
      var _private = {

         getSourceController: function (source) {
            return new SourceController({
               source: source
            });
         },

         prepareItems: function (self, items, idProperty) {
            if (!cInstance.instanceOfModule(items, 'WS.Data/Collection/RecordSet')) {
               self._items = new RecordSet({
                  rawData: items,
                  idProperty: idProperty
               });
            } else {
               self._items = items;
            }
         },

         loadItems: function (self, item, index) {
            var properties = item.get('properties');

            self._configs[index] = {};
            self._configs[index].keyProperty = properties.keyProperty;
            self._configs[index].displayProperty = properties.displayProperty || 'title';

            if (properties.items) {
               _private.prepareItems(self._configs[index], properties.items, properties.keyProperty);
               return Deferred.success(self._configs[index]._items);
            } else if (properties.source) {
               var dSource = {
                  source: properties.source,
                  idProperty: properties.keyProperty
               };
               return DropdownUtils.loadItems(self._configs[index], dSource).addCallback(function () {
               });
            }
         },

         reload: function (self) {
            var pDef = new pDeferred();
            Chain(self._items).each(function (item, index) {
               var result = _private.loadItems(self, item, index);
               pDef.push(result);
            });
            //Сначала загрузим все списки, чтобы не вызывать морганий интерфейса и множества перерисовок
            return pDef.done().getResult().addCallback(function () {
               self._forceUpdate();
            });
         },

         getFilter: function (items) {
            var filter = {};
            Chain(items).each(function (item) {
               if (item.get('value') !== item.get('resetValue')) {
                  filter[item.get('id')] = item.get('value');
               }
            });
            return filter;
         },

         selectItem: function (item) {
            //Получаем ключ выбранного элемента
            var key = item.get(this._configs[this.lastOpenIndex].keyProperty);
            this._items.at(this.lastOpenIndex).set({value: key});
            this._notify('selectedKeysChanged', [key]);
         },

         onResult: function (args) {
            var actionName = args[0];
            var data = args[2];
            if (actionName === 'itemClick') {
               _private.selectItem.apply(this, data);
               this._notify('filterChanged', [_private.getFilter(this._items)], {bubbling: true});
               this._children.DropdownOpener.close();
            }
         }
      };

      var FastData = Control.extend({
         _template: template,
         _configs: null,
         _items: null,

         constructor: function () {
            FastData.superclass.constructor.apply(this, arguments);

            this._configs = {};
            this._items = [];

            this._onResult = _private.onResult.bind(this);
         },

         _beforeMount: function (options) {
            var self = this,
               resultDef;
            if (options.items) {
               _private.prepareItems(this, options.items);
               resultDef = _private.reload(this);
            } else if (options.source) {
               resultDef = _private.getSourceController(options.source).load().addCallback(function (items) {
                  self._items = items;
                  return _private.reload(self);
               });
            }
            return resultDef;
         },

         _open: function (event, item, index) {
            var config = {
               componentOptions: {
                  items: this._configs[index]._items,
                  keyProperty: this._configs[index].keyProperty,
                  parentProperty: item.get('parentProperty'),
                  nodeProperty: item.get('nodeProperty'),
                  itemTemplateProperty: item.get('itemTemplateProperty'),
                  itemTemplate: item.get('itemTemplate'),
                  headTemplate: item.get('headTemplate'),
                  footerTemplate: item.get('footerTemplate'),
                  selectedKeys: this._items.at(index).get('value') || this._items.at(index).get('resetValue')
               },
               target: event.target.parentElement
            };
            //Сохраняем индекс последнего открытого списка. Чтобы получить список в selectItem
            this.lastOpenIndex = index;
            this._children.DropdownOpener.open(config, this);
         },

         _getText: function (item, index) {
            if (this._configs[index]._items) {
               var sKey = this._items.at(index).get('value') || this._items.at(index).get('resetValue');
               return this._configs[index]._items.getRecordById(sKey).get(this._configs[index].displayProperty);
            }
         },

         _reset: function (event, item, index) {
            var newValue = this._items.at(index).get('resetValue');
            this._items.at(index).set({value: newValue});
            this._notify('selectedKeysChanged', [newValue]);
            this._notify('filterChanged', [_private.getFilter(this._items)], {bubbling: true});
         }
      });

      FastData._private = _private;
      return FastData;
   }
);