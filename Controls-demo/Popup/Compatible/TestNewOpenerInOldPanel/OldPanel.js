define('Controls-demo/Popup/Compatible/TestNewOpenerInOldPanel/OldPanel', [
   'Lib/Control/CompoundControl/CompoundControl',
   'wml!Controls-demo/Popup/Compatible/TestNewOpenerInOldPanel/OldPanel',
   'Controls/popup',
   'UI/Base',
   'Vdom/Vdom',
   'wml!Controls-demo/Popup/Compatible/TestNewOpenerInOldPanel/NewTemplate'
], function(CompoundControl, dotTplFn, popup, Base, Vdom, newTemplateFn) {

   var OldPanel = CompoundControl.extend({
      _dotTplFn: dotTplFn,

      _vdomOpenerContainer: null,
      _vdomOpener: null,

      init: function() {
         var self = this;

         OldPanel.superclass.init.apply(this, arguments);

         this._vdomOpenerContainer = this._container.find('.containerForVdomOpener')[0];
         this._vdomOpener = Base.Control.createControl(
            popup.Stack,
            { element: this._vdomOpenerContainer },
            this._vdomOpenerContainer
         );

         this.getChildControlByName('openNewPanel').subscribe('onActivated', function() {
            self._vdomOpener.open({
               template: newTemplateFn,
               opener: self
            });
         });
      },
      destroy: function() {
         if (this._vdomOpener) {
            Vdom.Synchronizer.unMountControlFromDOM(this._vdomOpener, this._vdomOpenerContainer);
            this._vdomOpenerContainer = null;
            this._vdomOpener = null;
         }
         OldPanel.superclass.destroy.apply(this, arguments);
      }
   });

   return OldPanel;

});
