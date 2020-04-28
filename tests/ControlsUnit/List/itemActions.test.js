/**
 * Created by kraynovdo on 23.10.2017.
 */
define([
   'Controls/list',
   'Types/source',
   'Types/entity',
   'Types/collection',
   'Controls/display',
   'Controls/_list/ItemActions/Utils/Actions',
   'Controls/Utils/Toolbar',
   'i18n!Controls'
], function(lists, source, entity, collection, display, aUtil, tUtil, rk) {
   describe('Controls.List.ItemActions', function() {
      var data, listViewModel, rs, actions, sandbox;
      const theme = 'default';
      before(() => {
         lists.ItemActionsControl._isUnitTesting = true;
      });
      beforeEach(function() {
         data = [
            {
               id: 0,
               title: 'Первый',
               type: 1
            },
            {
               id: 1,
               title: 'Второй',
               type: 2
            },
            {
               id: 2,
               title: 'Третий',
               type: 2
            },
            {
               id: 3,
               title: 'Четвертый',
               type: 1
            },
            {
               id: 4,
               title: 'Пятый',
               type: 2
            },
            {
               id: 5,
               title: 'Шестой',
               type: 2
            }
         ];
         rs = new collection.RecordSet({
            keyProperty: 'id',
            rawData: data
         });
         listViewModel = new lists.ListViewModel({
            items: rs,
            keyProperty: 'id'
         });

         actions = [
            {
               id: 0,
               title: 'прочитано',
               showType: tUtil.showType.TOOLBAR,
               handler: function() {
                  console.log('action read Click');
               }
            },
            {
               id: 1,
               icon: 'icon-primary icon-PhoneNull',
               title: 'phone',
               showType: tUtil.showType.MENU,
               handler: function(item) {
                  console.log('action phone Click ', item);
               }
            },
            {
               id: 2,
               icon: 'icon-primary icon-EmptyMessage',
               title: 'message',
               showType: tUtil.showType.MENU,
               handler: function() {
                  alert('Message Click');
               }
            },
            {
               id: 3,
               icon: 'icon-primary icon-Profile',
               title: 'profile',
               showType: tUtil.showType.MENU_TOOLBAR,
               handler: function() {
                  console.log('action profile Click');
               }
            },
            {
               id: 4,
               icon: 'icon-Erase icon-error',
               title: 'delete pls',
               showType: tUtil.showType.TOOLBAR,
               handler: function() {
                  console.log('action delete Click');
               }
            },
            {
               id: 5,
               icon: 'icon-done icon-Admin',
               title: 'delete pls',
               showType: tUtil.showType.TOOLBAR,
               handler: function() {
                  console.log('action delete Click');
               }
            }
         ];
         sandbox = sinon.createSandbox();
      });

      afterEach(function() {
         sandbox.restore();
      });

      it('itemActionVisibilityCallback', function() {
         var cfg = {
            listModel: listViewModel,
            itemActions: actions,
            itemActionVisibilityCallback: function(action, item) {
               if (item.get('id') === 2 && (action.id === 2 || action.title === 'phone')) {
                  return false;
               }
               return true;
            }
         };
         var ctrl = new lists.ItemActionsControl(cfg);
         ctrl._options.listModel = {
            unsubscribe: function() {

            }};
         ctrl._beforeUpdate(cfg, {isTouch: {isTouch: false}});
         assert.equal(listViewModel._actions[2].all.length, actions.length - 2);// для item`a  с id = 2 фильтруется два экшена
      });

      it('itemActionsProperty', function() {
         var
            data = [
               {
                  id: 0,
                  title: 'Первый',
                  type: 1,
                  test: [
                     {
                        id: 0,
                        title: 'прочитано',
                        showType: tUtil.showType.TOOLBAR
                     }
                  ]
               },
               {
                  id: 1,
                  title: 'Второй',
                  type: 2,
                  test: [
                     {
                        id: 0,
                        title: 'прочитано',
                        showType: tUtil.showType.TOOLBAR
                     },
                     {
                        id: 1,
                        icon: 'icon-primary icon-PhoneNull',
                        title: 'phone',
                        showType: tUtil.showType.MENU
                     }
                  ]
               }
            ],
            rs = new collection.RecordSet({
               keyProperty: 'id',
               rawData: data
            }),
            listViewModel = new lists.ListViewModel({
               items: rs,
               keyProperty: 'id'
            }),
            cfg = {
               listModel: listViewModel,
               itemActions: [],
               itemActionsProperty: 'test'
            };
         var ctrl = new lists.ItemActionsControl(cfg);
         ctrl._options.listModel = {
            unsubscribe: function() {
            }
         };
         ctrl._beforeUpdate(cfg, { isTouch: { isTouch: false } });
         assert.deepEqual(data[0].test, listViewModel._actions[0].all);
         assert.deepEqual(data[1].test, listViewModel._actions[1].all);
      });

      describe('getContainerPaddingClass', function() {
         var bottomRight = 'controls-itemActionsV_position_bottomRight',
            topRight = 'controls-itemActionsV_position_topRight';
         var getPadding = lists.ItemActionsControl._private.getContainerPaddingClass;
         it('bottomRight, itemPadding is null', function() {
            assert.equal(getPadding(bottomRight, {bottom: 'null'}, theme), ` controls-itemActionsV_padding-bottom_null_theme-${theme} `);
         });
         it('bottomRight, itemPadding is not null', function() {
            assert.equal(getPadding(bottomRight, {bottom: 's'}, theme), ` controls-itemActionsV_padding-bottom_default_theme-${theme} `);
            assert.equal(getPadding(bottomRight, null, theme), ` controls-itemActionsV_padding-bottom_default_theme-${theme} `);
         });
         it('toRight, itemPadding is null', function() {
            assert.equal(getPadding(topRight, {top: 'null'}, theme), ` controls-itemActionsV_padding-top_null_theme-${theme} `);
         });
         it('topRight, itemPadding is not null', function() {
            assert.equal(getPadding(topRight, {top: 's'}, theme), ` controls-itemActionsV_padding-top_default_theme-${theme} `);
            assert.equal(getPadding(topRight, null, theme), ` controls-itemActionsV_padding-top_default_theme-${theme} `);
         });
         it('something else, itemPadding is not important', function() {
            assert.equal(getPadding('some_class'), ' ');
         });
      });

      it('getChildren', function() {
         const
            actionsWithHierarchy = [
               {
                  id: 1,
                  icon: 'icon-PhoneNull',
                  title: 'phone'
               },
               {
                  id: 2,
                  title: 'Добавить',
                  parent: null,
                  'parent@': true
               },
               {
                  id: 3,
                  title: 'Компанию',
                  parent: 2,
                  'parent@': null
               },
               {
                  id: 6,
                  title: 'ИП',
                  parent: 2,
                  'parent@': null
               }
            ],
            cfg = {
               listModel: listViewModel,
               itemActions: actionsWithHierarchy
            },
            ctrl = new lists.ItemActionsControl(cfg);
         assert.deepEqual(actionsWithHierarchy.slice(-2), ctrl.getChildren(actionsWithHierarchy[1], actionsWithHierarchy));
      });


      it('_onItemActionClick', function() {
           var cfg = {
               listModel: listViewModel,
               itemActions: actions
           };
           var instance = new lists.ItemActionsControl(cfg);
           instance.saveOptions(cfg);
           var item = {};
           var fakeItemData = {
               actionsItem: item,
               item: item,
               index: 0,
               key: 2
           };
           var fakeHTMLElement = {
               className: 'controls-ListView__itemV'
           };
           instance._container = {
               querySelector: function(selector) {
                   if (selector === '.controls-ListView__itemV') {
                       return {
                           parentNode: {
                               children: [fakeHTMLElement]
                           }
                       };
                   }
               }
           };
           const fakeEvent = {
               stopPropagation: function() {}
           };
           const action = {
               handler: sandbox.stub()
           };
           const notifyStub = sandbox.stub(instance, '_notify');

           instance._onItemActionsClick(fakeEvent, action, fakeItemData);
           assert.isTrue(notifyStub.withArgs('actionClick', [action, fakeItemData.item, fakeHTMLElement]).calledOnce);
           assert.isTrue(action.handler.withArgs(fakeItemData.item).calledOnce);
           assert.equal(instance._options.listModel.getMarkedKey(), fakeItemData.key);

           var setMarkedKeyCalled = false;
           var listModel = {
              setMarkedKey: function() {
                 setMarkedKeyCalled = true;
              },
              getStartIndex: function() {
                 return 0;
              }
           }
           instance._options.listModel = listModel;
           instance._destroyed = true;
           instance._onItemActionsClick(fakeEvent, action, fakeItemData);
           assert.isFalse(setMarkedKeyCalled);
       });

      it('should update itemActions on click', function () {
         let
             cfg = {
                listModel: listViewModel,
                itemActions: actions
             },
             instance = new lists.ItemActionsControl(cfg);

         instance.saveOptions(cfg);

         let
             fakeItem = {
                get: () => 1
             },
             fakeItemData = {
                actionsItem: fakeItem,
                item: fakeItem,
                index: 0,
                key: 2
             },
             fakeHTMLElement = {
                className: 'controls-ListView__itemV'
             },
             itemActionsUpdated = false;

         instance._container = {
            querySelector: function(selector) {
               if (selector === '.controls-ListView__itemV') {
                  return {
                     parentNode: {
                        children: [fakeHTMLElement]
                     }
                  };
               }
            }
         };
         const fakeEvent = {
            stopPropagation: function() {}
         };
         const action = {
            handler: sandbox.stub()
         };

         assert.deepEqual({}, listViewModel._actions);
         instance.updateItemActions(fakeItem);
         assert.equal(6, listViewModel._actions["1"].all.length);
         instance._options.itemActions = [{
            id: 0,
            title: 'прочитано',
            showType: tUtil.showType.TOOLBAR
         }];
         instance._onItemActionsClick(fakeEvent, action, fakeItemData);
         assert.equal(1, listViewModel._actions["1"].all.length);
      });

      it('getDefaultOptions ', function() {
         var defOpts = lists.ItemActionsControl.getDefaultOptions();
         assert.equal(defOpts.itemActionsPosition, 'inside');
      });

      it('updateItemActions should prepare expander with right fields', function () {
         var
             cfg = {
                listModel: listViewModel,
                itemActions: [
                   {
                      id: 0,
                      title: 'first',
                      showType: tUtil.showType.MENU
                   },
                   {
                      id: 1,
                      title: 'second',
                      showType: tUtil.showType.TOOLBAR
                   }
                ]
             },
             ctrl = new lists.ItemActionsControl(cfg);
         ctrl.saveOptions(cfg);
         ctrl.updateItemActions(listViewModel.getCurrent().item);
         let menuExpanderAction = listViewModel.getItemActions(listViewModel.getCurrent().item).showed.find((action) => action._isMenu);
         assert.equal("icon-ExpandDown controls-itemActionsV__action_icon  icon-size", menuExpanderAction.icon);
         assert.equal("secondary", menuExpanderAction.iconStyle);
         assert.equal("secondary", menuExpanderAction.style);
         assert.isTrue(menuExpanderAction._isMenu);
      });

      it('updateItemActions should update the version of the list exactly once', function() {
         var
            cfg = {
               listModel: listViewModel,
               itemActions: [{
                  id: 0,
                  title: 'first',
                  showType: tUtil.showType.MENU
               },
               {
                  id: 1,
                  title: 'second',
                  showType: tUtil.showType.TOOLBAR
               }],
               itemActionsPosition: 'outside'
            },
            ctrl = new lists.ItemActionsControl(cfg),
            oldVersion = listViewModel.getVersion();
         ctrl.saveOptions(cfg);
         ctrl.updateItemActions(listViewModel.getCurrent().item);
         assert.equal(listViewModel.getVersion() - oldVersion, 1);
      });

      it('updateItemActions should not update prefix item version', function() {
         var
            cfg = {
               listModel: listViewModel,
               itemActions: [{
                  id: 0,
                  title: 'first',
                  showType: tUtil.showType.MENU
               },
               {
                  id: 1,
                  title: 'second',
                  showType: tUtil.showType.TOOLBAR
               }],
               itemActionsPosition: 'outside'
            },
            ctrl = new lists.ItemActionsControl(cfg);
         ctrl.saveOptions(cfg);

         var prefixItemVersion = listViewModel._prefixItemVersion;
         ctrl.updateItemActions(listViewModel.getCurrent().item);

         assert.strictEqual(listViewModel._prefixItemVersion, prefixItemVersion);
      });
      it('updateItemActions should not call listModel.setItemActions if control is destroyed', function() {
         var setItemActionsCalled = false;
         var lm = {
            setItemActios: function () {
               setItemActionsCalled = true;
            },
            nextModelVersion: function() {}
         };
         var
            cfg = {
               listModel: lm,
               itemActions: [{
                     id: 0,
                     title: 'first',
                     showType: tUtil.showType.MENU
                  },
                  {
                     id: 1,
                     title: 'second',
                     showType: tUtil.showType.TOOLBAR
                  }],
               itemActionsPosition: 'outside'
            },
            ctrl = new lists.ItemActionsControl(cfg);
         ctrl.saveOptions(cfg);

         ctrl._destroyed = true;
         ctrl.updateItemActions(listViewModel.getCurrent().item);

         assert.isFalse(setItemActionsCalled);
      });
      describe('beforeUpdate updates model', function() {
         var visibilityCallback = function() {
            return true;
         };
         var lvm = new lists.ListViewModel({
            items: rs,
            keyProperty: 'id'
         });
         var cfg = {
            listModel: listViewModel,
            readOnly: false,
            tooblarVisibility: false,
            itemActions: [{
               id: 0,
               title: 'first',
               showType: tUtil.showType.MENU
            },
               {
                  id: 1,
                  title: 'second',
                  showType: tUtil.showType.TOOLBAR
               }],
            itemActionsPosition: 'outside'
            };

         var ctrl = new lists.ItemActionsControl(cfg);
         var modelVersion = 0;
         ctrl._beforeMount(cfg);
         ctrl.saveOptions(cfg);
         var originalUpdateModel = lists.ItemActionsControl._private.updateModel;

         beforeEach(function() {
            lists.ItemActionsControl._private.updateModel = function() {
               modelVersion++;
            }
         });
         afterEach(function() {
            lists.ItemActionsControl._private.updateModel = originalUpdateModel;
         });
         it('readOnly', function() {
            ctrl._beforeUpdate({...cfg, readOnly: true});
            assert.equal(modelVersion, 1);
         });
         it('listModel', function() {
            ctrl._beforeUpdate({...cfg, listModel: lvm});
            assert.equal(modelVersion, 2);
         });
         it('itemActions', function() {
            ctrl._beforeUpdate({...cfg, itemActions: []});
            assert.equal(modelVersion, 3);
         });
         it('itemActionVisibilityCallback', function() {
            ctrl._beforeUpdate({...cfg, itemActionVisibilityCallback: visibilityCallback});
            assert.equal(modelVersion, 4);
         });
         it('toolbarVisibility', function() {
            ctrl._beforeUpdate({...cfg, toolbarVisibility: true});
            assert.equal(modelVersion, 5);
         });
         it('itemActionsPosition', function() {
            ctrl._beforeUpdate({...cfg, itemActionsPosition: 'inside'});
            assert.equal(modelVersion, 6);
         });
      });
      it('updateActions', function() {
         let data, rs, lvm;
         let emptyRecordSet = new collection.RecordSet({
            rawData: [],
            keyProperty: 'id'
         });
         data = [{
            id: 1,
            title: 'item1'
         }];
         rs = new collection.RecordSet({
            keyProperty: 'id',
            rawData: data
         });
         lvm = new lists.ListViewModel({
            items: rs,
            keyProperty: 'id'
         });
         var cfg = {
            listModel: lvm,
            itemActions: [],
            itemActionsPosition: 'outside'
         };
         let modelUpdated = false;
         lvm.nextModelVersion = function() {
            modelUpdated = true;
         };
         var ctrl = new lists.ItemActionsControl(cfg);
         lists.ItemActionsControl._private.updateActions(ctrl, cfg);
         assert.isTrue(modelUpdated);

         modelUpdated = false;
         lists.ItemActionsControl._private.updateActions(ctrl, cfg);
         assert.isFalse(modelUpdated);

         modelUpdated = false;
         cfg.itemActions = [{
            id: 0,
            title: 'first',
            showType: tUtil.showType.MENU
         }];
         lists.ItemActionsControl._private.updateActions(ctrl, cfg);
         assert.isTrue(modelUpdated);

         modelUpdated = false;
         lists.ItemActionsControl._private.updateActions(ctrl, cfg);
         assert.isFalse(modelUpdated);
         cfg.editingConfig = {
            item: {
               get: (prop) => {
                  return this[prop];
                  },
               id: 'newItem'
            }
         };
         cfg.listModel = new lists.ListViewModel({
            items: emptyRecordSet,
            keyProperty: 'id'
         });
         cfg.listModel._editingItemData = {
            key: 'newItem'
         };
         modelUpdated = false;
         cfg.listModel.nextModelVersion = function() {
            modelUpdated = true;
         };
         lists.ItemActionsControl._private.updateActions(ctrl, cfg);
         assert.isTrue(modelUpdated);
      });
      it('updateItemAction with child action', () => {
         var cfg = {
            listModel: listViewModel,
            itemActions: [{
               id: 0,
               title: 'first',
               showType: tUtil.showType.TOOLBAR
            },
            {
               id: 1,
               title: 'second',
               showType: tUtil.showType.TOOLBAR
            },
            {
               id: 2,
               title: 'child',
               parent: 1,
               showType: tUtil.showType.TOOLBAR
            }],
            itemActionsPosition: 'outside'
         };
         var ctrl = new lists.ItemActionsControl(cfg);
         ctrl._beforeMount(cfg);
         ctrl.saveOptions(cfg);

         listViewModel.reset();
         ctrl.updateItemActions(listViewModel.getCurrent().item);
         assert.deepEqual([{
            id: 0,
            title: 'first',
            iconStyle: 'secondary',
            style: 'secondary',
            showType: tUtil.showType.TOOLBAR
         },
         {
            id: 1,
            title: 'second',
            iconStyle: 'secondary',
            style: 'secondary',
            showType: tUtil.showType.TOOLBAR
         }], listViewModel._actions[0].showed);

      });
      it('updateItemActions', function() {
         var cfg = {
            listModel: listViewModel,
            itemActions: [{
               id: 0,
               title: 'first',
               showType: tUtil.showType.MENU
            },
            {
               id: 1,
               title: 'second',
               showType: tUtil.showType.TOOLBAR
            }],
            itemActionsPosition: 'outside'
         };
         var ctrl = new lists.ItemActionsControl(cfg);
         ctrl._beforeMount(cfg);
         ctrl.saveOptions(cfg);

         listViewModel.reset();
         ctrl.updateItemActions(listViewModel.getCurrent().item);
         assert.deepEqual([{
            id: 1,
            title: 'second',
            iconStyle: 'secondary',
            style: 'secondary',
            showType: tUtil.showType.TOOLBAR
         }, {
            icon: 'icon-ExpandDown controls-itemActionsV__action_icon  icon-size',
            iconStyle: 'secondary',
            style: 'secondary',
            title: rk('Ещё'),
            _isMenu: true
         }], listViewModel._actions[0].showed);
      });
      describe('needShow- methods', () => {
         const inst = new lists.ItemActionsControl();
         const actions = {
            title: {
               displayMode: 'title',
               title: 'title',
               icon: 'icon'
            },
            icon: {
               displayMode: 'icon',
               title: 'title',
               icon: 'icon'
            },
            both: {
               displayMode: 'both',
               title: 'title',
               icon: 'icon'
            },
            autoWithIcon: {
               displayMode: 'auto',
               title: 'title',
               icon: 'icon'
            },
            autoWithoutIcon: {
               displayMode: 'auto',
               title: 'title'
            }
         };
         it('needShowIcon', () => {
            assert.isTrue(inst.needShowIcon(actions.icon));
            assert.isTrue(inst.needShowIcon(actions.autoWithIcon));
            assert.isTrue(inst.needShowIcon(actions.both));
            assert.isFalse(inst.needShowIcon(actions.autoWithoutIcon));
            assert.isFalse(inst.needShowIcon(actions.title));
         });
         it('needShowTitle', () => {
            assert.isFalse(inst.needShowTitle(actions.icon));
            assert.isFalse(inst.needShowTitle(actions.autoWithIcon));
            assert.isTrue(inst.needShowTitle(actions.both));
            assert.isTrue(inst.needShowTitle(actions.autoWithoutIcon));
            assert.isTrue(inst.needShowTitle(actions.title));
         });
      });
      it('getTooltip', () => {
         const inst = new lists.ItemActionsControl();
         const actions = {
            titleTooltip: {
               title: 'title',
               tooltip: 'tooltip'
            },
            title: {
               title: 'title',
            },
            tooltip: {
               tooltip: 'tooltip'
            }
         };
         assert.equal(inst.getTooltip(actions.titleTooltip), 'tooltip');
         assert.equal(inst.getTooltip(actions.title), 'title');
         assert.equal(inst.getTooltip(actions.tooltip), 'tooltip');
      });

      describe('needActionsMenu', function() {
         let needActionsMenu = lists.ItemActionsControl._private.needActionsMenu;

         it('only one action should not be hidden in menu', function() {
            let actions = [
               {
                  id: 1,
               }
            ];
            assert.isFalse(needActionsMenu(actions, 'inside'));
         });
         it('actions with showType = TOOLBAR should not be hidden in menu', function() {
            let actions = [
               {
                  id: 1,
                  showType: tUtil.showType.TOOLBAR
               },
               {
                  id: 2,
                  showType: tUtil.showType.TOOLBAR
               }
            ];
            assert.isFalse(needActionsMenu(actions, 'inside'));

         });
         it('actions with showType = MENU should be hidden in menu', function() {
            let actions = [
               {
                  id: 1,
                  showType: tUtil.showType.MENU
               },
               {
                  id: 2,
                  showType: tUtil.showType.TOOLBAR
               }
            ];
            assert.isTrue(needActionsMenu(actions, 'inside'));
         });
         it('actions with showType = TOOLBAR_MENU should be hidden in menu', function() {
            let actions = [
               {
                  id: 1,
                  showType: tUtil.showType.TOOLBAR_MENU
               },
               {
                  id: 2,
                  showType: tUtil.showType.TOOLBAR
               }
            ];
            assert.isTrue(needActionsMenu(actions, 'inside'));
         });
         it('default action showType is MENU', function() {
            let actions = [
               {
                  id: 1,
               },
               {
                  id: 2,
                  showType: tUtil.showType.TOOLBAR
               }
            ];
            assert.isTrue(needActionsMenu(actions, 'inside'));
         });
         it('actions with position = outside should not be hidden in menu', function() {
            let actions = [
               {
                  id: 1,
                  showType: tUtil.showType.TOOLBAR_MENU
               },
               {
                  id: 2,
                  showType: tUtil.showType.MENU
               }
            ];
            assert.isTrue(needActionsMenu(actions));
         });

      });
   });

   describe('Controls.List.Utils.Actions', function() {
      var sandbox;
      beforeEach(function() {
         sandbox = sinon.createSandbox();
      });
      afterEach(function() {
         sandbox.restore();
      });
      it('itemActionClick action with menu', function() {
         var
            stopPropagationCalled = false,
            notifyCalled = false,
            fakeEvent = {
               stopPropagation: function() {
                  stopPropagationCalled = true;
               }
            },
            action = {
               'parent@': true
            },
            itemData = {
               item: 'test'
            },
            instance = {
               _options: {},
               _notify: function(eventName, args) {
                  notifyCalled = true;
                  assert.equal(args[0], itemData);
                  assert.equal(args[1], fakeEvent);
                  assert.equal(args[2], action);
                  assert.equal(eventName, 'menuActionClick');
               }
            };
         aUtil.itemActionsClick(instance, fakeEvent, action, itemData);
         assert.isTrue(stopPropagationCalled);
         assert.isTrue(notifyCalled);
      });

      it('itemActionClick menu', function() {
         var
            fakeEvent = {
               stopPropagation: sandbox.stub()
            },
            action = {
               _isMenu: true
            },
            itemData = {
               item: 'test'
            },
            instance = {
               _notify: sandbox.stub(),
               _options: {},
            };

         aUtil.itemActionsClick(instance, fakeEvent, action, itemData, {}, false);
         assert.isTrue(instance._notify.withArgs('menuActionsClick', [itemData, fakeEvent, false]).calledOnce);
         assert.isTrue(fakeEvent.stopPropagation.calledOnce);
      });
      it('itemActionsClick', function() {
         var
            fakeNativeEvent = {},
            fakeHTMLElement = {
               className: 'controls-ListView__itemV'
            },
            fakeEvent = {
               stopPropagation: sandbox.stub(),
               nativeEvent: fakeNativeEvent
            },
            action = {},
            itemData = {
               item: 'test',
               index: 1
            },
            instance = {
               _notify: sandbox.stub(),
               _options: {},
               _container: {
                  querySelector: sandbox.stub().withArgs('.controls-ListView__itemV').returns({
                     parentNode: {
                        children: [fakeHTMLElement]
                     }
                  })
               }
            };
         var fakeListModel = {
            getStartIndex: function() {
               return 1;
            }
         };

         aUtil.itemActionsClick(instance, fakeEvent, action, itemData, fakeListModel, false);
         assert.isTrue(instance._notify.withArgs('actionClick', [action, itemData.item, fakeHTMLElement]).calledOnce);
         assert.isTrue(fakeEvent.stopPropagation.calledOnce);
      });
   });
});
