define(['Controls/grid', 'Types/collection'], function(gridMod, collection) {
   var
      theme = 'default',
      gridColumns = [
         {
            displayProperty: 'title'
         },
         {
            displayProperty: 'price',
            width: 'auto'
         },
         {
            displayProperty: 'balance',
            width: '100px'
         },
         {
            displayProperty: 'rest',
            width: '1fr'
         }
      ],
      gridHeader = [
         {
            title: '',
            style: 'default',
            startRow: 1,
            endRow: 3,
            startColumn: 1,
            endColumn: 2
         },
         {
            title: 'Цена',
            align: 'right',
            style: 'default',
            sortingProperty: 'price',
            startRow: 1,
            endRow: 2,
            startColumn: 2,
            endColumn: 3
         },
         {
            title: 'Остаток',
            align: 'right',
            style: 'default',
            startRow: 1,
            endRow: 2,
            startColumn: 3,
            endColumn: 4
         },
         {
            title: 'Что-то',
            align: 'right',
            style: 'default',
            startRow: 2,
            endRow: 3,
            startColumn: 2,
            endColumn: 3
         },
         {
            title: 'еще',
            align: 'right',
            style: 'default',
            startRow: 2,
            endRow: 3,
            startColumn: 3,
            endColumn: 4
         }
      ],
      preparedColumnsWithMultiselect = 'grid-template-columns: max-content 1fr auto 100px 1fr;',
      preparedColumnsWithoutMiltiselect = 'grid-template-columns: 1fr auto 100px 1fr;',
      fakeSelf = {
         _options: {
            listModel: {
               getDragItemData: function() {
                  return null;
               }
            }
         }
      };

   describe('Controls.List.Grid.GridView', function() {
      it('GridView.prepareGridTemplateColumns', function() {
         assert.equal(preparedColumnsWithMultiselect, gridMod.GridView._private.getGridTemplateColumns(fakeSelf, gridColumns, true),
            'Incorrect result "prepareGridTemplateColumns with checkbox".');
         assert.equal(preparedColumnsWithoutMiltiselect, gridMod.GridView._private.getGridTemplateColumns(fakeSelf, gridColumns, false),
            'Incorrect result "prepareGridTemplateColumns without checkbox".');
      });
      it('Footer', function() {
         let count = 0;
         let listModel = {
            getCount: () => count,
            getEditingItemData: () => null
         }
         var
             cfg = {
                columns: [
                   { displayProperty: 'field1', template: 'column1' },
                   { displayProperty: 'field2', template: 'column2' }
                ],
                multiSelectVisibility: 'onhover',
                itemPadding: {
                   left: 'S'
                },
                theme
             },
             gridView = new gridMod.GridView(cfg);

         gridView.saveOptions(cfg);
         gridView._listModel = listModel;

         assert.equal(gridView._getFooterClasses(), 'controls-GridView__footer controls-GridView__footer__paddingLeft_withCheckboxes_theme-default');

         gridView._options.multiSelectVisibility = 'visible';
         assert.equal(gridView._getFooterClasses(), 'controls-GridView__footer controls-GridView__footer__paddingLeft_withCheckboxes_theme-default');

         gridView._options.multiSelectVisibility = 'hidden';
         assert.equal(gridView._getFooterClasses(), 'controls-GridView__footer controls-GridView__footer__paddingLeft_s_theme-default');

         gridView._options.itemPadding = undefined;
         assert.equal(gridView._getFooterClasses(), 'controls-GridView__footer controls-GridView__footer__paddingLeft_default_theme-default');
      });
      it('Footer with itemActionsPosition outside', function() {
         let count = 0;
         let editingItemData = {};
         let listModel = {
            getCount: () => count,
            getEditingItemData: () => editingItemData
         }
         var
             cfg = {
                columns: [
                   { displayProperty: 'field1', template: 'column1' },
                   { displayProperty: 'field2', template: 'column2' }
                ],
                itemActionsPosition: 'outside',
                needBottomPadding: false,
                theme
             },
             gridView = new gridMod.GridView(cfg);

         gridView.saveOptions(cfg);
         gridView._listModel = listModel;

         assert.equal(gridView._getFooterClasses(), 'controls-GridView__footer controls-GridView__footer__paddingLeft_withCheckboxes_theme-default controls-GridView__footer__itemActionsV_outside_theme-default');

         editingItemData = null;
         assert.equal(gridView._getFooterClasses(), 'controls-GridView__footer controls-GridView__footer__paddingLeft_withCheckboxes_theme-default');

         count = 10;
         assert.equal(gridView._getFooterClasses(), 'controls-GridView__footer controls-GridView__footer__paddingLeft_withCheckboxes_theme-default controls-GridView__footer__itemActionsV_outside_theme-default');
      });
      it('beforeUpdate', function() {
         var
            superclassBeforeUpdateCalled = false,
            cfg = {
               columns: [
                  { displayProperty: 'field1', template: 'column1' },
                  { displayProperty: 'field2', template: 'column2' }
               ]
            },
            gridView = new gridMod.GridView(cfg),
            superclassBeforeUpdate = gridMod.GridView.superclass._beforeUpdate;
         gridView.saveOptions(cfg);
         gridMod.GridView.superclass._beforeUpdate = function() {
            superclassBeforeUpdateCalled = true;
            superclassBeforeUpdate.apply(this, arguments);
         };
         gridView._beforeUpdate(cfg);
         gridMod.GridView.superclass._beforeUpdate = superclassBeforeUpdate;
         assert.isTrue(superclassBeforeUpdateCalled, 'Superclass method not called in "_beforeUpdate".');
         gridView._listModel = {
            _isMultiHeader: true,
            setHeader: () => null,
         };
         let isColumnScrollChanged = false;
         gridView._listModel.setColumnScroll = () => { isColumnScrollChanged = true; }
         gridView._beforeUpdate({ ...cfg, columnScroll: true });
         assert.isTrue(isColumnScrollChanged);

      });
      it('afterMount', function() {
         var
            cfg = {
               columns: [
                  { displayProperty: 'field1', template: 'column1' },
                  { displayProperty: 'field2', template: 'column2' }
               ]
            },
            gridView = new gridMod.GridView(cfg);

            gridView.saveOptions(cfg);
            gridView._options.header = [{}, {}, {}]
            let setHeightWasCalled = false
            gridView._isHeaderChanged = false;
            gridView._afterMount = () => {
               if (gridView._options.header && gridView._listModel._isMultiHeader && gridView._listModel.isStickyHeader()) {
                  gridView._listModel.setHeaderCellMinHeight(gridView._setHeaderWithHeight());
               }
               gridView._isHeaderChanged = true
            }

            gridView._listModel = {
               _isMultiHeader: true,
               isStickyHeader: () => true,
               setHeaderCellMinHeight: (header) => header.length,
               _isMultiHeader: true,
               isDrawHeaderWithEmptyList: () => true
            }
            gridView._setHeaderWithHeight = () => {
               setHeightWasCalled = true;
               return [{}, {}, {}, {}]
            }
            gridView._afterMount();
            assert.isTrue(gridView._isHeaderChanged);
      });

      it('update resultsVisibility', function() {
         const cfg = {
               columns: [
                  { displayProperty: 'field1', template: 'column1' },
                  { displayProperty: 'field2', template: 'column2' }
               ],
               resultsVisibility: 'visible'
            };
         const gridView = new gridMod.GridView(cfg);
         const listModel = {
            resultsVisibility: 'visible',
            setResultsVisibility(resultsVisibility) {
               this.resultsVisibility = resultsVisibility;
            }
         };
         gridView.saveOptions(cfg);
         gridView._listModel = listModel;
         gridView._beforeUpdate({...cfg, resultsVisibility: 'hidden'});
         assert.equal(gridView._listModel.resultsVisibility, 'hidden');
      });

      it('resultPosition update', function(){
         let gridView = new gridMod.GridView({resultsPosition: 'top'});
         let setResultPosinionCalled = false;
         gridView._listModel = {setResultsPosition: function() {
               setResultPosinionCalled = true;
            }};
         gridView._beforeUpdate({resultsPosition: 'bottom'});
         assert.isTrue(setResultPosinionCalled, 'setPesultPosinion');
      });

      it('getGridTemplateColumns', function () {
         var
             columns = [
                {displayProperty: 'field1', width: '1fr'},
                {displayProperty: 'field2', width: 'auto'},
                {displayProperty: 'field3'},
             ];

         assert.equal(gridMod.GridView._private.getGridTemplateColumns(fakeSelf, columns, true), 'grid-template-columns: max-content 1fr auto 1fr;');
         assert.equal(gridMod.GridView._private.getGridTemplateColumns(fakeSelf, columns, false), 'grid-template-columns: 1fr auto 1fr;');
      });

      describe('getHeaderHeight', () => {
         const cfg = {
            columns: [
               { displayProperty: 'field1', template: 'column1' },
               { displayProperty: 'field2', template: 'column2' }
            ],
            header: gridHeader,
            multiSelectVisibility: 'hidden',
         };
         let gridView;
         beforeEach(() => {
            gridView = new gridMod.GridView(cfg);
             gridView._children.header = {};
             gridView._listModel = {};
         });


         it('no headerContainer', function () {
             gridView._children.header = null;
            assert.equal(0, gridView.getHeaderHeight());
         });

         it('simple header', function () {
            const headerHeight = 30;
             gridView._children.header.getBoundingClientRect = () => ({ height: headerHeight });
            gridView._listModel._isMultiHeader = false;
            assert.equal(headerHeight, gridView.getHeaderHeight());
         });

         it('empty multi header', function () {
            gridView._listModel._isMultiHeader = true;
            // No header cells
            gridView._children.header.children = [];
            assert.equal(0, gridMod.GridView._private.getMultiHeaderHeight(gridView._children.header));
         });

         it('multi header', function () {
            gridView._listModel._isMultiHeader = true;
            gridView._children.header.children = [
               { top: 0, bottom: 10 },
               { top: 10, bottom: 20 },
               { top: 20, bottom: 30 },
               { top: 0, bottom: 30 },
               { top: 0, bottom: 15 },
               { top: 15, bottom: 30 }
            ];
            assert.equal(30, gridMod.GridView._private.getMultiHeaderHeight(gridView._children.header, (cell) => ({
               top: cell.top,
               bottom: cell.bottom
            })));
         });
      });

      it('getResultsHeight and getHeaderHeight', function() {
         const cfg = {
                columns: [
                   { displayProperty: 'field1', template: 'column1' },
                   { displayProperty: 'field2', template: 'column2' }
                ],
                header: gridHeader,
                resultsPosition: 'top',
                multiSelectVisibility: 'hidden',
             };
         const gridView = new gridMod.GridView(cfg);
         gridView._listModel = {
            isDrawHeaderWithEmptyList: function() {
               return true
            }
         };
         gridView._children.header = {
            getBoundingClientRect: () => ({ height: 40 })
         }
         gridView._children.results = {
            getBoundingClientRect: () => ({ height: 20 })
         }
         gridView.saveOptions(cfg);
         assert.equal(40, gridView.getHeaderHeight());
         assert.equal(20, gridView.getResultsHeight());

         gridView._listModel = {
            isDrawHeaderWithEmptyList: function() {
               return false
            }
         };
         gridView._children.header = undefined;
         gridView._children.results = undefined;

         assert.equal(0, gridView.getHeaderHeight());
         assert.equal(0, gridView.getResultsHeight());

      });

      it('itemClick sends right args', function() {
         const cfg = {
            multiSelectVisibility: 'visible',
            columns: [
               { displayProperty: 'field1', template: 'column1' },
               { displayProperty: 'field2', template: 'column2' }
            ]
         };
         const gridView = new gridMod.GridView(cfg);

         let isEventRaised = false;
         let isNativeStopped = false;
         const fakeEvent = {
            stopImmediatePropagation() {
               isNativeStopped = true;
            },
            target: {
               closest: (selector) => {
                  if (selector === '.controls-Grid__row') {
                     return {
                        querySelectorAll: () => ['multiselect', 0, 1]
                     };
                  }
                  if (selector === '.controls-Grid__row-cell') {
                     return 1;
                  }
               }
            }
         };
         const item = {};
         const fakeDispItem = {
            getContents: () => item
         };
         gridView._notify = function (e, args) {
            if (e === 'itemClick') {
               isEventRaised = true;
               assert.equal(args[0], item);
               assert.equal(args[1], fakeEvent);
               assert.equal(args[2], 1);
            }
         };
         gridView._onItemClick(fakeEvent, fakeDispItem);
         assert.isTrue(isEventRaised);
         assert.isTrue(isNativeStopped);
      });

      describe('editArrowClick', function() {
         it('click on editArrow stops click event', function() {
            let cfg = {
                   columns: [
                      { displayProperty: 'field1', template: 'column1' },
                      { displayProperty: 'field2', template: 'column2' }
                   ]
                };
            let gridView = new gridMod.GridView(cfg);
            let clickEvent = {
               stopped: false,
               stopPropagation: function() {
                  this.stopped = true;
               }
            };
            let editArrowClickNotified = false;
            gridView._notify = function (e) {
               if (e === 'editArrowClick') {
                  editArrowClickNotified = true;
               }
            }
            gridView._onEditArrowClick(clickEvent);
            assert.isTrue(clickEvent.stopped);
            assert.isTrue(editArrowClickNotified);
         });
      });

      it('set columns and header on mount', function () {
         const cfg = {
            multiSelectVisibility: 'hidden',
            columns: [
               { displayProperty: 'field1', template: 'column1' },
               { displayProperty: 'field2', template: 'column2' }
            ]
         };
         const gridView = new gridMod.GridView(cfg);
         const calledMethods = [];
         gridView.saveOptions(cfg);
         gridView._listModel = {
            setBaseItemTemplateResolver: () => {},
            setHeaderVisibility: () => {},
            setColumnTemplate: () => {},
            setColumnScroll: (opts, silent) => {calledMethods.push(['setColumnScroll', silent])},
            setColumns: (opts, silent) => {calledMethods.push(['setColumns', silent])},
            setHeader: (opts, silent) => {calledMethods.push(['setHeader', silent])}
         };
         gridView._beforeMount(cfg);

         assert.deepEqual(calledMethods, [['setColumnScroll', true], ['setColumns', true], ['setHeader', true]]);
      });

      describe('column scroll', function () {

         const DEBUG = true;
         let gridView;
         let cfg;
         let contentContainer;
         let tempCfg;

         beforeEach(() => {
            tempCfg = {
               multiSelectVisibility: 'visible',
               columnScroll: true,
               columns: [
                  { displayProperty: 'field1', template: 'column1' },
                  { displayProperty: 'field2', template: 'column2' }
               ]
            };

            const listModel = new gridMod.GridViewModel({
               ...tempCfg,
               items: new collection.RecordSet({
                  rawData: [ { id: 1, title: 'first'}, { id: 2, title: 'second'} ],
                  keyProperty: 'id'
               })
            });

            cfg = {...tempCfg, listModel};

            gridView = new gridMod.GridView(cfg);

            contentContainer = {
               offsetWidth: 100,
               scrollWidth: 200,
               querySelector: () => {},
               querySelectorAll: (selector) => selector === '.controls-Grid_columnScroll_wrapper' ? [] : null
            };

            gridView._children.columnScrollContainer = {
               offsetWidth: contentContainer['offsetWidth'],
               getClientRects: () => [{}, {}],
               getElementsByClassName: (selector) => {
                  if (selector === 'controls-Grid_columnScroll') {
                     return [contentContainer];
                  } else if(selector === 'js-controls-GridView__emptyTemplate') {
                     return [null];
                  }
               }
            };
            gridView._children.columnScrollStylesContainer = {};
         });

         describe('init, disable and destroy column scroll', () => {
            const ERROR_MSG = {
               SHOULD_BE: {
                  COLUMN_SCROLL: 'ColumnScrollController must be created.',
                  DRAG_SCROLL: 'DragScrollController must be created.'
               },
               SHOULD_NOT_BE: {
                  COLUMN_SCROLL: 'ColumnScrollController must be undefined or null.',
                  DRAG_SCROLL: 'DragScrollController must be undefined or null.'
               }
            };

            beforeEach(() => {
               gridView.saveOptions(cfg);
            });

            it('on mount, without column scroll', () => {
               gridView._beforeMount({...cfg, columnScroll: undefined});
               gridView.saveOptions({...cfg, columnScroll: undefined});
               gridView._afterMount();
               assert.isUndefined(gridView._columnScrollController, ERROR_MSG.SHOULD_NOT_BE.COLUMN_SCROLL);
               assert.isUndefined(gridView._dragScrollController, ERROR_MSG.SHOULD_NOT_BE.DRAG_SCROLL);
               assert.isUndefined(gridView._listModel._options.columnScrollVisibility);
            });

            it('on mount, with drag scroll, default options', () => {
               gridView._beforeMount(cfg);
               gridView.saveOptions(cfg);
               gridView._afterMount();
               assert.isDefined(gridView._columnScrollController, ERROR_MSG.SHOULD_BE.COLUMN_SCROLL);
               assert.isDefined(gridView._dragScrollController, ERROR_MSG.SHOULD_BE.DRAG_SCROLL);
               assert.isTrue(gridView._listModel._options.columnScrollVisibility);
            });

            it('on mount, with items DND', () => {
               gridView._beforeMount({...cfg, itemsDragNDrop: true});
               gridView.saveOptions({...cfg, itemsDragNDrop: true});
               gridView._afterMount();
               assert.isDefined(gridView._columnScrollController, ERROR_MSG.SHOULD_BE.COLUMN_SCROLL);
               assert.isUndefined(gridView._dragScrollController, ERROR_MSG.SHOULD_NOT_BE.DRAG_SCROLL);
               assert.isTrue(gridView._listModel._options.columnScrollVisibility);
            });

            it('on mount, with items DND and drag scroll', () => {
               gridView._beforeMount({...cfg, itemsDragNDrop: true, dragScrolling: true});
               gridView.saveOptions({...cfg, itemsDragNDrop: true, dragScrolling: true});
               gridView._afterMount();
               assert.isDefined(gridView._columnScrollController, ERROR_MSG.SHOULD_BE.COLUMN_SCROLL);
               assert.isDefined(gridView._dragScrollController, ERROR_MSG.SHOULD_BE.DRAG_SCROLL);
               assert.isTrue(gridView._listModel._options.columnScrollVisibility);
            });

            it('by update options', () => {
               gridView._beforeMount(cfg);
               gridView.saveOptions(cfg);
               gridView._afterMount();

               assert.isDefined(gridView._columnScrollController, ERROR_MSG.SHOULD_BE.COLUMN_SCROLL);
               assert.isDefined(gridView._dragScrollController, ERROR_MSG.SHOULD_BE.DRAG_SCROLL);
               assert.isTrue(gridView._listModel._options.columnScrollVisibility);

               gridView._beforeUpdate({...cfg, columnScroll: false});

               assert.isNull(gridView._columnScrollController, ERROR_MSG.SHOULD_NOT_BE.COLUMN_SCROLL);
               assert.isNull(gridView._dragScrollController, ERROR_MSG.SHOULD_NOT_BE.DRAG_SCROLL);
               assert.isFalse(gridView._listModel._options.columnScrollVisibility);

               gridView._beforeUpdate({...cfg, columnScroll: true});

               assert.isDefined(gridView._columnScrollController, ERROR_MSG.SHOULD_BE.COLUMN_SCROLL);
               assert.isDefined(gridView._dragScrollController, ERROR_MSG.SHOULD_BE.DRAG_SCROLL);
            });

            it('destroy column scroll before unmount view', () => {
               gridView._beforeMount(cfg);
               gridView.saveOptions(cfg);
               gridView._afterMount();

               assert.isDefined(gridView._columnScrollController, ERROR_MSG.SHOULD_BE.COLUMN_SCROLL);
               assert.isDefined(gridView._dragScrollController, ERROR_MSG.SHOULD_BE.DRAG_SCROLL);

               gridView._beforeUnmount();

               assert.isNull(gridView._columnScrollController, ERROR_MSG.SHOULD_NOT_BE.COLUMN_SCROLL);
               assert.isNull(gridView._dragScrollController, ERROR_MSG.SHOULD_NOT_BE.DRAG_SCROLL);
            });
         });

         describe('update sizes', () => {
            it('on view resize', async () => {
               gridView.saveOptions(cfg);
               gridView._afterMount();

               await new Promise((resolve) => {
                  contentContainer.offsetWidth = 125;
                  contentContainer.scrollWidth = 600;
                  gridView._resizeHandler();

                  setTimeout(() => {
                     assert.equal(gridView._containerSize, 125);
                     assert.equal(gridView._contentSizeForHScroll, 600);
                     resolve();
                  }, 20);
               });
            });

            it('on list collection changed', async () => {
               gridView.saveOptions(cfg);
               gridView._afterMount();

               await new Promise((resolve) => {
                  contentContainer.offsetWidth = 125;
                  contentContainer.scrollWidth = 600;
                  gridView.resizeNotifyOnListChanged();

                  setTimeout(() => {
                     assert.equal(gridView._containerSize, 125);
                     assert.equal(gridView._contentSizeForHScroll, 600);
                     resolve();
                  }, 20);
               });
            });

            it('on toggle multiselect', async () => {
               gridView.saveOptions({...cfg, multiSelectVisibility: 'hidden'});
               gridView._afterMount();

               assert.equal(gridView._containerSize, 100);
               assert.equal(gridView._contentSizeForHScroll, 200);

               /*
               * Переключение режима множественного выбора приводит к ресайзу списка
               * и запускается отложенное обновление размеров. Нужно проверить, что
               * отложенное обновление будет вызвано на контроллере с правильными опциями.
               * */
               contentContainer.offsetWidth = 125;
               contentContainer.scrollWidth = 600;

               await new Promise((resolve) => {
                  gridView._beforeUpdate({...cfg, multiSelectVisibility: 'visible'});
                  gridView.saveOptions({...cfg, multiSelectVisibility: 'visible'});
                  gridView._resizeHandler();
                  gridView._isColumnScrollVisible = () => {};
                  gridView._afterUpdate({...cfg, multiSelectVisibility: 'hidden'});

                  setTimeout(resolve, 20);
               }).then(() => {
                  assert.equal(gridView._containerSize, 125);
                  assert.equal(gridView._contentSizeForHScroll, 600);
               });
            });

            it('should update columnScrollVisibilty in model after editingItemData has changed', () => {
               const items = new collection.RecordSet({
                  rawData: [],
                  keyProperty: 'id'
               });
               const listModel = new gridMod.GridViewModel({ ...tempCfg, items });
               const oldOptions = { ...cfg, listModel };
               const newOptions = {...cfg, listModel, editingItemData: {id: 1}};

               gridView._beforeMount(oldOptions);
               gridView.saveOptions(oldOptions);
               gridView._afterMount();
               gridView._children.columnScrollContainer = {
                  getElementsByClassName: (selector) => selector === 'controls-Grid_columnScroll' ? [{offsetWidth: 100, scrollWidth: 200}] : null
               };

               assert.notExists(gridView._listModel.getColumnScrollVisibility());

               gridView._beforeUpdate(newOptions);
               gridView.saveOptions(newOptions);
               gridView._afterUpdate(newOptions);

               assert.isTrue(gridView._listModel.getColumnScrollVisibility());
            });

            it('should update column scroll sizes if options has been changed (only once per lifecycle)', () => {
               const oldOptions = {...cfg, multiSelectVisibility: 'hidden'};
               const newOptions = {...cfg, multiSelectVisibility: 'visible', stickyColumnsCount: 2};
               const calledMethods = [];
               gridView.saveOptions(oldOptions);
               gridView._columnScrollController = {
                  setStickyColumnsCount: () => {calledMethods.push('setStickyColumnsCount')},
                  setMultiSelectVisibility: () => {calledMethods.push('setMultiSelectVisibility')},
                  updateSizes: () => {calledMethods.push('updateSizes')},
                  isVisible: () => {}
               };
               gridView._children.columnScrollContainer = {
                  getElementsByClassName: (selector) => selector === 'controls-Grid_columnScroll' ? [{offsetWidth: 100, scrollWidth: 200}] : null
               };

               gridView._beforeUpdate(newOptions);
               gridView.saveOptions(newOptions);
               gridView._isColumnScrollVisible = () => {};
               gridView._afterUpdate(oldOptions);

               assert.deepEqual(calledMethods, ['setStickyColumnsCount', 'setMultiSelectVisibility', 'updateSizes']);
            });
         });

         describe('itemActions on touch device', () => {
            let wasSwipeInited;
            let wasSwipeClosed;
            let swipeDirection;
            let wasEventStopped;

            const createTouchStartEvent = (touches) => ({
               preventDefault: () => {},
               nativeEvent: {
                  touches: touches.map((t) => ({
                     clientX: t
                  }))
               },
               target: {
                  closest: () => null
               }
            });

            const createSwipeEvent = (direction, isFixed) => ({
               stopPropagation: () => {
                  wasEventStopped = true;
               },
               nativeEvent: { direction },
               target: {
                  closest: () => isFixed
               }
            });

            beforeEach(async() => {
               wasSwipeInited = false;
               wasSwipeClosed = false;
               wasEventStopped = false;

               contentContainer.querySelector = (selector) => selector === '.controls-Grid_columnScroll__fixed:nth-child(2)' ? {
                  getBoundingClientRect: () => ({
                     left: 25
                  }),
                  offsetWidth: 25
               } : null;
               contentContainer.getBoundingClientRect = () => ({
                  left: 0
               });
               gridView._children.columnScrollContainer.getBoundingClientRect = () => ({
                  left: 0
               });


               gridView.saveOptions(cfg);
               await gridView._afterMount();
               gridView._notify = (eName, args) => {
                  if (eName === 'itemSwipe') {
                     wasSwipeInited = true;
                     const event = args[1];
                     swipeDirection = event.nativeEvent.direction;
                  } else if (eName === 'closeSwipe') {
                     wasSwipeClosed = true;
                  }
               };
            });

            // -->
            describe('right swipe', () => {
               it('on fixed area', () => {
                  gridView._startDragScrolling(createTouchStartEvent([30]), 'touch');
                  gridView._onItemSwipe(createSwipeEvent('right', true));

                  assert.isTrue(wasSwipeInited);
                  assert.equal(swipeDirection, 'right');
                  assert.isFalse(gridView._leftSwipeCanBeStarted);
               });
               it('on scrollable area, out of available area for swipe', () => {
                  gridView._startDragScrolling(createTouchStartEvent([55]), 'touch');
                  gridView._onItemSwipe(createSwipeEvent('right', false));

                  assert.isFalse(wasSwipeInited);
                  assert.isFalse(gridView._leftSwipeCanBeStarted);
               });
               it('on scrollable area, into available area for swipe', () => {
                  gridView._startDragScrolling(createTouchStartEvent([98]), 'touch');
                  gridView._onItemSwipe(createSwipeEvent('right', false));

                  assert.isFalse(wasSwipeInited);
                  assert.isFalse(gridView._leftSwipeCanBeStarted);
               });
            });

            // <--
            describe('left swipe', () => {
               it('on fixed area', () => {
                  gridView._startDragScrolling(createTouchStartEvent([30]), 'touch');
                  gridView._onItemSwipe(createSwipeEvent('left', true));

                  assert.isFalse(wasSwipeInited);
                  assert.isFalse(gridView._leftSwipeCanBeStarted);
               });
               it('on scrollable area, out of available area for swipe', () => {
                  gridView._startDragScrolling(createTouchStartEvent([55]), 'touch');
                  gridView._onItemSwipe(createSwipeEvent('left', false));

                  assert.isFalse(wasSwipeInited);
                  assert.isFalse(gridView._leftSwipeCanBeStarted);
               });
               it('on scrollable area, into available area for swipe', () => {
                  gridView._startDragScrolling(createTouchStartEvent([98]), 'touch');
                  gridView._onItemSwipe(createSwipeEvent('left', false));

                  assert.isTrue(wasSwipeInited);
                  assert.equal(swipeDirection, 'left');
                  assert.isFalse(gridView._leftSwipeCanBeStarted);
               });
               it('shouldn\'t handle top swipe', () => {
                  gridView._startDragScrolling(createTouchStartEvent([55]), 'touch');
                  gridView._onItemSwipe(createSwipeEvent('top', false));

                  assert.isFalse(wasSwipeInited);
                  assert.isFalse(wasEventStopped);
                  assert.notExists(gridView._leftSwipeCanBeStarted);
               });
               it('shouldn\'t handle bottom swipe', () => {
                  gridView._startDragScrolling(createTouchStartEvent([55]), 'touch');
                  gridView._onItemSwipe(createSwipeEvent('bottom', false));

                  assert.isFalse(wasSwipeInited);
                  assert.isFalse(wasEventStopped);
                  assert.notExists(gridView._leftSwipeCanBeStarted);
               });
            });
         });

         it('mounting with option startScrollPosition === end', () => {
            const testCfg = { ...cfg, columnScrollStartPosition: 'end' };
            gridView._beforeMount(testCfg);
            gridView.saveOptions(testCfg);

            gridView._afterMount(testCfg);

            assert.equal(100, gridView._columnScrollController.getScrollPosition());

            assert.equal(200, gridView._contentSizeForHScroll);
            assert.equal(100, gridView._horizontalScrollWidth);
            assert.equal(100, gridView._containerSize);

            assert.equal(100, gridView._dragScrollController._scrollLength);
            assert.equal(100, gridView._dragScrollController._scrollPosition);
         });

         it('is drag scrolling enabled in different cases', () => {
            /* [dragScrolling, itemsDragNDrop, expectedVisibility] */
            [
               [undefined, undefined, true],
               [undefined, true, false],
               [undefined, false, true],
               [true, undefined, true],
               [true, true, true],
               [true, false, true],
               [false, undefined, false],
               [false, true, false],
               [false, false, false]
            ].forEach((params, index) => {
               assert.equal(
                   params[2],
                   gridView._isDragScrollingEnabled({ dragScrolling: params[0], itemsDragNDrop: params[1] }),
                   `Wrong drag scroll visibility with params[${index}]: {dragScrolling: ${params[0]}, itemsDragNDrop: ${params[1]}}`
               );
            });
         });

         it('is column scroll visible in different cases', () => {
            gridView._beforeMount(cfg);
            let needScrollBySize;
            let hasItemsRecordSet;
            let itemsCount;
            let setEditing = (hasEditing) => {
               gridView._options.editingItemData = hasEditing
            };

            gridView._columnScrollController = { isVisible: () => needScrollBySize };
            gridView._options.listModel = {
               getItems: () => hasItemsRecordSet ? {
                  getCount: () => itemsCount
               } : null
            };

            // hasItemsRecordSet, itemsCount, needScrollBySize, hasEditing, headerInEmptyListVisible,  EXPECTED_VISIBILITY
            [
               [false, 0, false, false, true, false],
               [false, 0, false, true, true, false],
               [false, 0, true, false, true, true],
               [false, 0, true, true, true, true],
               [false, 5, false, false, true, false],
               [false, 5, false, true, true, false],
               [false, 5, true, false, true, true],
               [false, 5, true, true, true, true],
               [true, 0, false, false, true, false],
               [true, 0, false, true, true, false],
               [true, 0, true, false, true, true],
               [true, 0, true, true, true, true],
               [true, 5, false, false, true, false],
               [true, 5, false, true, true, false],
               [true, 5, true, false, true, true],
               [true, 5, true, true, true, true],

               [false, 0, false, false, false, false],
               [false, 0, false, true, false, false],
               [false, 0, true, false, false, false],
               [false, 0, true, true, false, false],
               [false, 5, false, false, false, false],
               [false, 5, false, true, false, false],
               [false, 5, true, false, false, false],
               [false, 5, true, true, false, false],
               [true, 0, false, false, false, false],
               [true, 0, false, true, false, false],
               [true, 0, true, false, false, false],
               [true, 0, true, true, false, true],
               [true, 5, false, false, false, false],
               [true, 5, false, true, false, false],
               [true, 5, true, false, false, true],
               [true, 5, true, true, false, true]
            ].forEach((params, index) => {
               hasItemsRecordSet = params[0];
               itemsCount = params[1];
               needScrollBySize = params[2];
               setEditing(params[3]);
               gridView._options.headerInEmptyListVisible = params[4];

               assert.equal(params[5], gridView._isColumnScrollVisible(),
                   `Wrong column scroll visibility with params[${index}]: {hasItemsRecordSet: ${params[0]}, itemsCount: ${params[1]}, needScrollBySize: ${params[2]}, hasEditing: ${params[3]}, headerInEmptyListVisible: ${params[4]}.}`
               );
            });
         });

        /* it('update column scroll shadow classes should not leads to forceUpdate (const classes object)', () => {
            gridView.saveOptions(cfg);
            gridView._afterMount();

            const oldClasses = gridView._columnScrollShadowClasses;
            assert.equal(
                'controls-ColumnScroll__shadow_theme-default controls-ColumnScroll__shadow_without-bottom-padding_theme-default controls-ColumnScroll__shadow-start_theme-default controls-horizontal-gradient-default_theme-default controls-ColumnScroll__shadow_invisible',
                oldClasses.start
            );
            assert.equal(
                'controls-ColumnScroll__shadow_theme-default controls-ColumnScroll__shadow_without-bottom-padding_theme-default controls-ColumnScroll__shadow-end_theme-default controls-horizontal-gradient-default_theme-default',
                oldClasses.end
            );
            gridView._columnScrollController._shadowState.start = true;
            gridView._updateColumnScrollShadowClasses();

            const newClasses = gridView._columnScrollShadowClasses;
            assert.equal(
                'controls-ColumnScroll__shadow_theme-default controls-ColumnScroll__shadow_without-bottom-padding_theme-default controls-ColumnScroll__shadow-start_theme-default controls-horizontal-gradient-default_theme-default',
                newClasses.start
            );
            assert.equal(
                'controls-ColumnScroll__shadow_theme-default controls-ColumnScroll__shadow_without-bottom-padding_theme-default controls-ColumnScroll__shadow-end_theme-default controls-horizontal-gradient-default_theme-default',
                newClasses.end
            );

            assert.equal(oldClasses, newClasses);
         });*/

         it('update column scroll shadow styles should leads to forceUpdate', () => {
            gridView.saveOptions(cfg);
            gridView._afterMount();

            const oldStyles = gridView._columnScrollShadowStyles;

            assert.equal('', oldStyles.start);
            assert.equal('', oldStyles.end);

            gridView._columnScrollController._shadowState.start = true;
            gridView._updateColumnScrollShadowStyles();

            const newStyles = gridView._columnScrollShadowStyles;
            assert.equal('left: 0px;', newStyles.start);
            assert.equal('', newStyles.end);

            assert.notEqual(oldStyles, newStyles);
         });

         it('should call drag scroll methods only if column scroll enabled', () => {
            const calledMethods = [];
            gridView._dragScrollController = {};

            [
               'onViewMouseDown',
               'onViewTouchStart',
               'onViewMouseMove',
               'onViewTouchMove',
               'onViewMouseUp',
               'onViewTouchEnd',
               'onOverlayMouseMove',
               'onOverlayTouchMove',
               'onOverlayMouseUp',
               'onOverlayTouchEnd',
               'onOverlayMouseLeave'
            ].forEach((methodName) => {
               gridView._dragScrollController[methodName] = () => {
                  calledMethods.push(methodName);
               };
            });

            gridView._startDragScrolling({}, 'mouse');
            gridView._startDragScrolling({}, 'touch');
            gridView._moveDragScroll({}, 'mouse');
            gridView._moveDragScroll({}, 'touch');
            gridView._stopDragScrolling({}, 'mouse');
            gridView._stopDragScrolling({}, 'touch');

            assert.deepEqual(calledMethods, []);
         });

         it('resize on list changed with column scroll', () => {
            let columnScrollResizeHandlerCalled = false;
            let updateShadowStyleCalled = false;
            gridView.saveOptions(cfg);

            gridView._columnScrollController = {
               updateSizes(c) {
                  columnScrollResizeHandlerCalled = true;
                  c({
                     contentSizeForScrollBar: 100,
                     scrollWidth: 80
                  });
               }
            };
            gridView._updateColumnScrollData = () => {
               updateShadowStyleCalled = true;
            };
            gridView._isFullMounted = true;

            gridView.resizeNotifyOnListChanged();
            assert.isTrue(columnScrollResizeHandlerCalled);
            assert.isTrue(updateShadowStyleCalled);
         });
      });

      // при смене columnScroll необходимо пересчитывать настройки хеадера
      it('should update header when columnScroll has changed', () => {
         let isSetHeaderCalled = false;
         const cfg = {
            multiSelectVisibility: 'hidden',
            stickyColumnsCount: 1,
            columnScroll: false,
            columns: [
               { displayProperty: 'field1', template: 'column1' },
               { displayProperty: 'field2', template: 'column2' }
            ],
            header: [
               { displayProperty: 'field1', template: 'column1' },
               { displayProperty: 'field2', template: 'column2' }
            ]
         };
         const gridView = new gridMod.GridView(cfg);
         gridView.saveOptions(cfg);
         gridView._listModel = {
            setHeader: () => {
               isSetHeaderCalled = true;
            },
            setColumnScroll: () => {},
            setColumnScrollVisibility: () => {}
         };
         gridView._children = {
            columnScrollContainer: {
               getElementsByClassName: () => [{

               }]
            }
         };
         gridView._beforeUpdate({...cfg, columnScroll: true});
         gridView.saveOptions({...cfg, columnScroll: true});
         gridView._afterUpdate({...cfg, columnScroll: true});
         assert.isTrue(isSetHeaderCalled);
      });
   });
});
