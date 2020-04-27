
define('Controls-demo/RadioGroup/RadioGroupDemo', [
   'Core/Control',
   'wml!Controls-demo/RadioGroup/RadioGroupDemo',
   'Types/source',
   'wml!Controls-demo/RadioGroup/resources/RadioItemTemplate',
   'wml!Controls-demo/RadioGroup/resources/SingleItemTemplate',
   'wml!Controls-demo/RadioGroup/resources/ContentTemplate',
   'Types/collection'// Удалить после мержа https://online.sbis.ru/opendoc.html?guid=6989b29a-8e1d-4c3b-bb7d-23b09736ef2c
], function(Control,
             template,
             sourceLib
) {
   'use strict';
   var RadioGroupDemo = Control.extend({
      _template: template,
      _source: null,
      _sourceOfSource: null,
      _selectKey: null,
      _selectedSource: 'source',
      _selectedDirection: 'vertical',
      _directionSource: null,
      _sourceContentTemplate: null,
      _selectedContentTemplate: 'default',
      _contentTemplate: '',
      _eventName: 'no event',
      source2: null,
      _displayProperty: 'title',
      _beforeMount: function() {
         this.source2 = new sourceLib.Memory({
            keyProperty: 'id',
            data: [
               {
                  id: '1',
                  title: 'Header1',
                  caption: 'Caption1'
               },
               {
                  id: '2',
                  title: 'Header2',
                  caption: 'Caption2'
               },
               {
                  id: '3',
                  title: 'Header3',
                  caption: 'Caption3'
               },
               {
                  id: '4',
                  title: 'Header4',
                  caption: 'Caption4'
               }
            ]
         });
         this._source = new sourceLib.Memory({
            keyProperty: 'id',
            displayProperty: 'caption',
            data: [
               {
                  id: '1',
                  title: 'Title1',
                  caption: 'Additional caption1'
               },
               {
                  id: '2',
                  title: 'Title2',
                  caption: 'Additional caption2'
               },
               {
                  id: '3',
                  title: 'Title3',
                  templateTwo: 'wml!Controls-demo/RadioGroup/resources/SingleItemTemplate',
                  caption: 'Additional caption3'
               },
               {
                  id: '4',
                  title: 'Title4',
                  caption: 'Additional caption4'
               },
               {
                  id: '5',
                  title: 'Title5',
                  caption: 'Additional caption5'
               },
               {
                  id: '6',
                  title: 'Title6',
                  caption: 'Additional caption6'
               }
            ]
         });
         this._sourceOfSource = new sourceLib.Memory({
            keyProperty: 'title',
            data: [
               {
                  title: 'source',
                  source: this.source
               },
               {
                  title: 'source2',
                  source: this.source2
               }
            ]
         });
         this._directionSource = new sourceLib.Memory({
            keyProperty: 'title',
            data: [
               {
                  title: 'horizontal'
               },
               {
                  title: 'vertical'
               }
            ]
         });
         this._sourceContentTemplate = new sourceLib.Memory({
            keyProperty: 'title',
            data: [
               {
                  title: 'default',
                  template: ''
               },
               {
                  title: 'custom',
                  template: 'wml!Controls-demo/RadioGroup/resources/ContentTemplate'
               }
            ]
         });
      },
      changeKey: function(e, key) {
         this._selectKey = key;
         this._eventName = 'selectedKeyChanged';
      },
      changeSource: function(e, key) {
         this._selectedSource = key;
         var self = this;
         this._sourceOfSource.read(key).addCallback(function(model) {
            self._source = model.get('source');
            self._forceUpdate();
         });
      },
      changeDirection: function(e, key) {
         this._selectedDirection = key;
      },
      changeContentTemplate: function(e, key) {
         this._selectedContentTemplate = key;
         var self = this;
         this._sourceContentTemplate.read(key).addCallback(function(model) {
            self._contentTemplate = model.get('template');
            self._forceUpdate();
         });
      },
      changeSelectedKey: function(e, key) {
         this._selectKey = key;
      },
      changedDisplayProperty: function(e, displayPropertyValue) {
         this._displayProperty = (displayPropertyValue ? 'caption' : 'title');
      },
      reset: function() {
         this._eventName = 'no event';
      }
   });
   RadioGroupDemo._styles = ['Controls-demo/RadioGroup/RadioGroupDemo', 'Controls-demo/Headers/resetButton'];

   return RadioGroupDemo;
});
