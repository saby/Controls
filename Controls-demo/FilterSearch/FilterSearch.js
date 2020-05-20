/**
 * Created by am.gerasimov on 17.07.2018.
 */
define('Controls-demo/FilterSearch/FilterSearch', [
   'Core/Control',
   'wml!Controls-demo/FilterSearch/FilterSearch',
   'Types/source',
   'Controls-demo/Utils/MemorySourceData',
   'Controls-demo/Utils/MemorySourceFilter',
   'Controls/deprecatedList',
   'Controls/search',
   'Controls/filter'
], function(Control, template, sourceLib, memorySourceData, memorySourceFilter) {
   'use strict';
   var SearchContainer = Control.extend({
      _template: template,
      _navigation: null,
      _searchValue: '',
      _filter: null,
      _search: null,
      _filterSearch: null,
      _filterSearchTabs: null,
      _fastFilterData: null,
      _fullFastFilterData: null,
      _filterButtonData: null,
      _tabSelectedKey: 'employees',
      _searchValueWithFilters: '',
      _searchValueWithFiltersTabs: '',
      _beforeMount: function() {
         this._navigation = {
            source: 'page',
            view: 'page',
            sourceConfig: {
               pageSize: 20,
               page: 0,
               hasMore: false
            }
         };
         this._filter = {};
         this._search = {};
         this._filterSearch = {};
         this._filterSearchTabs = {};
         this._fastFilterData = [
            {
               id: 'owner',
               resetValue: '0',
               value: '0',
               textValue: '',
               properties: {
                  keyProperty: 'owner',
                  displayProperty: 'title',
                  source: new sourceLib.Memory({
                     data: [
                        { id: 0, title: 'По ответственному', owner: '0' },
                        { id: 1, title: 'Новиков Д.В.', owner: 'Новиков Д.В.' },
                        { id: 2, title: 'Кошелев А.Е.', owner: 'Кошелев А.Е.' },
                        { id: 3, title: 'Субботин А.В.', owner: 'Субботин А.В.' },
                        { id: 4, title: 'Чеперегин А.С.', owner: 'Чеперегин А.С.' },
                     ],
                     keyProperty: 'owner'
                  })
               }
            }
         ];
         this._fullFastFilterData = [
            {
               id: 'owner',
               resetValue: '0',
               value: '0',
               textValue: '',
               properties: {
                  keyProperty: 'owner',
                  displayProperty: 'title',
                  source: new sourceLib.Memory({
                     data: [
                        { id: 0, title: 'По ответственному', owner: '0' },
                        { id: 1, title: 'Новиков Д.В.', owner: 'Новиков Д.В.' },
                        { id: 2, title: 'Кошелев А.Е.', owner: 'Кошелев А.Е.' },
                        { id: 3, title: 'Субботин А.В.', owner: 'Субботин А.В.' },
                        { id: 4, title: 'Чеперегин А.С.', owner: 'Чеперегин А.С.' },
                     ],
                     keyProperty: 'owner'
                  })
               }
            },
            {
               id: 'department',
               resetValue: 'По департаменту',
               value: 'По департаменту',
               textValue: '',
               properties: {
                  keyProperty: 'title',
                  displayProperty: 'title',
                  source: new sourceLib.Memory({
                     data: [
                        { id: 0, title: 'По департаменту' },
                        { id: 1, title: 'Разработка' },
                        { id: 2, title: 'Продвижение СБИС' },
                        { id: 3, title: 'Федеральная клиентская служка' },
                        { id: 4, title: 'Служба эксплуатации' },
                        { id: 5, title: 'Технологии и маркетинг' },
                        { id: 6, title: 'Федеральный центр продаж. Call-центр Ярославль' },
                        { id: 7, title: 'Сопровождение информационных систем' }
                     ],
                     keyProperty: 'owner'
                  })
               }
            }
         ];
         this._filterButtonData = [{
            id: 'owner',
            resetValue: '0',
            value: '0',
            source: new sourceLib.Memory({
               data: [
                  { id: 0, title: 'По ответственному', lastName: '0' },
                  { id: 1, title: 'Новиков Д.В.', lastName: 'Новиков Д.В.' },
                  { id: 2, title: 'Кошелев А.Е.', lastName: 'Кошелев А.Е.' },
                  { id: 3, title: 'Субботин А.В.', lastName: 'Субботин А.В.' },
                  { id: 4, title: 'Чеперегин А.С.', lastName: 'Чеперегин А.С.' },
               ],
               keyProperty: 'lastName'
            })
         }];
         this._source = new sourceLib.Memory({
            data: memorySourceData.departments,
            keyProperty: 'id',
            filter: memorySourceFilter({
               'owner': '0',
               'department': 'По департаменту'
            })
         });

         this._sourceWithoutFilter = new sourceLib.Memory({
            data: memorySourceData.departments,
            keyProperty: 'id'
         });

         this._tabSource = new sourceLib.Memory({
            data: [
               {
                  id: 'employees',
                  title: 'Сотрудники',
                  align: 'right'
               }
            ],
            keyProperty: 'id'
         });
      }
   });

   SearchContainer._styles = ['Controls-demo/FilterSearch/FilterSearch'];

   return SearchContainer;
});
