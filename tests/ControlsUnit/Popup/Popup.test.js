define(
   [
      'Controls/_popup/Manager/Popup',
   ],

   function(PopupClass) {
      'use strict';

      describe('Controls/_popup/Manager/Popup', () => {
         it('isResized', () => {
            const Popup = new PopupClass.default();
            let oldOptions = { position: {} };
            let newOptions = { position: {} };
            assert.equal(false, Popup._isResized(oldOptions, newOptions));

            newOptions.position.width = 10;
            assert.equal(true, Popup._isResized(oldOptions, newOptions));

            oldOptions.position.width = 10;
            assert.equal(false, Popup._isResized(oldOptions, newOptions));

            oldOptions = { position: { height: 10 } };
            newOptions = { position: {} };
            assert.equal(true, Popup._isResized(oldOptions, newOptions));

            newOptions.position.height = 10;
            assert.equal(false, Popup._isResized(oldOptions, newOptions));

            oldOptions = { position: { hidden: true } };
            newOptions = { position: { hidden: false } };

            assert.equal(true, Popup._isResized(oldOptions, newOptions));
         });
         it('_showIndicatorHandler', () => {
            const Popup = new PopupClass.default();
            let config = '';
            let promise = '';
            let stopPropagation = () => {
            };
            Popup._notify = (eventName, eventArgs, eventOptions) => {
               config = eventArgs[0];
               promise = eventArgs[1];
            };
            Popup._showIndicatorHandler({ event: 'event', stopPropagation }, 'config', 'promise');
            assert.equal(config, 'config');
            assert.equal(promise, 'promise');
            Popup.destroy();
         });
      });
   }
);
