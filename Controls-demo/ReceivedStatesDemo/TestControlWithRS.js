define('Controls-demo/ReceivedStatesDemo/TestControlWithRS',
   [
      'UI/Base',
      'wml!Controls-demo/ReceivedStatesDemo/TestControlWithRS'
   ],
   function(Base, template) {
      'use strict';

      return Base.Control.extend({
         _template: template,
         _beforeMount: function(cfg, _, receivedState) {
            var res = '654';
            if(receivedState === '654') {
               this.gotRSInner = 'true';
               this.gotRSOuter = '' + cfg.wrapperRS;
            } else {
               return new Promise(function(resolve) {
                  resolve(res);
               });
            }
         }
      });
   });
