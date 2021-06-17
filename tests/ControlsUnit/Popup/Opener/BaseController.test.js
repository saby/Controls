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

         it('search maximized popup', () => {
            let BCInstacne = new BaseController();
            let hasMaximizePopup = BCInstacne._isAboveMaximizePopup({});
            assert.equal(hasMaximizePopup, false);

            BCInstacne._goUpByControlTree = () => {
               return [
                  {
                     _moduleName: 'Controls/_popup/Manager/Popup',
                     _options: {
                        maximize: true
                     }
                  }
               ];
            };

            hasMaximizePopup = BCInstacne._isAboveMaximizePopup({});
            assert.equal(hasMaximizePopup, true);
         });

         it('getFakeDivMargins', () => {
            let BCInstacne = new BaseController();
            BCInstacne._getFakeDiv = () => {
               return {
                  currentStyle: {
                     marginTop: '10.2px',
                     marginLeft: '11.4px'
                  }
               };
            };
            BCInstacne._getContainerStyles = (container) => {
               return container.currentStyle;
            };

            const item = {
               popupOptions: {}
            };

            const margins = BCInstacne._getFakeDivMargins(item);
            assert.equal(margins.left, 11.4);
            assert.equal(margins.top, 10.2);
         });

         it('getMargins', () => {
            let BCInstacne = new BaseController();
            let margins = {
               top: 1,
               left: 2,
            };
            BCInstacne._getFakeDivMargins = () => margins;
            let item = {
               popupOptions: {
                  maxWidth: 200,
                  width: 150,
                  maxHeight: 200
               }
            };
            assert.deepEqual({
               left: 0,
               top: 0
            }, BCInstacne._getMargins(item));

            item.popupOptions.className = '1';
            assert.deepEqual({
               left: 2,
               top: 1
            }, BCInstacne._getMargins(item));

            margins = {
               top: 3,
               left: 4,
            };
            assert.deepEqual({
               left: 2,
               top: 1
            }, BCInstacne._getMargins(item));

            item.popupOptions.className = '2';
            assert.deepEqual({
               left: 4,
               top: 3
            }, BCInstacne._getMargins(item));
         });
      });
   }
);
