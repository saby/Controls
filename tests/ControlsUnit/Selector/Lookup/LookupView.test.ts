/**
 * Created by am.gerasimov on 31.05.2018.
 */

import {default as Lookup} from 'Controls/_lookup/Lookup';
import {Model} from 'Types/entity';
import {List} from 'Types/collection';
import {Memory} from 'Types/source';
import {strictEqual, ok, deepStrictEqual} from 'assert';
import {createSandbox} from 'sinon';

function getMemoryWithFilter(): Memory {
   return new Memory({
      data: [
         {
            id: 0,
            name: 'Sasha'
         },
         {
            id: 1,
            name: 'Sergey'
         },
         {
            id: 2,
            name: 'Aleksey'
         }
      ],
      filter: (item, query) => {
         return query?.id.includes(item.get('id'));
      },
      keyProperty: 'id'
   });
}

function getItems(countItems: number): List<Model> {
   const items = [];
   for (; countItems; countItems--) {
      items.push(new Model({
         rawData: {id: countItems},
         keyProperty: 'id'
      }));
   }

   return new List({
      items
   });
}

describe('Controls/_lookup/Lookup/LookupView', () => {

   describe('_beforeUpdate', () => {

      it('items are loaded and sizes calculated after selectedKeys changed', async () => {
         const lookup = new Lookup();
         let options = {
            source: getMemoryWithFilter(),
            keyProperty: 'id',
            selectedKeys: [],
            multiSelect: true
         };
         let itemsChanged = false;

         await lookup._beforeMount(options);

         options = {...options};
         options.selectedKeys = [0, 1];
         lookup._itemsChanged = () => {
            itemsChanged = true;
         };

         await lookup._beforeUpdate(options);

         ok(lookup._items.getCount());
         ok(itemsChanged);
      });

   });

   it('getAvailableCollectionWidth', () => {
      const afterFieldWrapperWidth = 20;
      const lookup = new Lookup();
      const sandbox = createSandbox();

      sandbox.replace(lookup, '_getFieldWrapperComputedStyle', () => {
         return {
            paddingLeft: '4px',
            paddingRight: '4px',
            borderLeftWidth: '1px',
            borderRightWidth: '1px'
         };
      });

      lookup._fieldWrapperWidth = 100;
      lookup._fieldWrapperMinHeight = 24;
      lookup._fieldWrapper = {
         offsetWidth: 110
      };

      strictEqual(lookup._getAvailableCollectionWidth(afterFieldWrapperWidth, false, false), 80);
      strictEqual(lookup._getAvailableCollectionWidth(afterFieldWrapperWidth, false, true), 50);
      strictEqual(lookup._getAvailableCollectionWidth(afterFieldWrapperWidth, false, false, true), 50);

      lookup._fieldWrapperMinHeight = 5;
      strictEqual(lookup._getAvailableCollectionWidth(afterFieldWrapperWidth, false, true), 60);
      sandbox.restore();
   });

   it('getInputMinWidth', function() {
      const lookup = new Lookup();
      strictEqual(lookup._getInputMinWidth(330, 30, 24), 96);
      strictEqual(lookup._getInputMinWidth(330, 30, 30), 100);
      strictEqual(lookup._getInputMinWidth(150, 30, 24), 40);
   });

   it('getMaxVisibleItems', function() {
      const lookup = new Lookup();
      const items = [1, 2, 3, 4, 5];
      const itemsSizes = [5, 10, 25, 40, 15];

      deepStrictEqual(lookup._getMaxVisibleItems(items, itemsSizes, 80), 3);
      deepStrictEqual(lookup._getMaxVisibleItems(items, itemsSizes, 10), 1);
      deepStrictEqual(lookup._getMaxVisibleItems(items, itemsSizes, 999), items.length);
   });

   it('getLastSelectedItems', function() {
      const item = new Model({
         rawData: {id: 1},
         keyProperty: 'id'
      });
      const item2 = new Model({
         rawData: {id: 2},
         keyProperty: 'id'
      });
      const items = new List({
         items: [item, item2]
      });
      const lookup = new Lookup();

      deepStrictEqual(lookup._getLastSelectedItems(items, 1), [item2]);
      deepStrictEqual(lookup._getLastSelectedItems(items, 10), [item, item2]);
   });

   it('isShowCounter', function() {
      const lookup = new Lookup();
      ok(lookup._isShowCounter(true, 10, 5));
      ok(!lookup._isShowCounter(true, 10, 20));
      ok(lookup._isShowCounter(false, 2));
      ok(!lookup._isShowCounter(false, 1));
   });

   it('getInputWidth', function() {
      const lookup = new Lookup();
      strictEqual(lookup._getInputWidth(400, 200, 100), undefined);
      strictEqual(lookup._getInputWidth(400, 200, 300), 200);
   });

   it('getMultiLineState', function() {
      const lookup = new Lookup();
      ok(lookup._getMultiLineState(200, 100, true));
      ok(!lookup._getMultiLineState(200, 300, true));
      ok(lookup._getMultiLineState(200, 300, false));
   });

   it('_isNeedCalculatingSizes', function() {
      var lookup = new Lookup();

      lookup._items = getItems(0);
      ok(!lookup._isNeedCalculatingSizes({
         multiSelect: true,
         readOnly: false
      }));

      lookup._items = getItems(1);
      ok(!!!lookup._isNeedCalculatingSizes({
         multiSelect: false,
         readOnly: false
      }));

      lookup._items = getItems(1);
      ok(lookup._isNeedCalculatingSizes({
         multiSelect: false,
         readOnly: false,
         comment: 'notEmpty'
      }));

      lookup._items = getItems(1);
      ok(!lookup._isNeedCalculatingSizes({
         multiSelect: true,
         readOnly: true
      }));

      lookup._items = getItems(1);
      ok(lookup._isNeedCalculatingSizes({
         multiSelect: true,
         readOnly: false
      }));

      lookup._items = getItems(2);
      ok(lookup._isNeedCalculatingSizes({
         multiSelect: true,
         readOnly: true
      }));
   });

   it('_isInputVisible', function() {
      var lookup = new Lookup();

      lookup._items = getItems(0);
      ok(lookup._isInputVisible({
            multiSelect: false
         }
      ));

      lookup._items = getItems(1);
      ok(!!!lookup._isInputVisible({
         multiSelect: false
      }));

      lookup._items = getItems(1);
      ok(!!lookup._isInputVisible({
         multiSelect: false,
         comment: 'notEmpty'
      }));

      lookup._items = getItems(1);
      ok(lookup._isInputVisible({
         multiSelect: true
      }));

      lookup._items = getItems(1);
      ok(!!!lookup._isInputVisible({
         multiSelect: true,
         readOnly: true
      }));

      lookup._inputValue = 'notEmpty';
      lookup._items = getItems(0);
      ok(!lookup._isInputVisible({
         multiSelect: true,
         readOnly: true
      }));

      lookup._items = getItems(0);
      ok(lookup._isInputVisible({
         multiSelect: false,
         readOnly: true
      }));

      lookup._items = getItems(1);
      ok(lookup._isInputVisible({
         placeholder: 'test',
         placeholderVisibility: 'empty',
			readOnly: true
      }));
   });

   it('_isInputActive', function() {
      let lookup = new Lookup();

      lookup._items = getItems(0);
      ok(lookup._isInputActive({
            multiSelect: false
         }
      ));

      lookup._items = getItems(1);
      ok(!lookup._isInputActive({
         multiSelect: false
      }));

      lookup._items = getItems(1);
      ok(lookup._isInputActive({
         multiSelect: true
      }));

      lookup._items = getItems(1);
      ok(!lookup._isInputActive({
         multiSelect: true,
         readOnly: true
      }));
   });

   it('_calculatingSizes', function() {
      var
      // min width const 4 * FIELD_WRAPPER_MIN_HEIGHT = 100;
         FIELD_WRAPPER_MIN_HEIGHT = 25,
         FIELD_WRAPPER_WIDTH = 300,
         ITEM_WIDTH = 50,
         COUNTER_WIDTH = 20,
         MAX_ITEMS_IN_ONE_ROW = FIELD_WRAPPER_WIDTH / ITEM_WIDTH;

      var
         lookup = new Lookup(),
         getItemsSizesLastRow = lookup._getItemsSizesLastRow,
         getCounterWidth = lookup._getCounterWidth,
         initializeConstants = lookup._initializeConstants,
         newOptions = {
            maxVisibleItems: 7,
            multiSelect: true,
            multiLine: false,
            readOnly: false,
            fontSize: 's',
            theme: 'testTheme'
         };

      const sandbox = createSandbox();

      sandbox.replace(lookup, '_getFieldWrapperComputedStyle', () => {
         return {
            paddingLeft: '4px',
            paddingRight: '4px',
            borderLeftWidth: '1px',
            borderRightWidth: '1px'
         };
      });

      lookup._fieldWrapper = {
         offsetWidth: FIELD_WRAPPER_WIDTH
      };
      lookup._items = getItems(6);
      lookup._fieldWrapperWidth = FIELD_WRAPPER_WIDTH;
      lookup._fieldWrapperMinHeight = FIELD_WRAPPER_MIN_HEIGHT;

      lookup._getItemsSizesLastRow = function() {
         var numberItems = lookup._items.getCount();

         if (newOptions.multiLine) {

            // Счетчик сместит запись
            if (lookup._items.getCount() > newOptions.maxVisibleItems) {
               numberItems++;
            }

            numberItems = numberItems % MAX_ITEMS_IN_ONE_ROW || MAX_ITEMS_IN_ONE_ROW;
         }

         return new Array(numberItems).fill(ITEM_WIDTH);
      };

      lookup._getCounterWidth = function() {
         return COUNTER_WIDTH;
      };
      lookup._initializeConstants = function() {};

      newOptions.multiSelect = true;
      lookup._calculateSizes(newOptions);
      ok(!lookup._multiLineState);
      strictEqual(lookup._counterWidth, 20);

      // из 300 px, 100 для input, 20 для счетчика, для коллекции остается 180, в которую влезут 3 по 50.
      strictEqual(lookup._maxVisibleItems, 3);

      // Если айтема 4, то влезут все, т.к не нужно показывать счетчик
      lookup._items = getItems(4);
      lookup._calculateSizes(newOptions);
      strictEqual(lookup._maxVisibleItems, 4);

      newOptions.multiLine = true;
      lookup._calculateSizes(newOptions);
      ok(!lookup._multiLineState);
      strictEqual(lookup._inputWidth, 100);
      strictEqual(lookup._maxVisibleItems, 7);
      strictEqual(lookup._counterWidth, undefined);

      // Инпут на уровне с последними элементами коллекции(расположение по строкам 3-4-4-1 и input)
      lookup._items = getItems(12);
      lookup._calculateSizes(newOptions);
      ok(lookup._multiLineState);
      strictEqual(lookup._inputWidth, 250);

      // Инпут с новой строки(расположение 3-4-4-input)
      lookup._items = getItems(11);
      lookup._calculateSizes(newOptions);
      strictEqual(lookup._inputWidth, undefined);

      // Режим readOnly
      newOptions.readOnly = true;
      newOptions.multiSelect = false;
      lookup._calculateSizes(newOptions);
      strictEqual(lookup._inputWidth, undefined);
      strictEqual(lookup._maxVisibleItems, lookup._items.getCount());

      lookup._getItemsSizesLastRow = getItemsSizesLastRow;
      lookup._getCounterWidth = getCounterWidth;
      lookup._initializeConstants = initializeConstants;
   });

   it('getCollectionOptions', function() {
      var standardOptions = {
         itemTemplate: 'testItemTemplate',
         readOnly: 'testReadOnly',
         displayProperty: 'testReadOnly',
         itemsLayout: 'oneRow',
         maxVisibleItems: 10,
         _counterWidth: '10px',
         theme: 'default',
         items: undefined
      };

      var controlOptions = {
         itemTemplate: 'testItemTemplate',
         readOnly: 'testReadOnly',
         displayProperty: 'testReadOnly',
         multiLine: false,
         theme: 'default'
      };

      const lookup = new Lookup();

      deepStrictEqual(lookup._getCollectionOptions(controlOptions, 10, '10px'), standardOptions);

      delete controlOptions.itemTemplate;
      ok(!lookup._getCollectionOptions(controlOptions, 10, '10px').hasOwnProperty('itemTemplate'));
   });
});
