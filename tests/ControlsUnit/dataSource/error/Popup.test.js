/* global define, beforeEach, afterEach, describe, it, assert, sinon */
define([
   'Controls/dataSource',
   'Env/Env',
   'WasabyLoader/Library',
   'Browser/Transport'
], function(
   dataSource,
   { constants },
   WasabyLib
) {
   const require = requirejs;
   describe('Controls/dataSource:error.Popup', () => {
      const Popup = dataSource.error.Popup;
      const fakeModules = [
         ['FakePopupModule1', () => ({
            name: 'FakePopupModule1',
            Confirmation: {
               openPopup: sinon.stub()
            },
            Dialog: {
               openPopup: sinon.stub(),
               closePopup: sinon.stub()
            }
         })],
         ['FakePopupModule2', () => ({ name: 'FakePopupModule2' })],
         ['FakePopupModule3', () => ({ name: 'FakePopupModule3' })],
         ['FakePopupModule4', () => ({ name: 'FakePopupModule4' })]
      ];
      const fakeModuleNames = fakeModules.map(([name]) => name);
      const defineModule = ([name, definition]) => define(name, [], definition);
      const undefModule = ([name]) => require.undef(name);
      const importThemes = modules => new Promise((resolve, reject) => {
         require(modules, (...args) => resolve(args), reject);
      });

      let originalModules;
      let originalThemes;
      let originalImportThemes;

      beforeEach(() => {
         originalModules = Popup.POPUP_MODULES;
         originalImportThemes = Popup.importThemes;
         Popup.importThemes = importThemes;
         fakeModules.forEach(defineModule);
      });

      afterEach(() => {
         fakeModules.forEach(undefModule);
         Popup.POPUP_MODULES = originalModules;
         Popup.importThemes = originalImportThemes;
         sinon.restore();
      });

      describe('preloadPopup()', () => {
         it('loads default modules', () => {
            Popup.POPUP_MODULES = [fakeModuleNames[0], fakeModuleNames[1]];
            const p = new Popup([], [fakeModuleNames[2], fakeModuleNames[3]]);
            return p.preloadPopup().then((result) => {
               assert.strictEqual(result.name, fakeModuleNames[0]);
            });
         });

         it('loads additional modules', () => {
            Popup.POPUP_MODULES = [fakeModuleNames[0]];
            const p = new Popup([fakeModuleNames[2]], [fakeModuleNames[1], fakeModuleNames[3]]);
            return p.preloadPopup().then((result) => {
               assert.strictEqual(result.name, fakeModuleNames[0]);
            });
         });

         it('result fulfilled with undefined', () => {
            Popup.POPUP_MODULES = [fakeModuleNames[0]];
            const p = new Popup([], ['FakeFailModule1']);
            return p.preloadPopup().then((result) => {
               assert.isUndefined(result);
            });
         });
      });

      describe('openConfirmation()', () => {
         it('calls openPopup()', () => {
            Popup.POPUP_MODULES = [fakeModuleNames[0]];
            const p = new Popup([], [fakeModuleNames[1]]);
            const options = {};
            return p.openConfirmation(options).then(() => {
               const popup = require(fakeModuleNames[0]);
               assert.isTrue(
                  popup.Confirmation.openPopup.calledOnce,
                  'openPopup() called'
               );
               assert.strictEqual(
                  popup.Confirmation.openPopup.getCall(0).args[0],
                  options,
                  'openPopup() called with options'
               );
            });
         });

         it('calls showDefaultDialog()', () => {
            Popup.POPUP_MODULES = [fakeModuleNames[0]];
            const p = new Popup([], ['FakeFailModule1']);
            sinon.stub(Popup, 'showDefaultDialog');
            const options = { message: 'test' };
            return p.openConfirmation(options).then(() => {
               const popup = require(fakeModuleNames[0]);
               assert.isNotOk(
                  popup.Confirmation.openPopup.called,
                  'openPopup() should not be called'
               );
               assert.isTrue(
                  Popup.showDefaultDialog.calledOnce,
                  'showDefaultDialog() called'
               );
               assert.strictEqual(
                  Popup.showDefaultDialog.getCall(0).args[0],
                  options.message,
                  'showDefaultDialog() called with message'
               );
            });
         });
      });

      describe('openDialog()', () => {
         let p;

         beforeEach(() => {
            sinon.stub(Popup, 'showDefaultDialog');
            Popup.POPUP_MODULES = [fakeModuleNames[0]];
            p = new Popup([], [fakeModuleNames[1]]);
         });

         afterEach(() => {
            sinon.restore();
         });

         it('calls openPopup()', () => {
            const viewConfig = {
               template: {},
               options: {}
            };
            const opener = {};
            const eventHandlers = {};
            return p.openDialog(viewConfig, { opener, eventHandlers }).then(() => {
               const popup = require(fakeModuleNames[0]);
               assert.isTrue(popup.Dialog.openPopup.calledOnce, 'openPopup() called');
               const cfg = popup.Dialog.openPopup.getCall(0).args[0];
               assert.strictEqual(cfg.template, viewConfig.template, 'openPopup() called with template');
               assert.strictEqual(cfg.options, viewConfig.templateOptions, 'openPopup() called with options');
               assert.strictEqual(cfg.opener, opener, 'openPopup() called with opener');
               assert.strictEqual(cfg.eventHandlers, eventHandlers, 'openPopup() called with event handlers');
               assert.strictEqual(cfg.modal, true, 'modal is true by default');
            });
         });

         it('calls showDefaultDialog()', () => {
            p.themes = ['FakeFailModule1'];
            const config = {
               options: {
                  message: 'message',
                  details: 'details'
               }
            };
            return p.openDialog(config).then(() => {
               const popup = require(fakeModuleNames[0]);
               assert.isNotOk(popup.Dialog.openPopup.called, 'openPopup() should not be called');
               assert.isTrue(Popup.showDefaultDialog.calledOnce, 'showDefaultDialog() called');
               assert.deepEqual(
                  Popup.showDefaultDialog.getCall(0).args,
                  [config.options.message, config.options.details],
                  'showDefaultDialog() called with message and details'
               );
            });
         });

         it('combines dialogTemplate options with templateOptions', () => {
            Popup.POPUP_MODULES = [fakeModuleNames[0]];
            const dialogTmplOptions = { dialogOption: 'dialogTemplateOption' };
            const dialogOptions = { templateOptions: dialogTmplOptions, handler: 42 };
            const viewConfig = { options: { configOption: 'configTemplateOption' } };
            const p = new Popup([], [fakeModuleNames[1]]);
            return p.openDialog(viewConfig, dialogOptions).then(() => {
               const popup = require(fakeModuleNames[0]);
               const cfg = popup.Dialog.openPopup.getCall(0).args[0];
               assert.strictEqual(cfg.templateOptions.dialogOption, dialogTmplOptions.dialogOption);
               assert.strictEqual(cfg.templateOptions.configOption, viewConfig.options.configOption);
               assert.strictEqual(cfg.handler, dialogOptions.handler);
            });
         });

         it('if config contains string template, it will load this and opens popup', () => {
            const viewConfig = { template: fakeModuleNames[2], options: {} };
            return p.openDialog(viewConfig, {}).then(() => {
               const popup = require(fakeModuleNames[0]);
               assert.isTrue(popup.Dialog.openPopup.calledOnce, 'openPopup() called');
               return WasabyLib.load(fakeModuleNames[2]).then((module) => {
                  assert.isDefined(module, 'template module exists');
               });
            });
         });

         it('if config contains falsy string template, it will opens default popup', () => {
            const fakeModuleName = 'fakeModuleName';
            const viewConfig = { template: fakeModuleName, options: {} };
            return p.openDialog(viewConfig, {}).then(() => {
               const popup = require(fakeModuleNames[0]);
               assert.isFalse(
                  popup.Confirmation.openPopup.called,
                  'openPopup() should not be called'
               );
               assert.isTrue(
                  Popup.showDefaultDialog.calledOnce,
                  'showDefaultDialog() called'
               );
               return WasabyLib.load(fakeModuleName).then(
                  () => assert.fail('template module exists'),
                  (error) => assert.isOk(error, 'template module doesn\'t exist')
               );
            });
         });
      });

      describe('showDefaultDialog()', () => {
         const globalObject = typeof global !== 'undefined'
            ? global
            : typeof window !== 'undefined'
               ? window
               : {};
         const originalIsBrowser = constants.isBrowserPlatform;
         const originalAlert = globalObject.alert;

         beforeEach(() => {
            globalObject.alert = sinon.stub();
         });

         afterEach(() => {
            constants.isBrowserPlatform = originalIsBrowser;
            globalObject.alert = originalAlert;
         });

         it('does nothing on server side', function() {
            if (originalIsBrowser) {
               this.skip();
            }

            Popup.showDefaultDialog();
            assert.isNotOk(globalObject.alert.called);
         });

         it('calls alert with message', () => {
            constants.isBrowserPlatform = true;
            const message = 'message';
            Popup.showDefaultDialog(message);
            assert.isTrue(globalObject.alert.calledOnceWith(message));
         });

         it('calls alert with message and details', () => {
            constants.isBrowserPlatform = true;
            const message = 'message';
            const details = 'details';
            Popup.showDefaultDialog(message, details);
            assert.isTrue(globalObject.alert.calledOnceWith(`${message}\n${details}`));
         });
      });

      describe('closeDialog()', () => {
         it('does nothing if popupId is empty', () => {
            Popup.POPUP_MODULES = [fakeModuleNames[0]];
            const p = new Popup();
            return p.closeDialog(undefined).then(() => {
               const popup = require(fakeModuleNames[0]);
               assert.isNotOk(popup.Dialog.closePopup.called, 'closePopup() should not be called');
            });
         });

         it('does nothing if popup modules was not loaded', () => {
            Popup.POPUP_MODULES = [fakeModuleNames[0]];
            const p = new Popup([], ['FakeFailModule1']);
            return p.closeDialog('testPopupId').then(() => {
               const popup = require(fakeModuleNames[0]);
               assert.isNotOk(popup.Dialog.closePopup.called, 'closePopup() should not be called');
            });
         });

         it('calls closePopup()', () => {
            Popup.POPUP_MODULES = [fakeModuleNames[0]];
            const popupId = String(Date.now());
            const p = new Popup();
            return p.closeDialog(popupId).then(() => {
               const popup = require(fakeModuleNames[0]);
               assert.isTrue(popup.Dialog.closePopup.calledOnceWith(popupId), 'closePopup() called');
            });
         });
      });
   });
});
