define(
   [
      'Controls/popup',
      'UI/Vdom',
      'Types/collection',
      'Core/helpers/Number/randomId'
   ],

   function (popupMod, Vdom, collection, randomId) {
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

         it('set overlay id', () => {
            const Container = new popupMod.Container();
            const list = new collection.List();

            list.add(getItem(0, 'InfoBox', {modal: true, currentZIndex: 40}));
            list.add(getItem(1, 'InfoBox', {modal: false, currentZIndex: 10}));
            list.add(getItem(2, 'InfoBox', {modal: true, currentZIndex: 20}));
            list.add(getItem(3, 'InfoBox', {modal: false, currentZIndex: 30}));
            Container.setPopupItems(list);
            assert.equal(Container._overlayId, 0);

            list.removeAt(0);
            Container.setPopupItems(list);
            assert.equal(Container._overlayId, 2);

            list.removeAt(1);
            Container.setPopupItems(list);
            assert.equal(Container._overlayId, undefined);
            Vdom.Synchronizer.unMountControlFromDOM(Container, {});
         });

         it('popup items redraw promise', () => {
            const Container = new popupMod.Container();
            Container._calcOverlayId = () => {};
            let isRedrawPromiseResolve = false;
            const redrawPromise = Container.setPopupItems({}).then(() => {
               isRedrawPromiseResolve = true;
               assert.equal(isRedrawPromiseResolve, true);
               Vdom.Synchronizer.unMountControlFromDOM(Container, {});
            });
            Container._afterRender();
            return redrawPromise;
         });
      });
   }
);
