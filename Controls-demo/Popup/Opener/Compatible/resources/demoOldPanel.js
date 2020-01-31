define('Controls-demo/Popup/Opener/Compatible/resources/demoOldPanel',
   [
      'Lib/Control/CompoundControl/CompoundControl',
      'tmpl!Controls-demo/Popup/Opener/Compatible/resources/demoOldPanel'
   ],
   function (CompoundControl, template) {
      'use strict';

      var Panel = CompoundControl.extend({
         _dotTplFn: template,

         init: function() {
            Panel.superclass.init.call(this);
            var self = this;
            $('.testButton1', this.getContainer()).on('click', function() {
               self.openPanelCustomHeaderCaption();
            });
            $('.testButton2', this.getContainer()).on('click', function() {
               self.openPanelCustomHeader();
            });
            this.getTopParent().subscribeTo(self, 'onInit', function() {
               $('.textBox1', self.getContainer()).text('Сработал "onInit"');
            });
         },

         openPanelCustomHeaderCaption: function() {
            var self = this;
            requirejs(['Lib/Control/LayerCompatible/LayerCompatible'],
               function (CompatiblePopup) {
                  CompatiblePopup.load().addCallback(function () {
                     requirejs(['SBIS3.CONTROLS/Action/List/OpenEditDialog'], function (OpenDialog) {
                        var dialog = new OpenDialog({
                           mode: 'floatArea',
                           template: "Controls-demo/Popup/Opener/Compatible/resources/oldChildPnlTitle"
                        });
                        var dialogOptions = {
                           width: 300,
                           opener: self._button2,
                           title: 'ChildPanel'
                        };
                        dialog.execute({
                           dialogOptions: dialogOptions,
                           componentOptions: {
                           }
                        });
                     });
                  });
               }
            );
         },
         openPanelCustomHeader: function() {
            var self = this;
            requirejs(['Lib/Control/LayerCompatible/LayerCompatible'],
               function (CompatiblePopup) {
                  CompatiblePopup.load().addCallback(function () {
                     requirejs(['SBIS3.CONTROLS/Action/List/OpenEditDialog'], function (OpenDialog) {
                        var dialog = new OpenDialog({
                           mode: 'floatArea',
                           template: "Controls-demo/Popup/Opener/Compatible/resources/oldChildPnlCaption"
                        });
                        var dialogOptions = {
                           width: 300,
                           opener: self._button3
                        };
                        dialog.execute({
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

      return Panel;
   }
);
