define('Controls-demo/Popup/TestInfoBox',
   [
      'Core/Control',
      'wml!Controls-demo/Popup/TestInfoBox'
   ],
   function (Control, template) {
      'use strict';

       var TestInfoBox = Control.extend({
         _template: template,
      });
       TestInfoBox.getDefaultOptions = function () {
           return {
               stickyPosition: {
                   direction: {
                       horizontal: 'left',
                       vertical: 'top'
                   },
                   targetPoint: {
                       horizontal: 'left',
                       vertical: 'top'
                   }
               }
           };
       };
       return TestInfoBox;
   }
);