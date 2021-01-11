/**
 * Created by as.krasilnikov on 21.01.2019.
 */
define('Controls-demo/Popup/PopupAnimation/PopupAnimation_stack',
   [
      'UI/Base',
      'wml!Controls-demo/Popup/PopupAnimation/PopupAnimation_stack'
   ],
   function(Base, template) {
      return Base.Control.extend({
         _template: template,
         _showTaskImg: false,
         _beforeMount: function(opt) {
            if (opt.fullCreateDelay === 0) {
               this._showTaskImg = true;
            }
         },
         _afterMount: function(opt) {
            if (!this._showTaskImg) {
               this._children.loadingIndicator.show();
               setTimeout(function() {
                  this._showTaskImg = true;
                  this._children.loadingIndicator.hide();
                  this._forceUpdate();
               }.bind(this), opt.fullCreateDelay);
            }
         },
         close: function() {
            this._notify('close', [], { bubbling: true });
         }
      });
   });
