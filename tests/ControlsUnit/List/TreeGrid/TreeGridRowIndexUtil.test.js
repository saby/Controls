define([
   'Controls/_treeGrid/utils/TreeGridRowIndexUtil',
   'Controls/_list/resources/utils/ItemsUtil',
   'Controls/treeGrid',
   'Types/collection'
], function (RowUtil, ItemsUtil, treeGridLib, collection) {

   describe('Controls._treeGrid.utils.TreeGridRowIndexUtil', function () {

      function getItem(id, cfg) {
         let item = {
            'id': `${id}`,
            'title': 'title' in cfg ? `${cfg.title}` : `Row title with id ${id}`
         };
         cfg = cfg || {};
         item['parent'] = 'parent' in cfg ? cfg.parent : null;
         item['nodeType'] = 'nodeType' in cfg ? cfg.nodeType : null;
         if ('group' in cfg) {
            item['group'] = cfg.group;
         }
         return item;
      }

      let
          treeGridData = [
             getItem('1', {nodeType: true, parent: null, group: 'group_1'}),
             getItem('1_1', {nodeType: true, parent: '1', group: 'group_1'}),
             getItem('1_1_1', {nodeType: null, parent: '1_1', group: 'group_1'}),
             getItem('1_1_2', {nodeType: null, parent: '1_1', group: 'group_1'}),
             getItem('1_2', {nodeType: null, parent: '1', group: 'group_1'}),
             getItem('2', {nodeType: false, parent: null, group: 'group_1'}),
             getItem('2_1', {nodeType: null, parent: '2', group: 'group_1'}),
             getItem('3', {nodeType: false, parent: null, group: 'group_2'}),
             getItem('3_1', {nodeType: null, parent: '3', group: 'group_2'}),
             getItem('4', {nodeType: null, parent: null, group: 'group_2'})
          ],
          treeGridColumns = [{displayProperty: 'title'}],
          treeGridHeader = [{title: 'Название'}];

      /*
      * Создаёт модель, эмулирующуу дерево вида:
      *
      * Шапка                                realIndex 0
      * group 1            displayIndex 0    realIndex 1
      * ->node             displayIndex 1    realIndex 2
      *   ->node           displayIndex 2    realIndex 3
      *     ->item         displayIndex 3    realIndex 4
      *     ->item         displayIndex 4    realIndex 5
      *     ->hasMoreFooter                  realIndex 6
      *   ->item           displayIndex 5    realIndex 7
      *   hasMoreFooter                      realIndex 8
      * ->hiddenNode       displayIndex 6    realIndex 9
      *   ->item           displayIndex 7    realIndex 10
      *   nodeFooter                         realIndex 11
      * group 2            displayIndex 8    realIndex 12
      * ->hiddenNode       displayIndex 9    realIndex 13
      *   ->item           displayIndex 10   realIndex 14
      *   nodeFooter                         realIndex 15
      * ->item             displayIndex 11   realIndex 16
      *
      * */
      function createModel(cfg, data) {
         cfg = cfg || {};
         cfg.keyProperty = cfg.keyProperty || 'id';
         cfg.displayProperty = cfg.displayProperty || 'title';
         cfg.columns = treeGridColumns;
         cfg.header = 'header' in cfg ? cfg.header : treeGridHeader;
         cfg.nodeProperty = 'nodeType';
         cfg.parentProperty = 'parent';
         if (cfg.groupBy) {
            cfg.groupingKeyCallback = function (item) {
               return item.get(cfg.groupBy);
            }
         }
         cfg.items = new collection.RecordSet({
            rawData: data || treeGridData,
            keyProperty: cfg.keyProperty
         });
         cfg.columnScroll = cfg.columnScroll || false;
         let model = new treeGridLib.ViewModel(cfg);
         model.setHasMoreStorage({'1': true, '1_1': true, '2': false, '3': undefined});
         model.setExpandedItems(['1', '1_1', '2', '3']);
         return model;
      }


      let model;

      describe('TreeGrid with header and grouping', function () {

         describe('with results in top', function () {

            describe('with columnScroll', function () {


               beforeEach(function () {
                  model = createModel({resultsPosition: 'top', groupBy: 'group', nodeFooterTemplate: 'qwe'});
               });

               it('getBottomPaddingRowIndex', function () {
                  let index = model._getRowIndexHelper().getBottomPaddingRowIndex();
                  assert.equal(index, model._getRowIndexHelper().getBottomPaddingRowIndex());
                  model._multiHeaderOffset = 1;
                  assert.equal(index + 1, model._getRowIndexHelper().getBottomPaddingRowIndex());
               });

               it('getFooterIndex', function () {
                  let index = model._getRowIndexHelper().getFooterIndex();
                  model._options._needBottomPadding = true;
                  assert.equal(index + 1, model._getRowIndexHelper().getFooterIndex());
                  model._multiHeaderOffset = 1;
                  assert.equal(index + 2, model._getRowIndexHelper().getFooterIndex());
               });

            });

            describe('with node footer template', function () {


               beforeEach(function () {
                  model = createModel({resultsPosition: 'top', groupBy: 'group', nodeFooterTemplate: 'qwe'});
               });

               it('getIndexById', function () {
                  assert.equal(3, model._getRowIndexHelper().getIndexById('1'));
                  assert.equal(6, model._getRowIndexHelper().getIndexById('1_1_2'));
                  assert.equal(8, model._getRowIndexHelper().getIndexById('1_2'));
                  assert.equal(11, model._getRowIndexHelper().getIndexById('2_1'));
                  assert.equal(15, model._getRowIndexHelper().getIndexById('3_1'));
                  assert.equal(17, model._getRowIndexHelper().getIndexById('4'));
               });

               it('getIndexByDisplayIndex', function () {
                  assert.equal(3, model._getRowIndexHelper().getIndexByDisplayIndex(1));
                  assert.equal(6, model._getRowIndexHelper().getIndexByDisplayIndex(4));
                  assert.equal(8, model._getRowIndexHelper().getIndexByDisplayIndex(5));
                  assert.equal(11, model._getRowIndexHelper().getIndexByDisplayIndex(7));
                  assert.equal(15, model._getRowIndexHelper().getIndexByDisplayIndex(10));
                  assert.equal(17, model._getRowIndexHelper().getIndexByDisplayIndex(11));
               });

               it('getIndexByItem', function () {
                  assert.equal(3, model._getRowIndexHelper().getIndexByItem(model.getDisplay().at(1)));
                  assert.equal(6, model._getRowIndexHelper().getIndexByItem(model.getDisplay().at(4)));
                  assert.equal(8, model._getRowIndexHelper().getIndexByItem(model.getDisplay().at(5)));
                  assert.equal(11, model._getRowIndexHelper().getIndexByItem(model.getDisplay().at(7)));
                  assert.equal(15, model._getRowIndexHelper().getIndexByItem(model.getDisplay().at(10)));
                  assert.equal(17, model._getRowIndexHelper().getIndexByItem(model.getDisplay().at(11)));
               });

               it('groups indexes', function () {
                  assert.equal(model._getRowIndexHelper().getIndexByDisplayIndex(0), 2);
                  assert.equal(model._getRowIndexHelper().getIndexByDisplayIndex(8), 13);
               });

               it('getResultsIndex', function () {
                  assert.equal(model._getRowIndexHelper().getResultsIndex(), 1);
                  assert.equal(model._getRowIndexHelper().getResultsIndex(), 1);
                  model._options._needBottomPadding = true;
                  assert.equal(model._getRowIndexHelper().getResultsIndex(), 1);
                  model._multiHeaderOffset = 1;
                  assert.equal(model._getRowIndexHelper().getResultsIndex(), 2);
               });

               it('getBottomPaddingRowIndex', function () {
                  let index = model._getRowIndexHelper().getBottomPaddingRowIndex();
                  assert.isTrue(index > 11 * 2 + 1);
                  assert.equal(index, model._getRowIndexHelper().getBottomPaddingRowIndex());
                  model._multiHeaderOffset = 1;
                  assert.equal(index + 1, model._getRowIndexHelper().getBottomPaddingRowIndex());
               });

               it('getFooterIndex', function () {
                  let index = model._getRowIndexHelper().getFooterIndex();
                  assert.isTrue(index > 11 * 2 + 1);
                  model._options._needBottomPadding = true;
                  assert.equal(index + 1, model._getRowIndexHelper().getFooterIndex());
                  model._multiHeaderOffset = 1;
                  assert.equal(index + 2, model._getRowIndexHelper().getFooterIndex());
               });

            });

            describe('without node footer template', function () {

               beforeEach(function () {
                  model = createModel({resultsPosition: 'top', groupBy: 'group'});
               });

               it('getIndexById', function () {
                  assert.equal(3, model._getRowIndexHelper().getIndexById('1'));
                  assert.equal(6, model._getRowIndexHelper().getIndexById('1_1_2'));
                  assert.equal(8, model._getRowIndexHelper().getIndexById('1_2'));
                  assert.equal(11, model._getRowIndexHelper().getIndexById('2_1'));
                  assert.equal(14, model._getRowIndexHelper().getIndexById('3_1'));
                  assert.equal(15, model._getRowIndexHelper().getIndexById('4'));
               });

               it('getIndexByDisplayIndex', function () {
                  assert.equal(3, model._getRowIndexHelper().getIndexByDisplayIndex(1));
                  assert.equal(6, model._getRowIndexHelper().getIndexByDisplayIndex(4));
                  assert.equal(8, model._getRowIndexHelper().getIndexByDisplayIndex(5));
                  assert.equal(11, model._getRowIndexHelper().getIndexByDisplayIndex(7));
                  assert.equal(14, model._getRowIndexHelper().getIndexByDisplayIndex(10));
                  assert.equal(15, model._getRowIndexHelper().getIndexByDisplayIndex(11));
               });

               it('getIndexByItem', function () {
                  assert.equal(3, model._getRowIndexHelper().getIndexByItem(model.getDisplay().at(1)));
                  assert.equal(6, model._getRowIndexHelper().getIndexByItem(model.getDisplay().at(4)));
                  assert.equal(8, model._getRowIndexHelper().getIndexByItem(model.getDisplay().at(5)));
                  assert.equal(11, model._getRowIndexHelper().getIndexByItem(model.getDisplay().at(7)));
                  assert.equal(14, model._getRowIndexHelper().getIndexByItem(model.getDisplay().at(10)));
                  assert.equal(15, model._getRowIndexHelper().getIndexByItem(model.getDisplay().at(11)));
               });

               it('groups indexes', function () {
                  assert.equal(model._getRowIndexHelper().getIndexByDisplayIndex(0), 2);
                  assert.equal(model._getRowIndexHelper().getIndexByDisplayIndex(8), 12);
               });

               it('getResultsIndex', function () {
                  assert.equal(model._getRowIndexHelper().getResultsIndex(), 1);
                  assert.equal(model._getRowIndexHelper().getResultsIndex(), 1);
                  model._options._needBottomPadding = true;
                  assert.equal(model._getRowIndexHelper().getResultsIndex(), 1);
               });

               it('getBottomPaddingRowIndex', function () {
                  let index = model._getRowIndexHelper().getBottomPaddingRowIndex();
                  assert.isTrue(index > 11 * 2 + 1);
                  assert.equal(index, model._getRowIndexHelper().getBottomPaddingRowIndex());
               });

               it('getFooterIndex', function () {
                  let index = model._getRowIndexHelper().getFooterIndex();
                  assert.isTrue(index > 11 * 2 + 1);
                  model._options._needBottomPadding = true;
                  assert.equal(index + 1, model._getRowIndexHelper().getFooterIndex());
               });

            });

         });

         describe('with results in bottom', function () {

            describe('with node footer template', function () {

               beforeEach(function () {
                  model = createModel({resultsPosition: 'bottom', groupBy: 'group', nodeFooterTemplate: 'qwe'});
               });

               it('getIndexById', function () {
                  assert.equal(2, model._getRowIndexHelper().getIndexById('1'));
                  assert.equal(5, model._getRowIndexHelper().getIndexById('1_1_2'));
                  assert.equal(7, model._getRowIndexHelper().getIndexById('1_2'));
                  assert.equal(10, model._getRowIndexHelper().getIndexById('2_1'));
                  assert.equal(14, model._getRowIndexHelper().getIndexById('3_1'));
                  assert.equal(16, model._getRowIndexHelper().getIndexById('4'));
               });

               it('getIndexByDisplayIndex', function () {
                  assert.equal(2, model._getRowIndexHelper().getIndexByDisplayIndex(1));
                  assert.equal(5, model._getRowIndexHelper().getIndexByDisplayIndex(4));
                  assert.equal(7, model._getRowIndexHelper().getIndexByDisplayIndex(5));
                  assert.equal(10, model._getRowIndexHelper().getIndexByDisplayIndex(7));
                  assert.equal(14, model._getRowIndexHelper().getIndexByDisplayIndex(10));
                  assert.equal(16, model._getRowIndexHelper().getIndexByDisplayIndex(11));
               });

               it('getIndexByItem', function () {
                  assert.equal(2, model._getRowIndexHelper().getIndexByItem(model.getDisplay().at(1)));
                  assert.equal(5, model._getRowIndexHelper().getIndexByItem(model.getDisplay().at(4)));
                  assert.equal(7, model._getRowIndexHelper().getIndexByItem(model.getDisplay().at(5)));
                  assert.equal(10, model._getRowIndexHelper().getIndexByItem(model.getDisplay().at(7)));
                  assert.equal(14, model._getRowIndexHelper().getIndexByItem(model.getDisplay().at(10)));
                  assert.equal(16, model._getRowIndexHelper().getIndexByItem(model.getDisplay().at(11)));
               });

               it('groups indexes', function () {
                  assert.equal(model._getRowIndexHelper().getIndexByDisplayIndex(0), 1);
                  assert.equal(model._getRowIndexHelper().getIndexByDisplayIndex(8), 12);
               });

               it('getResultsIndex', function () {
                  let index = model._getRowIndexHelper().getResultsIndex();
                  assert.isTrue(index > 11 * 2);
                  assert.equal(index, model._getRowIndexHelper().getResultsIndex());
                  model._options._needBottomPadding = true;
                  assert.equal(index + 1, model._getRowIndexHelper().getResultsIndex());
               });

               it('getBottomPaddingRowIndex', function () {
                  let index = model._getRowIndexHelper().getBottomPaddingRowIndex();
                  assert.isTrue(index > 11 * 2 + 1);
                  assert.equal(index, model._getRowIndexHelper().getBottomPaddingRowIndex());
               });

               it('getFooterIndex', function () {
                  let index = model._getRowIndexHelper().getFooterIndex();
                  assert.isTrue(index > 11 * 2 + 1);
                  assert.equal(index, model._getRowIndexHelper().getFooterIndex());
                  model._options._needBottomPadding = true;
                  assert.equal(index + 1, model._getRowIndexHelper().getFooterIndex());
               });

            });

            describe('without node footer template', function () {

               beforeEach(function () {
                  model = createModel({resultsPosition: 'bottom', groupBy: 'group'});
               });

               it('getIndexById', function () {
                  assert.equal(2, model._getRowIndexHelper().getIndexById('1'));
                  assert.equal(5, model._getRowIndexHelper().getIndexById('1_1_2'));
                  assert.equal(7, model._getRowIndexHelper().getIndexById('1_2'));
                  assert.equal(10, model._getRowIndexHelper().getIndexById('2_1'));
                  assert.equal(13, model._getRowIndexHelper().getIndexById('3_1'));
                  assert.equal(14, model._getRowIndexHelper().getIndexById('4'));
               });

               it('getIndexByDisplayIndex', function () {
                  assert.equal(2, model._getRowIndexHelper().getIndexByDisplayIndex(1));
                  assert.equal(5, model._getRowIndexHelper().getIndexByDisplayIndex(4));
                  assert.equal(7, model._getRowIndexHelper().getIndexByDisplayIndex(5));
                  assert.equal(10, model._getRowIndexHelper().getIndexByDisplayIndex(7));
                  assert.equal(13, model._getRowIndexHelper().getIndexByDisplayIndex(10));
                  assert.equal(14, model._getRowIndexHelper().getIndexByDisplayIndex(11));
               });

               it('getIndexByItem', function () {
                  assert.equal(2, model._getRowIndexHelper().getIndexByItem(model.getDisplay().at(1)));
                  assert.equal(5, model._getRowIndexHelper().getIndexByItem(model.getDisplay().at(4)));
                  assert.equal(7, model._getRowIndexHelper().getIndexByItem(model.getDisplay().at(5)));
                  assert.equal(10, model._getRowIndexHelper().getIndexByItem(model.getDisplay().at(7)));
                  assert.equal(13, model._getRowIndexHelper().getIndexByItem(model.getDisplay().at(10)));
                  assert.equal(14, model._getRowIndexHelper().getIndexByItem(model.getDisplay().at(11)));
               });

               it('groups indexes', function () {
                  assert.equal(model._getRowIndexHelper().getIndexByDisplayIndex(0), 1);
                  assert.equal(model._getRowIndexHelper().getIndexByDisplayIndex(8), 11);
               });

               it('getResultsIndex', function () {
                  let index = model._getRowIndexHelper().getResultsIndex();
                  assert.isTrue(index > 11 * 2);
                  assert.equal(index, model._getRowIndexHelper().getResultsIndex());
                  model._options._needBottomPadding = true;
                  assert.equal(index + 1, model._getRowIndexHelper().getResultsIndex());
               });

               it('getBottomPaddingRowIndex', function () {
                  let index = model._getRowIndexHelper().getBottomPaddingRowIndex();
                  assert.isTrue(index > 11 * 2 + 1);
                  assert.equal(index, model._getRowIndexHelper().getBottomPaddingRowIndex());
               });

               it('getFooterIndex', function () {
                  let index = model._getRowIndexHelper().getFooterIndex();
                  assert.isTrue(index > 11 * 2 + 1);
                  assert.equal(index, model._getRowIndexHelper().getFooterIndex());
                  model._options._needBottomPadding = true;
                  assert.equal(index + 1, model._getRowIndexHelper().getFooterIndex());
               });

            });

         });

         describe('without results', function () {

            describe('with node footer template', function () {

               beforeEach(function () {
                  model = createModel({groupBy: 'group', nodeFooterTemplate: 'qwe'});
               });

               it('getIndexById', function () {
                  assert.equal(2, model._getRowIndexHelper().getIndexById('1'));
                  assert.equal(5, model._getRowIndexHelper().getIndexById('1_1_2'));
                  assert.equal(7, model._getRowIndexHelper().getIndexById('1_2'));
                  assert.equal(10, model._getRowIndexHelper().getIndexById('2_1'));
                  assert.equal(14, model._getRowIndexHelper().getIndexById('3_1'));
                  assert.equal(16, model._getRowIndexHelper().getIndexById('4'));
               });

               it('getIndexByDisplayIndex', function () {
                  assert.equal(2, model._getRowIndexHelper().getIndexByDisplayIndex(1));
                  assert.equal(5, model._getRowIndexHelper().getIndexByDisplayIndex(4));
                  assert.equal(7, model._getRowIndexHelper().getIndexByDisplayIndex(5));
                  assert.equal(10, model._getRowIndexHelper().getIndexByDisplayIndex(7));
                  assert.equal(14, model._getRowIndexHelper().getIndexByDisplayIndex(10));
                  assert.equal(16, model._getRowIndexHelper().getIndexByDisplayIndex(11));
               });

               it('getIndexByItem', function () {
                  assert.equal(2, model._getRowIndexHelper().getIndexByItem(model.getDisplay().at(1)));
                  assert.equal(5, model._getRowIndexHelper().getIndexByItem(model.getDisplay().at(4)));
                  assert.equal(7, model._getRowIndexHelper().getIndexByItem(model.getDisplay().at(5)));
                  assert.equal(10, model._getRowIndexHelper().getIndexByItem(model.getDisplay().at(7)));
                  assert.equal(14, model._getRowIndexHelper().getIndexByItem(model.getDisplay().at(10)));
                  assert.equal(16, model._getRowIndexHelper().getIndexByItem(model.getDisplay().at(11)));
               });

               it('groups indexes', function () {
                  assert.equal(model._getRowIndexHelper().getIndexByDisplayIndex(0), 1);
                  assert.equal(model._getRowIndexHelper().getIndexByDisplayIndex(8), 12);
               });

               it('getBottomPaddingRowIndex', function () {
                  let index = model._getRowIndexHelper().getBottomPaddingRowIndex();
                  assert.isTrue(index > 11 * 2 + 1);
                  assert.equal(index, model._getRowIndexHelper().getBottomPaddingRowIndex());
               });

               it('getFooterIndex', function () {
                  let index = model._getRowIndexHelper().getFooterIndex();
                  assert.isTrue(index > 11 * 2 + 1);
                  assert.equal(index, model._getRowIndexHelper().getFooterIndex());
                  model._options._needBottomPadding = true;
                  assert.equal(index + 1, model._getRowIndexHelper().getFooterIndex());
               });

            });

            describe('without node footer template', function () {

               beforeEach(function () {
                  model = createModel({resultsPosition: 'bottom', groupBy: 'group'});
               });

               it('getIndexById', function () {
                  assert.equal(2, model._getRowIndexHelper().getIndexById('1'));
                  assert.equal(5, model._getRowIndexHelper().getIndexById('1_1_2'));
                  assert.equal(7, model._getRowIndexHelper().getIndexById('1_2'));
                  assert.equal(10, model._getRowIndexHelper().getIndexById('2_1'));
                  assert.equal(13, model._getRowIndexHelper().getIndexById('3_1'));
                  assert.equal(14, model._getRowIndexHelper().getIndexById('4'));
               });

               it('getIndexByDisplayIndex', function () {
                  assert.equal(2, model._getRowIndexHelper().getIndexByDisplayIndex(1));
                  assert.equal(5, model._getRowIndexHelper().getIndexByDisplayIndex(4));
                  assert.equal(7, model._getRowIndexHelper().getIndexByDisplayIndex(5));
                  assert.equal(10, model._getRowIndexHelper().getIndexByDisplayIndex(7));
                  assert.equal(13, model._getRowIndexHelper().getIndexByDisplayIndex(10));
                  assert.equal(14, model._getRowIndexHelper().getIndexByDisplayIndex(11));
               });

               it('getIndexByItem', function () {
                  assert.equal(2, model._getRowIndexHelper().getIndexByItem(model.getDisplay().at(1)));
                  assert.equal(5, model._getRowIndexHelper().getIndexByItem(model.getDisplay().at(4)));
                  assert.equal(7, model._getRowIndexHelper().getIndexByItem(model.getDisplay().at(5)));
                  assert.equal(10, model._getRowIndexHelper().getIndexByItem(model.getDisplay().at(7)));
                  assert.equal(13, model._getRowIndexHelper().getIndexByItem(model.getDisplay().at(10)));
                  assert.equal(14, model._getRowIndexHelper().getIndexByItem(model.getDisplay().at(11)));
               });

               it('groups indexes', function () {
                  assert.equal(model._getRowIndexHelper().getIndexByDisplayIndex(0), 1);
                  assert.equal(model._getRowIndexHelper().getIndexByDisplayIndex(8), 11);
               });

               it('getBottomPaddingRowIndex', function () {
                  let index = model._getRowIndexHelper().getBottomPaddingRowIndex();
                  assert.isTrue(index > 11 * 2 + 1);
                  assert.equal(index, model._getRowIndexHelper().getBottomPaddingRowIndex());
               });

               it('getFooterIndex', function () {
                  let index = model._getRowIndexHelper().getFooterIndex();
                  assert.isTrue(index > 11 * 2 + 1);
                  assert.equal(index, model._getRowIndexHelper().getFooterIndex());
                  model._options._needBottomPadding = true;
                  assert.equal(index + 1, model._getRowIndexHelper().getFooterIndex());
               });

            });

         });

      });

      describe('TreeGrid without header, with grouping', function () {

         describe('with results in top', function () {

            describe('with node footer template', function () {

               beforeEach(function () {
                  model = createModel({resultsPosition: 'top', header: null, groupBy: 'group', nodeFooterTemplate: 'qwe'});
               });

               it('getIndexById', function () {
                  assert.equal(2, model._getRowIndexHelper().getIndexById('1'));
                  assert.equal(5, model._getRowIndexHelper().getIndexById('1_1_2'));
                  assert.equal(7, model._getRowIndexHelper().getIndexById('1_2'));
                  assert.equal(10, model._getRowIndexHelper().getIndexById('2_1'));
                  assert.equal(14, model._getRowIndexHelper().getIndexById('3_1'));
                  assert.equal(16, model._getRowIndexHelper().getIndexById('4'));
               });

               it('getIndexByDisplayIndex', function () {
                  assert.equal(2, model._getRowIndexHelper().getIndexByDisplayIndex(1));
                  assert.equal(5, model._getRowIndexHelper().getIndexByDisplayIndex(4));
                  assert.equal(7, model._getRowIndexHelper().getIndexByDisplayIndex(5));
                  assert.equal(10, model._getRowIndexHelper().getIndexByDisplayIndex(7));
                  assert.equal(14, model._getRowIndexHelper().getIndexByDisplayIndex(10));
                  assert.equal(16, model._getRowIndexHelper().getIndexByDisplayIndex(11));
               });

               it('getIndexByItem', function () {
                  assert.equal(2, model._getRowIndexHelper().getIndexByItem(model.getDisplay().at(1)));
                  assert.equal(5, model._getRowIndexHelper().getIndexByItem(model.getDisplay().at(4)));
                  assert.equal(7, model._getRowIndexHelper().getIndexByItem(model.getDisplay().at(5)));
                  assert.equal(10, model._getRowIndexHelper().getIndexByItem(model.getDisplay().at(7)));
                  assert.equal(14, model._getRowIndexHelper().getIndexByItem(model.getDisplay().at(10)));
                  assert.equal(16, model._getRowIndexHelper().getIndexByItem(model.getDisplay().at(11)));
               });

               it('groups indexes', function () {
                  assert.equal(model._getRowIndexHelper().getIndexByDisplayIndex(0), 1);
                  assert.equal(model._getRowIndexHelper().getIndexByDisplayIndex(8), 12);
               });

               it('getResultsIndex', function () {
                  assert.equal(model._getRowIndexHelper().getResultsIndex(), 0);
                  assert.equal(model._getRowIndexHelper().getResultsIndex(), 0);
                  model._options._needBottomPadding = true;
                  assert.equal(model._getRowIndexHelper().getResultsIndex(), 0);
               });

               it('getBottomPaddingRowIndex', function () {
                  let index = model._getRowIndexHelper().getBottomPaddingRowIndex();
                  assert.isTrue(index > 11 * 2 + 1);
                  assert.equal(index, model._getRowIndexHelper().getBottomPaddingRowIndex());
               });

               it('getFooterIndex', function () {
                  let index = model._getRowIndexHelper().getFooterIndex();
                  assert.isTrue(index > 10 * 2 + 1);
                  assert.equal(index, model._getRowIndexHelper().getFooterIndex());
                  model._options._needBottomPadding = true;
                  assert.equal(index + 1, model._getRowIndexHelper().getFooterIndex());
               });

            });

            describe('without node footer template', function () {

               beforeEach(function () {
                  model = createModel({resultsPosition: 'top', header: null, groupBy: 'group'});
               });

               it('getIndexById', function () {
                  assert.equal(2, model._getRowIndexHelper().getIndexById('1'));
                  assert.equal(5, model._getRowIndexHelper().getIndexById('1_1_2'));
                  assert.equal(7, model._getRowIndexHelper().getIndexById('1_2'));
                  assert.equal(10, model._getRowIndexHelper().getIndexById('2_1'));
                  assert.equal(13, model._getRowIndexHelper().getIndexById('3_1'));
                  assert.equal(14, model._getRowIndexHelper().getIndexById('4'));
               });

               it('getIndexByDisplayIndex', function () {
                  assert.equal(2, model._getRowIndexHelper().getIndexByDisplayIndex(1));
                  assert.equal(5, model._getRowIndexHelper().getIndexByDisplayIndex(4));
                  assert.equal(7, model._getRowIndexHelper().getIndexByDisplayIndex(5));
                  assert.equal(10, model._getRowIndexHelper().getIndexByDisplayIndex(7));
                  assert.equal(13, model._getRowIndexHelper().getIndexByDisplayIndex(10));
                  assert.equal(14, model._getRowIndexHelper().getIndexByDisplayIndex(11));
               });

               it('getIndexByItem', function () {
                  assert.equal(2, model._getRowIndexHelper().getIndexByItem(model.getDisplay().at(1)));
                  assert.equal(5, model._getRowIndexHelper().getIndexByItem(model.getDisplay().at(4)));
                  assert.equal(7, model._getRowIndexHelper().getIndexByItem(model.getDisplay().at(5)));
                  assert.equal(10, model._getRowIndexHelper().getIndexByItem(model.getDisplay().at(7)));
                  assert.equal(13, model._getRowIndexHelper().getIndexByItem(model.getDisplay().at(10)));
                  assert.equal(14, model._getRowIndexHelper().getIndexByItem(model.getDisplay().at(11)));
               });

               it('groups indexes', function () {
                  assert.equal(model._getRowIndexHelper().getIndexByDisplayIndex(0), 1);
                  assert.equal(model._getRowIndexHelper().getIndexByDisplayIndex(8), 11);
               });

               it('getResultsIndex', function () {
                  assert.equal(model._getRowIndexHelper().getResultsIndex(), 0);
                  assert.equal(model._getRowIndexHelper().getResultsIndex(), 0);
                  model._options._needBottomPadding = true;
                  assert.equal(model._getRowIndexHelper().getResultsIndex(), 0);
               });

               it('getBottomPaddingRowIndex', function () {
                  let index = model._getRowIndexHelper().getBottomPaddingRowIndex();
                  assert.isTrue(index > 11 * 2 + 1);
                  assert.equal(index, model._getRowIndexHelper().getBottomPaddingRowIndex());
               });

               it('getFooterIndex', function () {
                  let index = model._getRowIndexHelper().getFooterIndex();
                  assert.isTrue(index > 11 * 2 + 1);
                  assert.equal(index, model._getRowIndexHelper().getFooterIndex());
                  model._options._needBottomPadding = true;
                  assert.equal(index + 1, model._getRowIndexHelper().getFooterIndex());
               });

            });

         });

         describe('with results in bottom', function () {

            describe('with node footer template', function () {

               beforeEach(function () {
                  model = createModel({resultsPosition: 'bottom', header: null, groupBy: 'group', nodeFooterTemplate: 'qwe'});
               });

               it('getIndexById', function () {
                  assert.equal(1, model._getRowIndexHelper().getIndexById('1'));
                  assert.equal(4, model._getRowIndexHelper().getIndexById('1_1_2'));
                  assert.equal(6, model._getRowIndexHelper().getIndexById('1_2'));
                  assert.equal(9, model._getRowIndexHelper().getIndexById('2_1'));
                  assert.equal(13, model._getRowIndexHelper().getIndexById('3_1'));
                  assert.equal(15, model._getRowIndexHelper().getIndexById('4'));
               });

               it('getIndexByDisplayIndex', function () {
                  assert.equal(1, model._getRowIndexHelper().getIndexByDisplayIndex(1));
                  assert.equal(4, model._getRowIndexHelper().getIndexByDisplayIndex(4));
                  assert.equal(6, model._getRowIndexHelper().getIndexByDisplayIndex(5));
                  assert.equal(9, model._getRowIndexHelper().getIndexByDisplayIndex(7));
                  assert.equal(13, model._getRowIndexHelper().getIndexByDisplayIndex(10));
                  assert.equal(15, model._getRowIndexHelper().getIndexByDisplayIndex(11));
               });

               it('getIndexByItem', function () {
                  assert.equal(1, model._getRowIndexHelper().getIndexByItem(model.getDisplay().at(1)));
                  assert.equal(4, model._getRowIndexHelper().getIndexByItem(model.getDisplay().at(4)));
                  assert.equal(6, model._getRowIndexHelper().getIndexByItem(model.getDisplay().at(5)));
                  assert.equal(9, model._getRowIndexHelper().getIndexByItem(model.getDisplay().at(7)));
                  assert.equal(13, model._getRowIndexHelper().getIndexByItem(model.getDisplay().at(10)));
                  assert.equal(15, model._getRowIndexHelper().getIndexByItem(model.getDisplay().at(11)));
               });

               it('groups indexes', function () {
                  assert.equal(model._getRowIndexHelper().getIndexByDisplayIndex(0), 0);
                  assert.equal(model._getRowIndexHelper().getIndexByDisplayIndex(8), 11);
               });

               it('getResultsIndex', function () {
                  let index = model._getRowIndexHelper().getResultsIndex();
                  assert.isTrue(index > 11 * 2);
                  assert.equal(index, model._getRowIndexHelper().getResultsIndex());
                  model._options._needBottomPadding = true;
                  assert.equal(index + 1, model._getRowIndexHelper().getResultsIndex());
               });

               it('getBottomPaddingRowIndex', function () {
                  let index = model._getRowIndexHelper().getBottomPaddingRowIndex();
                  assert.isTrue(index > 11 * 2 + 1);
                  assert.equal(index, model._getRowIndexHelper().getBottomPaddingRowIndex());
               });

               it('getBottomPaddingRowIndex', function () {
                  let index = model._getRowIndexHelper().getBottomPaddingRowIndex();
                  assert.isTrue(index > 11 * 2 + 1);
                  assert.equal(index, model._getRowIndexHelper().getBottomPaddingRowIndex());
               });

               it('getFooterIndex', function () {
                  let index = model._getRowIndexHelper().getFooterIndex();
                  assert.isTrue(index > 11 * 2 + 1);
                  assert.equal(index, model._getRowIndexHelper().getFooterIndex());
                  model._options._needBottomPadding = true;
                  assert.equal(index + 1, model._getRowIndexHelper().getFooterIndex());
               });

            });

            describe('without node footer template', function () {

               beforeEach(function () {
                  model = createModel({resultsPosition: 'bottom', header: null, groupBy: 'group'});
               });

               it('getIndexById', function () {
                  assert.equal(1, model._getRowIndexHelper().getIndexById('1'));
                  assert.equal(4, model._getRowIndexHelper().getIndexById('1_1_2'));
                  assert.equal(6, model._getRowIndexHelper().getIndexById('1_2'));
                  assert.equal(9, model._getRowIndexHelper().getIndexById('2_1'));
                  assert.equal(12, model._getRowIndexHelper().getIndexById('3_1'));
                  assert.equal(13, model._getRowIndexHelper().getIndexById('4'));
               });

               it('getIndexByDisplayIndex', function () {
                  assert.equal(1, model._getRowIndexHelper().getIndexByDisplayIndex(1));
                  assert.equal(4, model._getRowIndexHelper().getIndexByDisplayIndex(4));
                  assert.equal(6, model._getRowIndexHelper().getIndexByDisplayIndex(5));
                  assert.equal(9, model._getRowIndexHelper().getIndexByDisplayIndex(7));
                  assert.equal(12, model._getRowIndexHelper().getIndexByDisplayIndex(10));
                  assert.equal(13, model._getRowIndexHelper().getIndexByDisplayIndex(11));
               });

               it('getIndexByItem', function () {
                  assert.equal(1, model._getRowIndexHelper().getIndexByItem(model.getDisplay().at(1)));
                  assert.equal(4, model._getRowIndexHelper().getIndexByItem(model.getDisplay().at(4)));
                  assert.equal(6, model._getRowIndexHelper().getIndexByItem(model.getDisplay().at(5)));
                  assert.equal(9, model._getRowIndexHelper().getIndexByItem(model.getDisplay().at(7)));
                  assert.equal(12, model._getRowIndexHelper().getIndexByItem(model.getDisplay().at(10)));
                  assert.equal(13, model._getRowIndexHelper().getIndexByItem(model.getDisplay().at(11)));
               });

               it('groups indexes', function () {
                  assert.equal(model._getRowIndexHelper().getIndexByDisplayIndex(0), 0);
                  assert.equal(model._getRowIndexHelper().getIndexByDisplayIndex(8), 10);
               });

               it('getResultsIndex', function () {
                  let index = model._getRowIndexHelper().getResultsIndex();
                  assert.isTrue(index > 11 * 2);
                  assert.equal(index, model._getRowIndexHelper().getResultsIndex());
                  model._options._needBottomPadding = true;
                  assert.equal(index + 1, model._getRowIndexHelper().getResultsIndex());
               });

               it('getBottomPaddingRowIndex', function () {
                  let index = model._getRowIndexHelper().getBottomPaddingRowIndex();
                  assert.isTrue(index > 11 * 2 + 1);
                  assert.equal(index, model._getRowIndexHelper().getBottomPaddingRowIndex());
               });

               it('getFooterIndex', function () {
                  let index = model._getRowIndexHelper().getFooterIndex();
                  assert.isTrue(index > 11 * 2 + 1);
                  assert.equal(index, model._getRowIndexHelper().getFooterIndex());
                  model._options._needBottomPadding = true;
                  assert.equal(index + 1, model._getRowIndexHelper().getFooterIndex());
               });

            });

         });

         describe('without results', function () {

            describe('with node footer template', function () {

               beforeEach(function () {
                  model = createModel({groupBy: 'group', header: null, nodeFooterTemplate: 'qwe'});
               });

               it('getIndexById', function () {
                  assert.equal(1, model._getRowIndexHelper().getIndexById('1'));
                  assert.equal(4, model._getRowIndexHelper().getIndexById('1_1_2'));
                  assert.equal(6, model._getRowIndexHelper().getIndexById('1_2'));
                  assert.equal(9, model._getRowIndexHelper().getIndexById('2_1'));
                  assert.equal(13, model._getRowIndexHelper().getIndexById('3_1'));
                  assert.equal(15, model._getRowIndexHelper().getIndexById('4'));
               });

               it('getIndexByDisplayIndex', function () {
                  assert.equal(1, model._getRowIndexHelper().getIndexByDisplayIndex(1));
                  assert.equal(4, model._getRowIndexHelper().getIndexByDisplayIndex(4));
                  assert.equal(6, model._getRowIndexHelper().getIndexByDisplayIndex(5));
                  assert.equal(9, model._getRowIndexHelper().getIndexByDisplayIndex(7));
                  assert.equal(13, model._getRowIndexHelper().getIndexByDisplayIndex(10));
                  assert.equal(15, model._getRowIndexHelper().getIndexByDisplayIndex(11));
               });

               it('getIndexByItem', function () {
                  assert.equal(1, model._getRowIndexHelper().getIndexByItem(model.getDisplay().at(1)));
                  assert.equal(4, model._getRowIndexHelper().getIndexByItem(model.getDisplay().at(4)));
                  assert.equal(6, model._getRowIndexHelper().getIndexByItem(model.getDisplay().at(5)));
                  assert.equal(9, model._getRowIndexHelper().getIndexByItem(model.getDisplay().at(7)));
                  assert.equal(13, model._getRowIndexHelper().getIndexByItem(model.getDisplay().at(10)));
                  assert.equal(15, model._getRowIndexHelper().getIndexByItem(model.getDisplay().at(11)));
               });

               it('groups indexes', function () {
                  assert.equal(model._getRowIndexHelper().getIndexByDisplayIndex(0), 0);
                  assert.equal(model._getRowIndexHelper().getIndexByDisplayIndex(8), 11);
               });

               it('getBottomPaddingRowIndex', function () {
                  let index = model._getRowIndexHelper().getBottomPaddingRowIndex();
                  assert.isTrue(index > 11 * 2 + 1);
                  assert.equal(index, model._getRowIndexHelper().getBottomPaddingRowIndex());
               });

               it('getFooterIndex', function () {
                  let index = model._getRowIndexHelper().getFooterIndex();
                  assert.isTrue(index > 11 * 2 + 1);
                  assert.equal(index, model._getRowIndexHelper().getFooterIndex());
                  model._options._needBottomPadding = true;
                  assert.equal(index + 1, model._getRowIndexHelper().getFooterIndex());
               });

            });

            describe('without node footer template', function () {

               beforeEach(function () {
                  model = createModel({resultsPosition: 'bottom', header: null, groupBy: 'group'});
               });

               it('getIndexById', function () {
                  assert.equal(1, model._getRowIndexHelper().getIndexById('1'));
                  assert.equal(4, model._getRowIndexHelper().getIndexById('1_1_2'));
                  assert.equal(6, model._getRowIndexHelper().getIndexById('1_2'));
                  assert.equal(9, model._getRowIndexHelper().getIndexById('2_1'));
                  assert.equal(12, model._getRowIndexHelper().getIndexById('3_1'));
                  assert.equal(13, model._getRowIndexHelper().getIndexById('4'));
               });

               it('getIndexByDisplayIndex', function () {
                  assert.equal(1, model._getRowIndexHelper().getIndexByDisplayIndex(1));
                  assert.equal(4, model._getRowIndexHelper().getIndexByDisplayIndex(4));
                  assert.equal(6, model._getRowIndexHelper().getIndexByDisplayIndex(5));
                  assert.equal(9, model._getRowIndexHelper().getIndexByDisplayIndex(7));
                  assert.equal(12, model._getRowIndexHelper().getIndexByDisplayIndex(10));
                  assert.equal(13, model._getRowIndexHelper().getIndexByDisplayIndex(11));
               });

               it('getIndexByItem', function () {
                  assert.equal(1, model._getRowIndexHelper().getIndexByItem(model.getDisplay().at(1)));
                  assert.equal(4, model._getRowIndexHelper().getIndexByItem(model.getDisplay().at(4)));
                  assert.equal(6, model._getRowIndexHelper().getIndexByItem(model.getDisplay().at(5)));
                  assert.equal(9, model._getRowIndexHelper().getIndexByItem(model.getDisplay().at(7)));
                  assert.equal(12, model._getRowIndexHelper().getIndexByItem(model.getDisplay().at(10)));
                  assert.equal(13, model._getRowIndexHelper().getIndexByItem(model.getDisplay().at(11)));
               });

               it('groups indexes', function () {
                  assert.equal(model._getRowIndexHelper().getIndexByDisplayIndex(0), 0);
                  assert.equal(model._getRowIndexHelper().getIndexByDisplayIndex(8), 10);
               });

               it('getBottomPaddingRowIndex', function () {
                  let index = model._getRowIndexHelper().getBottomPaddingRowIndex();
                  assert.isTrue(index > 11 * 2 + 1);
                  assert.equal(index, model._getRowIndexHelper().getBottomPaddingRowIndex());
               });

               it('getFooterIndex', function () {
                  let index = model._getRowIndexHelper().getFooterIndex();
                  assert.isTrue(index > 11 * 2 + 1);
                  assert.equal(index, model._getRowIndexHelper().getFooterIndex());
                  model._options._needBottomPadding = true;
                  assert.equal(index + 1, model._getRowIndexHelper().getFooterIndex());
               });

            });

         });

      });
   });
});
