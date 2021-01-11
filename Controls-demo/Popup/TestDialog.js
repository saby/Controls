define('Controls-demo/Popup/TestDialog',
   [
      'UI/Base',
      'wml!Controls-demo/Popup/TestDialog'
   ],
   function (Base, template) {
      'use strict';

      var TestDialog = Base.Control.extend({
         _template: template,
         _draggable: false,
         _headText: '',

         _close: function(){
            this._notify('close', [], {bubbling: true});
         },

         _draggableChanged: function(event, value) {
            this._draggable = value;
            this._notify('sendResult', [value], {bubbling: true});
         },

         _onClick: function(){
            if( this._options.type === 'sticky' ){
               this._notify('sendResult', [123], {bubbling: true});
            }
            else{
               this._children.stack.open({
                  maxWidth: 600,
                  opener: this._options.fromNotification === true ? null : this
               });
            }
         }
      });

      TestDialog.dimensions = {
         minWidth: 600,
         maxWidth: 600,
         minHeight: 400,
         maxHeight: 400,
      };

      return TestDialog;
   }
);
