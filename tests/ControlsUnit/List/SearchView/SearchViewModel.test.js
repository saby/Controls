define(['Controls/_treeGridOld/SearchView/SearchViewModel', 'Types/collection', 'Controls/_treeGridOld/TreeGridView/TreeGridView'], function(SearchViewModel, Collection, TreeGridView) {
   describe('Controls.List.SearchView.SearchViewModel', function() {
      it('getDisplayFilter', function() {
         var
            itemsFilterMethod = function() {},
            searchViewModel = new SearchViewModel({
               root: 'myTestRoot',
               items: []
            }),
            result = [
               itemsFilterMethod
            ];
         assert.deepEqual(searchViewModel.getDisplayFilter(null, {itemsFilterMethod: itemsFilterMethod}), result);
         assert.deepEqual(searchViewModel._display.getRoot().getContents(), 'myTestRoot');
      });
      it('hasItemById', function() {
         var
            searchViewModel = new SearchViewModel({
               items: new Collection.RecordSet({
                  rawData: [{
                     id: 1,
                     type: true,
                     parent: null
                  }, {
                     id: 2,
                     type: null,
                     parent: 1
                  }],
                  keyProperty: 'id'
               }),
               parentProperty: 'parent',
               nodeProperty: 'type',
               keyProperty: 'id'
            });
         assert.equal(searchViewModel.hasItemById(1), true);
         assert.equal(searchViewModel.hasItemById(2), true);
         assert.equal(searchViewModel.hasItemById(3), false);
      });
      it('itemTemplate', function() {
         var
            itemData,
            searchViewModel,
            superclassGetItemDataByItem = SearchViewModel.superclass.getItemDataByItem,
            treeView = new TreeGridView({});
         SearchViewModel.superclass.getItemDataByItem = function(breadCrumbs) {
            const itemData = {
               item: {},
               resolvers: {
                  baseItemTemplate: treeView._resolveBaseItemTemplate.bind(treeView)
               },
               dispItem: {}
            };

            if (breadCrumbs) {
               itemData.dispItem.isBreadcrumbs = true;
            }
            return itemData;
         };

         searchViewModel = new SearchViewModel({});
         itemData = searchViewModel.getItemDataByItem(false);
         assert.equal(itemData.resolveItemTemplate(itemData).name, 'Controls__treeGridOld_TreeGridView_layout_grid_Item');
         itemData = searchViewModel.getItemDataByItem(true);
         assert.equal(itemData.resolveItemTemplate(itemData).name, 'Controls__treeGridOld_TreeGridView_layout_grid_Item');

         searchViewModel = new SearchViewModel({
            itemTemplate: {
               prototype: {
                  _moduleName: 'testItemTemplate'
               }
            }
         });
         itemData = searchViewModel.getItemDataByItem(false);
         assert.equal(itemData.resolveItemTemplate(itemData).prototype._moduleName, 'testItemTemplate');
         itemData = searchViewModel.getItemDataByItem(true);
         assert.equal(itemData.resolveItemTemplate(itemData).name, 'Controls__treeGridOld_TreeGridView_layout_grid_Item');

         SearchViewModel.superclass.getItemDataByItem = superclassGetItemDataByItem;
      });

      xit('_getItemVersion', function() {
         var
            searchViewModel = new SearchViewModel({
               items: new Collection.RecordSet({
                  rawData: [{
                     id: 1,
                     type: true,
                     parent: null
                  }, {
                     id: 2,
                     type: true,
                     parent: 1
                  }, {
                     id: 3,
                     type: null,
                     parent: 2
                  }],
                  keyProperty: 'id'
               }),
               parentProperty: 'parent',
               nodeProperty: 'type',
               keyProperty: 'id'
            });
         assert.equal(searchViewModel._getItemVersion(searchViewModel._display.at(0).getContents()), '0_0');
         assert.equal(searchViewModel._getItemVersion(searchViewModel._display.at(1).getContents()), '0');
      });

      it('isGroup', function() {
         let searchViewModel = new SearchViewModel({
               root: 'myTestRoot',
               items: []
            });

         let itemGroupMock = 'test';
         let breadCrumbsMock = [];

         assert.isFalse(searchViewModel._isGroup(breadCrumbsMock));
         assert.isTrue(searchViewModel._isGroup(itemGroupMock));
      });

      it('setHoveredItem', function() {
         const model = new SearchViewModel({
            root: 'myTestRoot',
            items: []
         });

         const fakeItem = { fakeItem: true };
         model.setHoveredItem(fakeItem);
         assert.strictEqual(model.getHoveredItem(), fakeItem);

         // does not fail on breadcrumbs
         const fakeCrumbs = [{ crumb: 1 }, { crumb: 2 }, { crumb: 3 }];
         model.setHoveredItem(fakeCrumbs);
         assert.strictEqual(model.getHoveredItem(), fakeCrumbs[2]);

         // does not fail when hover is removed
         model.setHoveredItem(null);
         assert.isNull(model.getHoveredItem());
      });

      it('_getDisplayItemCacheKey works for breadcrumbs', function() {
         const model = new SearchViewModel({
            root: 'myTestRoot',
            keyProperty: 'id',
            nodeProperty: 'type',
            items: new Collection.RecordSet({
               rawData: [{
                  id: 456,
                  type: true,
               }],
               keyProperty: 'id'
            }),
         });

         // emulate breadcrumbs
         const crumbsDisplay = { getContents: () => [{}, {}, { id: 456 }] };
         assert.strictEqual(
             model._getDisplayItemCacheKey(crumbsDisplay),
             '456_breadcrumbs'
         );
      });

      describe('variants of breadcrumbs colspan', () => {
         let itemData;
         const _model = new SearchViewModel({
            keyProperty: 'id',
            nodeProperty: 'type',
            items: new Collection.RecordSet({
               rawData: [{
                  id: 456,
                  type: true,
               }],
               keyProperty: 'id'
            }),
         });

         beforeEach(() => {
            _model.reset();
            itemData = _model.getCurrent();
         });

         describe('without column scroll', () => {
            beforeEach(() => {
               itemData.columnScroll = false;
            });

            it('no colspan params', () => {
               // Нет горизонтального скролла, ничего не задано прикладником. Растягиваем крошку на всю строку
               assert.isTrue(itemData.getColspan(undefined, undefined));
               assert.isUndefined(itemData.getColspanLength(undefined, undefined));
            });

            it('colspan true', () => {
               // Нет горизонтального скролла, прикладник задал колспан. Растягиваем крошку на всю строку
               assert.isTrue(itemData.getColspan(true, undefined));
               assert.isUndefined(itemData.getColspanLength(true, undefined));
            });

            it('colspan false', () => {
               // Нет горизонтального скролла, прикладник запретил колспан. НЕ растягиваем крошку, рисуем по колонкам
               assert.isFalse(itemData.getColspan(false, undefined));
               assert.equal(itemData.getColspanLength(false, undefined), 1);
            });
         });

         describe('with column scroll', () => {
            beforeEach(() => {
               itemData.columnScroll = true;
               itemData.stickyColumnsCount = 2;
               itemData.columns = [{}, {}, {}, {}];
            });

            it('no colspan params, column scroll visible', () => {
               // Есть горизонтальный скролл, ничего не задано прикладником.
               // Не растягиваем, т.к. при скролле колонок нужно рисовать ячейки.
               assert.isFalse(itemData.getColspan(undefined, true));
               assert.equal(itemData.getColspanLength(undefined, true), 2);
            });

            it('colspan true, column scroll visible', () => {
               // Есть горизонтальный скролл, прикладник задал колспан.
               // Не растягиваем, т.к. при скролле колонок нужно рисовать ячейки.
               assert.isFalse(itemData.getColspan(true, true));
               assert.equal(itemData.getColspanLength(true, true), 2);
            });

            it('colspan false, column scroll visible', () => {
               // Есть горизонтальный скролл, прикладник запретил колспан.
               // Не растягиваем, т.к. при скролле колонок нужно рисовать ячейки.
               assert.isFalse(itemData.getColspan(true, true));
               assert.equal(itemData.getColspanLength(true, true), 2);
            });


            it('no colspan params, column scroll hidden', () => {
               // Есть горизонтальный скролл, но он не виден(контент влезает), ничего не задано прикладником.
               // Растягиваем, т.к. без видимого скролла колонок можно растягивать.
               assert.isTrue(itemData.getColspan(undefined, false));
               assert.isUndefined(itemData.getColspanLength(undefined, false));
            });

            it('colspan true, column scroll hidden', () => {
               // Есть горизонтальный скролл, но он не виден(контент влезает), прикладник задал колспан.
               // Растягиваем, т.к. без видимого скролла колонок можно растягивать.
               assert.isTrue(itemData.getColspan(true, false));
               assert.isUndefined(itemData.getColspanLength(true, false));
            });

            it('colspan false, column scroll hidden', () => {
               // Есть горизонтальный скролл, но он не виден(контент влезает), прикладник запретил колспан.
               // Не растягиваем, т.к. при скролле колонок нужно рисовать ячейки.
               assert.isFalse(itemData.getColspan(false, false));
               assert.equal(itemData.getColspanLength(false, false), 1);
            });
         });
      });
   });
});
