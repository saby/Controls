define('Controls-demo/EditableArea/EditableArea', [
   'Core/Control',
   'wml!Controls-demo/EditableArea/EditableArea',
   'Types/entity',
   'Types/source',
   'wml!Controls-demo/EditableArea/resources/exampleTabTemplate',
   'wml!Controls-demo/EditableArea/resources/exampleTabTemplate2',

], function(
   Control,
   template,
   entity,
   source,
   exampleTabTemplate,
   exampleTabTemplate2
) {
   'use strict';
   var tabsData = [
         {
            id: 0,
            title: 'Поручение',
            align: 'left',
            number: '3565654',
            date: '09.01.17',
            itemTemplate: exampleTabTemplate
         },
         {
            id: 1,
            align: 'right',
            title: 'Лента событий'
         }
      ],
      tabsData2 = [
         {
            id: 0,
            align: 'left',
            name: 'Компания "Сбис плюс"',
            itemTemplate: exampleTabTemplate2
         }];

   var EditableArea = Control.extend({
      _template: template,
      _record: null,
      _record1: null,
      _selectedTab: 0,
      _selectedTab2: 0,
      _tabSource: null,

      _beforeMount: function() {
         this._record = new entity.Record({
            rawData: {
               id: 1,
               text1: 'Мой отдел'
            }
         });
         this._record1 = new entity.Record({
            rawData: {
               id: 1,
               text1: 'Мой отдел'
            }
         });
         this._tabSource = new source.Memory({
            keyProperty: 'id',
            data: tabsData
         });
         this._tabSource2 = new source.Memory({
            keyProperty: 'id',
            data: tabsData2
         });
      }
   });
   EditableArea._styles = ['Controls-demo/EditableArea/EditableArea'];

   return EditableArea;
});
