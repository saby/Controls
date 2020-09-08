define(
   [
      'Controls/_popupTemplate/Sticky/StickyStrategy',
   ],
   (StickyStrategy) => {
      'use strict';

      describe('visualViewPort', () => {
         //ipad
         let windowSizes = StickyStrategy._private.getWindowSizes;
         StickyStrategy._private.getWindowSizes = () => ({
            width: 1024,
            height: 1040
         });
         it('checkOverflow', () => {
            let getVisualViewPort = StickyStrategy._private.getVisualViewport;
            StickyStrategy._private.getVisualViewport = () => ({
               width: 1000,
               offsetLeft: 0,
               pageLeft: 80
            });
            let targetCoords = {
               left: 989,
               leftScroll: 0
            };
            let popupCfg = {
               sizes: {
                  width: 120
               }
            };
            let position = {
               left: 989
            };
            //окно открывается вправо, но не умещается из-за своих размеров
            let overflow = StickyStrategy._private.checkOverflow(popupCfg, targetCoords, position, 'horizontal');
            assert.strictEqual(overflow, 85);

            //страница зазумлена, но это влиять на ширину не должно
            StickyStrategy._private.getVisualViewport = () => ({
               width: 1000,
               offsetLeft: 200,
               pageLeft: 200
            });

            overflow = StickyStrategy._private.checkOverflow(popupCfg, targetCoords, position, 'horizontal');
            assert.strictEqual(overflow, 85);

            StickyStrategy._private.getVisualViewport = getVisualViewPort;
         });

         StickyStrategy._private.getWindowSizes = windowSizes;
      });
   }
);
