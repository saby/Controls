define('Controls-demo/Popup/Edit/OpenerPreviewer',
   [
      'UI/Base',
      'wml!Controls-demo/Popup/Edit/OpenerPreviewer'
   ],
   function(Base, template) {
      'use strict';

      var OpenerPreviewer = Base.Control.extend({
         _template: template
      });

      return OpenerPreviewer;
   });
