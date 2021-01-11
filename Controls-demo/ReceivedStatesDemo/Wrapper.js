define('Controls-demo/ReceivedStatesDemo/Wrapper',
   [
      'UI/Base',
      'wml!Controls-demo/ReceivedStatesDemo/Wrapper'
   ],
   function(Base, template) {
      'use strict';

      return Base.Control.extend({
         _template: template,
         _beforeMount: function(cfg, _, receivedState) {
            var res = '123';
            if(receivedState === '123') {
               this.gotRS = true;
            } else {
               return new Promise(function(resolve) {
                  resolve(res);
               });
            }
         }
      });
   });
