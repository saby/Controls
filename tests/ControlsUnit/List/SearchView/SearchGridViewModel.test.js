define(['Controls/treeGrid', 'Types/collection', 'Types/entity'], function(treeGrid, collection, entity) {

   describe('Controls.List.SearchView.SearchGridViewModel', function() {

      describe('instance tests', function() {

         it('getCurrent', function () {
            var items = new collection.RecordSet({
               rawData: [{id: 1, title: 'test', node: null, parent: null}],
               keyProperty: 'id'
            });
            var model = new treeGrid.SearchGridViewModel({
               items: items,
               keyProperty: 'id',
               parentProperty: 'parent',
               nodeProperty: 'node',
               searchValue: 'tes',
               columns: [{displayProperty: 'id'}, {displayProperty: 'title'}],
               multiSelectVisibility: 'hidden'
            });
            model._curIndex = 0;

            var current = model.getCurrent();
            current.resetColumnIndex();
            assert.isFalse(!!current.getCurrentColumn().column.needSearchHighlight);
            assert.equal(current.getCurrentColumn().searchValue, 'tes');

            current.goToNextColumn();
            assert.isTrue(!!current.getCurrentColumn().column.needSearchHighlight);
            assert.equal(current.getCurrentColumn().searchValue, 'tes');
         });

         it('getCurrent with ladder', function () {
            var items = new collection.RecordSet({
               rawData: [{id: 1, title: 'test', type: true, parent: null}],
               keyProperty: 'id'
            });
            var model = new treeGrid.SearchGridViewModel({
               items: items,
               keyProperty: 'id',
               parentProperty: 'parent',
               nodeProperty: 'type',
               searchValue: 'tes',
               columns: [{displayProperty: 'id'}, {displayProperty: 'title'}],
               ladderProperties: ['title'],
               multiSelectVisibility: 'hidden'
            });
            model._curIndex = 0;
            assert.isTrue(model.getCurrent().breadCrumbs);
            assert.deepEqual(model._ladder, {});
         });

         it('should not add spacing to first column because multiSelectVisibility is "visible"', function() {
            var items = new collection.RecordSet({
               rawData: [{id: 1, title: 'test', node: null, parent: null}],
               keyProperty: 'id'
            });
            var model = new treeGrid.SearchGridViewModel({
               items: items,
               parentProperty: 'parent',
               nodeProperty: 'node',
               searchValue: 'tes',
               keyProperty: 'id',
               columns: [{displayProperty: 'id'}, {displayProperty: 'title'}],
               multiSelectVisibility: 'visible'
            });
            model._curIndex = 0;
            var current = model.getCurrent();
            current.resetColumnIndex();
         });
      });
      describe('Check value of "current" for all items with grouping.', function() {
         var
            items = new collection.RecordSet({
               rawData: [{
                  id: 1,
                  parent: null,
                  nodeType: true,
                  title: 'test_node'
               }, {
                  id: 2,
                  parent: 1,
                  nodeType: null,
                  title: 'test_leaf'
               }],
               keyProperty: 'id'
            }),
            searchModel;
         beforeEach(function() {
            searchModel = new treeGrid.SearchGridViewModel({
               items: items,
               keyProperty: 'id',
               parentProperty: 'parent',
               nodeProperty: 'nodeType',
               columns: [{}],
               columnScroll: true,
               groupingKeyCallback: function() {
                  return 'test_group';
               }
            });
         });
         it('current.rowIndex', function() {
            let current = searchModel.getCurrent();
            assert.equal(current.rowIndex, 1);
            searchModel.goToNext();
            current = searchModel.getCurrent();
            assert.equal(current.rowIndex, 2);
            searchModel.goToNext();
            current = searchModel.getCurrent();
            assert.equal(searchModel.getCurrent().rowIndex, 3);
         });
         it('current.breadCrumbs', function() {
            assert.isFalse(searchModel.getCurrent().breadCrumbs);
            searchModel.goToNext();
            assert.isTrue(searchModel.getCurrent().breadCrumbs);
            searchModel.goToNext();
            assert.isFalse(searchModel.getCurrent().breadCrumbs);
         });
         it('isDrawResults', function() {
            var items = new collection.RecordSet({
               rawData: [{id: 1, title: 'test', node: null, parent: null}, {id: 2, title: 'test2', node: null, parent: null}],
               keyProperty: 'id'
            });
            var model = new treeGrid.SearchGridViewModel({
               items: items,
               searchValue: 'tes',
               keyProperty: 'id',
               parentProperty: 'parent',
               nodeProperty: 'node',
               columns: [{displayProperty: 'id'}, {displayProperty: 'title'}],
               multiSelectVisibility: 'visible'
            });
            assert.isTrue(model.isDrawResults());
            model.getItems().removeAt(1);
            assert.isFalse(model.isDrawResults());
         });
      });
   });
});
