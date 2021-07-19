define([
   'Controls/Utils/Icon'
], function(Util) {
   describe('Controls/Util/Icon', () => {
      it('getIcon', () => {
         it('returns url with external use svg syntax', () => {
            assert.equal(Util.getIcon('Controls/iconModule:icon-done'), '/Controls/iconModule.svg#icon-done');
         });

         it('returns original icon with incorrect syntax', () => {
            assert.equal(Util.icon('icon-done'), 'icon-done');
         });
      });
   });
});
