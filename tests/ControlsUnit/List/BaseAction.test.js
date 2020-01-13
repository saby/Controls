define(['Controls/list'], function(lists) {
   const BaseAction = lists.BaseAction.default;

   describe('Controls.List.BaseAction', function() {
      it('validate', function() {
         let baseAction = new BaseAction();

         assert.isFalse(baseAction.validate([]));
         assert.isFalse(baseAction.validate({
            selected: [],
            excluded: []
         }));
         assert.isTrue(baseAction.validate([1]));
         assert.isTrue(baseAction.validate({
            selected: [1],
            excluded: []
         }));
      });
   });
});
