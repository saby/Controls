define('Controls-demo/Popup/Opener/StackDemo/StackDemo',
   [
      'UI/Base',
      'wml!Controls-demo/Popup/Opener/StackDemo/StackDemo',
   ],
   function(Base, template) {
      'use strict';

      var PopupPage = Base.Control.extend({
         _template: template,
      });
      return PopupPage;
   });
