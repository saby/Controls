define('Controls-demo/InfoBox/InfoBox',
   [
      'Core/Control',
      'wml!Controls-demo/InfoBox/InfoBox',

      'Controls/popup'
   ],
   function(Control, template) {

      'use strict';

      return Control.extend({
         _template: template,
         _styles: ['Controls-demo/InfoBox/resources/Infobox'],
         _dblClickHandler: function() {
            var child = this._children.demandInfobox;
            child.open();
            setTimeout(child.close.bind(child), 5000);
         }
      });
   }
);
