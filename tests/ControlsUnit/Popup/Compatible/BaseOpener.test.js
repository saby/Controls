/**
 * Created by mi.marachev on 07.08.2018.
 */
define(
   [
      'Controls/compatiblePopup',
      'Core/CompoundContainer',
      'Core/core-instance',
      'Core/Deferred',
      'Core/Context'
   ],

   function(compatiblePopup, DropdownExample, cInstance, Deferred, Context) {
      'use strict';

      var config = {
         maximize: true,
         _type: 'dialog',
         templateOptions: {},
         componentOptions: {},
         template: 'tmpl!/test/test/test',
         hoverTarget: 'testHoverTarget',
         record: 'testRecord',
         parent: 'testParent',
         opener: 'testOpener',
         newRecord: 'newTestRecord',
         handlers: {},
         linkedContext: 'testLinkedContext',
         closeButtonStyle: 'testStyle',
         border: false,
         autoShow: false,
         autoCloseOnHide: false,
         offset: {
            x: '25',
            y: 25
         },
         target: ['testTarget'],
         className: 'testClass',
         verticalAlign: 'middle',
         side: 'left',
         _initCompoundArea: function() {
            return 'test';
         },
         context: new Context(),
         eventHandlers: {
            onResult: 'onResult',
            onClose: 'onclose'
         },
         enabled: true,
         draggable: true,
         closeChildWindows: true,
         closeButtonViewMode: 'toolButton',
         closeButtonTransparent: false,
         closeOnTargetScroll: true,
         width: 'auto'
      };

      describe('Controls/compatiblePopup:BaseOpener', function() {
         it('_prepareContext', function() {
            let newConfig = {
               templateOptions: {
                  handlers: {
                     onDestroy: []
                  }
               },
               context: {}
            };
            compatiblePopup.BaseOpener._prepareContext(newConfig);
            assert.isTrue(newConfig.templateOptions.handlers.onDestroy[0] instanceof Function);
            assert.isFalse(cInstance.instanceOfModule(newConfig.context, 'Core/Abstract'));
            assert.isTrue(cInstance.instanceOfModule(newConfig.templateOptions.context, 'Core/Abstract'));
            newConfig = {
               templateOptions: {
                  handlers: {
                     onDestroy: {}
                  }
               },
               context: {}
            };
            compatiblePopup.BaseOpener._prepareContext(newConfig);
            assert.isTrue(newConfig.templateOptions.handlers.onDestroy[1] instanceof Function);
            assert.isFalse(cInstance.instanceOfModule(newConfig.context, 'Core/Abstract'));
            assert.isTrue(cInstance.instanceOfModule(newConfig.templateOptions.context, 'Core/Abstract'));
            newConfig = {
               templateOptions: {},
               context: {}
            };
            compatiblePopup.BaseOpener._prepareContext(newConfig);
            assert.isTrue(newConfig.templateOptions.handlers.onDestroy instanceof Function);
            newConfig = {
               templateOptions: {}
            };
            let parentContext = new Context();
            compatiblePopup.BaseOpener._prepareContext(newConfig, parentContext);
            assert.isTrue(cInstance.instanceOfModule(newConfig.templateOptions.context, 'Core/Abstract'));
            assert.equal(newConfig.templateOptions.context.getPrevious(), parentContext);
         });

         it('_preparePopupCfgFromOldToNew', function() {
            config.autoHide = true;
            config.onResultHandler = function() {};
            config.onCloseHandler = function() {};
            compatiblePopup.BaseOpener._preparePopupCfgFromOldToNew(config);
            assert.equal(config.eventHandlers.onResult, config.onResultHandler);
            assert.equal(config.eventHandlers.onClose, config.onCloseHandler);

            assert.equal(config.templateOptions.target, config.target);
            assert.equal(config.isDefaultOpener, true);
            assert.equal(config.className, 'testClass');
            assert.equal(config.templateOptions.draggable, config.draggable);
            assert.isTrue(config.modal);
            assert.isFalse(config.closeOnOutsideClick);
            assert.isTrue(cInstance.instanceOfModule(config.context, 'Core/Abstract'));
            config.side = null;
            config.modal = true;
            config.horizontalAlign = {
               offset: undefined
            };
            config.offset = 0;
            config.closeOnOutsideClick = false;
            delete config.draggable;
            config._popupComponent = 'dialog';
            compatiblePopup.BaseOpener._preparePopupCfgFromOldToNew(config);
            assert.equal(config.templateOptions.draggable, true);
            assert.isFalse(config.closeOnOutsideClick);
            assert.isFalse(!!config.horizontalAlign.side);
            assert.isFalse(!!config.horizontalAlign.offset);
            assert.isTrue(config.modal);
            config.direction = 'right';
            config.horizontalAlign = 'left';
            compatiblePopup.BaseOpener._preparePopupCfgFromOldToNew(config);
            assert.equal('right', config.direction.horizontal);
            config.direction = 'top';
            config.verticalAlign = 'test';
            compatiblePopup.BaseOpener._preparePopupCfgFromOldToNew(config);
            assert.equal('top', config.direction.vertical);
            delete config.direction;
            config.side = 'right';
            compatiblePopup.BaseOpener._preparePopupCfgFromOldToNew(config);
            assert.equal(config.direction.horizontal, 'left');
            config.direction = 'top';
            config.horizontalAlign = 'left';
            config.verticalAlign = 'top';
            compatiblePopup.BaseOpener._preparePopupCfgFromOldToNew(config);
            assert.equal(config.direction.horizontal, 'left');
            config.catchFocus = false;
            compatiblePopup.BaseOpener._preparePopupCfgFromOldToNew(config);
            assert.equal(config.autofocus, false);
            config.catchFocus = true;
            compatiblePopup.BaseOpener._preparePopupCfgFromOldToNew(config);
            assert.equal(config.autofocus, true);

            config.template = 'Examples/DropdownList/MyDropdownList/MyDropdownList';
            assert.equal(config.isCompoundTemplate, true);
            config.template = 'Core/Control';
            compatiblePopup.BaseOpener._preparePopupCfgFromOldToNew(config);
            assert.equal(config.isCompoundTemplate, false);
         });

         it('prepareNotificationConfig', function() {
            let template = () => {};
            let config = {
               template,
               opener: 'opener',
               className: 'myClass',
               templateOptions: {
                  myOpt: true
               }
            };
            compatiblePopup.BaseOpener.prepareNotificationConfig(config);
            assert.equal(config.template, 'Controls/compatiblePopup:OldNotification');
            assert.equal(config.componentOptions.template, template);
            assert.equal(config.componentOptions.templateOptions, config.templateOptions);
            assert.equal(config.componentOptions.className, 'myClass');
            assert.equal(config.isVDOM, true);
            assert.equal(config.className, 'controls-OldNotification');
            assert.equal(config.opener, null);
         });

         it('_prepareConfigFromOldToOldByNewEnvironment', () => {
            let cfg = {
               flipWindow: 'vertical'
            };
            compatiblePopup.BaseOpener._prepareConfigFromOldToOldByNewEnvironment(cfg);
            assert.equal(cfg.fittingMode, 'overflow');
      })
         it('_setSizes', function() {
            compatiblePopup.BaseOpener._setSizes(config, DropdownExample);
            assert.isTrue(config.autoWidth);
            assert.isTrue(config.autoHeight);
            let newConfig = {};
            newConfig.minWidth = 50;
            newConfig.maxWidth = 50;
            newConfig.minHeight = 50;
            newConfig.maxHeight = 50;
            assert.isFalse(!!newConfig.autoWidth);
            assert.isFalse(!!newConfig.autoHeight);
            var newClass = {};
            newConfig = {};
            newClass.dimensions = {
               minWidth: 30,
               maxWidth: '30',
               minHeight: 30,
               maxHeight: '30',
               width: 100
            };
            compatiblePopup.BaseOpener._setSizes(newConfig, newClass);
            assert.isFalse(!!newConfig.autoWidth);
            assert.isFalse(!!newConfig.autoHeight);
            assert.equal(newConfig.minWidth, newClass.dimensions.minWidth);
            assert.equal(newConfig.maxWidth, 30);
            assert.equal(newConfig.minHeight, newClass.dimensions.minHeight);
            assert.equal(newConfig.maxHeight, 30);
            assert.equal(newConfig.width, newClass.dimensions.width);

            newClass = {};
            newConfig = {};
            newClass.dimensions = {
               width: 350
            };
            compatiblePopup.BaseOpener._setSizes(newConfig, newClass);
            assert.equal(newConfig.minWidth, null);
         });

         it('_prepareConfigForOldTemplate', function() {
            config.fixed = true;
            compatiblePopup.BaseOpener._prepareConfigForOldTemplate(config, DropdownExample);
            assert.equal(config.templateOptions.trackTarget, true);
            assert.equal(config.templateOptions.closeButtonViewMode, 'testStyle');
            assert.equal(config.templateOptions.closeButtonTransparent, false);
            assert.equal(config.templateOptions.closeOnTargetHide, false);
            assert.equal(config.templateOptions.closeOnTargetHide, false);
            assert.equal(config.templateOptions.fixed, true);
            assert.equal(config.templateOptions.hoverTarget, config.hoverTarget);
            assert.equal(config.templateOptions.width, undefined);
            assert.equal(config.templateOptions.record, config.record);
            assert.equal(config.templateOptions.__parentFromCfg, config.parent);
            assert.equal(config.templateOptions.__openerFromCfg, config.opener);
            assert.equal(config.templateOptions.newRecord, config.newRecord);
            assert.equal(config.templateOptions.linkedContext, config.linkedContext);
            assert.equal(config.className, 'testClass ws-window ws-hidden');
            assert.isTrue(config.templateOptions.hideCross);
            assert.isTrue(config.templateOptions.maximize);
            assert.isFalse(config.templateOptions.autoShow);
            assert.isFalse(config.templateOptions._isVisible);
            assert.isTrue(config.templateOptions.enabled);
            assert.equal(config.template, 'Controls/compatiblePopup:CompoundArea');
            assert.isFalse(!!config.templateOptions.caption);
            let newConfig = config;
            newConfig.minWidth = '100';
            newConfig.maximized = false;
            newConfig.canMaximize = true;
            newConfig.maxWidth = 150;
            newConfig.minHeight = '150';
            newConfig.maxHeight = '300';
            newConfig.height = '320';
            newConfig.trackTarget = false;
            newConfig.closeOnTargetScroll = true;
            newConfig.closeOnTargetHide = true;
            newConfig.trackTarget = false;
            newConfig.disableActions = true;
            compatiblePopup.BaseOpener._prepareConfigForOldTemplate(newConfig, DropdownExample);
            assert.equal(config.templateOptions.trackTarget, false);
            assert.equal(config.templateOptions.closeOnTargetHide, true);
            assert.equal(config.templateOptions.closeOnTargetHide, true);
            assert.equal(newConfig.minimizedWidth, 100);
            assert.equal(newConfig.minWidth, 200);
            assert.equal(newConfig.maxWidth, newConfig.templateOptions.maxWidth);
            assert.equal(newConfig.minHeight, newConfig.templateOptions.minHeight);
            assert.equal(newConfig.maxHeight, newConfig.templateOptions.maxHeight);
            assert.equal(newConfig.width, newConfig.templateOptions.width);
            assert.equal(newConfig.height, newConfig.templateOptions.height);
            assert.isTrue(newConfig.templateOptions.canMaximize);
            assert.isTrue(config.templateOptions.hideCross);
            assert.equal(newConfig.templateOptions.templateOptions.isPanelMaximized, newConfig.maximized);
            delete newConfig.context;
            delete newConfig.templateOptions.context;
            let parentContext = new Context();
            newConfig.parent = {
               getLinkedContext: function() {
                  return parentContext;
               }
            };
            compatiblePopup.BaseOpener._prepareConfigForOldTemplate(newConfig, DropdownExample);
            assert.isTrue(!!newConfig.templateOptions.context);
            assert.equal(newConfig.templateOptions.context.getPrevious(), parentContext);
            newConfig = {
               _type : 'stack',
               minWidth: 300
            };
            compatiblePopup.BaseOpener._prepareConfigForOldTemplate(newConfig, DropdownExample);
            assert.equal(newConfig.width, 300);
         });

         it('_getCaption', function() {
            config.title = 'testTitle';
            let title = compatiblePopup.BaseOpener._getCaption(config, DropdownExample);
            assert.equal(title, 'testTitle');
         });

         it('_prepareConfigForNewTemplate', function() {
            let newConfig = {
               width: 800,
               maxWidth: 1200,
               minWidth: 800,
               componentName: 'floatArea'
            };
            newConfig.templateOptions = config.templateOptions;
            newConfig.template = 'Controls/Popup/Compatible/CompoundAreaForOldTpl/CompoundArea';
            newConfig.onResultHandler = 'onResultHandler';
            newConfig.onCloseHandler = 'onCloseHandler';
            newConfig.onResultHandlerEvent = 'onResultHandlerEvent';
            newConfig.onCloseHandlerEvent = 'onCloseHandlerEvent';
            compatiblePopup.BaseOpener._prepareConfigForNewTemplate(newConfig, DropdownExample);
            assert.isFalse(newConfig.border);
            assert.equal(newConfig.componentOptions.catchFocus, true);
            assert.equal(newConfig.componentOptions.templateOptions, config.templateOptions);
            assert.equal(newConfig.componentOptions.template, 'Controls/Popup/Compatible/CompoundAreaForOldTpl/CompoundArea');
            assert.equal(newConfig.template, 'Controls/compatiblePopup:CompoundAreaNewTpl');
            assert.equal(newConfig.animation, 'off');
            assert.equal(newConfig.componentOptions.onResultHandler, newConfig.onResultHandler);
            assert.equal(newConfig.componentOptions.onCloseHandler, newConfig.onCloseHandler);
            assert.equal(newConfig.componentOptions.onResultHandlerEvent, newConfig.onResultHandlerEvent);
            assert.equal(newConfig.componentOptions.onCloseHandlerEvent, newConfig.onCloseHandlerEvent);
            assert.equal(newConfig.componentOptions.templateOptions.stackMinWidth, newConfig.minWidth);
            assert.equal(newConfig.componentOptions.templateOptions.stackMaxWidth, 1200);
            assert.equal(newConfig.componentOptions.templateOptions.stackWidth, newConfig.width);
            assert.equal(newConfig.maxWidth, 800);
         });

         it('_prepareConfigFromNewToOld', function() {
            // prevent test from falling cause of jQuery
            compatiblePopup.BaseOpener._prepareTarget = function(cfg) {
               return cfg.target;
            };
            config.offset = {
               x: 25,
               y: 25
            };

            delete config.autoCloseOnHide;

            config.minWidth = 100;
            config.width = 100;
            config.maxWidth = 1000;
            config.maximized = true;
            config.title = 'заголовок';
            config.maximize = true;

            config.target = 'testTarget';
            config.className = 'testClass';
            config.closeOnOutsideClick = false;
            config.fittingMode = 'fixed';
            config.autofocus = false;
            let newConfig = compatiblePopup.BaseOpener._prepareConfigFromNewToOld(config);
            assert.isFalse(newConfig.dialogOptions.flipWindow);
            assert.equal(newConfig.dialogOptions.width, 1000);
            assert.equal(newConfig.templateOptions, config.templateOptions);
            assert.equal(newConfig.dialogOptions._isCompatibleArea, true);
            assert.equal(newConfig.componentOptions, config.templateOptions);
            assert.equal(newConfig.template, config.template);
            assert.equal(newConfig._initCompoundArea, config._initCompoundArea);
            assert.isFalse(newConfig.dialogOptions.isStack);
            assert.equal(newConfig.target, config.target);
            assert.isTrue(newConfig.dialogOptions.modal);
            assert.equal(newConfig.dialogOptions.handlers, config.handlers);
            assert.equal(newConfig.dialogOptions.catchFocus, config.autofocus);
            assert.equal(newConfig.dialogOptions.autoHide, config.closeOnOutsideClick);
            assert.equal(newConfig.dialogOptions.closeOnOverlayClick, config.closeOnOutsideClick);
            assert.equal(newConfig.dialogOptions.className, config.className);
            assert.equal(newConfig.dialogOptions.title, config.title);
            assert.isTrue(newConfig.dialogOptions.border);
            assert.equal(newConfig.mode, 'floatArea');
            assert.isTrue(newConfig.dialogOptions.fitWindow);
            assert.equal(newConfig.dialogOptions.onResultHandler, config.eventHandlers.onResult);
            assert.equal(newConfig.dialogOptions.onCloseHandler, config.eventHandlers.onClose);
            assert.isTrue(newConfig.dialogOptions.closeChildWindows);
            assert.equal(newConfig.dialogOptions.closeOnTargetScroll, config.closeOnTargetScroll);
            assert.equal(newConfig.dialogOptions.offset, config.offset);

            assert.equal(newConfig.dialogOptions.showOnControlsReady, false);
            assert.equal(newConfig.dialogOptions.maximize, true);
            assert.equal(newConfig.dialogOptions.autoCloseOnHide, true);
            assert.equal(newConfig.dialogOptions.minWidth, config.minWidth);
            assert.equal(newConfig.dialogOptions.maxWidth, config.maxWidth);
            assert.equal(newConfig.dialogOptions.maximized, true);
            assert.equal(newConfig.componentOptions.maximized, true);
            let testconfig = {
               direction: {
                  horizontal: 'left',
                  vertical: 'top'
               },
               offset: {
                  horizontal: 10,
                  vertical: 15
               },
               targetPoint: {
                  vertical: 'bottom'
               },
               mode: 'floatArea'
            };
            let vdomTemplate = { stable: true }; // state of vdom template
            let newTestConfig = compatiblePopup.BaseOpener._prepareConfigFromNewToOld(testconfig, vdomTemplate);
            assert.equal(newTestConfig.dialogOptions.direction, testconfig.horizontalAlign.side);
            assert.isFalse(newTestConfig.dialogOptions.border);
            assert.equal(newTestConfig.dialogOptions.verticalAlign, 'bottom');
            assert.equal(newTestConfig.dialogOptions.offset.x, 10);
            assert.equal(newTestConfig.dialogOptions.offset.y, 15);
            assert.equal(newTestConfig.dialogOptions.side, testconfig.corner.horizontal);
            testconfig.horizontalAlign = null;
            newTestConfig = compatiblePopup.BaseOpener._prepareConfigFromNewToOld(testconfig);
            assert.equal(newTestConfig.dialogOptions.direction, 'right');
            testconfig._type = 'stack';
            newTestConfig = compatiblePopup.BaseOpener._prepareConfigFromNewToOld(testconfig);
            assert.equal(newTestConfig.dialogOptions.direction, 'left');
            testconfig.horizontalAlign = {
               side: 'center'
            };
            newTestConfig = compatiblePopup.BaseOpener._prepareConfigFromNewToOld(testconfig);
            assert.equal(newTestConfig.dialogOptions.direction, '');
            testconfig.actionOnScroll = 'close';
            newTestConfig = compatiblePopup.BaseOpener._prepareConfigFromNewToOld(testconfig);
            assert.equal(newTestConfig.dialogOptions.closeOnTargetScroll, true);
         });

         it('_getDimensions', function() {
            var newClass = {};
            newClass.dimensions = {
               minWidth: 50,
               maxWidth: 50,
               minHeight: 50,
               maxHeight: 50
            };
            var dimensions = compatiblePopup.BaseOpener._getDimensions(newClass);
            assert.equal(newClass.dimensions, dimensions);
         });
         it('_getConfigFromTmpl', function() {
            var config = {
               getDefaultOptions: function() {
                  return {
                     minWidth: 300,
                     maxWidth: 900,
                     minimizedWidth: 400
                  };
               }
            };
            var newcfg = compatiblePopup.BaseOpener._getConfigFromTemplate(config);
            assert.equal(newcfg.minWidth, 300);
            assert.equal(newcfg.maxWidth, 900);
            assert.equal(newcfg.minimizedWidth, 400);
         });
      });
   }
);
