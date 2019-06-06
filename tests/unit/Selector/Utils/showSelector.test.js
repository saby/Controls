define(['Controls/_lookup/showSelector', 'Controls/_lookup/BaseController'], function(showSelector, BaseController) {
   describe('Controls/_lookup/showSelector', function() {
      var
         lastPopupOptions,
         isShowSelector = false,
         baseController = new BaseController();

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
         }
      };

      it('showSelector without params', function() {
         showSelector(baseController);
         assert.isTrue(isShowSelector);
         assert.equal(lastPopupOptions.templateOptions.selectedTab, 'defaultTab');
         assert.equal(lastPopupOptions.width, 100);
         assert.equal(lastPopupOptions.opener, baseController);
         assert.equal(lastPopupOptions.multiSelect, undefined);
      });

      it('showSelector with templateOptions', function() {
         isShowSelector = false;
         showSelector(baseController, {
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
         isShowSelector = false;
         showSelector(baseController, {
            width: 50,
            height: 20
         });
         assert.isTrue(isShowSelector);
         assert.equal(lastPopupOptions.width, 50);
         assert.equal(lastPopupOptions.height, 20);
         assert.equal(lastPopupOptions.opener, baseController);
      });

      it('showSelector with multiSelect', function() {
         showSelector(baseController, undefined, true);
         assert.isTrue(lastPopupOptions.templateOptions.multiSelect);
      });
   });
});