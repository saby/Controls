/* global define, beforeEach, afterEach, describe, it, assert, sinon */
define([
   'Controls/dataSource'
], function(dataSource) {
   describe('Controls/dataSource:error.Container', function() {
      const Container = dataSource.error.Container;
      let instance;

      function mockPopupHelper(popupId) {
         instance._popupHelper = {
            openDialog(config, opener, handlers) {
               this._onClose = handlers && handlers.onClose;
               return Promise.resolve(popupId);
            },
            closeDialog(id) {
               if (id === popupId && typeof this._onClose === 'function') {
                  this._onClose();
               }
            }
         };
      }

      function createInstance() {
         instance = new Container();
         sinon.stub(instance, '_notify');
         mockPopupHelper();
      }

      function getViewConfig(mode, options) {
         return {
            mode,
            options,
            template: 'template',
            status: undefined
         };
      }

      afterEach(() => {
         sinon.restore();
      });

      it('is defined', function() {
         assert.isDefined(Container);
      });

      it('is constructor', function() {
         assert.isFunction(Container);
         createInstance();
         assert.instanceOf(instance, Container);
      });

      describe('_openDialog()', function() {
         beforeEach(() => {
            createInstance();
         });

         it('closes previously opened dialog', function() {
            sinon.stub(instance, '_closeDialog');
            instance._popupId = 'test';

            return instance._openDialog({}).then(() => {
               assert.isTrue(instance._closeDialog.calledOnce, '_closeDialog called');
               assert.isNotOk(instance._popupId, '_closeDialog is empty');
            });
         });

         it('notifies "dialogClosed" on closing opened dialog', function() {
            const popupId = String(Date.now());
            const config = {};
            mockPopupHelper(popupId);
            return instance._openDialog(config).then(() => {
               assert.strictEqual(instance._popupId, popupId, 'saves popupId');

               // Диалог открылся. Теперь эмулируем закрытие диалога.
               instance._popupHelper.closeDialog(popupId);
               assert.isNotOk(instance._popupId, 'clears popupId');
               assert.isTrue(instance._notify.calledOnceWith('dialogClosed', []), 'notifies "dialogClosed"');
            });
         });
      });

      describe('_beforeUpdate()', () => {
         let viewConfig;

         beforeEach(() => {
            createInstance();
            viewConfig = getViewConfig('include');
         });

         it('sets new viewConfig when it comes', () => {
            instance.__viewConfig = null;
            instance._options.viewConfig = null;

            instance._beforeUpdate({ viewConfig });

            assert.isDefined(instance.__viewConfig);
         });

         it('does not set new viewConfig when options.viewConfig are equal', () => {
            instance.__viewConfig = null;
            instance._options.viewConfig = viewConfig;

            instance._beforeUpdate({ viewConfig });

            assert.isNull(instance.__viewConfig);
         });

         it('inlist mode: sets new list options when options viewConfig are equal', () => {
            const options = { viewConfig: getViewConfig('inlist', {}), someListsOptions: 42 };

            instance.__viewConfig = viewConfig;
            instance._options.viewConfig = viewConfig;

            instance._beforeUpdate(options);

            assert.strictEqual(instance.__viewConfig.options.listOptions, options);
         });
      });

      describe('_updateInlistOptions()', () => {
         let viewConfig;
         let options;

         beforeEach(() => {
            createInstance();
            viewConfig = getViewConfig('inlist', {});
            options = {};
            instance.__viewConfig = viewConfig;
         });

         it('updates viewConfig options object', () => {
            const oldViewConfigOptions = instance.__viewConfig.options;
            instance._updateInlistOptions(options);
            assert.notStrictEqual(instance.__viewConfig.options, oldViewConfigOptions);
         });

         it('sets viewConfig options as passed options', () => {
            instance._updateInlistOptions(options);
            assert.strictEqual(instance.__viewConfig.options.listOptions, options);
         });
      });

      describe('__updateConfig()', () => {
         let viewConfig;
         let options;

         beforeEach(() => {
            createInstance();
            viewConfig = getViewConfig('include', {});
            options = { viewConfig };
            instance.__viewConfig = null;
         });

         it('sets new viewConfig from passed options', () => {
            instance.__updateConfig(options);
            assert.isDefined(instance.__viewConfig);
         });

         it('sets correct showed flag for viewConfig', () => {
            [
               [true, 'include', true],
               [true, 'dialog', true],
               [false, 'include', true],
               [false, 'dialog', false]
            ].forEach(([isShowed, mode, result]) => {
               viewConfig.isShowed = isShowed;
               viewConfig.mode = mode;
               instance.__updateConfig({ viewConfig });
               assert.strictEqual(instance.__viewConfig.isShowed, result);
            });
         });

         it('updates list options in inlist mode', () => {
            viewConfig.mode = 'inlist';
            instance.__updateConfig(options);
            assert.strictEqual(instance.__viewConfig.options.listOptions, options);
         });

         it('does not update list options in non-inlist mode', () => {
            instance.__updateConfig(options);
            assert.isUndefined(instance.__viewConfig.options.listOptions);
         });
      });
   });
});
