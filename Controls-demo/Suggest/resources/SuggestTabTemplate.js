define('Controls-demo/Suggest/resources/SuggestTabTemplate', [
   'UI/Base',
   'wml!Controls-demo/Suggest/resources/SuggestTabTemplate',
   'Types/source',
   'Controls/list'
], function(Base, template, sourceLib) {

   'use strict';

   var tabSourceData = [
      {id: 1, title: 'Контрагенты', text: 'test', align: 'left'},
      {id: 2, title: 'Компании', text: 'test', align: 'left'}
   ];

   return Base.Control.extend({
      _template: template,
      _tabsSelectedKey: null,

      _beforeMount: function () {
         this._tabsOptions = {
            source: new sourceLib.Memory({
               keyProperty: 'id',
               data: tabSourceData
            }),
            keyProperty: 'id',
            displayProperty: 'title'
         };
      }
   });
});
