define(['Controls/list'], function(lists) {
   describe('Controls.List', () => {
      it('reloadItem', function() {
         var list = new lists.View({});
         list._children = {
            listControl: {
               reloadItem: function(key, readMeta, direction) {
                  assert.equal(key, 'test');
                  assert.deepEqual(readMeta, {test: 'test'});
                  assert.equal(direction, 'depth');
               }
            }
         };
         list.reloadItem('test', {test: 'test'}, 'depth');
      });
   });
});
