
define(['Controls/Dropdown/resources/template/DropdownList', 'Types/collection', 'Core/core-clone'], function(DropdownList, collection, Clone) {

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
         '@parent': true
      },
      {
         id: 5,
         parent: 1,
         isAdditional: true,
         '@parent': true,
         myTemplate: 'wml!Path/To/CustomTemplate'
      }
   ];

   var items =  new collection.RecordSet({rawData: rawData, idProperty: 'id'});

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
         stickyPosition: {}
      };
   };

   var getDropDownListWithConfig = function(config) {
      var dropDownList = new DropdownList(config);
      dropDownList.saveOptions(config);
      return dropDownList;
   };

   describe('Controls/Dropdown/resources/template/DropdownList', function() {

      describe('DropdownList::_beforeUpdate', function() {

         it('_itemMouseEnter', function() {
            var dropDownConfig, dropDownList;
            var opened = false;
   
            dropDownConfig = getDropDownConfig();
            dropDownList = getDropDownListWithConfig(dropDownConfig);
   
            dropDownList._beforeMount(dropDownConfig);
            dropDownList._beforeUpdate(dropDownConfig);
            
            //moch child opener
            dropDownList._children = { subDropdownOpener: { close: function() {opened = false;}, open: function() {opened = true;} } };
            dropDownList._hasHierarchy = false;
            dropDownList._subDropdownOpened = false;
   
            dropDownList._itemMouseEnter({}, items.at(4), true);
            assert.isTrue(dropDownList._subDropdownOpened)
            assert.isFalse(opened);
            
            return new Promise(function(resolve) {
               setTimeout(function() {
                  assert.isTrue(opened);
      
                  dropDownList._hasHierarchy = false;
                  dropDownList._itemMouseEnter({}, items.at(4), true);
                  assert.isTrue(opened);
      
                  dropDownList._hasHierarchy = false;
                  dropDownList._subDropdownOpened = false;
                  dropDownList._itemMouseEnter({}, items.at(4), true);
                  assert.isTrue(opened);
      
      
                  dropDownList._hasHierarchy = true;
                  dropDownList._subDropdownOpened = true;
                  dropDownList._itemMouseEnter({}, items.at(4), false);
                  assert.isFalse(opened);
                  resolve();
               }, 120);
            });
         });

         it('_mouseenterHandler', function() {
            let dropDownConfig = getDropDownConfig();
            let dropDownList = getDropDownListWithConfig(dropDownConfig),
               closed = false,
               closeHandler = () => {
                  closed = true;
               };
            dropDownList._children = {subDropdownOpener: { close: closeHandler } };
            dropDownList._mouseenterHandler();
            assert.isFalse(closed);

            dropDownList._hasHierarchy = true;
            dropDownList._mouseenterHandler();
            assert.isTrue(closed);
         });

         it('check hierarchy', function() {
            var dropDownConfig, dropDownList;

            dropDownConfig = getDropDownConfig();
            dropDownList = getDropDownListWithConfig(dropDownConfig);

            dropDownList._beforeMount(dropDownConfig);
            dropDownList._beforeUpdate(dropDownConfig);

            assert.isTrue(dropDownList._hasHierarchy);

            /**** CHANGE ROOT *******************/

            dropDownConfig = getDropDownConfig();
            dropDownConfig.rootKey = 1;
            dropDownList._beforeUpdate(dropDownConfig);

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
               horizontalAlign: {
                  offset: 0,
                  side: 'right'
               },
               verticalAlign: {
                  offset: 0,
                  side: 'top'
               }
            };
            dropDownList = getDropDownListWithConfig(dropDownConfig);

            dropDownList._beforeMount(dropDownConfig);
            dropDownList._beforeUpdate(dropDownConfig);
            assert.deepEqual(dropDownList._popupOptions.horizontalAlign, { side: 'right' });
            assert.equal(dropDownList._dropdownClass, 'controls-DropdownList__popup-top controls-DropdownList__popup-shadow-suggestionsContainer');

            dropDownConfig.stickyPosition.horizontalAlign.side = 'left';
            dropDownConfig.stickyPosition.verticalAlign.side = 'bottom';
            dropDownList._beforeUpdate(dropDownConfig);
            assert.deepEqual(dropDownList._popupOptions.horizontalAlign, { side: 'left' });
            assert.equal(dropDownList._dropdownClass, 'controls-DropdownList__popup-bottom controls-DropdownList__popup-shadow-suggestionsContainer');

         });

      });

      describe('DropdownList::_beforeMount', function() {
         it('check list view model', function() {
            let expectedConfig = {
               items: items,
               rootKey: null,
               selectedKeys: [2],
               keyProperty: 'id',
               displayProperty: 'title',
               nodeProperty: 'parent@',
               parentProperty: 'parent',
               additionalProperty: 'add',
               emptyText: undefined,
               groupMethod: undefined,
               groupTemplate: undefined,
               groupingKeyCallback: undefined,
               itemTemplateProperty: undefined
            };
            let actualConfig = Clone(expectedConfig);
            let dropDownList = getDropDownListWithConfig(expectedConfig);
            dropDownList._beforeMount(expectedConfig);
            assert.deepEqual(dropDownList._listModel._options, actualConfig);
            expectedConfig.rootKey = undefined;
            actualConfig.rootKey = null;
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
                  keyProperty: dropDownList._options.keyProperty,
                  displayProperty: dropDownList._options.displayProperty,
                  parentProperty: dropDownList._options.parentProperty,
                  nodeProperty: dropDownList._options.nodeProperty,
                  selectedKeys: dropDownList._options.selectedKeys,
                  rootKey: items.at(0).get(dropDownList._options.keyProperty),
                  showHeader: false,
                  defaultItemTemplate: dropDownList._options.defaultItemTemplate,
                  dropdownClassName: dropDownList._options.dropdownClassName
               },
               corner: dropDownList._popupOptions.corner,
               horizontalAlign: dropDownList._popupOptions.horizontalAlign,
               target: "MyTarget"
            };

            var inFactConfig = DropdownList._private.getSubMenuOptions(dropDownList._options, dropDownList._popupOptions, { target: "MyTarget"}, items.at(0));
            assert.deepEqual(expectedConfig, inFactConfig);

            dropDownList._options.rootKey = null;
            expectedConfig.corner.horizontal = 'right';
            expectedConfig.horizontalAlign.side = 'right';

            inFactConfig = DropdownList._private.getSubMenuOptions(dropDownList._options, dropDownList._popupOptions, { target: "MyTarget"}, items.at(0));
            assert.deepEqual(expectedConfig, inFactConfig);
         });

         it('resultHandler itemClick', function() {
            var dropdownList = getDropDownListWithConfig(getDropDownConfig());
            dropdownList._notify = function(event, data) {
               if (event === 'sendResult') {
                  assert.equal(data[0].action, 'itemClick');
               }
            };
            dropdownList._children = { subDropdownOpener: { close: function() {return true;} } };
            dropdownList._resultHandler({ action: 'itemClick', data: [items.at(0)] });
         });
         it('resultHandler pinClick', function() {
            var dropdownList = getDropDownListWithConfig(getDropDownConfig());
            dropdownList._notify = function(event, data) {
               if (event === 'sendResult') {
                  assert.equal(data[0].action, 'pinClicked');
               }
            };
            dropdownList._resultHandler({ action: 'pinClicked' });
         });
      });
   });
});
