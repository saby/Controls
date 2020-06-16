define(
   [
      'Controls/popup',
      'Types/collection',
      'Core/helpers/Number/randomId'
   ],

   function (popupMod, collection, randomId) {
      'use strict';
      describe('Controls/_popup/Manager/Container', function () {
         let id;
         const items = new collection.List();
         const popupContainer = new popupMod.Container();

         const getItem = (popupId, TYPE, data = {}) => ({
            id: popupId,
            modal: data.modal,
            currentZIndex: data.currentZIndex,
            controller: {
               TYPE
            }
         });

         it('add popupItem', function(){
            id = randomId('popup-');
            items.add({
               id: id,
               popupOptions: {},
               controller: {}
            });
            popupContainer.setPopupItems(items);
            assert.equal(popupContainer._popupItems.getCount(), 1);
         });

         it('remove popupItem', function(){
            items.removeAt(0);
            popupContainer.setPopupItems(items);
            assert.equal(popupContainer._popupItems.getCount(), 0);
         });

         it('getItems', () => {
            const Container = new popupMod.Container();
            const list = new collection.List();
            list.add(getItem(0, 'InfoBox'));
            list.add(getItem(1, 'Stack'));
            list.add(getItem(2, 'Dialog'));
            list.add(getItem(3, 'Sticky'));
            list.add(getItem(4, 'Stack'));
            list.add(getItem(5, 'Dialog'));

            const containerItems = Container._getItems(list);
            const order = [5, 4, 2, 1, 0, 3];
            const containerOrder = [];
            containerItems.each((element) => {
               containerOrder.push(element.id);
            });
            assert.deepEqual(order, containerOrder);
            Container.destroy();
         });
         it('set overlay id', () => {
            const Container = new popupMod.Container();
            const list = new collection.List();

            list.add(getItem(0, 'InfoBox', {modal: true, currentZIndex: 40}));
            list.add(getItem(1, 'InfoBox', {modal: false, currentZIndex: 10}));
            list.add(getItem(2, 'InfoBox', {modal: true, currentZIndex: 20}));
            list.add(getItem(3, 'InfoBox', {modal: false, currentZIndex: 30}));
            Container._getItems(list);
            assert.equal(Container._overlayId, 0);

            list.removeAt(0);
            Container._getItems(list);
            assert.equal(Container._overlayId, 2);

            list.removeAt(1);
            Container._getItems(list);
            assert.equal(Container._overlayId, undefined);
            Container.destroy();
         });
      });
   }
);
