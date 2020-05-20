define('Controls-demo/Input/ComboBox/ComboBox',
   [
      'Core/Control',
      'wml!Controls-demo/Input/ComboBox/ComboBox',
      'Types/source',
      'wml!Controls-demo/Input/ComboBox/resources/ItemTemplate',
      'Controls/dropdown',
   ],
   function(Control, template, sourceLib, myTmpl) {
      'use strict';
      var _cmbSource = {
         createMemory: function(self) {
            var cfg = {};
            if (self._resources === 'coffee') {
               cfg.data = self._defaultItems;
            } else {
               cfg.data = self._customItems;
            }
            cfg.keyProperty = 'id';
            self._source = new sourceLib.Memory(cfg);
         }
      };
      var ComboBox = Control.extend({
         _template: template,
         _events: '',
         _source: null,
         _validationErrors: '',
         _validationErrorsValue: false,
         _placeholder: 'select',
         _emptyText: 'none',
         _selectedKey: '0',
         _displayProperty: 'title',
         _keyProperty: 'id',
         _tagStyle: 'primary',
         _flag: 'default',
         _myTmpl: myTmpl,
         _resources: 'coffee',
         _defaultItems: null,
         _customItems: null,
         _itemTemp: null,
         _sourceData: null,
         _parameters: null,
         _beforeMount: function() {
            this._defaultItems = [
               { id: '1', title: 'Shakerato', text: 'It is an iced coffee made by shaking espresso and ice cubes.' },
               { id: '2', title: 'Espresso Romano', text: 'It is a shot of espresso with a slice of lemon served on the side.' },
               { id: '3', title: 'Melya', text: 'It is coffee flavoured with cocoa powder and honey.' },
               { id: '4', title: 'Guillermo', text: 'Originally one or two shots of hot espresso poured over slices of lime.' },
               { id: '5', title: 'Freddo Espresso', text: 'It is a foam-covered iced coffee made from espresso.' },
               { id: '6', title: 'Palazzo', text: 'It is two shots of espresso, chilled immediately after brewing and mixed with sweetened cream.' },
               { id: '7', title: 'Frappe', text: 'Greek frappe is a foam-covered iced coffee drink made from spray-dried instant coffee.' }
            ];
            this._customItems = [
               { id: '1', title: 'Corrido', text: 'It is a popular narrative song and poetry that form a ballad.' },
               { id: '2', title: 'Heavy metal', text: 'It is characterized by loud distorted guitars, emphatic rhythms, dense bass-and-drum sound, and vigorous vocals.' },
               { id: '3', title: 'Soul', text: 'It combines elements of African-American gospel music, rhythm and blues and jazz.' },
               { id: '4', title: 'Austropop ', text: 'It comprises several musical styles, from traditional pop music to rock.' },
               { id: '5', title: 'Noise', text: 'Noise music is a category of music that is characterised by the expressive use of noise within a musical context.' },
               { id: '6', title: 'Jazz-funk', text: 'It is characterized by a strong back beat, electrified sounds and an early prevalence of analog synthesizers.' },
               { id: '7', title: 'Vispop', text: 'It is typically performed by a singer-songwriter playing an acoustic guitar, and the lyrics often expresses social commentary.' }
            ];
            this._itemTemp = [
               { id: '1', title: 'default' },
               { id: '2', title: 'custom' }
            ];
            this._sourceData = [
               { id: '1', title: 'coffee' },
               { id: '2', title: 'music' }
            ];
            this._parameters = [
               { title: 'id' },
               { title: 'title' },
               { title: 'text' }
            ];
            _cmbSource.createMemory(this);
         },
         _beforeUpdate: function() {
            _cmbSource.createMemory(this);
         },
         _selectedKeyChangedHandler: function(event, tmp) {
            this._events += 'selectedKeyChanged :  ' + tmp + '\n';
            if (tmp == null) {
               this._selectedKey = '0';
            } else {
               this._selectedKey = tmp;
            }
         },
         _tagStyleHandler: function() {
            this._events += 'tagHover\r\n';
            this._children.infoBoxComboBox.open({
               target: this._children.comboBox._container,
               message: 'Hover',
               showDelay: 1500
            });
         },
         _tagStyleClickHandler: function() {
            this._events += 'tagClick\r\n';
            this._children.infoBoxComboBox.open({
               target: this._children.comboBox._container,
               message: 'Click'
            });
         },
         _valueChangedHandler: function(event, tmp) {
            this._events += 'valueChanged : ' + tmp + '\n';
         },
         _inputCompletedHandler: function() {
            this._events += 'inputCompleted\r\n';
         },
         _validationChangedHandler: function() {
            if (this._validationErrorsValue) {
               this._validationErrors = ['Some error'];
            } else {
               this._validationErrors = null;
            }
         },
         _props: function() { // keyProperty, displayProperty
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
         _mainSource: function() { // source
            return new sourceLib.Memory({
               keyProperty: 'title',
               data: this._sourceData,
               filter: function(record, filter) {
                  if (record.get('title').indexOf(filter.title) !== -1) {
                     return true;
                  }
               }
            });
         },
         _kindsOfBox: function() { // itemTemplate
            return new sourceLib.Memory({
               keyProperty: 'id',
               data: this._itemTemp,
               filter: function(record, filter) {
                  if (record.get('title').indexOf(filter.title) !== -1) {
                     return true;
                  }
               }
            });
         }
      });
      ComboBox._styles = ['Controls-demo/Input/resources/VdomInputs'];

      return ComboBox;
   });
