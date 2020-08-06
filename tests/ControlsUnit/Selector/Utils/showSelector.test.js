define(['Controls/_lookup/showSelector', 'Controls/_lookup/Lookup', 'Controls/popup', 'Types/collection'], function(showSelector, Lookup, popup, { RecordSet }) {

   describe('Controls/_lookup/showSelector', function() {
      let lastPopupOptions;
      let isShowSelector = false;

      const getBaseController = function() {
         const baseController = new Lookup.default();

         baseController._lookupController = {
            getItems: () => new RecordSet()
         };
         baseController._options.selectorTemplate = {
            templateOptions: {
               selectedTab: 'defaultTab'
            },
            popupOptions: {
               width: 100
            }
         };

         baseController._stack = {
            open: (popupOptions) => {
               isShowSelector = true;
               lastPopupOptions = popupOptions;
               return Promise.resolve();
            },
            close: () => {}
         };

         return baseController;
      };

      it('showSelector without params', function() {
         const baseController = getBaseController();
         showSelector.default(baseController);
         assert.isTrue(isShowSelector);
         assert.equal(lastPopupOptions.templateOptions.selectedTab, 'defaultTab');
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

      it('showSelector with handlers on templateOptions', function() {
         const baseController = getBaseController();
         baseController._options.selectorTemplate = {
            templateOptions: {
               handlers: {
                  onTestAction: () => {}
               }
            }
         };
         showSelector.default(baseController, {});

         assert.isFunction(lastPopupOptions.templateOptions.handlers.onSelectComplete);
         assert.isFunction(lastPopupOptions.templateOptions.handlers.onTestAction);
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

      it('showSelector notify selector close', function() {
         const baseController = getBaseController();
         let selectorCloseNotified = false;
         baseController._closeHandler = () => {};
         baseController.notify = (eventName) => {
            if (eventName === 'selectorClose') {
               selectorCloseNotified = true;
            }
         };
         showSelector.default(baseController, undefined, true);
         lastPopupOptions.eventHandlers.onClose();
         assert.isFalse(selectorCloseNotified);
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
         baseController._selectorOpening = null;
         showSelector.default(baseController, {});
         assert.isTrue(isShowSelector);
         assert.isNotNull(baseController._selectorOpening);

         isShowSelector = false;
         showSelector.default(baseController, {});
         assert.isFalse(isShowSelector);
      });

      it('showSelector without selectorTemplate', function() {
         const baseController = getBaseController();
         baseController._options.selectorTemplate = null;
         baseController._selectorOpening = null;

         assert.isNull(showSelector.default(baseController, {}));
      });

      it('showSelector without selectorTemplate and popupOptions template', function() {
         const baseController = getBaseController();
         baseController._options.selectorTemplate = null;
         showSelector.default(baseController, {});

         assert.isUndefined(baseController._selectorOpening);
      });

      it('showSelector without selectorTemplate and with popupOptions template', function() {
         const baseController = getBaseController();
         baseController._selectorOpening = null;
         baseController._options.selectorTemplate = null;
         showSelector.default(baseController, {
            template: 'testTemplate'
         });
         assert.isNotNull(baseController._selectorOpening);
         assert.equal(lastPopupOptions.template, 'testTemplate');
      });

      it('showSelector with selectorTemplate', function() {
         const baseController = getBaseController();
         baseController._selectorOpening = null;
         baseController._options.selectorTemplate = {
            templateName: 'selectorTemplate'
         };
         showSelector.default(baseController, {});
         assert.equal(lastPopupOptions.template, 'selectorTemplate');
         assert.isNotNull(baseController._selectorOpening);
      });
   });
});
