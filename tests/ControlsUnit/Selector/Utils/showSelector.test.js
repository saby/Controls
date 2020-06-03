define(['Controls/_lookup/showSelector', 'Controls/_lookup/BaseController', 'Controls/popup'], function(showSelector, BaseController, popup) {
   'use strict';

   describe('Controls/_lookup/showSelector', function() {
      let lastPopupOptions;
      let isShowSelector = false;
      let stubOpenPopup;

      const getBaseController = function() {
         const baseController = new BaseController();

         baseController._options.selectorTemplate = {
            templateOptions: {
               selectedTab: 'defaultTab'
            },
            popupOptions: {
               width: 100
            }
         };

         return baseController;
      };

      before(function() {
         stubOpenPopup = sinon.stub(popup.Stack, 'openPopup');
         stubOpenPopup.callsFake(function(popupOptions) {
            isShowSelector = true;
            lastPopupOptions = popupOptions;
            return Promise.resolve();
         });
      });

      after(function() {
         stubOpenPopup.restore();

         stubOpenPopup = undefined;
      });

      it('showSelector without params', function() {
         const baseController = getBaseController();
         let items = baseController._getItems();
         showSelector.default(baseController);
         assert.isTrue(isShowSelector);
         assert.equal(lastPopupOptions.templateOptions.selectedTab, 'defaultTab');
         assert.notEqual(lastPopupOptions.templateOptions.selectedItems, items);
         assert.equal(lastPopupOptions.width, 100);
         assert.equal(lastPopupOptions.opener, baseController);
         assert.equal(lastPopupOptions.multiSelect, undefined);
      });

      it('showSelector with templateOptions', function() {
         const baseController = getBaseController();
         isShowSelector = false;
         showSelector.default(baseController, {
            templateOptions: {
               selectedTab: 'Employees'
            }
         });
         assert.isTrue(isShowSelector);
         assert.equal(lastPopupOptions.templateOptions.selectedTab, 'Employees');
         assert.equal(lastPopupOptions.width, 100);
         assert.equal(lastPopupOptions.opener, baseController);
      });

      it('showSelector with popupOptions', function() {
         const baseController = getBaseController();
         isShowSelector = false;
         showSelector.default(baseController, {
            width: 50,
            height: 20
         });
         assert.isTrue(isShowSelector);
         assert.equal(lastPopupOptions.width, 50);
         assert.equal(lastPopupOptions.height, 20);
         assert.equal(lastPopupOptions.opener, baseController);
      });

      it('showSelector with multiSelect', function() {
         const baseController = getBaseController();
         let selectCompleted = false;
         let selectorClosed = false;

         baseController._selectCallback = () => {
            selectCompleted = true;
         };
         popup.Stack.closePopup = () => {
            selectorClosed = true;
            assert.isFalse(selectCompleted);
         };
         baseController._options.isCompoundTemplate = true;

         showSelector.default(baseController, undefined, true);
         lastPopupOptions.templateOptions.handlers.onSelectComplete();
      });

      it('showSelector with isCompoundTemplate:false', function() {
         const baseController = getBaseController();
         const sandbox = sinon.createSandbox();
         const stub = sandbox.stub(baseController, '_selectCallback');
         popup.Stack.closePopup = () => {};
         baseController._options.isCompoundTemplate = false;
         showSelector.default(baseController, undefined, true);
         lastPopupOptions.templateOptions.handlers.onSelectComplete();

         assert.isTrue(stub.notCalled);
         sandbox.restore();
      });

      it('opening showSelector', function() {
         const baseController = getBaseController();
         isShowSelector = false;
         baseController._openingSelector = null;
         showSelector.default(baseController, {});
         assert.isTrue(isShowSelector);
         assert.isNotNull(baseController._openingSelector);

         isShowSelector = false;
         showSelector.default(baseController, {});
         assert.isFalse(isShowSelector);
      });
   });
});
