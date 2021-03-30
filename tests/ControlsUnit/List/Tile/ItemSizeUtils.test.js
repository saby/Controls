define(['Controls/_tileNew/utils/imageUtil'], function(ItemSizeUtils) {
   'use strict';

   function mockHTMLElement(width, height) {
      return {
         classList: {
            _classList: [],
            add: function(className) {
               this._classList.push(className);
            },
            remove: function(className) {
               this._classList.splice(this._classList.indexOf(className), 1);
            }
         },
         style: {},
         getBoundingClientRect: function() {
            return {
               width: width,
               height: height
            };
         }
      };
   }

   var
      items = {
         '.controls-TileView__itemContent': mockHTMLElement(100, 100),
         '.controls-TileView__imageWrapper': mockHTMLElement(100, 75)
      },
      item = {
         querySelector: function(selector) {
            return items[selector];
         }
      };

   describe('Controls/_tile/TileView/resources/ItemSizeUtils', function() {
      it('without imageWrapper', function() {
         var hasError = false;

         delete items['.controls-TileView__imageWrapper'];

         try {
            ItemSizeUtils.getItemSize(item, 1);
         } catch (e) {
            hasError = true;
         }

         assert.isFalse(hasError);
      });
   });
});
