define(
   [
      'Controls/spoiler'
   ],
   function(spoiler) {
      'use strict';

      describe('Controls/spoiler:Heading', function() {
         var ctrl
         var options;

         beforeEach(function() {
            ctrl = new spoiler.Heading();
            options = spoiler.Heading.getDefaultOptions();
         });

         describe('State by options', function() {
            it('Test1', function() {
               ctrl._beforeMount(options);

               assert.equal(ctrl._icon, 'CollapseLight');
               assert.equal(ctrl._view, 'expanded');
               assert.equal(ctrl._caption, '');
            });
            it('Test2', function() {
               options.captions = 'Заголовок';
               ctrl._beforeMount(options);

               assert.equal(ctrl._icon, 'CollapseLight');
               assert.equal(ctrl._view, 'expanded');
               assert.equal(ctrl._caption, 'Заголовок');
            });
            it('Test3', function() {
               options.captions = ['Заголовок1', 'Заголовок2'];
               ctrl._beforeMount(options);

               assert.equal(ctrl._icon, 'CollapseLight');
               assert.equal(ctrl._view, 'expanded');
               assert.equal(ctrl._caption, 'Заголовок1');
            });
            it('Test4', function() {
               options.expanded = false;
               options.captions = ['Заголовок1', 'Заголовок2'];
               ctrl._beforeMount(options);

               assert.equal(ctrl._icon, 'ExpandLight');
               assert.equal(ctrl._view, 'collapsed');
               assert.equal(ctrl._caption, 'Заголовок2');
            });
            it('Test5', function() {
               options.captions = [];
               ctrl._beforeMount(options);

               assert.equal(ctrl._icon, 'CollapseLight');
               assert.equal(ctrl._view, 'expanded');
               assert.equal(ctrl._caption, '');
            });
            it('Test6', function() {
               options.expanded = false;
               options.captions = [];
               ctrl._beforeMount(options);

               assert.equal(ctrl._icon, 'ExpandLight');
               assert.equal(ctrl._view, 'collapsed');
               assert.equal(ctrl._caption, '');
            });
            it('Test7', function() {
               options.captions = ['Заголовок1'];
               ctrl._beforeMount(options);

               assert.equal(ctrl._icon, 'CollapseLight');
               assert.equal(ctrl._view, 'expanded');
               assert.equal(ctrl._caption, 'Заголовок1');
            });
            it('Test7', function() {
               options.expanded = false;
               options.captions = ['Заголовок1'];
               ctrl._beforeMount(options);

               assert.equal(ctrl._icon, 'ExpandLight');
               assert.equal(ctrl._view, 'collapsed');
               assert.equal(ctrl._caption, '');
            });
         });
      });
   }
);
