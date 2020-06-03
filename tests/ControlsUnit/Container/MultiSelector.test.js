define([
   'Controls/operations',
   'Controls/Utils/tmplNotify'
], function(
   MultiSelector,
   tmplNotify
) {
   'use strict';
   describe('Controls.Container.MultiSelector', function() {
      it('_selectedTypeChangedHandler', function() {
         var instance = new MultiSelector.Controller();
         instance._selectedTypeRegister = {
            start: function(typeName) {
               assert.equal(typeName, 'toggleAll');
            }
         };
         instance._selectedTypeChangedHandler({}, 'toggleAll');
      });

      it('_selectedKeysCountChanged', function() {
         var
            instance = new MultiSelector.Controller(),
            count = 1;
         instance._notify = function(eventName, eventArgs) {
            assert.equal(eventName, 'selectedKeysCountChanged');
            assert.equal(eventArgs[0], count);
         };
         instance._selectedKeysCountChanged({
            stopPropagation: function() {

            }
         }, count);
         assert.equal(instance._selectedKeysCount, count);
         count = 2;
         instance._notify = function(eventName, eventArgs) {
            assert.equal(eventName, 'selectedKeysCountChanged');
            assert.equal(eventArgs[0], count);
         };
         instance._selectedKeysCountChanged({
            stopPropagation: function() {

            }
         }, count);
      });

      it('_notifyHandler', function() {
         var instance = new MultiSelector.Controller();
         assert.equal(instance._notifyHandler, tmplNotify);
      });
   });
});
