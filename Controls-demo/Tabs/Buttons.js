define('Controls-demo/Tabs/Buttons', [
   'Core/Control',
   'wml!Controls-demo/Tabs/Buttons/Buttons',
   'wml!Controls-demo/Tabs/Buttons/resources/spaceTemplate',
   'wml!Controls-demo/Tabs/Buttons/resources/itemTemplate',
   'wml!Controls-demo/Tabs/Buttons/resources/mainTemplate',
   'wml!Controls-demo/Tabs/Buttons/resources/photoContent',
   'Types/source',
], function(
   Control,
   template,
   spaceTemplate,
   itemTemplate,
   mainTemplate,
   photoContent,
   source
) {
   'use strict';
    var TabButtonsDemo = Control.extend({
      _template: template,
      _styles: ['Controls-demo/Tabs/Buttons/Buttons'],
      SelectedKey1: '1',
      SelectedKeyLeft: '2',
      SelectedKey2: '1',
      SelectedKey3: '4',
      SelectedKey4: '2',
      SelectedKey5: '2',
      SelectedKey6: '1',
      SelectedKey7: '3',
      SelectedKey8: '2',
      SelectedKey9: '2',
      _source1: null,
      _sourceLeft: null,
      _source2: null,
      _source3: null,
      _source4: null,
      _source5: null,
      _source6: null,
      _source7: null,
      _source8: null,
       _source9: null,
      _spaceTemplate: spaceTemplate,
      _beforeMount: function() {
         this._source1 = new source.Memory({
            keyProperty: 'id',
            data: [
               {
                  id: '1',
                  title: 'Document'
               },
               {
                  id: '2',
                  title: 'Files'
               },
               {
                  id: '3',
                  title: 'Orders'
               }
            ]
         });
         this._sourceLeft = new source.Memory({
            keyProperty: 'id',
            data: [
               {
                  id: '1',
                  title: 'Document',
                  align: 'left',
               },
               {
                  id: '2',
                  title: 'Files',
                  isMainTab: true,
                  align: 'left',
               },
               {
                  id: '3',
                  align: 'left',
                  title: 'Orders'
               }
            ]
         });
         this._source2 = new source.Memory({
            keyProperty: 'id',
            data: [
               {
                  id: '1',
                  title: 'Задача в разработку №1263182638123681268716831726837182368172631239999',
                  align: 'left',
                  itemTemplate: mainTemplate
               },
               {
                  id: '2',
                  title: 'Photos'
               },
               {
                  id: '3',
                  title: 'Videos'
               },
               {
                  id: '4',
                  title: 'Groups'
               },
               {
                  id: '5',
                  title: 'Documents'
               },
               {
                  id: '6',
                  title: 'Meetings'
               }
            ]
         });
         this._source9 = new source.Memory({
            keyProperty: 'id',
            data: [
               {
                  id: '1',
                  title: 'Meetings',
                  align: 'left',
                  itemTemplate: mainTemplate
               },
               {
                  id: '2',
                  align: 'left',
                  title: 'Photos'
               },
               {
                  id: '3',
                  align: 'left',
                  title: 'Videos'
               },
               {
                  id: '4',
                  title: 'Groups'
               }
            ]
         });
         this._source3 = new source.Memory({
            keyProperty: 'id',
            data: [
               {
                  id: '1',
                  carambola: 'Person card',
                  align: 'left'
               },
               {
                  id: '2',
                  carambola: 'Photos'
               },
               {
                  id: '3',
                  carambola: 'Videos'
               },
               {
                  id: '4',
                  carambola: 'Groups'
               },
               {
                  id: '5',
                  carambola: 'Documents'
               },
               {
                  id: '6',
                  carambola: 'Meetings'
               }
            ]
         });
         this._source4 = new source.Memory({
            keyProperty: 'id',
            data: [
               {
                  id: '1',
                  title: 'Meetings',
                  align: 'left'
               },
               {
                  id: '2',
                  title: 'Groups'
               },
               {
                  id: '3',
                  title: 'Documents'
               }
            ]
         });
         this._source5 = new source.Memory({
            keyProperty: 'id',
            data: [
               {
                  id: '1',
                  align: 'left',
                  text: 'Отпуск',
                  icon: 'icon-Vacation',
                  iconStyle: 'success',
                  itemTemplate: itemTemplate
               },
               {
                  id: '2',
                  align: 'left',
                  text: 'Отгул',
                  icon: 'icon-SelfVacation',
                  iconStyle: 'warning',
                  itemTemplate: itemTemplate
               },
               {
                  id: '3',
                  align: 'left',
                  text: 'Больничный',
                  icon: 'icon-Sick',
                  iconStyle: 'secondary',
                  itemTemplate: itemTemplate
               }
            ]
         });
         this._source6 = new source.Memory({
            keyProperty: 'id',
            data: [
               {
                  id: '1',
                  title:
                     'Task number 12345678901234567890'
               },
               {
                  id: '2',
                  title: 'News',
                  align: 'left'
               },
               {
                  id: '3',
                  title: 'Meetings'
               }
            ]
         });
         this._source7 = new source.Memory({
            keyProperty: 'id',
            data: [
               {
                  id: '1',
                  title: 'Person card',
                  align: 'left',
                  carambola: photoContent,
                  type: 'photo'
               },
               {
                  id: '2',
                  title: 'Documents',
                  align: 'left'
               },
               {
                  id: '3',
                  title: 'Photos',
                  align: 'left'
               },
               {
                  id: '4',
                  title: 'Groups',
                  align: 'left'
               },
               {
                  id: '5',
                  title: 'Meetings'
               },
               {
                  id: '6',
                  title: 'Videos'
               },
               {
                  id: '7',
                  title: '',
                  carambola: photoContent,
                  type: 'photo'
               }
            ]
         });
         this._source8 = new source.Memory({
            keyProperty: 'id',
            data: [
               {
                  id: '1',
                  title: 'Document',
                  align: 'left',
                  contentTab: true

               },
               {
                  id: '2',
                  title: 'Files',
                  align: 'left'
               },
               {
                  id: '3',
                  title: 'Orders',
                  align: 'left'
               }
            ]
         });
      },
      _setSource: function() {
         this._source6 = new source.Memory({
            keyProperty: 'id',
            data: [
               {
                  id: '1',
                  title: 'Videos'
               },
               {
                  id: '2',
                  title: 'Groups'
               },
               {
                  id: '3',
                  title: 'Photos'
               }
            ]
         });
         this._source6.destroy();
      }
   });
   return TabButtonsDemo;
});
