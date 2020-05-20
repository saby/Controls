define([
   'Core/core-merge',
   'Env/Env',
   'Controls/input',
   'ControlsUnit/Calendar/Utils'
], function(coreMerge, Env, input, testUtils) {

   'use strict';

   let createComponent = function(Component, cfg) {
      let cmp;
      if (Component.getDefaultOptions) {
         cfg = coreMerge(cfg, Component.getDefaultOptions(), {preferSource: true});
      }
      cmp = new Component(cfg);
      cmp.saveOptions(cfg);
      cmp._beforeMount(cfg);
      cmp._children[cmp._fieldName] = {
         selectionStart: 0,
         selectionEnd: 0,
         value: '',
         focus: function() {},
         setSelectionRange: function(start, end) {
            this.selectionStart = start;
            this.selectionEnd = end;
         }
      };
      return cmp;
   };

   describe('Controls/_input/Phone', function() {
      describe('_focusInHandler', function() {
         it('should set selection position to end', function() {
            const component = createComponent(input.Phone, { value: '12' });
            component._viewModel.selection = {
               start: 10,
               end: 10
            };
            component._focusInHandler({
                  target: {}
               });
            assert.deepEqual(
               component._viewModel.selection,
               {
                  start: 2,
                  end: 2
               }
            );
         });
         it('should not update selection position if the focus was set by a mouse click', function() {
            const
               component = createComponent(input.Phone, { value: '12' });
            component._viewModel.selection = {
               start: 1,
               end: 1
            };
            component._mouseDownHandler();
            component._focusInHandler({
                  target: {}
               });
            assert.deepEqual(component._viewModel.selection, { start: 1, end: 1 });
         });
      });
      describe('handleInput', function() {
         it('Remove 7', function() {
            const component = createComponent(input.Phone, { value: '+79721161' });
            component._viewModel.handleInput({
               after: ' (972) 116-1',
               before: '+',
               delete: '7',
               insert: '',
            }, 'deleteBackward');
            assert.equal(component._viewModel.displayValue, '+972 116 1');
         });
      });
   });
});
