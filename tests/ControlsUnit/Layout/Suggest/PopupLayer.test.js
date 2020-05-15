define(['Controls/_suggestPopup/Layer/__PopupLayer'], function(PopupLayer) {

   describe('Controls._suggestPopup.Layer.__PopupLayer', function() {

      it('_private.getPopupClassName', function() {
         assert.equal(PopupLayer.default._private.getPopupClassName('top'), 'controls-Suggest__suggestionsContainer_popup_top');
         assert.equal(PopupLayer.default._private.getPopupClassName('bottom'), 'controls-Suggest__suggestionsContainer_popup_bottom');
      });

      it('_onResult', function() {
         const layer = new PopupLayer.default();
         const resultPopupOptions = {
            direction: {
               vertical: 'test',
               horizontal: 'test'
            },
            offset: {
               vertical: 10,
               horizontal: 20
            },
            targetPoint: {side: 'test'},
            className: 'controls-Suggest__suggestionsContainer_popup_test',
            fittingMode: 'fixed'
         };
         const resultOpenConfig = Object.assign({
            opener: layer,
            actionOnScroll: 'close',
            target: undefined,
            theme: 'testTheme'
         }, resultPopupOptions);
         let openedWithConfig;

         layer._options = {
            theme: 'testTheme'
         };
         layer._popupOptions = {};
         layer._children = {
            suggestPopup: {
               open: (cfg) => {
                  openedWithConfig = cfg;
               }
            }
         };

         layer._onResult({
            direction: {
               vertical: 'test',
               horizontal: 'test'
            },
            offset: {
               vertical: 10,
               horizontal: 20
            },
            targetPoint: {side: 'test'}
         });

         assert.deepStrictEqual(resultPopupOptions, layer._popupOptions);

         delete openedWithConfig.zIndex;
         assert.deepStrictEqual(resultOpenConfig, openedWithConfig);
      });

      it('_resizeCallback', function() {
         var layer = new PopupLayer.default();
         var resizeCalled = false;

         layer._children = {
            popupContent: {
               resize: () => {
                  resizeCalled = true;
               }
            }
         };

         layer._resizeCallback();
         assert.isTrue(resizeCalled);

         resizeCalled = false;
         layer._children = {};
         layer._resizeCallback();
         assert.isFalse(resizeCalled);
      });

   });

});
