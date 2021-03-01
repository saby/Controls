define(['Controls/_suggestPopup/Layer/__BaseLayer'], function(__LayerBase) {

   describe('Controls._suggestPopup.Layer.__LayerBase', function() {

      it('__LayerBase::_getChildContext', function() {
         var baseLayer = new __LayerBase.default();
         baseLayer._options.searchValue = 'test';
         baseLayer._beforeMount(baseLayer._options);

         assert.equal(baseLayer._getChildContext().searchLayoutField.searchValue, 'test');
      });

   });

});
