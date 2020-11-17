define(
   [
      'Controls/toolbars',
      'Types/entity',
      'Types/collection',
      'Types/source',
      'Controls/popup'
   ],
   (toolbars, entity, collection, sourceLib, popupLib) => {
      describe('Toolbar', () => {
         let defaultItems = [
            {
               id: '1',
               title: 'Запись 1',
               parent: null,
               '@parent': null
            },
            {
               id: '2',
               title: 'Запись 2',
               parent: null,
               '@parent': true,
               icon: 'icon-Ezy',
               iconStyle: 'super'
            },
            {
               id: '3',
               title: 'Запись 3',
               icon: 'icon-medium icon-Doge icon-primary',
               parent: null,
               '@parent': null,
               showType: 2
            },
            {
               id: '4',
               title: 'Запись 4',
               buttonViewMode: 'link',
               parent: '2',
               '@parent': null,
               showType: 0
            },
            {
               id: '5',
               title: 'Запись 4',
               buttonViewMode: 'link'
            }
         ];

         let records = new collection.RecordSet({
            rawData: defaultItems
         });
         let config = {
            source: new sourceLib.Memory({
               keyProperty: 'id',
               data: defaultItems
            }),
            parentProperty: 'parent',
            nodeProperty: '@parent'
         };
         let itemWithMenu = new entity.Model({
            rawData: defaultItems[1]
         });
         let itemWithOutMenu = new entity.Model({
            rawData: defaultItems[5]
         });
         let toolbar = new toolbars.View(config);
         toolbar._beforeMount(config);

         toolbar._notify = (e, data) => {
            assert.equal(data[0].id, 'myTestItem');
            assert.equal(e, 'itemClick');
         };
         toolbar._children.menuOpener = {
            close: setTrue.bind(this, assert),
            open: setTrue.bind(this, assert)
         };
         toolbar._children.menuTarget = {
            _container: 'target'
         };

         describe('_isShowToolbar', function() {
            it('Test1', function() {
               const item = new entity.Record({
                  rawData: {
                     parent: null,
                     showType: 2
                  }
               });
               assert.isTrue(toolbar._isShowToolbar(item, toolbar._parentProperty));
            });
            it('Test2', function() {
               const item = new entity.Record({
                  rawData: {
                     parent: 0,
                     showType: 2
                  }
               });
               assert.isFalse(toolbar._isShowToolbar(item, toolbar._parentProperty));
            });
            it('Test3', function() {
               const item = new entity.Record({
                  rawData: {
                     parent: null,
                     showType: 1
                  }
               });
               assert.isTrue(toolbar._isShowToolbar(item, toolbar._parentProperty));
            });
            it('Test4', function() {
               const item = new entity.Record({
                  rawData: {
                     parent: 0,
                     showType: 1
                  }
               });
               assert.isTrue(toolbar._isShowToolbar(item, toolbar._parentProperty));
            });
            it('Test5', function() {
               const item = new entity.Record({
                  rawData: {
                     parent: null,
                     showType: 0
                  }
               });
               assert.isFalse(toolbar._isShowToolbar(item, toolbar._parentProperty));
            });
            it('Test6', function() {
               const item = new entity.Record({
                  rawData: {
                     parent: 0,
                     showType: 0
                  }
               });
               assert.isFalse(toolbar._isShowToolbar(item, toolbar._parentProperty));
            });
         });

         describe('publicMethod', function() {
            it('check received state', () => {
               toolbar._beforeMount(config, null, records);
               assert.isFalse(toolbar._items.isEqual(records));
               assert.equal(!!toolbar._needShowMenu, true);
            });
            it('need show menu', function() {
               return new Promise((resolve) => {
                  toolbar._beforeMount({
                     keyProperty: 'id',
                     source: config.source
                  }).addCallback(() => {
                     assert.equal(!!toolbar._needShowMenu, true);
                     assert.equal(toolbar._items.getCount(), defaultItems.length);
                     resolve();
                  });
               });
            });
            it('open menu', function() {
               let isOpened = false;
               toolbar._notify = (e) => {
                  isOpened = true;
                  assert.equal(e, 'menuOpened');
               };
               popupLib.Sticky = {
                  closePopup: setTrue.bind(this, assert),
                  openPopup: () => {
                     return new Promise((resolve) => {
                        setTrue.bind(this, assert);
                        resolve();
                     });
                  }
               };
               toolbar._children.menuTarget = {
                  _container: 'target'
               };
               toolbar._options = config;
               toolbar._setMenuItems = () => {
                  const then = (func) => {
                     func();
                  };
                  return {
                     then
                  };
               };
               toolbar._showMenu({
                  stopPropagation: () => {
                  }
               });
               assert.equal(isOpened, true);
            });
            it('click toolbar item', function() {
               let isNotify = false;
               toolbar._notify = (e, data) => {
                  assert.equal(e, 'itemClick');
                  assert.equal(data[1], 'nativeEvent');
                  isNotify = true;
               };
               toolbar._itemClickHandler({
                  stopPropagation: () => {
                  }, nativeEvent: 'nativeEvent'
               }, {
                  id: 'myTestItem',
                  get: () => {
                  },
                  handler: () => {
                  }
               });
               assert.equal(isNotify, true);
            });
            it('click item with menu', function(done) {
               let isNotify = false;
               let eventString = '';
               toolbar._beforeMount(config, null, records);
               let isHeadConfigCorrect = false;
               let standart = {
                  icon: 'icon-Ezy',
                  caption: 'Запись 2',
                  iconStyle: 'super',
                  iconSize: 'm'
               };
               itemWithMenu = new entity.Model({
                  rawData: {
                     id: '2',
                     title: 'Запись 2',
                     parent: null,
                     '@parent': true,
                     icon: 'icon-Ezy',
                     iconStyle: 'super',
                     iconSize: 'm'
                  }
               });
               let itemConfigPromise = (new toolbars.View())._getMenuConfigByItem.call(toolbar, itemWithMenu);
               itemConfigPromise.then((itemConfig) => {
                  if (standart.caption === itemConfig.templateOptions.headConfig.caption &&
                      standart.icon === itemConfig.templateOptions.headConfig.icon &&
                      standart.iconStyle === itemConfig.templateOptions.headConfig.iconStyle &&
                      standart.iconSize === itemConfig.templateOptions.headConfig.iconSize) {
                     isHeadConfigCorrect = true;
                  }
                  assert.isTrue(isHeadConfigCorrect);
                  toolbar._notify = (e) => {
                     eventString += e;
                     isNotify = true;
                  };
                  toolbar._itemClickHandler({
                     stopPropagation: () => {
                     }
                  }, itemWithMenu);
                  setTimeout(() => {
                     assert.equal(eventString, 'itemClickmenuOpened');
                     assert.equal(isNotify, true);
                  });
                  done();
               });
            });
            it('menu item click', () => {
               let isMenuClosed = false;
               toolbar._nodeProperty = '@parent';
               toolbar._notify = (e) => {
                  assert.equal(e, 'itemClick');
               };
               toolbar._children.menuOpener.close = function() {
                  isMenuClosed = true;
               };
               toolbar._resultHandler({
                  action: 'itemClick', event: {
                     name: 'event', stopPropagation: () => {
                     }
                  }, data: [itemWithMenu]
               });
            });
            it('menu not closed if item has child', function() {
               let isMenuClosed = false;
               toolbar._nodeProperty = '@parent';
               toolbar._children.menuOpener.close = function() {
                  isMenuClosed = true;
               };
               assert.equal(isMenuClosed, false);
            });
            describe('_getMenuConfigByItem', () => {
               var
                  testItem = new entity.Model({
                     rawData: {
                        buttonViewMode: 'buttonViewMode',
                        popupClassName: 'popupClassName',
                        keyProperty: 'itemKeyProperty',
                        showHeader: true,
                        icon: 'icon icon-size',
                        title: 'title',
                        iconStyle: 'iconStyle'
                     }
                  }),
                  testSelf = {
                     _options: {
                        groupTemplate: 'groupTemplate',
                        groupingKeyCallback: 'groupingKeyCallback',
                        size: 'size',
                        theme: 'default',
                        keyProperty: 'keyProperty',
                        itemTemplateProperty: 'myTemplate',
                        iconSize: 'm',
                        nodeProperty: '@parent',
                        parentProperty: 'parent',
                        source: '_options.source'
                     },
                     _source: 'items',
                     _items: { getIndexByValue: () => {} },
                     _getSourceForMenu: () => Promise.resolve(testSelf._source),
                     _getMenuOptions: () => testSelf._menuOptions
                  },
                  expectedConfig = {
                     opener: testSelf,
                     className: 'controls-Toolbar__popup__icon_theme-default popupClassName',
                     targetPoint: {
                        horizontal: 'left',
                        vertical: 'top'
                     },
                     direction: {
                        horizontal: 'right'
                     },
                     templateOptions: {
                        groupTemplate: 'groupTemplate',
                        groupProperty: undefined,
                        groupingKeyCallback: 'groupingKeyCallback',
                        iconSize: 'm',
                        itemTemplateProperty: 'myTemplate',
                        keyProperty: 'keyProperty',
                        nodeProperty: '@parent',
                        parentProperty: 'parent',
                        headConfig: {
                           iconSize: undefined,
                           caption: 'title',
                           icon: 'icon icon-size',
                           iconStyle: 'iconStyle'
                        },
                        showHeader: true,
                        closeButtonVisibility: false
                     }
                  };
               it('should generate correct popup config', function(done) {
                  const configPromise = (new toolbars.View())._getMenuConfigByItem.call(testSelf, testItem);
                  configPromise.then((config) => {
                     assert.deepEqual(config, expectedConfig);
                  });
                  done();
               });

               it('should generate correct popup config', function (done) {
                  testSelf._items = { getIndexByValue: () => { return -1; } }; // для элемента не найдены записи в списке
                  const configPromise = (new toolbars.View())._getMenuConfigByItem.call(testSelf, testItem);
                  configPromise.then((config) => {
                     assert.deepEqual(config, expectedConfig);
                  });
                  done();
               });

               it('should generate correct popup config', function (done) {
                  testItem.set('showHeader', false);
                  expectedConfig.templateOptions.showHeader = false;
                  expectedConfig.templateOptions.closeButtonVisibility = true;
                  const configPromise = (new toolbars.View())._getMenuConfigByItem.call(testSelf, testItem);
                  configPromise.then((config) => {
                     assert.deepEqual(config, expectedConfig);
                  });
                  done();
               });
            });
            it('get button template options by item', function() {
               let item = new entity.Record(
                  {
                     rawData: {
                        id: '0',
                        icon: 'icon-Linked',
                        fontColorStyle: 'secondary',
                        viewMode: 'toolButton',
                        iconStyle: 'secondary',
                        contrastBackground: true,
                        title: 'Связанные документы',
                        '@parent': false,
                        parent: null,
                        readOnly: true
                     }
                  }
               );
               let modifyItem = {
                  _buttonStyle: 'readonly',
                  _caption: undefined,
                  _captionPosition: 'right',
                  _contrastBackground: true,
                  _fontColorStyle: 'secondary',
                  _fontSize: 'm',
                  _hasIcon: true,
                  _height: 'l',
                  _hoverIcon: true,
                  _icon: 'icon-Linked',
                  _iconSize: 'm',
                  _iconStyle: 'readonly',
                  _stringCaption: false,
                  _viewMode: 'toolButton',
                  readOnly: true
               };
               assert.deepEqual((new toolbars.View())._getButtonTemplateOptionsByItem(item), modifyItem);

            });
            it('get functionalButton template options by item', function() {
               let item = new entity.Record(
                  {
                     rawData: {
                        id: '0',
                        icon: 'icon-RoundPlus',
                        fontColorStyle: 'secondary',
                        viewMode: 'functionalButton',
                        iconStyle: 'contrast',
                        title: 'Добавить',
                        '@parent': false,
                        parent: null
                     }
                  }
               );
               let modifyItem = (new toolbars.View())._getButtonTemplateOptionsByItem(item);
               assert.strictEqual(modifyItem._iconSize, 's');
               assert.strictEqual(modifyItem._height, 'default');
               assert.strictEqual(modifyItem._icon, 'icon-RoundPlus');
            });
            it('menu popup config generation', function() {
               let itemsForMenu = [
                  {
                     id: '1',
                     icon: 'myIcon'
                  },
                  {
                     id: '2',
                     iconStyle: 'secondary'
                  }
               ];

               let recordForMenu = new collection.RecordSet({
                  rawData: itemsForMenu
               });
               var
                  testSelf = {
                     _options: {
                        theme: 'default',
                        size: 'size',
                        additionalProperty: 'additional',
                        popupClassName: 'popupClassName',
                        itemTemplateProperty: 'itp',
                        groupTemplate: 'groupTemplate',
                        groupingKeyCallback: 'groupingKeyCallback',
                        iconSize: 'm',
                        keyProperty: 'id',
                        nodeProperty: '@parent',
                        parentProperty: 'parent'
                     },
                     _children: {
                        menuTarget: 'menuTarget'
                     },
                     _menuSource: recordForMenu,
                     _getMenuOptions: () => testSelf._menuOptions
                  },
                  templateOptions = {
                     iconSize: 'm',
                     keyProperty: 'id',
                     nodeProperty: '@parent',
                     parentProperty: 'parent',
                     source: recordForMenu,
                     additionalProperty: 'additional',
                     itemTemplateProperty: 'itp',
                     groupTemplate: 'groupTemplate',
                     groupingKeyCallback: 'groupingKeyCallback',
                     groupProperty: undefined,
                     footerContentTemplate: undefined,
                     itemActions: undefined,
                     itemActionVisibilityCallback: undefined,
                     closeButtonVisibility: true
                  };
               const toolbar = new toolbars.View();
               const config = toolbar._getMenuConfig.call(testSelf);
               assert.deepEqual(config.templateOptions, templateOptions);
            });
            it('toolbar closed by his parent', () => {
               let isMenuClosed = false;
               toolbar._nodeProperty = '@parent';
               toolbar._sticky = {
                  close: function () {
                     isMenuClosed = true;
                  }
               };
               toolbar._sticky.isOpened = () => true;
               toolbar._notify = () => {};
               toolbar._resultHandler('itemClick', itemWithOutMenu);
               assert.equal(isMenuClosed, true, 'toolbar closed, but his submenu did not');
            });
            it('_closeHandler', () => {
               let isMenuClosed = false;
               toolbar._notify = (e, arr, bubl) => {
                  assert.equal(e, 'menuClosed', 'closeHandler is uncorrect');
                  assert.equal(bubl.bubbling, true, 'closeHandler is uncorrect');
               };
               toolbar._options.source = config.source;
               toolbar._closeHandler();
            });
            it('_setMenuItems', async() => {
               let Toolbar = new toolbars.View(config);
               await Toolbar._beforeMount(config);
               Toolbar._options = config;
               Toolbar._setMenuItems();
               assert.isTrue(Toolbar._menuSource instanceof sourceLib.PrefetchProxy);
               assert.isTrue(Toolbar._menuSource._$target instanceof sourceLib.Memory);
               assert.isTrue(Toolbar._menuSource._$data.query instanceof collection.RecordSet);
            });
            it('_setMenuItems without source', async() => {
               const cfg = {
                  items: new collection.RecordSet({
                     rawData: defaultItems
                  }),
                  parentProperty: 'parent',
                  nodeProperty: '@parent'
               };
               let Toolbar = new toolbars.View(cfg);
               await Toolbar._beforeMount(cfg);
               Toolbar._options = cfg;
               Toolbar._setMenuItems();
               assert.isTrue(Toolbar._menuSource instanceof sourceLib.PrefetchProxy);
               assert.isTrue(Toolbar._menuSource._$target instanceof sourceLib.Memory);
               assert.isTrue(Toolbar._menuSource._$data.query instanceof collection.RecordSet);
            });
            it('_getMenuOptions - fittingMode', () => {
               let Toolbar = new toolbars.View(config);
               Toolbar._beforeMount(config);
               //все остальное дублируется и проверяется в _getMenuConfigByItem
               //TODO: https://online.sbis.ru/opendoc.html?guid=36b0e31d-a773-4e11-b3d5-196ffd07058c
               let fittingMode = {
                  vertical: 'adaptive',
                  horizontal: 'overflow'
               };
               assert.deepEqual(Toolbar._getMenuOptions().fittingMode, fittingMode);
            });
            it('update menuItems when items/source changed', () => {
               let options = {
                  items: records
               };
               let newOptions = {
                  items: new collection.RecordSet({
                     rawData: [{
                        id: '1',
                        title: 'Запись 1',
                        parent: null,
                        '@parent': null
                     },
                        {
                           id: '2',
                           title: 'Запись 2',
                           parent: null,
                           '@parent': true,
                           icon: 'icon-Ezy',
                           iconStyle: 'super'
                        },
                        {
                           id: '3',
                           title: 'Запись 3',
                           icon: 'icon-medium icon-Doge icon-primary',
                           parent: null,
                           '@parent': null,
                           showType: 2
                        }]
                  })
               };
               let isMenuItemsChanged = false;
               let Toolbar = new toolbars.View(options);
               Toolbar._notify = () => {};
               Toolbar._openMenu = () => {};
               Toolbar._setMenuItems = () => {
                  isMenuItemsChanged = true;
                  return {
                     then: function(func) {
                        func();
                     }
                  };
               };
               Toolbar._beforeMount(options);
               Toolbar._showMenu();
               assert.isTrue(isMenuItemsChanged);
               assert.isTrue(Toolbar._isLoadMenuItems);

               Toolbar._beforeUpdate(newOptions);
               isMenuItemsChanged = false;
               assert.isFalse(Toolbar._isLoadMenuItems);
               Toolbar._showMenu();
               assert.isTrue(isMenuItemsChanged);
               assert.isTrue(Toolbar._isLoadMenuItems);

            });
         });
         function setTrue(assert) {
            assert.equal(true, true);
         }
      });
   }
);
