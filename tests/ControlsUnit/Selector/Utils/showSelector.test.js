define(['Controls/_lookup/showSelector', 'Controls/_lookup/BaseController'], function(showSelector, BaseController) {
   'use strict';

   describe('Controls/_lookup/showSelector', function() {
      let lastPopupOptions;
      let isShowSelector = false;
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
         baseController._children.selectorOpener = {
            open: function(popupOptions) {
               isShowSelector = true;
               lastPopupOptions = popupOptions;
               return Promise.resolve();
            }
         };
         
         return baseController;
      };

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
         baseController._children.selectorOpener.close = () => {
            selectorClosed = true;
            assert.isFalse(selectCompleted);
         };

         showSelector.default(baseController, undefined, true);
         lastPopupOptions.templateOptions.handlers.onSelectComplete();
      });
   });
});
