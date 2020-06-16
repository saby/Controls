// tslint:disable:no-empty
// tslint:disable:no-magic-numbers

import { assert } from 'chai';
import { MarkerController } from "Controls/marker";
import { ListViewModel } from 'Controls/list';
import { RecordSet } from 'Types/collection';

describe('Controls/marker/Controller', () => {
   let controller, model;

   beforeEach(() => {
      model = new ListViewModel({
         items: new RecordSet({
            rawData: [
               {id: 1},
               {id: 2},
               {id: 3}
            ],
            keyProperty: 'id'
         })
      });
      controller = new MarkerController({ model, markerVisibility: 'visible', markedKey: undefined })
   });

   describe('constructor', () => {
      it('not pass markedKey', () => {
         controller = new MarkerController({ model, markerVisibility: 'visible', markedKey: undefined })
         assert.equal(controller._markedKey, 1);
         assert.equal(model.getMarkedKey(), 1);
      });

      it('pass markedKey', () => {
         controller = new MarkerController({model: model, markerVisibility: 'visible', markedKey: 1})
         assert.equal(controller._markedKey, 1);
         assert.equal(controller._markerVisibility, 'visible');
         assert.equal(model.getMarkedKey(), 1);
      });
   });

   describe('update', () => {
      it('change marked key', () => {
         const result = controller.update({model: model, markedKey: 2})
         assert.equal(model.getMarkedKey(), 2);
         assert.equal(result, 2);
      })

      it('pass null if markedKey was set', () => {
         let result = controller.setMarkedKey(1);
         assert.equal(model.getMarkedKey(), 1);
         assert.equal(result, 1);

         result =  controller.update({
            model: model,
            markerVisibility: 'visible',
            markedKey: null
         });
         assert.equal(result, 1);
         assert.equal(model.getMarkedKey(), 1);
      });

      it('pass null if markedKey was not set', () => {
         const result = controller.update({
            model: model,
            markerVisibility: 'visible',
            markedKey: null
         })
         assert.equal(result, 1);
         assert.equal(model.getMarkedKey(), 1);
      });

      it('marker was reset in model', () => {
         let result = controller.setMarkedKey(2);
         assert.equal(result, 2);
         assert.equal(model.getMarkedKey(), 2);

         // сбрасываем маркер в модели
         model.setMarkedKey(2, false);
         assert.isNull(model.getMarkedKey());

         result = controller.update({
            model: model,
            markerVisibility: 'visible',
            markedKey: 2
         });
         assert.equal(result, 2);
         assert.equal(model.getMarkedKey(), 2);
      });
   });

   describe('setMarkedKey', () => {
      it('same key', () => {
         controller._markedKey = 2;
         const result = controller.setMarkedKey(2);
         assert.equal(result, 2);
      });

      it('same key which not exists in model', () => {
         controller._markedKey = 4;
         const result = controller.setMarkedKey(4);
         assert.equal(result, 1);
      });

      it('null', () => {
         controller = new MarkerController({model: model, markerVisibility: 'visible', markedKey: 2});

         const result = controller.setMarkedKey(null);
         assert.equal(result, 1);
         assert.equal(model.getMarkedKey(), 1);
      });

      it('undefined', () => {
         controller = new MarkerController({model: model, markerVisibility: 'visible', markedKey: 2});

         const result = controller.setMarkedKey(undefined);
         assert.equal(result, undefined);
         assert.equal(model.getMarkedKey(), undefined);
      });

      it('change key', () => {
         controller = new MarkerController({model: model, markerVisibility: 'visible', markedKey: 1});

         const result = controller.setMarkedKey(2);
         assert.equal(result, 2);
         assert.equal(model.getMarkedKey(), 2);
      });

      it('not exist item by key', () => {
         controller = new MarkerController({model: model, markerVisibility: 'visible', markedKey: 2});

         const result = controller.setMarkedKey(4);
         assert.equal(result, 1);
         assert.equal(model.getMarkedKey(), 1);
      });

      it('not exists item and onActivated visibility', () => {
         controller = new MarkerController({model: model, markerVisibility: 'onactivated', markedKey: undefined});

         const result = controller.setMarkedKey(4);
         assert.equal(result, undefined);
         assert.equal(model.getMarkedKey(), undefined);
      });
   });

   it('move marker next', () => {
      controller = new MarkerController({model: model, markerVisibility: 'visible', markedKey: 2});

      const result = controller.moveMarkerToNext();
      assert.equal(result, 3);
      assert.equal(model.getMarkedKey(), 3);
   });

   it('move marker prev', () => {
      controller = new MarkerController({model: model, markerVisibility: 'visible', markedKey: 2});

      const result = controller.moveMarkerToPrev();
      assert.equal(result, 1);
      assert.equal(model.getMarkedKey(), 1);
   });

   describe('handlerRemoveItems', () => {
      it('exists next item', () => {
         controller = new MarkerController({model: model, markerVisibility: 'visible', markedKey: 2});

         model.setItems(new RecordSet({
               rawData: [
                  {id: 1},
                  {id: 3}
               ],
               keyProperty: 'id'
            }));

         const result = controller.handleRemoveItems(1);
         assert.equal(result, 3);
         assert.equal(model.getMarkedKey(), 3);
      });

      it('exists prev item, but not next', () => {
         controller = new MarkerController({model: model, markerVisibility: 'visible', markedKey: 2});

         model.setItems(new RecordSet({
            rawData: [
               {id: 1},
               {id: 2}
            ],
            keyProperty: 'id'
         }));

         const result = controller.handleRemoveItems(2);
         assert.equal(result, 2);
         assert.equal(model.getMarkedKey(), 2);
      });

      it('not exists next and prev', () => {
         controller = new MarkerController({model: model, markerVisibility: 'visible', markedKey: 2});

         model.setItems(new RecordSet({
            rawData: [],
            keyProperty: 'id'
         }));

         const result = controller.handleRemoveItems(0);
         assert.equal(result, undefined);
         assert.equal(model.getMarkedKey(), undefined);
      });
   });

   describe('setMarkerOnFirstVisibleItem', () => {
      const getBCR = function() {
         return { height: 30 };
      };
      const htmlItems = [
         { getBoundingClientRect: getBCR },
         { getBoundingClientRect: getBCR },
         { getBoundingClientRect: getBCR },
      ];

      it('offset 0', () => {
         const result = controller.setMarkerOnFirstVisibleItem(htmlItems, 0);
         assert.equal(result, 1);
         assert.equal(model.getMarkedKey(), 1);
      });

      it('offset 1', () => {
         const result = controller.setMarkerOnFirstVisibleItem(htmlItems, 1);
         assert.equal(result, 2);
         assert.equal(model.getMarkedKey(), 2);
      });

      it('offset 29', () => {
         const result = controller.setMarkerOnFirstVisibleItem(htmlItems, 29);
         assert.equal(result, 2);
         assert.equal(model.getMarkedKey(), 2);
      });

      it ('offset 30', () => {
         const result = controller.setMarkerOnFirstVisibleItem(htmlItems, 30);
         assert.equal(result, 2);
         assert.equal(model.getMarkedKey(), 2);
      });

      it ('offset 31', () => {
         const result = controller.setMarkerOnFirstVisibleItem(htmlItems, 31);
         assert.equal(result, 3);
         assert.equal(model.getMarkedKey(), 3);
      });

      it ('offset 31 and start index 2', () => {
         model.getStartIndex = () => { return 2; }
         const result = controller.setMarkerOnFirstVisibleItem(htmlItems, 31);
         assert.equal(result, 3);
         assert.equal(model.getMarkedKey(), 3);
      });
   });
});
