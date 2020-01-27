define('Controls-demo/Previewer/Previewer', [
   'Core/Control',
   'Env/Env',
   'wml!Controls-demo/Previewer/Previewer',
   'Types/source',
   'css!Controls-demo/Previewer/Previewer',
   'css!Controls-demo/Controls-demo'
], function(Control, Env, template, source) {
   'use strcit';

   var Previewer = Control.extend({
      _template: template,
      _triggerSource: null,
      _caption1: 'hover',
      _caption2: 'click',
      _trigger: 'hoverAndClick',
      _value: true,
      _selectedTrigger: 'hoverAndClick',
      _images: null,
      _text: 'Previewer has not opened yet',
      _theme: ['Controls/Classes'],

      _getMemorySource: function(items) {
         return new source.Memory({
            keyProperty: 'id',
            data: items
         });
      },
      _closeHandler: function() {
         this._text='Previewer closed';
      },



      _beforeMount: function() {
         this._images = ['Andrey', 'Valera', 'Maksim'];

         this._resourceRoot = Env.constants.resourceRoot;
         this._triggerSource = new source.Memory({
            keyProperty: 'title',
            data: [
               { title: 'hoverAndClick' },
               { title: 'hover' },
               { title: 'click' },
               { title: 'demand' }
            ]
         });
         this._defaultItemsWithoutToolbutton = [
            {
               id: '1',
               icon: 'icon-Print icon-medium',
               title: 'Распечатать',
               '@parent': false,
               parent: null
            },
            {
               id: '2',
               buttonViewMode: 'icon',
               icon: 'icon-Link icon-medium',
               title: 'Скопировать в буфер',
               '@parent': false,
               parent: null
            },
            {
               id: '3',
               showType: 0,
               title: 'Прикрепить к',
               '@parent': false,
               parent: null
            },
            {
               id: '4',
               showType: 0,
               title: 'Проекту',
               '@parent': false,
               parent: '3'
            },
            {
               id: '5',
               showType: 0,
               title: 'Этапу',
               '@parent': false,
               parent: '3'
            },
            {
               id: '6',
               icon: 'icon-medium icon-EmptyMessage',
               buttonStyle: 'secondary',
               showHeader: true,
               buttonViewMode: 'link',
               buttonIconStyle: 'secondary',
               buttonTransparent: false,
               title: 'Обсудить',
               '@parent': true,
               parent: null,
               readOnly: true
            },
            {
               id: '7',
               showType: 0,
               title: 'Видеозвонок',
               '@parent': false,
               parent: '6'
            },
            {
               id: '8',
               showType: 0,
               title: 'Сообщение',
               '@parent': false,
               parent: '6'
            }
         ]
      },

      changeTrigger: function(e, key) {
         this._selectedTrigger = key;
         this._trigger = key;
      },

      _clickHandler: function(event, name) {
         this._children[name].open('click');
      }

   });

   return Previewer;
});
