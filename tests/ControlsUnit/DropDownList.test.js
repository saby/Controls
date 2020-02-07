
define(['Controls/dropdownPopup', 'Types/collection', 'Core/core-clone'], function(dropdownPopup, collection, Clone) {

   'use strict';

   var rawData = [
      {
         id: 1,
         parent: null,
         '@parent': false,
         myTemplate: 'wml!Path/To/CustomTemplate'
      },
      {
         id: 2,
         parent: 1,
         '@parent': false
      },
      {
         id: 3,
         parent: 1,
         '@parent': false,
         myTemplate: 'wml!Path/To/CustomTemplate'
      },
      {
         id: 4,
         parent: null,
         isAdditional: true,
         '@parent': true,
         readOnly: true
      },
      {
         id: 5,
         parent: 1,
         isAdditional: true,
         '@parent': true,
         myTemplate: 'wml!Path/To/CustomTemplate'
      }
   ];

   var items =  new collection.RecordSet({rawData: rawData, keyProperty: 'id'});

   var getDropDownConfig = function() {
      return {
         items: items,
         selectedKeys: [],
         displayProperty: 'id',
         keyProperty: 'id',
         nodeProperty: '@parent',
         parentProperty: 'parent',
         typeShadow: 'suggestionsContainer',
         itemTemplateProperty: 'myTemplate',
         itemPadding: {},
         stickyPosition: {}
      };
   };

   var getDropDownListWithConfig = function(config, openCallback, closeCallback) {
      var dropDownList = new dropdownPopup.List(config);
      dropDownList._children.subDropdownOpener = {
         open: openCallback,
         close: closeCallback
      };
      dropDownList.saveOptions(config);
      return dropDownList;
   };

   describe('Controls/_dropdownPopup/DropdownList', function() {

      describe('DropdownList::_beforeUpdate', function() {

         it('_itemMouseEnter', function() {
            var dropDownConfig, dropDownList;
            var opened = false;
            var closed = false;

            dropDownConfig = getDropDownConfig();
            dropDownList = getDropDownListWithConfig(
               dropDownConfig,
               () => {
                  opened = true;
                  closed = false;
               },
               () => {
                  opened = false;
                  closed = true;
               }
            );

            dropDownList._beforeMount(dropDownConfig);
            dropDownList._beforeUpdate(dropDownConfig);

            //moch child opener
            dropDownList._hasHierarchy = false;
            dropDownList._subDropdownItem = null;

            dropDownList._itemMouseEnter( {}, items.at(3), true);
            assert.isNull(dropDownList._subDropdownItem);
            assert.isFalse(opened);

            dropDownList._itemMouseEnter({}, items.at(4), true);
            assert.isTrue(dropDownList._subDropdownItem === items.at(4));
            assert.isFalse(opened);

            return new Promise(function(resolve) {
               setTimeout(function() {
                  assert.isTrue(opened);

                  dropDownList._hasHierarchy = false;
                  dropDownList._itemMouseEnter({}, items.at(4), true);
                  assert.isTrue(opened);
                  assert.isTrue(dropDownList._subDropdownItem === items.at(4));

                  dropDownList._hasHierarchy = false;
                  dropDownList._subDropdownItem = null;
                  dropDownList._itemMouseEnter({}, items.at(4), true);
                  assert.isTrue(opened);

                  dropDownList._itemMouseEnter({}, items.at(4), true);
                  assert.isTrue(opened);

                  dropDownList._hasHierarchy = true;
                  dropDownList._subDropdownItem = items.at(3);
                  dropDownList._itemMouseEnter({}, items.at(4), false);
                  assert.isFalse(opened);

                  dropDownList._itemMouseEnter({}, items.at(4), true);
                  assert.isFalse(opened);
                  dropDownList._itemMouseEnter({}, items.at(3), true);
                  assert.isFalse(opened);
                  resolve();
               }, 120);
            });
         });

         it('_closeSubMenu', function() {
            let dropDownConfig = getDropDownConfig();
            let dropDownList = getDropDownListWithConfig(dropDownConfig),
               closed = false,
               closeHandler = () => {
                  closed = true;
               };
            dropDownList._children = {subDropdownOpener: { close: closeHandler } };
            dropDownList._closeSubMenu();
            assert.isFalse(closed);

            dropDownList._hasHierarchy = true;
            dropDownList._closeSubMenu();
            assert.isTrue(closed);
         });

         it('_openSubDropdown', function () {

         });

         it('check hierarchy', function() {
            let dropDownConfig, dropDownList;
            let closed = false;

            dropDownConfig = getDropDownConfig();
            dropDownList = getDropDownListWithConfig(
               dropDownConfig,
               () => {
                  closed = false;
               },
               () => {
                  closed = true;
               }
            );

            dropDownList._beforeMount(dropDownConfig);
            dropDownList._beforeUpdate(dropDownConfig);

            assert.isTrue(dropDownList._hasHierarchy);

            /**** CHANGE ROOT *******************/

            dropDownConfig = getDropDownConfig();
            dropDownConfig.rootKey = 1;
            dropDownList._beforeUpdate(dropDownConfig);

            assert.isTrue(closed);
            assert.isTrue(dropDownList._hasHierarchy);

            dropDownConfig = getDropDownConfig();
            dropDownConfig.rootKey = 2;
            dropDownList._beforeUpdate(dropDownConfig);

            assert.isFalse(dropDownList._hasHierarchy);

            /******************************/

            /**** CHANGE EXPAND *******************/

            dropDownConfig = getDropDownConfig();
            dropDownConfig.additionalProperty = 'isAdditional';
            dropDownList = getDropDownListWithConfig(dropDownConfig);

            dropDownList._beforeMount(dropDownConfig);
            dropDownList._beforeUpdate(dropDownConfig);

            assert.isFalse(dropDownList._hasHierarchy);

            dropDownList._expanded = true; //В компоненте значение меняется по биндингу
            dropDownList._toggleExpanded();
            assert.isTrue(dropDownList._hasHierarchy);

            /*************************************/

            /**** CHANGE ORIENTATION POPUP *******************/

            dropDownConfig = getDropDownConfig();
            dropDownConfig.stickyPosition = {
               direction: {
                  horizontal: 'right',
                  vertical: 'top'
               }
            };
            dropDownList = getDropDownListWithConfig(dropDownConfig);

            dropDownList._beforeMount(dropDownConfig);
            dropDownList._beforeUpdate(dropDownConfig);
            assert.deepEqual(dropDownList._popupOptions.direction, { horizontal: 'right' });
            assert.equal(dropDownList._dropdownClass, 'controls-DropdownList__popup-top controls-DropdownList__popup-shadow-suggestionsContainer');

            dropDownConfig.stickyPosition.direction = {
               horizontal: 'left',
               vertical: 'bottom'
            };
            dropDownList._beforeUpdate(dropDownConfig);
            assert.deepEqual(dropDownList._popupOptions.direction, { horizontal: 'left' });
            assert.equal(dropDownList._dropdownClass, 'controls-DropdownList__popup-bottom controls-DropdownList__popup-shadow-suggestionsContainer');

            /**** CHANGE HEADER CONFIG *******************/
            dropDownConfig = getDropDownConfig();
            dropDownList = getDropDownListWithConfig(dropDownConfig);
            dropDownList._beforeMount(dropDownConfig);
            assert.isNotOk(dropDownList._headConfig);

            dropDownList._beforeUpdate({...dropDownConfig, caption: 'New caption', showHeader: true});
            assert.equal(dropDownList._headConfig.caption, 'New caption');
         });

         it('change root key', function() {
            let dropDownConfig = getDropDownConfig();
            dropDownConfig.rootKey = 'test';

            let dropDownList = getDropDownListWithConfig(dropDownConfig);
            dropDownList._beforeMount(dropDownConfig);

            dropDownList.saveOptions(dropDownConfig);
            dropDownConfig = getDropDownConfig();
            dropDownConfig.rootKey = 'test root';

            dropDownList._beforeUpdate(dropDownConfig);
            assert.equal(dropDownList._listModel._options.rootKey, 'test root');

            dropDownList.saveOptions(dropDownConfig);
            dropDownConfig = getDropDownConfig();
            dropDownConfig.rootKey = undefined;

            dropDownList._beforeUpdate(dropDownConfig);
            dropDownList.saveOptions(dropDownConfig);
            assert.equal(dropDownList._listModel._options.rootKey, null);
         });

         it('itemschanged', function() {
            var dropDownConfig, dropDownList;

            dropDownConfig = getDropDownConfig();
            dropDownList = getDropDownListWithConfig(dropDownConfig);
            dropDownList._children = { subDropdownOpener: { close: function() {} } };

            dropDownList._beforeMount(dropDownConfig);
            dropDownList._beforeUpdate(dropDownConfig);
            assert.deepEqual(dropDownList._listModel.getItems().getRawData(), dropDownConfig.items.getRawData());

            let newItems = Clone(rawData);
            newItems[3].parent = 1;
            dropDownList._beforeUpdate({...dropDownConfig, items: new collection.RecordSet({keyProperty: 'id', rawData: newItems})});
            assert.deepEqual(dropDownList._listModel.getItems().getRawData(), newItems);
         });

      });

      describe('DropdownList::_beforeMount', function() {
         it ('check headConfig', function() {
            let config2 = {
               showHeader: true,
               icon: 'icon-add',
               parentProperty: 'parent',
               rootKey: null,
               caption: 'Caption',
               iconPadding: { null: 'icon-small' }
            };
            let ddlConfig = getDropDownConfig();
            ddlConfig = {...ddlConfig, ...config2};
            let ddl = getDropDownListWithConfig(ddlConfig);
            ddl._beforeMount(ddlConfig);
            assert.equal(ddl._headConfig.icon, 'icon-add');
            assert.equal(ddl._headConfig.caption, 'Caption');

            ddlConfig.iconSize = 's';
            ddl._headConfig = {};
            ddl._beforeMount(ddlConfig);
            assert.equal(ddl._headConfig.icon, 'icon-add');
            assert.equal(ddl._headConfig.iconSize, 's');
            assert.equal(ddl._headConfig.caption, 'Caption');

            ddlConfig.iconSize = 's';
            ddlConfig.rootKey = undefined;
            ddl._beforeMount(ddlConfig);
            assert.equal(ddl._headConfig.icon, 'icon-add');
            assert.equal(ddl._headConfig.iconSize, 's');
            assert.equal(ddl._headConfig.caption, 'Caption');
         });
         it('check list view model', function() {
            let expectedConfig = {
               items: items,
               rootKey: null,
               selectedKeys: [2],
               keyProperty: 'id',
               multiSelect: undefined,
               displayProperty: 'title',
               nodeProperty: 'parent@',
               parentProperty: 'parent',
               additionalProperty: 'add',
               emptyText: undefined,
               groupMethod: undefined,
               groupProperty: undefined,
               groupTemplate: undefined,
               groupingKeyCallback: undefined,
               itemTemplateProperty: undefined,
               itemPadding: {},
               hasClose: undefined,
               iconSize: undefined,
               hasIconPin: false
            };
            let actualConfig = Clone(expectedConfig);
            let dropDownList = getDropDownListWithConfig(expectedConfig);
            dropDownList._beforeMount(expectedConfig);
            assert.deepEqual(dropDownList._listModel._options, actualConfig);
            expectedConfig.rootKey = undefined;
            actualConfig.rootKey = null;
            dropDownList._beforeMount(expectedConfig);
            assert.deepEqual(dropDownList._listModel._options, actualConfig);
            expectedConfig.selectedKeys = undefined;
            actualConfig.selectedKeys = undefined;
            dropDownList._beforeMount(expectedConfig);
            assert.deepEqual(dropDownList._listModel._options, actualConfig);
            expectedConfig.selectedKeys = false;
            actualConfig.selectedKeys = false;
            dropDownList._beforeMount(expectedConfig);
            assert.deepEqual(dropDownList._listModel._options, actualConfig);
         });
         it('check popup options', function() {
            var dropDownConfig, dropDownList;
            dropDownConfig = getDropDownConfig();
            dropDownList = getDropDownListWithConfig(dropDownConfig);

            dropDownList._beforeMount(dropDownConfig);
            assert.isTrue(dropDownList._popupOptions !== undefined);
         });
         it('check iconPadding', function() {
            let config2 = {
               showHeader: true,
               icon: 'icon-add icon-medium',
               parentProperty: 'parent',
               rootKey: null,
               caption: 'Caption'
            };
            let ddlConfig = getDropDownConfig();
            ddlConfig = {...ddlConfig, ...config2};
            let ddl = getDropDownListWithConfig(ddlConfig);
            ddl._beforeMount(ddlConfig);
            assert.deepEqual(ddl._iconPadding, { 'null': 'icon-medium' });

            ddlConfig.iconSize = 's';
            ddl._beforeMount(ddlConfig);
            assert.deepEqual(ddl._iconPadding, { 'null': 'icon-small' });

            ddlConfig.showHeader = false;
            ddl._beforeMount(ddlConfig);
            assert.deepEqual(ddl._iconPadding, {});

            ddlConfig.iconSize = 'm';
            ddlConfig.items = new collection.RecordSet({
               rawData: [
                  { id: 'first', '@parent': true },
                  { id: '2' },
                  { id: '3', icon: 'icon-add', parent: 'first' },
                  { id: '4' }
               ],
               keyProperty: 'key'
            });
            ddl._beforeMount(ddlConfig);
            ddl.root = 'first';
            assert.deepEqual(ddl._iconPadding, { 'first': 'icon-medium' });
         });
      });

      describe('DropdownList::_private.getSubMenuOptions', function() {
         it('check assignment subMenu options', function() {
            var dropDownConfig, dropDownList;

            dropDownConfig = getDropDownConfig();
            dropDownConfig.rootKey = 1;
            dropDownList = getDropDownListWithConfig(dropDownConfig);
            dropDownList._beforeMount(dropDownConfig);

            var expectedConfig = {
               templateOptions: {
                  items: dropDownList._options.items,
                  itemTemplate: dropDownList._options.itemTemplate,
                  itemTemplateProperty: dropDownList._options.itemTemplateProperty,
                  groupTemplate: dropDownList._options.groupTemplate,
                  groupProperty: dropDownList._options.groupProperty,
                  groupingKeyCallback: dropDownList._options.groupingKeyCallback,
                  keyProperty: dropDownList._options.keyProperty,
                  displayProperty: dropDownList._options.displayProperty,
                  parentProperty: dropDownList._options.parentProperty,
                  nodeProperty: dropDownList._options.nodeProperty,
                  selectedKeys: dropDownList._options.selectedKeys,
                  footerTemplate: dropDownList._options.nodeFooterTemplate,
                  footerItemData: {key: 1, item: items.at(0)},
                  rootKey: items.at(0).get(dropDownList._options.keyProperty),
                  iconSize: dropDownList._options.iconSize,
                  showHeader: false,
                  defaultItemTemplate: dropDownList._options.defaultItemTemplate,
                  itemPadding: dropDownList._options.itemPadding,
                  dropdownClassName: dropDownList._options.dropdownClassName,
                  hasIconPin: dropDownList._options.hasIconPin
               },
               targetPoint: dropDownList._popupOptions.targetPoint,
               direction: dropDownList._popupOptions.direction,
               target: "MyTarget"
            };

            var inFactConfig = dropdownPopup.List._private.getSubMenuOptions(dropDownList._options, dropDownList._popupOptions, { target: "MyTarget"}, items.at(0));
            assert.deepEqual(expectedConfig, inFactConfig);

            dropDownList._options.rootKey = null;
            expectedConfig.targetPoint.horizontal = 'right';
            expectedConfig.direction.horizontal = 'right';

            inFactConfig = dropdownPopup.List._private.getSubMenuOptions(dropDownList._options, dropDownList._popupOptions, { target: "MyTarget"}, items.at(0));
            assert.deepEqual(expectedConfig, inFactConfig);
         });

         it('_subMenuResultHandler itemClick', function() {
            var dropdownList = getDropDownListWithConfig(getDropDownConfig());
            dropdownList._notify = function(event, data) {
               if (event === 'sendResult') {
                  assert.equal(data[0].action, 'itemClick');
               }
            };
            dropdownList._children = { subDropdownOpener: { close: function() {return true;} } };
            dropdownList._subMenuResultHandler('onresult', { action: 'itemClick', data: [items.at(0)] });
         });
         it('_subMenuResultHandler pinClick', function() {
            var dropdownList = getDropDownListWithConfig(getDropDownConfig());
            dropdownList._notify = function(event, data) {
               if (event === 'sendResult') {
                  assert.equal(data[0].action, 'pinClick');
               }
            };
            dropdownList._subMenuResultHandler('onresult', { action: 'pinClick' });
         });

         it('_subMenuResultHandler footerClick', function() {
            var dropdownList = getDropDownListWithConfig(getDropDownConfig());
            dropdownList._notify = function(event, data) {
               if (event === 'sendResult') {
                  assert.equal(data[0].action, 'footerClick');
               }
            };
            dropdownList._footerClick('onresult', { action: 'footerClick' });
         });

         it('_private::needShowApplyButton', function() {
            assert.isTrue(dropdownPopup.List._private.needShowApplyButton(['1', '2', '3'], ['3']));
            assert.isFalse(dropdownPopup.List._private.needShowApplyButton(['1', '2', '3'], ['1', '2', '3']));
         });

         it('_private::getResult', function() {
            let dropdownList = getDropDownListWithConfig(getDropDownConfig());
            dropdownList._beforeMount(getDropDownConfig());
            let expectedResult = {
               event: 'itemClick',
               action: 'itemClick',
               data: []
            };
            let result = dropdownPopup.List._private.getResult(dropdownList, 'itemClick', 'itemClick');
            assert.deepEqual(result, expectedResult);

            let ddlConfig = getDropDownConfig();
            ddlConfig.emptyText = 'Not selected';
            ddlConfig.selectedKeys = [null];
            dropdownList = getDropDownListWithConfig(ddlConfig);
            dropdownList._beforeMount(ddlConfig);
            expectedResult.data.push(dropdownList._listModel.getEmptyItem().item);
            result = dropdownPopup.List._private.getResult(dropdownList, 'itemClick', 'itemClick');
            assert.deepStrictEqual(result, expectedResult);
         });

         it('_private::isNeedUpdateSelectedKeys', function() {
            let config = getDropDownConfig();
            let dropdownList = getDropDownListWithConfig(config);
            let isCheckBox = false;
            let target = { closest: () => {return isCheckBox;} };

            // multiSelect = false
            config.multiSelect = false;
            dropdownList._beforeMount(config);
            assert.isFalse(dropdownPopup.List._private.isNeedUpdateSelectedKeys(dropdownList, target, items.at(0)));

            // multiSelect = true && click on unselected item
            config.multiSelect = true;
            config.selectedKeys = [3];
            dropdownList._beforeMount(config);
            assert.isFalse(dropdownPopup.List._private.isNeedUpdateSelectedKeys(dropdownList, target, items.at(0)));

            // multiSelect = true && _selectionChanged && click on unselected item
            isCheckBox = false;
            dropdownList._beforeMount(config);
            dropdownList._selectionChanged = true;
            assert.isTrue(dropdownPopup.List._private.isNeedUpdateSelectedKeys(dropdownList, target, items.at(4)));

            // multiSelect = true && click on checkbox
            isCheckBox = true;
            assert.isTrue(dropdownPopup.List._private.isNeedUpdateSelectedKeys(dropdownList, target, items.at(0)));
            dropdownList._beforeMount(config);
            assert.isTrue(dropdownPopup.List._private.isNeedUpdateSelectedKeys(dropdownList, target, items.at(0)));

            // multiSelect = true && click on empty item
            isCheckBox = false;
            assert.isFalse(dropdownPopup.List._private.isNeedUpdateSelectedKeys(dropdownList, target, { get: () => {return null;} }));

         });

         it('_applySelection', function() {
            let dropdownList = getDropDownListWithConfig(getDropDownConfig());
            let result;
            dropdownList._beforeMount(getDropDownConfig());
            dropdownList._notify = function(event, data) {
               if (event === 'sendResult') {
                  result = data[0];
               }
            };
            let expectedResult = {
               event: 'itemClick',
               action: 'applyClick',
               data: []
            };
            dropdownList._applySelection('itemClick');
            assert.deepEqual(result, expectedResult);
         });

         it('_itemClickHandler', function() {
            let config = getDropDownConfig();
            config.selectedKeys = [3];
            config.multiSelect = true;
            let dropdownList = getDropDownListWithConfig(config);
            dropdownList._beforeMount(config);
            let resizeEventFired = false;
            let result,
               event1 = { target: { closest: () => { return false; } } },
               event2 = { target: { closest: () => { return true; } } };
            dropdownList._notify = function(e, d) {
               if (e === 'sendResult') {
                  result = d[0];
               }

               if (e === 'controlResize') {
                  resizeEventFired = true;
               }
            };
            let expectedResult = {
               event:  event1,
               action: 'itemClick',
               data: [items.at(1)]
            };
            dropdownList._itemClickHandler(event1, items.at(1));
            assert.deepEqual(dropdownList._listModel.getSelectedKeys(), [3]);

            dropdownList._itemClickHandler(event2, items.at(1));
            assert.deepEqual(dropdownList._listModel.getSelectedKeys(), [3, 2]);
            assert.isTrue(dropdownList._needShowApplyButton);

            config.selectedKeys = [2, 3];
            dropdownList._itemClickHandler(event2, items.at(1));
            assert.deepEqual(result, expectedResult);

            //resize event fired after control update
            dropdownList._beforeUpdate(config);
            dropdownList._afterUpdate(config);
            assert.isTrue(resizeEventFired);

            config.selectedKeys = [];
            dropdownList._beforeMount(config);
            dropdownList._itemClickHandler(event1, items.at(1));
            assert.deepEqual(result, expectedResult);

            config.selectedKeys = undefined;
            dropdownList._needShowApplyButton = undefined;
            dropdownList._beforeMount(config);
            dropdownList._itemClickHandler(event1, items.at(1));
            assert.deepEqual(result, expectedResult);
            assert.isUndefined(dropdownList._needShowApplyButton);
         });

         it('_selectorDialogResult', function() {
            let dropdownList = getDropDownListWithConfig(getDropDownConfig());
            let expectedResult = {
              action: 'action',
               items: []
            },
            currentResult;
            dropdownList._notify = (event, data) => {
               if (event === 'sendResult') {
                  currentResult = data[0];
               }
            };
            dropdownList._selectorDialogResult('selectorResult', expectedResult);
            assert.deepStrictEqual(expectedResult, currentResult);
         });
      });
   });
});
