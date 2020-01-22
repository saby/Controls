define('Controls-demo/Popup/Opener/Compatible/resources/demoOldPanel',
   [
      'Lib/Control/CompoundControl/CompoundControl',
      'tmpl!Controls-demo/Popup/Opener/Compatible/resources/demoOldPanel',
      'tmpl!Controls-demo/Popup/Opener/Compatible/resources/oldChildPnlTitle',
      'tmpl!Controls-demo/Popup/Opener/Compatible/resources/oldChildPnlCaption',
      'SBIS3.CONTROLS/Button',
      'SBIS3.CONTROLS/TextBox'
   ],
   function (CompoundControl, template) {
      'use strict';

      var Panel = CompoundControl.extend({
         _dotTplFn: template,

         $constructor: function () {

         },

         init: function() {
            var self = this;
            Panel.superclass.init.call(this);
            self._button1 = self.getChildControlByName('testButton1');
            self._button2 = self.getChildControlByName('testButton2');
            self._button3 = self.getChildControlByName('testButton3');
            self._textbox1 = self.getChildControlByName('textBox1');
            self._textbox2 = self.getChildControlByName('textBox2');
            self._subscribe();
         },
         _subscribe: function() {
            var self = this;
            self.subscribeTo(self._button1, 'onActivated', function () {
               self._textbox1.setText('Нажали на Тестовую кнопку 1');
            });
            self.subscribeTo(self._button2, 'onActivated', function () {
               self.openPanelCustomHeaderCaption();
            });
            self.subscribeTo(self._button3, 'onActivated', function () {
               self.openPanelCustomHeader();
            });
            this.getTopParent().subscribeTo(self, 'onInit', function() {
               self._textbox2.setText('Сработало "onInit"');
            });
         },

         openPanelCustomHeaderCaption: function() {
            var self = this;
            requirejs(['Lib/Control/LayerCompatible/LayerCompatible'],
               function (CompatiblePopup) {
                  CompatiblePopup.load(null, false, false).addCallback(function () {
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
                  CompatiblePopup.load(null, false, false).addCallback(function () {
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
