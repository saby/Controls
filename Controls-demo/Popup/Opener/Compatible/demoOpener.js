define('Controls-demo/Popup/Opener/Compatible/demoOpener',
   [
      'Core/Control',
      'tmpl!Controls-demo/Popup/Opener/Compatible/demoOpener',
      'require',
      'Types/source',
   ],
   function (Control, template, require, source) {
      'use strict';

      var TestOpener = Control.extend({
         _template: template,
         _styles: ['Controls-demo/Popup/Opener/Compatible/demoOpener'],
         _border: true,
         _maximize: false,
         _maximized: false,
         _modal: false,
         _showTitle: true,
         _canMaximize: false,
         _enabled: true,
         _toggleMaxWidth: false,
         _catchFocus: true,
         _widthItems: null,
         _heightItems: null,
         _minWidth: null,
         _sideItems: null,
         _maxWidth: null,
         _minHeight: null,
         _maxHeight: null,
         _width: null,
         _horizontal: null,
         _vertical: null,
         _direction: null,
         _offsetX: null,
         _offsetY: null,
         _verticalAlign: null,
         _handlerText: '',
         _autoHide: false,
         _handlers: null,
         _draggable: false,

         _beforeMount: function() {
            this._verticalItems = [
               {title: 'top'},
               {title: 'bottom'}
            ];
            this._sideItems = [
               {title: 'left'},
               {title: 'right'}
            ];
            this._directionItems = [
               {title: 'left'},
               {title: 'top'},
               {title: 'bottom'},
               {title: 'right'}
            ];
            this._widthItems = [
               {title: '500'},
               {title: '550'},
               {title: '600'},
               {title: '650'},
               {title: '700'},
               {title: '750'}
            ];
            this._heightItems = [
               {title: '150'},
               {title: '200'},
               {title: '250'},
               {title: '300'},
               {title: '350'},
               {title: '400'}
            ];
            this._offsetItems = [
               {title: '-150'},
               {title: '-100'},
               {title: '-50'},
               {title: '50'},
               {title: '100'},
               {title: '150'}
            ];
         },

         _createMemory: function(items) {
            return new source.Memory({
               keyProperty: 'title',
               data: items
            });
         },

         openStack: function() {
            this._children.stackPanel.open({
               opener: this._children.stackButton,
               isCompoundTemplate: true,
               closeOnOutsideClick: true
            });
         },

         clearHandlers: function() {
            this._handlerText = '';
         },

         setHandlers: function(self) {
            return  {
               onInit: function() {
                  self._handlerText += ' сработал onInit';
                  self._forceUpdate();
               },
               onBeforeControlsLoad: function() {
                  self._handlerText += ' сработал onBeforeControlsLoad';
                  self._forceUpdate();
               },
               onBeforeShow: function() {
                  self._handlerText += ' сработал onBeforeShow';
                  self._forceUpdate();
               },
               onShow: function () {
                  self._handlerText += ' сработал onShow';
                  self._forceUpdate();
               },
               onAfterLoad: function() {
                  self._handlerText += ' сработал onAfterLoad';
                  self._forceUpdate();
               },
               onInitComplete: function() {
                  self._handlerText += ' сработал onInitComplete';
                  self._forceUpdate();
               },
               onAfterShow: function() {
                  self._handlerText += ' сработал onAfterShow';
                  self._forceUpdate();
               },
               onReady: function() {
                  self._handlerText += ' сработал onReady';
                  self._forceUpdate();
               },
               onBeforeClose: function() {
                  self._handlerText += ' сработал onBeforeClose';
                  self._forceUpdate();
               },
               onClose: function() {
                  self._handlerText += ' сработал onClose';
                  self._forceUpdate();
               },
               onAfterClose: function() {
                  self._handlerText += ' сработал onAfterClose';
                  self._forceUpdate();
               }
            }
         },
         openFloat: function() {
            var self = this;

            requirejs(['Lib/Control/LayerCompatible/LayerCompatible'],
               function(CompatiblePopup) {
                  CompatiblePopup.load().addCallback(function () {
                     requirejs(['SBIS3.CONTROLS/Action/List/OpenEditDialog'], function(OpenDialog) {
                        self._action = new OpenDialog({
                           template: "Controls-demo/Popup/Opener/Compatible/resources/demoOldPanel",
                           mode: 'floatArea'
                        });
                        self._action.execute({
                           dialogOptions: {
                              handlers: self.setHandlers(self),
                              border: true,
                              verticalAlign: self._verticalAlign,
                              title: self._showTitle ? 'ParentTitle' : '',
                              catchFocus: self._catchFocus,
                              enabled: self._enabled,
                              modal: self._modal,
                              autoHide: self._autoHide,
                              width: !self._minWidth && !self._maxWidth ? self._width : null,
                              maximized: self._maximized,
                              minWidth: self._minWidth,
                              canMaximize: self._canMaximize,
                              maxWidth: self._maxWidth,
                              showOnControlsReady: true
                           },
                           componentOptions: {

                           }
                        })
                     });
                  });
               }
            );
         },
         openDialog: function() {
            var self = this;
            requirejs(['Lib/Control/LayerCompatible/LayerCompatible'],
               function(CompatiblePopup) {
                  CompatiblePopup.load().addCallback(function() {
                     requirejs(['SBIS3.CONTROLS/Action/List/OpenEditDialog'], function(OpenDialog) {
                        self._action = new OpenDialog({
                           mode: 'dialog',
                           template: "Controls-demo/Popup/Opener/Compatible/resources/demoOldPanel",
                        });
                        self._action.execute({
                           dialogOptions: {
                              draggable: self._draggable,
                              handlers: self.setHandlers(self),
                              modal: self._modal,
                              minWidth: self._minWidth,
                              maxWidth: self._maxWidth,
                              minHeight: self._minHeight,
                              maxHeight: self._maxHeight,
                              catchFocus: self._catchFocus,
                              enabled: self._enabled,
                              title: self._showTitle ? 'ParentTitle' : '',
                              border: self._border,
                              maximize: self._maximize,
                              showOnControlsReady: true,
                              autoHide: self._autoHide
                           },
                           componentOptions: {

                           }
                        })
                     });
                  });
               }
            );
         },

         openSticky: function() {
            var self = this;

            requirejs(['Lib/Control/LayerCompatible/LayerCompatible'],
               function(CompatiblePopup) {
                  CompatiblePopup.load().addCallback(function() {
                     requirejs(['SBIS3.CONTROLS/Action/List/OpenEditDialog'], function(OpenDialog) {
                        self._action = new OpenDialog({
                           mode: 'floatArea',
                           template: "Controls-demo/Popup/Opener/Compatible/resources/demoOldPanel"
                        });
                        var dialogOptions = {
                           handlers: self.setHandlers(self),
                           border: self._border,
                           isStack: false,
                           catchFocus: self._catchFocus,
                           minWidth: self._minWidth,
                           maxWidth: self._maxWidth,
                           minHeight: self._minHeight,
                           maxHeight: self._maxHeight,
                           modal: self._modal,
                           autoHide: self._autoHide,
                           enabled: self._enabled,
                           title: self._showTitle ? 'ParentTitle' : '',
                           target: self._children.testTarget._container,
                           showOnControlsReady: true,
                           maximized: self._maximized,
                           canMaximize: self._canMaximize
                        };
                        if (self._vertical || self._horizontal) {
                           dialogOptions.corner = {
                              vertical: !self._vertical ? 'top' : self._vertical,
                              horizontal: !self._horizontal ? 'left' : self._horizontal
                           };
                        }
                        if (self._direction) {
                           dialogOptions.direction = self._direction
                        }
                        if (self._side) {
                           dialogOptions.side = self._side
                        }
                        if (self._offsetX || self._offsetY) {
                           dialogOptions.offset = {};
                           if (self._offsetX) {
                              dialogOptions.offset.x = self._offsetX
                           }
                           if (self._offsetY) {
                              dialogOptions.offset.y = self._offsetY
                           }
                        }
                        if (self._verticalAlign) {
                           dialogOptions.verticalAlign = self._verticalAlign
                        }
                        self._action.execute({

                           dialogOptions: dialogOptions,
                           componentOptions: {

                           }
                        });
                     });
                  });
               }
            );
         },

         openDimension: function() {
            var self = this;

            requirejs(['Lib/Control/LayerCompatible/LayerCompatible'],
               function(CompatiblePopup) {
                  CompatiblePopup.load().addCallback(function() {
                     requirejs(['SBIS3.CONTROLS/Action/List/OpenEditDialog'], function(OpenDialog) {
                        self._action = new OpenDialog({
                           mode: 'floatArea',
                           template: "Controls-demo/Popup/Opener/Compatible/resources/dimensionOldPanel"
                        });
                        var dialogOptions = {
                           handlers: self.setHandlers(self),
                           border: self._border,
                           isStack: true,
                           catchFocus: self._catchFocus,
                           modal: self._modal,
                           autoHide: self._autoHide,
                           title: self._showTitle ? 'ParentTitle' : '',
                           showOnControlsReady: true
                        };
                        self._action.execute({
                           dialogOptions: dialogOptions,
                           componentOptions: {
                           }
                        });
                     });
                  });
               }
            );
         }
      });

      return TestOpener;
   }
);
