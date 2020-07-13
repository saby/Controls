// tslint:disable:no-empty
// tslint:disable:no-magic-numbers

import { assert } from 'chai';
import { spy } from 'sinon';
import { MarkerController } from 'Controls/marker';
import { ListViewModel } from 'Controls/list';
import { RecordSet } from 'Types/collection';
import { SearchGridViewModel } from 'Controls/treeGrid';

describe('Controls/marker/Controller', () => {
   let controller, model, items;

   beforeEach(() => {
      items = new RecordSet({
         rawData: [
            {id: 1},
            {id: 2},
            {id: 3}
         ],
         keyProperty: 'id'
      });
      model = new ListViewModel({
         items
      });
      controller = new MarkerController({ model, markerVisibility: 'visible', markedKey: undefined });
   });

   describe('constructor', () => {
      it('not pass markedKey', () => {
         controller = new MarkerController({ model, markerVisibility: 'visible', markedKey: undefined });
         assert.equal(controller._markedKey, 1);
      });

      it('pass markedKey', () => {
         controller = new MarkerController({model, markerVisibility: 'onactivated', markedKey: 1});
         assert.equal(controller._markedKey, 1);
         assert.equal(controller._markerVisibility, 'onactivated');
      });
   });

   describe('update', () => {
      it('change marked key', () => {
         const result = controller.update({model, markedKey: 2});
         assert.equal(result, 2);
      });

      it('pass null if markedKey was set', () => {
         let result = controller.calculateMarkedKey(1);
         assert.equal(result, 1);

         result =  controller.update({
            model,
            markerVisibility: 'visible',
            markedKey: null
         });
         assert.equal(result, 1);
      });

      it('pass null if markedKey was not set', () => {
         const result = controller.update({
            model,
            markerVisibility: 'visible',
            markedKey: null
         });
         assert.equal(result, 1);
      });

      it('marker was reset in model', () => {
         let result = controller.calculateMarkedKey(2);
         assert.equal(result, 2);

         // сбрасываем маркер в модели
         model.setMarkedKey(2, false);

         result = controller.update({
            model,
            markerVisibility: 'visible',
            markedKey: 2
         });
         assert.equal(result, 2);
      });

      it('pass key by not exists item', () => {
         controller.calculateMarkedKey(2);
         const result = controller.update({
            model,
            markerVisibility: 'visible',
            markedKey: 5
         });
         assert.equal(result, 1);
      });
   });

   describe('calculateMarkedKey', () => {
      it('same key', () => {
         controller._markedKey = 2;
         const result = controller.calculateMarkedKey(2);
         assert.equal(result, 2);
      });

      it('same key which not exists in model', () => {
         controller._markedKey = 4;
         const result = controller.calculateMarkedKey(4);
         assert.equal(result, 1);
      });

      it('null', () => {
         controller = new MarkerController({model, markerVisibility: 'visible', markedKey: 2});

         const result = controller.calculateMarkedKey(null);
         assert.strictEqual(result, 1);
      });

      it('undefined', () => {
         controller = new MarkerController({model, markerVisibility: 'onactivated', markedKey: 2});

         const result = controller.calculateMarkedKey(undefined);
         assert.strictEqual(result, undefined);
      });

      it('change key', () => {
         controller = new MarkerController({model, markerVisibility: 'visible', markedKey: 1});

         const result = controller.calculateMarkedKey(2);
         assert.equal(result, 2);
      });

      it('not exist item by key', () => {
         controller = new MarkerController({model, markerVisibility: 'visible', markedKey: 2});

         const result = controller.calculateMarkedKey(4);
         assert.equal(result, 1);
      });

      it('not exists item and onActivated visibility', () => {
         controller = new MarkerController({model, markerVisibility: 'onactivated', markedKey: undefined});

         const result = controller.calculateMarkedKey(4);
         assert.equal(result, null);
      });

      it('onactivated', () => {
         controller = new MarkerController({model, markerVisibility: 'onactivated', markedKey: undefined});

         let result = controller.calculateMarkedKey(3);
         assert.equal(result, 3);

         // markedKey не должен сброситсья, если список пустой
         model.setItems(new RecordSet({
            rawData: [],
            keyProperty: 'id'
         }));

         result = controller.update({model, markerVisibility: 'onactivated', markedKey: 3});
         assert.equal(result, 3);

         model.setItems(new RecordSet({
            rawData: [
               {id: 1},
               {id: 2}
            ],
            keyProperty: 'id'
         }));

         result = controller.update({model, markerVisibility: 'onactivated', markedKey: 3});
         assert.equal(result, 1);
      });
   });

   describe('restoreMarker', () => {
      it('markerVisibility = onactivated', () => {
         controller = new MarkerController({model, markerVisibility: 'onactivated', markedKey: 1});
         model.setItems(items);

         controller.restoreMarker();

         assert.isTrue(model.getItemBySourceKey(1).isMarked());
      });

      it('markerVisibility = visible and not exists item with marked key', () => {
         controller = new MarkerController({model, markerVisibility: 'visible', markedKey: 1});
         model.setItems(new RecordSet({
            rawData: [
               {id: 2},
               {id: 3}
            ],
            keyProperty: 'id'
         }));

         const result = controller.restoreMarker();
         assert.equal(result, 2);
      });

      it('markerVisibility = onactivated and not exists item with marked key', () => {
         controller = new MarkerController({model, markerVisibility: 'onactivated', markedKey: 1});
         model.setItems(new RecordSet({
            rawData: [
               {id: 2},
               {id: 3}
            ],
            keyProperty: 'id'
         }));

         const result = controller.restoreMarker();
         assert.equal(result, 2);
      });
   });

   it('move marker next', () => {
      controller = new MarkerController({model, markerVisibility: 'visible', markedKey: 2});

      const result = controller.moveMarkerToNext();
      assert.equal(result, 3);
   });

   it('move marker prev', () => {
      controller = new MarkerController({model, markerVisibility: 'visible', markedKey: 2});

      const result = controller.moveMarkerToPrev();
      assert.equal(result, 1);
   });

   describe('setMarkerOnFirstVisibleItem', () => {
      const getBCR = () => ({ height: 30 });
      const htmlItems = [
         { getBoundingClientRect: getBCR },
         { getBoundingClientRect: getBCR },
         { getBoundingClientRect: getBCR }
      ];

      it('offset 0', () => {
         const result = controller.setMarkerOnFirstVisibleItem(htmlItems, 0);
         assert.equal(result, 1);
      });

      it('offset 1', () => {
         const result = controller.setMarkerOnFirstVisibleItem(htmlItems, 1);
         assert.equal(result, 2);
      });

      it('offset 29', () => {
         const result = controller.setMarkerOnFirstVisibleItem(htmlItems, 29);
         assert.equal(result, 2);
      });

      it ('offset 30', () => {
         const result = controller.setMarkerOnFirstVisibleItem(htmlItems, 30);
         assert.equal(result, 2);
      });

      it ('offset 31', () => {
         const result = controller.setMarkerOnFirstVisibleItem(htmlItems, 31);
         assert.equal(result, 3);
      });

      it ('offset 31 and start index 2', () => {
         model.getStartIndex = () => 2;
         const result = controller.setMarkerOnFirstVisibleItem(htmlItems, 31);
         assert.equal(result, 3);
      });
   });

   describe('handlerRemoveItems', () => {
      it('exists current marked item', () => {
         controller = new MarkerController({model, markerVisibility: 'visible', markedKey: 2});

         model.setItems(new RecordSet({
            rawData: [
               {id: 2},
               {id: 3}
            ],
            keyProperty: 'id'
         }));

         const result = controller.handleRemoveItems(0);
         assert.equal(result, 2);
      });

      it('exists next item', () => {
         controller = new MarkerController({model, markerVisibility: 'visible', markedKey: 2});

         model.setItems(new RecordSet({
               rawData: [
                  {id: 1},
                  {id: 3}
               ],
               keyProperty: 'id'
            }));

         const result = controller.handleRemoveItems(1);
         assert.equal(result, 3);
      });

      it('exists prev item, but not next', () => {
         controller = new MarkerController({model, markerVisibility: 'visible', markedKey: 2});

         model.setItems(new RecordSet({
            rawData: [
               {id: 1},
               {id: 2}
            ],
            keyProperty: 'id'
         }));

         const result = controller.handleRemoveItems(2);
         assert.equal(result, 2);
      });

      it('not exists next and prev', () => {
         controller = new MarkerController({model, markerVisibility: 'visible', markedKey: 2});

         model.setItems(new RecordSet({
            rawData: [],
            keyProperty: 'id'
         }));

         const result = controller.handleRemoveItems(0);
         assert.equal(result, null);
      });
   });

   it('should work with breadcrumbs', () => {
      model = new SearchGridViewModel({
         items: new RecordSet({
            rawData: [{
               id: 1,
               parent: null,
               nodeType: true,
               title: 'test_node'
            }, {
               id: 2,
               parent: 1,
               nodeType: null,
               title: 'test_leaf'
            },
            {
               id: 3,
               parent: null,
               nodeType: true,
               title: 'test_node'
            }, {
               id: 4,
               parent: 3,
               nodeType: null,
               title: 'test_leaf'
            }],
            keyProperty: 'id'
         }),
         keyProperty: 'id',
         parentProperty: 'parent',
         nodeProperty: 'nodeType',
         columns: [{}]
      });

      controller = new MarkerController({model, markerVisibility: 'visible', markedKey: 2});
      assert.equal(controller._markedKey, 2);

      let result = controller.moveMarkerToNext();
      assert.equal(result, 4);

      result = controller.moveMarkerToPrev();
      assert.equal(result, 2);

      result = controller.calculateMarkedKey(4);
      assert.equal(result, 4);

      model.setItems(new RecordSet({
         rawData: [{
            id: 1,
            parent: null,
            nodeType: true,
            title: 'test_node'
         }, {
            id: 2,
            parent: 1,
            nodeType: null,
            title: 'test_leaf'
         }],
         keyProperty: 'id'
      }));
      result = controller.handleRemoveItems(2);
      assert.equal(result, 2);
   });
});
