define([
   'Controls/list',
   'Core/Deferred',
   'Core/core-instance'
], function(
   lists,
   Deferred,
   cInstance
) {
   describe('Controls.List', function() {
      describe('EditInPlace', function() {
         it('beginEdit', function() {
            var opt = {
               test: '123'
            };
            var
               list = new lists.View({});
            list._children = {
               listControl: {
                  beginEdit: function(options) {
                     assert.equal(opt, options);
                     return Deferred.success();
                  }
               }
            };
            var result = list.beginEdit(opt);
            assert.isTrue(cInstance.instanceOfModule(result, 'Core/Deferred'));
            assert.isTrue(result.isSuccessful());
         });

         it('beginEdit, readOnly: true', function() {
            var opt = {
               test: '123'
            };
            var
               list = new lists.View({});
            list.saveOptions({ readOnly: true });
            var result = list.beginEdit(opt);
            assert.isTrue(cInstance.instanceOfModule(result, 'Core/Deferred'));
            assert.isFalse(result.isSuccessful());
         });
   
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

         it('beginAdd', function() {
            var opt = {
               test: '123'
            };
            var
               list = new lists.View({});
            list._children = {
               listControl: {
                  beginAdd: function(options) {
                     assert.equal(opt, options);
                     return Deferred.success();
                  }
               }
            };
            var result = list.beginAdd(opt);
            assert.isTrue(cInstance.instanceOfModule(result, 'Core/Deferred'));
            assert.isTrue(result.isSuccessful());
         });

         it('beginAdd, readOnly: true', function() {
            var opt = {
               test: '123'
            };
            var
               list = new lists.View({});
            list.saveOptions({ readOnly: true });
            var result = list.beginAdd(opt);
            assert.isTrue(cInstance.instanceOfModule(result, 'Core/Deferred'));
            assert.isFalse(result.isSuccessful());
         });

         it('cancelEdit', function() {
            var
               list = new lists.View({});
            list._children = {
               listControl: {
                  cancelEdit: function() {
                     return Deferred.success();
                  }
               }
            };
            var result = list.cancelEdit();
            assert.isTrue(cInstance.instanceOfModule(result, 'Core/Deferred'));
            assert.isTrue(result.isSuccessful());
         });

         it('cancelEdit, readOnly: true', function() {
            var
               list = new lists.View({});
            list.saveOptions({ readOnly: true });
            var result = list.cancelEdit();
            assert.isTrue(cInstance.instanceOfModule(result, 'Core/Deferred'));
            assert.isFalse(result.isSuccessful());
         });

         it('commitEdit', function() {
            var
               list = new lists.View({});
            list._children = {
               listControl: {
                  commitEdit: function() {
                     return Deferred.success();
                  }
               }
            };
            var result = list.commitEdit();
            assert.isTrue(cInstance.instanceOfModule(result, 'Core/Deferred'));
            assert.isTrue(result.isSuccessful());
         });

         it('commitEdit, readOnly: true', function() {
            var
               list = new lists.View({});
            list.saveOptions({ readOnly: true });
            var result = list.commitEdit();
            assert.isTrue(cInstance.instanceOfModule(result, 'Core/Deferred'));
            assert.isFalse(result.isSuccessful());
         });
      });
   });
});
