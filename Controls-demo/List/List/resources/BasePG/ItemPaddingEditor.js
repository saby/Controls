define('Controls-demo/List/List/resources/BasePG/ItemPaddingEditor', [
   'UI/Base',
   'wml!Controls-demo/List/List/resources/BasePG/ItemPaddingEditor',
   'Types/source'
], function(
   Base,
   template,
   TSource
) {
   'use strict';

   var
      EditableConfigEditor = Base.Control.extend({
         _template: template,
         _source: null,
         _left: null,
         _right: null,
         _top: null,
         _bottom: null,

         _beforeMount: function(cfg) {

            this._topBottomSource = new TSource.Memory({
               data: [
                  { id: 'null', title: 'null'},
                  { id: 's', title: 's'}
               ],
               keyProperty: 'id'
            });

            this._leftRightSource = new TSource.Memory({
               data: [
                  { id: 'null', title: 'null' },
                  { id: 'xs', title: 'xs' },
                  { id: 's', title: 's' },
                  { id: 'm', title: 'm' },
                  { id: 'l', title: 'l' },
                  { id: 'xl', title: 'xl' },
                  { id: 'xxl', title: 'xxl' }
               ],
               keyProperty: 'id'
            });

            this._left = cfg.value.left;
            this._right = cfg.value.right;
            this._top = cfg.value.top;
            this._bottom = cfg.value.bottom;
         },
         _onValueChanged: function() {
            this._notify('valueChanged', [{
               left: this._left,
               right: this._right,
               top: this._top,
               bottom: this._bottom
            }]);
         }
      });
   return EditableConfigEditor;
});
