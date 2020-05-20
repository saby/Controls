define('Controls-demo/Input/Suggest/Suggest', [
   'Core/Control',
   'wml!Controls-demo/Input/Suggest/Suggest',
   'Types/source',
   'wml!Controls-demo/Input/Suggest/resources/SuggestTemplate',
], function(Control, template, sourceLib, myTmpl) {

   'use strict';
   var _private = {
      createMemory: function(self) {
         var cfg = {};
         if (self._filter) {
            cfg.filter = function(record, filter) {
               if (record.get('title').indexOf(filter.title) !== -1) {
                  return true;
               }
            };
         }
         if (self._resources === 'women') {
            cfg.data = self.sourceData;
         } else {
            cfg.data = self.secondData;
         }
         cfg.keyProperty = 'id';
         self._source = new sourceLib.Memory(cfg);
      }
   };
   var VDomSuggest = Control.extend({
      _template: template,
      _source: null,
      _suggestValue: '',
      _myTmpl: myTmpl,
      _tagStyle: 'success',
      _events: '',
      _trim: false,
      _flag: 'custom',
      _resources: 'women',
      _constraint: '',
      _placeholder: 'Input..',
      _minSearchLength: 1,
      _maxLength: 10,
      _displayProperty: 'title',
      _keyProperty: 'id',
      _searchParam: 'title',
      _footer: true,
      _filter: true,
      _selectOnClick: false,
      _readOnly: false,
      _pageSize: '2',
      _page: '0',
      _parameters: null,
      _itemTpl: null,
      _items: null,
      _sourceData: null,
      sourceData: null,
      secondData: null,
      _beforeMount: function() {
         this.secondData = [
            {id: 1, title: 'Dmitry', age: '23', currentTab: 1},
            {id: 2, title: 'Andrey', age: '24', currentTab: 1},
            {id: 3, title: 'Aleksey', age: '26', currentTab: 1},
            {id: 4, title: 'Ivan', age: '23', currentTab: 1},
            {id: 5, title: 'Petr', age: '22', currentTab: 1},
            {id: 6, title: 'Roman', age: '21', currentTab: 1},
            {id: 7, title: 'Maxim', age: '34', currentTab: 1},
            {id: 8, title: 'Andrey', age: '25', currentTab: 1},
            {id: 9, title: 'Maxim', age: '22', currentTab: 2},
            {id: 10, title: 'Sasha', age: '23', currentTab: 1},
            {id: 11, title: 'Andrey', age: '29', currentTab: 1},
            {id: 12, title: 'Andrey', age: '27', currentTab: 1},
            {id: 13, title: 'Aleksey', age: '26', currentTab: 1},
            {id: 14, title: 'Ivan', age: '25', currentTab: 1},
            {id: 15, title: 'Petr', age: '24', currentTab: 1},
            {id: 16, title: 'Roman', age: '29', currentTab: 1},
            {id: 17, title: 'Maxim', age: '24', currentTab: 1},
            {id: 18, title: 'Andrey', age: '24', currentTab: 1},
            {id: 19, title: 'Andrey', age: '27', currentTab: 1},
            {id: 20, title: 'Aleksey', age: '26', currentTab: 1},
            {id: 21, title: 'Dmitry', age: '26', currentTab: 1},
            {id: 22, title: 'Andrey', age: '22', currentTab: 1},
            {id: 23, title: 'Aleksey', age: '26', currentTab: 1},
         ];
         this.sourceData = [
            {id: 1, title: 'Anna', age: '22', currentTab: 1},
            {id: 2, title: 'Sasha', age: '27', currentTab: 1},
            {id: 3, title: 'Anna', age: '29', currentTab: 1},
            {id: 4, title: 'Maria', age: '27', currentTab: 1},
            {id: 5, title: 'Bella', age: '24', currentTab: 2},
            {id: 6, title: 'Maria', age: '22', currentTab: 2},
            {id: 7, title: 'Anna', age: '26', currentTab: 2},
            {id: 8, title: 'Sasha', age: '26', currentTab: 1},
            {id: 9, title: 'Sasha', age: '26', currentTab: 1},
            {id: 10, title: 'Maria', age: '25', currentTab: 1},
            {id: 11, title: 'Sasha', age: '22', currentTab: 1},
            {id: 12, title: 'Maria', age: '23', currentTab: 1},
            {id: 13, title: 'Sasha', age: '24', currentTab: 1},
            {id: 14, title: 'Bella', age: '21', currentTab: 1},
            {id: 15, title: 'Anna', age: '27', currentTab: 1},
            {id: 16, title: 'Maria', age: '25', currentTab: 1},
            {id: 17, title: 'Sasha', age: '23', currentTab: 1},
            {id: 18, title: 'Sasha', age: '23', currentTab: 1},
            {id: 19, title: 'Bella', age: '28', currentTab: 1},
            {id: 20, title: 'Bella', age: '26', currentTab: 1},
            {id: 21, title: 'Maria', age: '25', currentTab: 1},
            {id: 22, title: 'Sasha', age: '23', currentTab: 1},
            {id: 23, title: 'Sasha', age: '27', currentTab: 1},
            {id: 24, title: 'Bella', age: '22', currentTab: 1},
            {id: 25, title: 'Anna', age: '23', currentTab: 1}
         ];
         this._items = [
            {title: '[0-9]', example: 'You can use only digits'},
            {title: '[a-zA-Z]', example: 'You can use only letters'},
            {title: '[a-z]', example: 'You can use only lowercase letters'},
            {title: '[A-Z]', example: 'You can use only uppercase letters'}
         ];
         this._parameters = [
            {title: 'age'},
            {title: 'title'}
         ];
         this._itemTpl = [
            {id: '1', title: 'default'},
            {id: '2', title: 'custom'}
         ];
         this._sourceData = [
            {id: '1', title: 'men'},
            {id: '2', title: 'women'}
         ];
         this.navigationConfig = {view: 'page', source: 'page', sourceConfig: {pageSize: 2, page: 0, hasMore: false}};
         _private.createMemory(this);
      },
      _validationChangedHandler: function() {
         if (this._validationErrorsValue) {
            this._validationErrors = ['Some error'];
         } else {
            this._validationErrors = null;
         }
      },
      _kindsOfSuggest: function() { //itemTemplate
         return new sourceLib.Memory({
            keyProperty: 'id',
            data: this._itemTpl,
            filter: function(record, filter) {
               if (record.get('title').indexOf(filter.title) !== -1) {
                  return true;
               }
            }
         });
      },
      _mainSource: function() { //source
         return new sourceLib.Memory({
            keyProperty: 'id',
            filter: function(record, filter) {
               if (record.get('title').indexOf(filter.title) !== -1) {
                  return true;
               }
            },
            data: this._sourceData
         });
      },
      _props: function() { //displayProperty, keyProperty
         return new sourceLib.Memory({
            keyProperty: 'title',
            data: this._parameters,
            filter: function(record, filter) {
               if (record.get('title').indexOf(filter.title) !== -1) {
                  return true;
               }
            }
         });
      },
      _tagStyleHandler: function() {
         this._events += 'tagHover\r\n';
         this._children.infoBoxSuggest.open({
            target: this._children.suggest._container,
            message: 'Hover'
         });
      },
      _tagStyleClickHandler: function() {
         this._events += 'tagClick\r\n';
         this._children.infoBoxSuggest.open({
            target: this._children.suggest._container,
            message: 'Click'
         });
      },
      _suggestChooseHandler: function(event, tmp) {
         this._events += 'choose: ' + tmp  + '\n';
      },
      _valueChangedHandler: function(event, tmp) {
         this._events += 'valueChanged : ' + tmp  + '\n';
      },
      _inputCompletedHandler: function() {
         this._events += 'inputCompleted\r\n';
      },
      _selectedKeyChangedHandler: function(event, tmp) {
         this._events += 'selectedKeyChanged :  ' + tmp + '\n';
      },
      _beforeUpdate: function() {
         _private.createMemory(this);
      }
   });
   VDomSuggest._styles = ['Controls-demo/Input/Suggest/Suggest', 'Controls-demo/Input/resources/VdomInputs'];

   return VDomSuggest;
});
