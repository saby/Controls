define(
   [
      'Controls/spoiler'
   ],
   function(spoiler) {
      'use strict';

      describe('Controls/spoiler:Heading', function() {
         var ctrl;
         var sandbox;

         beforeEach(function() {
            ctrl = new spoiler.View();

            var defaultOptions = spoiler.View.getDefaultOptions();
            ctrl._beforeMount(defaultOptions);

            sandbox = sinon.createSandbox();
            sandbox.stub(ctrl, '_notify');
         });

         afterEach(function() {
            sandbox.restore();
         });

         describe('The trigger of event controlResize on _afterUpdate', function() {
            it('oldExpanded = false, newExpanded = false', function() {
               ctrl._options.expanded = false;
               ctrl._afterUpdate({
                  expanded: false
               });
               sinon.assert.notCalled(ctrl._notify);
            });
            it('oldExpanded = true, newExpanded = false', function() {
               ctrl._options.expanded = true;
               ctrl._afterUpdate({
                  expanded: false
               });
               sinon.assert.called(ctrl._notify);
            });
            it('oldExpanded = false, newExpanded = true', function() {
               ctrl._options.expanded = false;
               ctrl._afterUpdate({
                  expanded: true
               });
               sinon.assert.called(ctrl._notify);
            });
            it('oldExpanded = true, newExpanded = true', function() {
               ctrl._options.expanded = true;
               ctrl._afterUpdate({
                  expanded: true
               });
               sinon.assert.notCalled(ctrl._notify);
            });
         });
      });
   }
);
