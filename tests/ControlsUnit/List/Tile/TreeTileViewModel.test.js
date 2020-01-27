define(['Controls/_tile/TreeTileView/TreeTileViewModel', 'Types/collection'], function(TreeTileViewModel, collection) {
   'use strict';

   describe('Controls/_tile/TreeTileView/TreeTileViewModel', function() {
      var
         treeTileViewModel = new TreeTileViewModel({
            tileMode: 'static',
            itemsHeight: 300,
            imageProperty: 'image',
            keyProperty: 'id',
            parentProperty: 'parent',
            nodeProperty: 'parent@',
            groupingKeyCallback: function(item) {
               return item.get('group');
            },
            items: new collection.RecordSet({
               rawData: [{
                  'id': 1,
                  'parent': null,
                  'parent@': true,
                  'group': '1'
               }, {
                  'id': 2,
                  'parent': null,
                  'parent@': null,
                  'group': '1'
               },
               {
                  'id': 3,
                  'parent': null,
                  'parent@': true,
                  'group': '1'
               },
               {
                  'id': 4,
                  'parent': 4,
                  'parent@': null,
                  'group': '1'
               }],
               keyProperty: 'id'
            }),
            expandedItems: [1, 2, 3],
            collapsedItems: [4, 5]
         });
      var treeTileViewModelWithoutLeaves = new TreeTileViewModel({
         tileMode: 'static',
         itemsHeight: 300,
         imageProperty: 'image',
         keyProperty: 'id',
         parentProperty: 'parent',
         nodeProperty: 'parent@',
         items: new collection.RecordSet({
            rawData: [{
               'id': 1,
               'parent': null,
               'parent@': true,
            },
            {
               'id': 2,
               'parent': null,
               'parent@': true,
            }],
            keyProperty: 'id'
         }),
      });

      it('constructor', function() {
         assert.equal(treeTileViewModel.getTileMode(), 'static');
         assert.equal(treeTileViewModel.getItemsHeight(), 300);
      });

      it('prepareDisplayFilterData', function() {
         var
            filterData = treeTileViewModel.prepareDisplayFilterData();
         assert.deepEqual([], filterData.expandedItems);
         assert.deepEqual([], filterData.collapsedItems);
      });

      it('getCurrent', function() {
         var cur;
         treeTileViewModel.setHoveredItem({
            key: 2,
            zoomCoefficient: 1.5,
            position: 'string with style'
         });
         cur = treeTileViewModel.getCurrent();
         assert.isTrue(cur.isGroup);
         assert.isTrue(!!cur.beforeItemTemplate);

         treeTileViewModel.goToNext();
         cur = treeTileViewModel.getCurrent();
         assert.equal(cur.tileMode, 'static');
         assert.equal(cur.itemsHeight, 300);
         assert.equal(cur.imageProperty, 'image');
         assert.isUndefined(cur.zoomCoefficient);
         assert.isFalse(!!cur.isHovered);
         assert.isFalse(!!cur.hasSeparator);

         treeTileViewModel.goToNext();
         cur = treeTileViewModel.getCurrent();
         assert.isTrue(!!cur.isHovered);
         assert.isTrue(!!cur.beforeItemTemplate);
         assert.equal(cur.position, 'string with style');
         assert.equal(cur.zoomCoefficient, 1.5);


         treeTileViewModelWithoutLeaves.goToNext();
         cur = treeTileViewModelWithoutLeaves.getCurrent();
         assert.isTrue(!!cur.afterItemTemplate);
      });

      it('getMultiSelectClassList hidden | for group', function() {
         treeTileViewModel.setMultiSelectVisibility('hidden');
         treeTileViewModel.resetCachedItemData();
         var item = treeTileViewModel.getItemDataByItem(treeTileViewModel.at(0));
         assert.equal(item.multiSelectClassList, '');
      });

      it('getMultiSelectClassList visible | for group', function() {
         treeTileViewModel.setMultiSelectVisibility('visible');
         treeTileViewModel.resetCachedItemData();
         var item = treeTileViewModel.getItemDataByItem(treeTileViewModel.at(0));
         assert.equal(item.multiSelectClassList, 'js-controls-ListView__checkbox js-controls-ListView__notEditable controls-TileView__checkbox js-controls-TileView__withoutZoom');
      });

      it('getMultiSelectClassList hidden', function() {
         treeTileViewModel.setMultiSelectVisibility('hidden');
         var item = treeTileViewModel.getItemDataByItem(treeTileViewModel.getItemById(2, 'id'));
         assert.equal(item.multiSelectClassList, '');
      });


      it('getMultiSelectClassList visible', function() {
         treeTileViewModel.setMultiSelectVisibility('visible');
         var item = treeTileViewModel.getItemDataByItem(treeTileViewModel.getItemById(2, 'id'));
         assert.equal(item.multiSelectClassList, 'js-controls-ListView__checkbox js-controls-ListView__notEditable controls-TileView__checkbox js-controls-TileView__withoutZoom');
         item = treeTileViewModel.getItemDataByItem(treeTileViewModel.getItemById(3, 'id'));
         assert.equal(item.multiSelectClassList, 'js-controls-ListView__checkbox js-controls-ListView__notEditable controls-TileView__checkbox js-controls-TileView__withoutZoom controls-TreeTileView__checkbox');
      });


      it('getMultiSelectClassList onhover selected', function() {
         treeTileViewModel.setMultiSelectVisibility('onhover');
         treeTileViewModel._selectedKeys = {2: true, 3: true};
         var item = treeTileViewModel.getItemDataByItem(treeTileViewModel.getItemById(2, 'id'));
         assert.equal(item.multiSelectClassList, 'js-controls-ListView__checkbox js-controls-ListView__notEditable controls-TileView__checkbox js-controls-TileView__withoutZoom');
         item = treeTileViewModel.getItemDataByItem(treeTileViewModel.getItemById(3, 'id'));
         assert.equal(item.multiSelectClassList, 'js-controls-ListView__checkbox js-controls-ListView__notEditable controls-TileView__checkbox js-controls-TileView__withoutZoom controls-TreeTileView__checkbox');
         treeTileViewModel._selectedKeys = {};
      });

      it('getMultiSelectClassList onhover unselected', function() {
         treeTileViewModel.setMultiSelectVisibility('onhover');
         var item = treeTileViewModel.getItemDataByItem(treeTileViewModel.getItemById(2, 'id'));
         assert.equal(item.multiSelectClassList, 'js-controls-ListView__checkbox js-controls-ListView__notEditable controls-ListView__checkbox-onhover controls-TileView__checkbox js-controls-TileView__withoutZoom');
         item = treeTileViewModel.getItemDataByItem(treeTileViewModel.getItemById(3, 'id'));
         assert.equal(item.multiSelectClassList, 'js-controls-ListView__checkbox js-controls-ListView__notEditable controls-ListView__checkbox-onhover controls-TileView__checkbox js-controls-TileView__withoutZoom controls-TreeTileView__checkbox');
      });

      it('setTileMode', function() {
         var ver = treeTileViewModel._version;
         treeTileViewModel.setTileMode('dynamic');
         assert.equal(treeTileViewModel.getTileMode(), 'dynamic');
         assert.notEqual(ver, treeTileViewModel._version);
      });

      it('setItemsHeight', function() {
         var ver = treeTileViewModel._version;
         treeTileViewModel.setItemsHeight(200);
         assert.equal(treeTileViewModel.getItemsHeight(), 200);
         assert.notEqual(ver, treeTileViewModel._version);
      });

      it('setHoveredItem', function() {
         var ver = treeTileViewModel._version;
         treeTileViewModel.setHoveredItem({key: 1});
         assert.equal(treeTileViewModel.getHoveredItem().key, 1);
         assert.notEqual(ver, treeTileViewModel._version);
      });

      it('setActiveItem', function() {
         treeTileViewModel.setHoveredItem({key: 1});
         treeTileViewModel.setActiveItem(null);
         assert.equal(treeTileViewModel.getHoveredItem(), null);
         treeTileViewModel.setHoveredItem({key: 2});
         treeTileViewModel.setActiveItem({key: 3});
         assert.equal(treeTileViewModel.getHoveredItem().key, 2);
      });

      it('setRoot', function() {
         treeTileViewModel.setHoveredItem({key: 1});
         treeTileViewModel.setRoot('root');
         assert.equal(treeTileViewModel.getHoveredItem(), null);
      });

      it('getTileItemData', function() {
         var tileItemData = treeTileViewModel.getTileItemData();
         assert.deepEqual(tileItemData, {
            defaultFolderWidth: 250,
            defaultItemWidth: 250,
            imageProperty: 'image',
            itemCompressionCoefficient: 0.7,
            itemsHeight: 200,
            defaultShadowVisibility: 'visible',
            tileMode: 'dynamic'
         });
      });
      it('isScaled', function() {
         let itemData = {
            displayProperty: 'title',
            item: {
               title: 'title',
               get: function (prop) {
                  return this.prop;
               }
            },
            isHovered: true,
         };
         assert.isTrue(treeTileViewModel.isScaled(itemData));
         itemData = {
            displayProperty: 'title',
            item: {
               title: 'title',
               get: function (prop) {
                  return this.prop;
               }
            },
         };
         assert.isFalse(treeTileViewModel.isScaled(itemData));
         itemData = {
            item: {
               get: function (prop) {
                  return this.prop;
               }
            },
            scalingMode: 'none',
            isHovered: true,
         };
         assert.isFalse(treeTileViewModel.isScaled(itemData));
         itemData = {
            item: {
               get: function (prop) {
                  return this.prop;
               }
            },
            scalingMode: 'inside',
            isHovered: true,
         };
         assert.isTrue(treeTileViewModel.isScaled(itemData));
      });
   });
});
