define([
   'Controls/operations',
   'UI/Events'
], function(
   MultiSelector,
   events
) {
   'use strict';
   describe('Controls.Container.MultiSelector', function() {
      it('_selectedTypeChangedHandler', function() {
         var instance = new MultiSelector.Controller();
         instance._beforeMount({});
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
         assert.equal(instance._notifyHandler, events.EventUtils.tmplNotify);
      });
   });
});
