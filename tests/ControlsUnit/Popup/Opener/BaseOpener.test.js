define(
   [
      'Controls/popup'
   ],
   (popup) => {
      'use strict';

      describe('Controls/_popup/Opener/BaseOpener', () => {
         it('registerOpenerUpdateCallback', () => {
            let opener = new popup.BaseOpener();
            opener._notify = (eventName, args) => {
               assert.equal(eventName, 'registerOpenerUpdateCallback');
               assert.equal(typeof args[0], 'function');
            };
            opener._afterMount();
            opener._notify = () => {};
            opener.destroy();
         });

         it('_getConfig', () => {
            let opener = new popup.BaseOpener();
            opener._options.templateOptions = {
               type: 'dialog',
               name: 'options'
            };
            var popupOptions = {
               closeOnOutsideClick: true,
               actionOnScroll: 'close',
               templateOptions: {
                  type: 'stack',
                  name: 'popupOptions'
               },
               opener: null
            };
            var baseConfig = opener._getConfig(popupOptions);

            assert.equal(opener._options.templateOptions.type, 'dialog');
            assert.equal(opener._options.templateOptions.name, 'options');
            assert.equal(baseConfig.templateOptions.name, 'popupOptions');
            assert.equal(baseConfig.closeOnOutsideClick, true);
            assert.equal(baseConfig.templateOptions.type, 'stack');
            assert.equal(baseConfig.opener, null);
            assert.equal(baseConfig.actionOnScroll, 'close');
            assert.equal(opener._actionOnScroll, 'close');
            let opener2 = new popup.BaseOpener();
            popupOptions = {
               templateOptions: {
                  type: 'stack',
                  name: 'popupOptions'
               },
               opener: null
            };
            popupOptions.templateOptions.opener = 123;
            baseConfig = opener2._getConfig(popupOptions);
            assert.equal(opener2._actionOnScroll, 'none');
            assert.equal(baseConfig.templateOptions.opener, undefined);

            opener.destroy();
			      opener2.destroy();
         });

         it('_beforeUnmount', () => {
            let opener = new popup.BaseOpener();
            let isHideIndicatorCall = false;
            opener._indicatorId = '123';
            opener._openPopupTimerId = '145';
            opener._options.closePopupBeforeUnmount = true;

            opener._notify = (eventName, args) => {
               if (eventName === 'hideIndicator') {
                  isHideIndicatorCall = true;
               }
            };

            opener._beforeUnmount();
            assert.equal(opener._indicatorId, null);
            assert.equal(isHideIndicatorCall, true);
            assert.equal(opener._openPopupTimerId, null);

            isHideIndicatorCall = false;
            opener._indicatorId = null;
            opener._openPopupTimerId = '145';
            opener._options.closePopupBeforeUnmount = false;
            opener._beforeUnmount();
            assert.equal(opener._indicatorId, null);
            assert.equal(opener._openPopupTimerId, '145');
            assert.equal(isHideIndicatorCall, false);
            opener.destroy();
         });
      });

      it('multi open', (done) => {
         const opener = new popup.BaseOpener();
         opener._openPopup = () => Promise.resolve(null);
         opener._useVDOM = () => true;

         let popupId1;
         let popupId2;
         let popupId3;

         opener.open().then((id) => { popupId1 = id });
         opener.open().then((id) => { popupId2 = id });
         opener.open().then((id) => { popupId3 = id });

         setTimeout(() => {
            assert.equal(popupId1, popupId2);
            assert.equal(popupId2, popupId3);
            done();
         }, 10);

         opener.destroy();
      });

      it('getIndicatorConfig', () => {
         const opener = new popup.BaseOpener();
         const standartCfg = {
            id: '',
            message: rk('Загрузка'),
            delay: 2000
         };
         assert.deepEqual(standartCfg, opener._getIndicatorConfig());
         opener._indicatorId = '123';
         standartCfg.id = '123';
         assert.deepEqual(standartCfg, opener._getIndicatorConfig());
         opener.destroy();
      });
   }
);
