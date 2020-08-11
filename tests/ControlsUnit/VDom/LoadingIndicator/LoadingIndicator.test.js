define([
   'Controls/LoadingIndicator',
   'UI/Vdom'
], (LoadingIndicator, Vdom) => {
   'use strict';

   describe('LoadingIndicator-tests', () => {
      let Loading = new LoadingIndicator.default();
      Loading._beforeMount({});

      it('LoadingIndicator - delay', () => {
         let LoadingDelay = new LoadingIndicator.default();
         LoadingDelay._beforeMount({
            delay: 1
         });
         assert.equal(LoadingDelay._getDelay({}), 1);
         assert.equal(LoadingDelay._getDelay({ delay: 5 }), 5);
         LoadingDelay._beforeMount({});
         assert.equal(LoadingDelay._getDelay({}), 2000);
         assert.equal(LoadingDelay._getDelay({ delay: 3 }), 3);
         Vdom.Synchronizer.unMountControlFromDOM(LoadingDelay, {});
      });

      it('LoadingIndicator - add', () => {
         let Loading2 = new LoadingIndicator.default();
         Loading2._beforeMount({});
         Loading._toggleIndicator = () => {
         };
         let prom = new Promise((resolve) => {
         });
         let promise = new Promise((resolve, reject) => {
            reject(new Error('error'));
         });
         let config = {
            message: 'message 1',
            delay: 1
         };
         let id = Loading._show(config, prom);
         assert.equal(typeof id, 'string');
         assert.equal(Loading._stack.getCount(), 1);
         assert.equal(Loading._stack.at(0).overlay, 'default');
         assert.equal(Loading._stack.at(0).message, 'message 1');
         assert.equal(Loading._stack.at(0).waitPromise, prom);

         config = {
            message: 'message 2',
            overlay: 'none'
         };
         Loading._show(config);
         assert.equal(Loading._stack.getCount(), 2);
         assert.equal(Loading._stack.at(1).overlay, 'none');
         assert.equal(Loading._stack.at(1).message, 'message 2');

         Loading._show('message 3');
         assert.equal(Loading._stack.getCount(), 3);
         assert.equal(Loading._stack.at(2).message, 'message 3');

         config = {
            message: 'message 4',
            overlay: 'none'
         };

         id = Loading.show(config);
         assert.equal(Loading._stack.getCount(), 4);
         assert.equal(Loading._stack.at(3).message, 'message 4');
         assert.equal(typeof id, 'string');

         Loading.hide(id);
         assert.equal(Loading._stack.getCount(), 3);
         config = {
            message: 'message 4',
            overlay: 'none',
            delay: 10
         };
         let id2 = Loading2._show(config, promise);
         promise.catch((error) => {
            assert.equal(Loading2._stack.getCount(), 0);
         });
      });

      it('LoadingIndicator - open config', () => {
         let LoadingInd = new LoadingIndicator.default();
         LoadingInd._beforeMount({});
         const waitPromise = Promise.resolve();
         const config = {};

         LoadingInd.show(config, waitPromise);
         assert.equal(config.waitPromise, undefined);

         Vdom.Synchronizer.unMountControlFromDOM(LoadingInd, {});
      });

      it('LoadingIndicator - isOpened', () => {
         let cfg1 = Loading._stack.at(0);
         assert.equal(Loading._isOpened(cfg1), true);

         let cfg2 = { id: 'test', message: 'test' };
         assert.equal(Loading._isOpened(cfg2), false);
         assert.equal(cfg2.hasOwnProperty('id'), false);
      });

      it('LoadingIndicator - update', () => {
         let cfg1 = Loading._stack.at(0);
         let id = cfg1.id;
         cfg1.message = 'message 0';
         Loading._show(cfg1);

         assert.equal(Loading._stack.getCount(), 3);
         assert.equal(Loading._stack.at(2).id, id);
         assert.equal(Loading._stack.at(2).message, 'message 0');
      });

      it('LoadingIndicator - remove indicator from stack', () => {
         let LoadingInd = new LoadingIndicator.default();
         LoadingInd._beforeMount({});

         let config1 = {
            message: 'message 1'
         };
         let config2 = {
            message: 'message 2'
         };
         let config3 = {
            message: 'message 3'
         };
         LoadingInd.show(config1);
         LoadingInd.show(config2);
         LoadingInd.show(config3);

         let id = LoadingInd._stack.at(0).id;
         LoadingInd._hide(id);
         assert.equal(LoadingInd._stack.getCount(), 2);

         id = LoadingInd._stack.at(1).id;
         LoadingInd._hide(id);
         assert.equal(LoadingInd._stack.getCount(), 1);

         id = LoadingInd._stack.at(0).id;
         LoadingInd._hide(id);
         assert.equal(LoadingInd._stack.getCount(), 0);

         let isItemRemove = false;
         LoadingInd._removeItem = () => isItemRemove = true;

         LoadingInd._hide('id');
         assert.equal(isItemRemove, false);
         Vdom.Synchronizer.unMountControlFromDOM(LoadingInd, {});
      });

      it('LoadingIndicator - getOverlay', () => {
         let LoadingInd = new LoadingIndicator.default();
         let overlay = 'dark';
         LoadingInd._isOverlayVisible = true;
         LoadingInd._isMessageVisible = false;
         assert.equal(LoadingInd._getOverlay(overlay), 'default');
         LoadingInd._isMessageVisible = true;
         assert.equal(LoadingInd._getOverlay(overlay), overlay);
         Vdom.Synchronizer.unMountControlFromDOM(LoadingInd, {});
      });

      it('LoadingIndicator - hide', () => {
         let config = {
            message: 'message 1',
            delay: 1
         };
         Loading._show(config);
         const delayTimerId = Loading.delayTimeout;
         Loading._show(config);
         Loading._show(config);
         assert.equal(delayTimerId, Loading.delayTimeout);
         assert.equal(false, Loading._isMessageVisible);
         Loading.hide();
         assert.equal(Loading._stack.getCount(), 0);
      });

      it ('LoadingIndicator with empty config', () => {
         let LoadingInd = new LoadingIndicator.default();
         LoadingInd._beforeMount({});

         const cfg = LoadingInd._prepareConfig({message: 'Loading'});
         LoadingInd._updateProperties(cfg);
         LoadingInd._beforeUpdate({});
         assert.equal(LoadingInd.message, 'Loading');

         const cfgEmpty = LoadingInd._prepareConfig({});
         LoadingInd._updateProperties(cfgEmpty);
         LoadingInd._beforeUpdate({});
         assert.equal(LoadingInd.message, '');
         Vdom.Synchronizer.unMountControlFromDOM(LoadingInd, {});
      });

      it('LoadingIndicator - toggleIndicator', (done) => {
         let LoadingInd = new LoadingIndicator.default();
         let isMessageVisible = true;
         LoadingInd._beforeMount({});
         let baseToggleIndicatorVisible = LoadingInd._toggleIndicatorVisible;
         let baseToggleOverlayAsync = LoadingInd._toggleOverlayAsync;
         LoadingInd._toggleOverlayAsync = LoadingInd._toggleOverlay;
         let config = {
            delay: 1
         };
         LoadingInd._stack.add({ delay: undefined });
         LoadingInd._toggleIndicator(true, config, true);
         assert.equal(LoadingInd._isOverlayVisible, true);
         assert.equal(LoadingInd._isMessageVisible, true);

         LoadingInd._toggleIndicator(false);
         assert.equal(LoadingInd._isOverlayVisible, true);
         assert.equal(LoadingInd._isMessageVisible, true);

         LoadingInd._stack.clear();
         LoadingInd._toggleIndicator(false);
         assert.equal(LoadingInd._isOverlayVisible, false);
         assert.equal(LoadingInd._isMessageVisible, false);

         LoadingInd._stack.add({ delay: undefined });
         LoadingInd._toggleIndicator(true, config);
         assert.equal(LoadingInd._isOverlayVisible, false);
         assert.equal(LoadingInd._isMessageVisible, false);

         LoadingInd._stack.clear();
         LoadingInd._toggleIndicator(true, config);
         assert.equal(LoadingInd._isOverlayVisible, false);
         assert.equal(LoadingInd._isMessageVisible, false);

         LoadingInd._toggleIndicatorVisible = function() {
            baseToggleIndicatorVisible.apply(LoadingInd, arguments);
            assert.equal(LoadingInd._isMessageVisible, isMessageVisible);
            if (isMessageVisible) {
               done();
            }
         };

         LoadingInd._toggleOverlayAsync = baseToggleOverlayAsync;
         LoadingInd._stack.clear();
         LoadingInd._stack.add({ delay: 2000 });
         LoadingInd._stack.add({ delay: 2000 });
         LoadingInd._isOverlayVisible = false;
         isMessageVisible = false;
         LoadingInd._toggleIndicator(true, config);

         isMessageVisible = true;

         Vdom.Synchronizer.unMountControlFromDOM(LoadingInd, {});

      });
      after(() => {
         Vdom.Synchronizer.unMountControlFromDOM(Loading, {});
      });
   });
});
