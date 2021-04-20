define('Controls-demo/Popup/Opener/StackDemo',
   [
      'UI/Base',
      'wml!Controls-demo/Popup/Opener/StackDemo',
   ],
   function(Base, template) {
      'use strict';

      var PopupPage = Base.Control.extend({
         _template: template,
      });
      return PopupPage;
   });