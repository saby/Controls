/**
 * Created by am.gerasimov on 13.04.2018.
 */
/**
 * Created by am.gerasimov on 13.12.2017.
 */
define('Controls-demo/Suggest/Suggest', [
   'Core/Control',
   'wml!Controls-demo/Suggest/Suggest',
   'Types/source',
   'Controls-demo/Search/SearchMemory',
   'Controls-demo/Utils/MemorySourceFilter',
   'Controls-demo/Utils/MemorySourceData',
], function(Control, template, source, SearchMemory, memorySourceFilter, MemorySourceData) {
   'use strict';

   function getLongData() {
      var data = [];

      for (var id = 10; id < 100; id++) {
         data.push({id: id, department: 'Разработка', owner: 'Новиков Д.В.', title: 'Разработка'});
      }

      return data;
   }

   var VDomSuggest = Control.extend({
      _template: template,
      _styles: ['Controls-demo/Suggest/Suggest'],
      _suggestDownValue: '',
      _suggestNoFooterValue: '',
      _suggestWithTabsValue: '',
      _suggestNoDataValue: '',
      _suggestCustomFooterValue: '',
      _suggestUpValue: '',

      constructor: function() {
         VDomSuggest.superclass.constructor.apply(this, arguments);

         this._companiesData = MemorySourceData.companies.slice();
         this._departmentsData = MemorySourceData.departments.concat([
            {id: 8, department: 'Разработка Сбис', owner: 'Новиков Д.В.', title: 'Разработка Сбис'},
            {id: 9, department: 'Разработка Ядра', owner: 'Новиков Д.В.', title: 'Разработка Ядра'}
         ]);

         this._departmentsDataLong = this._departmentsData.concat(getLongData());

         this._departmentsData.forEach(function(companie) {
            companie.currentTab = 1;
         });
         this._companiesData.forEach(function(companie) {
            companie.currentTab = 2;
         });

         this._suggestTabSource = new SearchMemory({
            keyProperty: 'id',
            data: this._companiesData.concat(this._departmentsData),
            searchParam: 'title',
            filter: memorySourceFilter()
         });
         this._suggestSource = new SearchMemory({
            keyProperty: 'id',
            data: this._departmentsData,
            searchParam: 'title',
            filter: memorySourceFilter()
         });

         this._emptySource = new source.Memory({
            data: []
         });

         this._suggestSourceLong = new SearchMemory({
            keyProperty: 'id',
            data: this._departmentsDataLong,
            searchParam: 'title',
            filter: memorySourceFilter()
         });
      }
   });

   return VDomSuggest;
});
