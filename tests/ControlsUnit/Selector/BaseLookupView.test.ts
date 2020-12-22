/**
 * Created by am.gerasimov on 31.05.2018.
 */

import {default as Lookup} from 'Controls/_lookup/Lookup';
import {Model} from 'Types/entity';
import {List} from 'Types/collection';
import {DOMUtil} from 'Controls/sizeUtils';
import {constants} from 'Env/Env';
import {deepStrictEqual, ok, notStrictEqual, strictEqual} from 'assert';
import * as sinon from 'sinon';

function getItems(countItems: number): List<unknown> {
   for (var items = []; countItems; countItems--) {
      items.push(new Model({
         rawData: {id: countItems},
         keyProperty: 'id'
      }));
   }

   return new List({
      items
   });
}

describe('Controls/_lookup/BaseLookupView', function() {
   it('_beforeMount', function() {
      const lookup = new Lookup();
      let options;

      options = {selectedKeys: [], multiLine: true, maxVisibleItems: 10, readOnly: true, multiSelect: true};
      lookup._items = getItems(5);
      lookup._inheritorBeforeMount(options);
      strictEqual(lookup._maxVisibleItems, 10);

      options = {selectedKeys: [], readOnly: true, multiSelect: true};
      lookup._inheritorBeforeMount(options);
      strictEqual(lookup._maxVisibleItems, 5);

      options = {selectedKeys: [], readOnly: false, multiSelect: true};
      lookup._inheritorBeforeMount(options);
      strictEqual(lookup._maxVisibleItems, 0);

      options = {selectedKeys: [], readOnly: true};
      lookup._inheritorBeforeMount(options);
      strictEqual(lookup._maxVisibleItems, 1);

      options = {selectedKeys: [], value: 'test'};
      lookup._inheritorBeforeMount(options);
      lookup.saveOptions(options);
      strictEqual(lookup._maxVisibleItems, 1);
      strictEqual(lookup._getInputValue(options), 'test');
   });

   it('_afterUpdate', function() {
      let configActivate;
      let activated = false;
      let lookup = new Lookup();

      lookup._suggestState = false;
      lookup._needSetFocusInInput = true;
      lookup._options.items = getItems(0);
      lookup.activate = function(config) {
         configActivate = config;
         activated = true;
      };

      lookup._afterUpdate();
      ok(!activated);
      ok(!lookup._needSetFocusInInput);

      lookup._needSetFocusInInput = true;
      lookup._active = true;
      lookup._afterUpdate();
      ok(activated);
      ok(!lookup._needSetFocusInInput);
      strictEqual(configActivate, undefined);
      ok(!lookup._suggestState);

      lookup._needSetFocusInInput = true;
      lookup._determineAutoDropDown = () => true;
      lookup._afterUpdate();
      ok(lookup._suggestState);
   });

   it('_changeValueHandler', function() {
      const lookup = new Lookup();
      let newValue = [];

      lookup.saveOptions(Lookup.getDefaultOptions());

      lookup._notify = function(event, value) {
         if (event === 'valueChanged') {
            newValue = value;
         }
      };
      lookup._changeValueHandler(null, 1);
      deepStrictEqual(newValue, [1]);
      strictEqual(lookup._inputValue, 1);
   });

   it('_choose', function() {
      let itemAdded = false;
      let lookup = new Lookup();
      let isActivated = false;
      let lastValueAtNotify;
      let selectedItem = {id: 1};

      lookup.saveOptions({});
      lookup._isInputVisible = false;
      lookup._addItem = function(value) {
         lastValueAtNotify = value;
         itemAdded = true;
      };
      lookup.activate = function() {
         isActivated = true;

         // activate input before add.
         ok(!itemAdded);
      };

      lookup._beforeMount({ selectedKeys: [], multiLine: true , items: getItems(1)});

      lookup._options.multiSelect = false;
      lookup._choose();
      ok(itemAdded);
      ok(lookup._needSetFocusInInput);
      ok(!isActivated);

      itemAdded = false;
      isActivated = false;
      lookup._needSetFocusInInput = false;
      lookup._options.multiSelect = true;
      lookup._choose();
      ok(!lookup._needSetFocusInInput);
      ok(isActivated);

      itemAdded = false;
      lookup._inputValue = 'not empty';
      lookup._choose(null, selectedItem);
      strictEqual(lookup._inputValue, '');
      strictEqual(lastValueAtNotify, selectedItem);
   });

   it('_deactivated', function() {
      var lookup = new Lookup();
      lookup._suggestState = true;
      lookup._deactivated();
      ok(!lookup._suggestState);
   });

   it('_suggestStateChanged', function() {
      var lookup = new Lookup();

      lookup._beforeMount({selectedKeys: []});
      lookup._suggestState = true;
      lookup._suggestStateChanged({}, false);
      ok(!lookup._suggestState);

      lookup._suggestState = true;
      lookup._isInputVisible = function() {
         return true;
      };
      lookup._suggestStateChanged({}, true);
      ok(lookup._suggestState);

      lookup._infoboxOpened = true;
      lookup._suggestStateChanged({}, true);
      ok(!lookup._suggestState);
   });

   it('_determineAutoDropDown', function() {
      var lookup = new Lookup();
      lookup._items = getItems(1);
      lookup._isInputVisible = function() {
         return false;
      };
      lookup._options.autoDropDown = true;
      ok(!lookup._determineAutoDropDown());
      lookup._items.clear();
      lookup._isInputVisible = function() {
         return true;
      };
      ok(lookup._determineAutoDropDown());

      lookup._options.autoDropDown = false;
      ok(!lookup._determineAutoDropDown());
   });

   it('_onMouseDownShowSelector', function() {
      var lookup = new Lookup();

      lookup._getFieldWrapperWidth = () => {};
      lookup._suggestState = true;
      lookup._onMouseDownShowSelector();

      ok(!lookup._suggestState);
   });

   it('_onClickClearRecords', function() {
      var
         configActivate,
         activated = false,
         lookup = new Lookup();

      lookup._beforeMount({selectedKeys: []});
      lookup.activate = function(config) {
         configActivate = config;
         activated = true;
      };

      lookup._options.selectedKeys = [];
      lookup._onClickClearRecords();
      ok(activated);
      strictEqual(configActivate, undefined);
   });

   it('_keyDown', function() {
      var
         isNotifyShowSelector= false,
         isNotifyRemoveItems = false,
         lookup = new Lookup(),
         eventBackspace = {
            nativeEvent: {
               keyCode: constants.key.backspace
            }
         },
         eventNotBackspace = {
            nativeEvent: {}
         },
         eventF2 = {
            nativeEvent: {
               keyCode: 113
            }
         };

      lookup._removeItem = (item) => {
         isNotifyRemoveItems = true;
         strictEqual(lookup._items.at(lookup._items.getCount() - 1), item);
      };

      lookup.showSelector = () => {
         isNotifyShowSelector = true;
      };

      lookup._beforeMount({
         value: '',
         items: getItems(0),
         selectedKeys: []
      });
      lookup._items = getItems(0);
      lookup._keyDown(null, eventBackspace);
      ok(!isNotifyRemoveItems);

      lookup._items = getItems(5);
      lookup._keyDown(null, eventNotBackspace);
      ok(!isNotifyRemoveItems);

      lookup._keyDown(null, eventBackspace);
      ok(isNotifyRemoveItems);
      isNotifyRemoveItems = false;

      lookup._beforeMount({
         value: 'not empty valeue',
         items: getItems(1),
         selectedKeys: []
      });
      lookup._options.value = 'not empty valeue';
      lookup._keyDown(null, eventBackspace);
      ok(!isNotifyRemoveItems);
      ok(!isNotifyShowSelector);

      lookup._keyDown(null, eventF2);
      ok(isNotifyShowSelector);
   });

   it('_openInfoBox', function() {
      var
         config = {},
         isNotifyOpenPopup = false,
         lookup = new Lookup();

      lookup._suggestState = true;
      lookup._getContainer = function() {
         return {offsetWidth: 100};
      };
      lookup._getOffsetForInfobox = () => 5;
      lookup._notify = function(eventName) {
         if (eventName === 'openInfoBox') {
            isNotifyOpenPopup = true;
         }
      };

      lookup._openInfoBox(null, config);
      deepStrictEqual(config, {
         width: 100,
         offset: {
             horizontal: -5
         }

   });
      ok(!lookup._suggestState);
      ok(lookup._infoboxOpened);
      ok(isNotifyOpenPopup);
   });

   it('_closeInfoBox', function() {
      var
         isNotifyClosePopup = false,
         lookup = new Lookup();

      lookup._infoboxOpened = true;
      lookup._notify = function(eventName) {
         if (eventName === 'closeInfoBox') {
            isNotifyClosePopup = true;
         }
      };

      lookup._closeInfoBox();
      ok(!lookup._infoboxOpened);
      ok(isNotifyClosePopup);
   });

   it('resetInputValue', function() {
      const lookup = new Lookup();
      const sandbox = sinon.createSandbox();
      const stub = sandbox.stub(lookup, '_notify');
      lookup.saveOptions({
         value: ''
      });

      lookup._resetInputValue();
      ok(stub.notCalled);

      lookup.saveOptions({
         value: 'notEmpty'
      });
      lookup._resetInputValue();
      ok(stub.calledWith('valueChanged', ['']));

      lookup.saveOptions({});
      lookup._inputValue = 'notEmpty';
      lookup._resetInputValue();
      strictEqual(lookup._inputValue, '');

      sandbox.restore();
   });

   it('setInputValue', () => {
      const lookup = new Lookup({});
      let forceUpdateCalled = false;

      lookup._forceUpdate = () => {
         forceUpdateCalled = true;
      };

      lookup._setInputValue({}, 'test');
      ok(lookup._inputValue === 'test');
      ok(forceUpdateCalled);
   });

   it('activate', function() {
      let isActivate = false;
      const lookup = new Lookup();

      lookup._needSetFocusInInput = false;
      lookup.saveOptions({multiSelect: false});
      lookup.activate = (cfg) => {
         deepStrictEqual(cfg, {enableScreenKeyboard: true});
         isActivate = true;
      };

      lookup._activateLookup();
      ok(!isActivate);
      ok(lookup._needSetFocusInInput);

      lookup._needSetFocusInInput = false;
      lookup._options.multiSelect = true;
      lookup._activateLookup();
      ok(isActivate);
      ok(!lookup._needSetFocusInInput);
   });

   it('_isInputActive', function() {
      let
         inputIsVisible = true,
         lookup = new Lookup();
      lookup._items = getItems(0);

      lookup._isInputVisible = function() {
         return inputIsVisible;
      };

      ok(lookup._isInputActive({readOnly: false}));
      ok(!lookup._isInputActive({readOnly: true}));

      inputIsVisible = false;
      lookup._items = getItems(1);
      ok(!lookup._isInputActive({readOnly: false}));
      ok(!lookup._isInputActive({readOnly: true}));
   });

   it('_isShowCollection', function() {
      let lookup = new Lookup();

      lookup._maxVisibleItems = 1;
      lookup._options = {
         readOnly: false
      };
      lookup._items = getItems(1);

      ok(!!lookup._isShowCollection());

      lookup._maxVisibleItems = null;
      ok(!!!lookup._isShowCollection());

      lookup._options.readOnly = true;
      ok(!!lookup._isShowCollection());

      lookup._items = getItems(0);
      ok(!!!lookup._isShowCollection());
   });

   it('_itemClick', function() {
      let
         isNotifyItemClick = false,
         lookup = new Lookup();

      lookup._suggestState = true;
      lookup._notify = function(eventName) {
         if (eventName === 'itemClick') {
            isNotifyItemClick = true;
         }
      };

      lookup._itemClick();
      ok(!lookup._suggestState);
      ok(isNotifyItemClick);
   });

   it('_crossClick', () => {
      const lookup = new Lookup();
      const sandbox = sinon.createSandbox();
      lookup._beforeMount({selectedKeys: []});

      sandbox.stub(lookup, '_removeItem');
      sandbox.stub(lookup, 'activate');
      lookup.saveOptions({
         multiSelect: false
      });

      lookup._crossClick({}, 'testItem');

      sinon.assert.calledWith(lookup._removeItem, 'testItem');
      ok(lookup._needSetFocusInInput);

      lookup.saveOptions({
         multiSelect: true
      });
      lookup._needSetFocusInInput = false;

      lookup._crossClick({}, 'testItem');
      sinon.assert.calledWith(lookup.activate, { enableScreenKeyboard: false });
      ok(!lookup._needSetFocusInInput);
   });

   it('_resize', function() {
      let
         lookupView = new Lookup(),
         oldFieldWrapperWidth = 500,
         newFieldWrapperWidth = 500,
         isCalculatingSizes = false,
         wrapperWidthCalled = false;

      lookupView._isNeedCalculatingSizes = () => true;
      lookupView._getFieldWrapperWidth = (recount) => {
         wrapperWidthCalled = true;
         return recount ? newFieldWrapperWidth : oldFieldWrapperWidth;
      };
      lookupView._calculateSizes = () => {
         isCalculatingSizes = true;
      };

      lookupView._fieldWrapperWidth = oldFieldWrapperWidth;
      lookupView._resize();
      ok(!isCalculatingSizes);

      newFieldWrapperWidth = 0;
      lookupView._resize();
      ok(!isCalculatingSizes);

      newFieldWrapperWidth = 400;
      lookupView._resize();
      ok(isCalculatingSizes);
      ok(wrapperWidthCalled);

      wrapperWidthCalled = false;
      lookupView._isNeedCalculatingSizes = () => false;
      lookupView._resize();
      ok(!wrapperWidthCalled);
   });

   it('_getFieldWrapperWidth', () => {
      const lookupView = new Lookup({});
      const sandbox = sinon.createSandbox();
      let wrappedWidth;

      sandbox.replace(lookupView, '_getFieldWrapper', () => {});
      sandbox.replace(DOMUtil, 'width', () => wrappedWidth);

      wrappedWidth = 100;
      ok(lookupView._getFieldWrapperWidth() === wrappedWidth);
      ok(lookupView._fieldWrapperWidth === wrappedWidth);

      wrappedWidth = -10;
      lookupView._fieldWrapperWidth = null;
      ok(lookupView._getFieldWrapperWidth() === wrappedWidth);
      ok(lookupView._fieldWrapperWidth === null);

      sandbox.restore();
   });
});
