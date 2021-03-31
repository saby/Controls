define(['Controls/_tile/TreeTileView/TreeTileViewModel', 'Types/collection'], function(TreeTileViewModel, collection) {
   'use strict';

   describe('Controls/_tile/TreeTileView/TreeTileViewModel', function() {
      const urlResolver = () => {};
      var
         treeTileViewModel = new TreeTileViewModel({
            tileMode: 'static',
            itemsHeight: 300,
            imageProperty: 'image',
            folderWidth: 250,
            keyProperty: 'id',
            parentProperty: 'parent',
            nodeProperty: 'parent@',
            displayProperty: 'title',
            tileWidth: 250,
            theme: 'default',
            imageWidthProperty: 'imageWidth',
            imageHeightProperty: 'imageHeight',
            imageFit: 'cover',
            imageUrlResolver: urlResolver,
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
         groupProperty: 'group',
         theme: 'default',
         items: new collection.RecordSet({
            rawData: [{
               'id': 1,
               'parent': null,
               'parent@': true,
               'group': 'group_1'
            },
            {
               'id': 2,
               'parent': null,
               'parent@': true,
               'group': 'group_1'
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


         cur = treeTileViewModelWithoutLeaves.getCurrent();
         assert.isFalse(!!cur.afterItemTemplate);

         treeTileViewModelWithoutLeaves.goToNext();
         cur = treeTileViewModelWithoutLeaves.getCurrent();
         assert.isFalse(!!cur.afterItemTemplate);

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
         assert.equal(item.multiSelectClassList, 'js-controls-ListView__checkbox js-controls-ListView__notEditable controls-List_DragNDrop__notDraggable js-controls-ColumnScroll__notDraggable controls-CheckboxMarker_inList_theme-default controls-TileView__checkbox js-controls-TileView__withoutZoom');
      });

      it('getMultiSelectClassList hidden', function() {
         treeTileViewModel.setMultiSelectVisibility('hidden');
         var item = treeTileViewModel.getItemDataByItem(treeTileViewModel.getItemById(2, 'id'));
         assert.equal(item.multiSelectClassList, '');
      });


      it('getMultiSelectClassList visible', function() {
         treeTileViewModel.setMultiSelectVisibility('visible');
         var item = treeTileViewModel.getItemDataByItem(treeTileViewModel.getItemById(2, 'id'));
         assert.equal(item.multiSelectClassList, 'js-controls-ListView__checkbox js-controls-ListView__notEditable controls-List_DragNDrop__notDraggable js-controls-ColumnScroll__notDraggable controls-CheckboxMarker_inList_theme-default controls-TileView__checkbox js-controls-TileView__withoutZoom');
         item = treeTileViewModel.getItemDataByItem(treeTileViewModel.getItemById(3, 'id'));
         assert.equal(item.multiSelectClassList, 'js-controls-ListView__checkbox js-controls-ListView__notEditable controls-List_DragNDrop__notDraggable js-controls-ColumnScroll__notDraggable controls-CheckboxMarker_inList_theme-default controls-TileView__checkbox js-controls-TileView__withoutZoom controls-TreeTileView__checkbox');
      });


      it('getMultiSelectClassList onhover unselected', function() {
         treeTileViewModel.setMultiSelectVisibility('onhover');
         var item = treeTileViewModel.getItemDataByItem(treeTileViewModel.getItemById(2, 'id'));
         assert.equal(item.multiSelectClassList, 'js-controls-ListView__checkbox js-controls-ListView__notEditable controls-List_DragNDrop__notDraggable js-controls-ColumnScroll__notDraggable controls-CheckboxMarker_inList_theme-default controls-ListView__checkbox-onhover controls-TileView__checkbox js-controls-TileView__withoutZoom');
         item = treeTileViewModel.getItemDataByItem(treeTileViewModel.getItemById(3, 'id'));
         assert.equal(item.multiSelectClassList, 'js-controls-ListView__checkbox js-controls-ListView__notEditable controls-List_DragNDrop__notDraggable js-controls-ColumnScroll__notDraggable controls-CheckboxMarker_inList_theme-default controls-ListView__checkbox-onhover controls-TileView__checkbox js-controls-TileView__withoutZoom controls-TreeTileView__checkbox');
      });

      it('getMultiSelectClassList onhover selected', function() {
         treeTileViewModel.setMultiSelectVisibility('onhover');
         treeTileViewModel.getItemById(2, 'id').setSelected(true);
         treeTileViewModel.getItemById(3, 'id').setSelected(true);
         var item = treeTileViewModel.getItemDataByItem(treeTileViewModel.getItemById(2, 'id'));
         assert.equal(item.multiSelectClassList, 'js-controls-ListView__checkbox js-controls-ListView__notEditable controls-List_DragNDrop__notDraggable js-controls-ColumnScroll__notDraggable controls-CheckboxMarker_inList_theme-default controls-TileView__checkbox js-controls-TileView__withoutZoom');
         item = treeTileViewModel.getItemDataByItem(treeTileViewModel.getItemById(3, 'id'));
         assert.equal(item.multiSelectClassList, 'js-controls-ListView__checkbox js-controls-ListView__notEditable controls-List_DragNDrop__notDraggable js-controls-ColumnScroll__notDraggable controls-CheckboxMarker_inList_theme-default controls-TileView__checkbox js-controls-TileView__withoutZoom controls-TreeTileView__checkbox');
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
         treeTileViewModel.setActiveItem({key: 3, setActive: function() {return null;}});
         assert.equal(treeTileViewModel.getHoveredItem().key, 2);
      });

      it('setRoot', function() {
         treeTileViewModel.setHoveredItem({key: 1});
         treeTileViewModel.setRoot('root');
         assert.equal(treeTileViewModel.getHoveredItem(), null);
      });

      it('getItemWidth', () => {
         let leftImagePositionWidth;
         let rightImagePositionWidth;
         let topImagePositionWidth;
         const item = treeTileViewModel.getItems().at(0);

         treeTileViewModel.setTileSize('s');
         topImagePositionWidth = treeTileViewModel.getItemWidth(item, false, '', '', 'top');
         leftImagePositionWidth = treeTileViewModel.getItemWidth(item, false, '', '', 'left');
         rightImagePositionWidth = treeTileViewModel.getItemWidth(item, false, '', '', 'right');
         assert.equal(topImagePositionWidth, 164);
         assert.isTrue(leftImagePositionWidth === rightImagePositionWidth);
         assert.equal(leftImagePositionWidth, 300);


         treeTileViewModel.setTileSize('m');
         topImagePositionWidth = treeTileViewModel.getItemWidth(item, false, '', '', 'top');
         leftImagePositionWidth = treeTileViewModel.getItemWidth(item, false, '', '', 'left');
         rightImagePositionWidth = treeTileViewModel.getItemWidth(item, false, '', '', 'right');
         assert.equal(topImagePositionWidth, 200);
         assert.isTrue(leftImagePositionWidth === rightImagePositionWidth);
         assert.equal(leftImagePositionWidth, 420);

         treeTileViewModel.setTileSize('l');
         topImagePositionWidth = treeTileViewModel.getItemWidth(item, false, '', '', 'top');
         leftImagePositionWidth = treeTileViewModel.getItemWidth(item, false, '', '', 'left');
         rightImagePositionWidth = treeTileViewModel.getItemWidth(item, false, '', '', 'right');
         assert.equal(topImagePositionWidth, 256);
         assert.isTrue(leftImagePositionWidth === rightImagePositionWidth);
         assert.equal(leftImagePositionWidth, 648);

         treeTileViewModel.setTileSize(null);
      });

      it('getTileItemData', function() {
         let tileItemData = treeTileViewModel.getTileItemData({
            isNode: () => true,
            getContents: () => null
         });
         assert.deepEqual(tileItemData, {
            defaultFolderWidth: 250,
            defaultItemWidth: 250,
            imageProperty: 'image',
            itemCompressionCoefficient: 0.7,
            itemClasses: 'controls-TileView__item_spacingLeft_default_theme-default controls-TileView__item_spacingRight_default_theme-default controls-TileView__item_spacingTop_default_theme-default controls-TileView__item_spacingBottom_default_theme-default',
            itemContentClasses: 'controls-TileView__item_roundBorder_topLeft_default_theme-default controls-TileView__item_roundBorder_topRight_default_theme-default controls-TileView__item_roundBorder_bottomLeft_default_theme-default controls-TileView__item_roundBorder_bottomRight_default_theme-default',
            itemsHeight: 200,
            itemWidth: 250,
            defaultShadowVisibility: 'visible',
            tileMode: 'dynamic',
            displayProperty: 'title',
            imageWidthProperty: 'imageWidth',
            getImageProportion: treeTileViewModel._tileModel.getImageProportion,
            imageHeightProperty: 'imageHeight',
            imageFit: 'cover',
            getItemWidth: treeTileViewModel.getItemWidth,
            imageUrlResolver: urlResolver
         });
         tileItemData = treeTileViewModel.getTileItemData({
            isNode: () => false,
            getContents: () => null
         });
         assert.isTrue(tileItemData.itemWidth === 250);
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
            isActive: () => false,
            isSwiped: () => false
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
            isActive: () => false,
            isSwiped: () => false
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
            isActive: () => false,
            isSwiped: () => false
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
            isActive: () => false,
            isSwiped: () => false
         };
         assert.isTrue(treeTileViewModel.isScaled(itemData));
      });

      it('setDragItemData', () => {
         const itemData = {
            isFixed: true,
            isHovered: true,
            position: { },
            canShowActions: true,
            isAnimated: true,
            zoomCoefficient: 1
         };

         treeTileViewModel.setDragItemData(itemData);
         assert.isFalse(itemData.isFixed);
         assert.isFalse(itemData.isHovered);
         assert.isNull(itemData.position);
         assert.isFalse(itemData.canShowActions);
         assert.isFalse(itemData.isAnimated);
         assert.isNull(itemData.zoomCoefficient);

         treeTileViewModel.setDragItemData(null);
         assert.isNull(treeTileViewModel.getDragItemData());
      });
   });
});
