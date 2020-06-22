define(
   [
      'Controls/_popupTemplate/BaseController'
   ],
   (BaseController) => {
      'use strict';
      describe('Controls/_popupTemplate/BaseController', () => {
         BaseController = BaseController.default;
         it('Controller popup sizes', () => {
            let BCInstacne = new BaseController();
            let config = {
               popupOptions: {
                  maxWidth: 200,
                  width: 150,
                  maxHeight: 200
               }
            };

            let container = {
               getBoundingClientRect: () => {
                  return {
                     width: 100,
                     height: 100
                  };
               }
            };

            BCInstacne._getPopupSizes(config, container);
            assert.equal(config.sizes.width, 150);
            assert.equal(config.sizes.height, 100);

            config.popupOptions.className = '1';
            BCInstacne._getPopupSizes(config, container);

            config.popupOptions = {};

            BCInstacne._getPopupSizes(config, container);

            assert.equal(config.sizes.width, 100);
            assert.equal(config.sizes.height, 100);
         });
      });
   }
);
