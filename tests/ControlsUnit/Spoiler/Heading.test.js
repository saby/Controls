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

               assert.equal(ctrl._view, 'collapsed');
               assert.equal(ctrl._caption, '');
            });
            it('Test2', function() {
               options.captions = 'Заголовок';
               ctrl._beforeMount(options);

               assert.equal(ctrl._view, 'collapsed');
               assert.equal(ctrl._caption, 'Заголовок');
            });
            it('Test3', function() {
               options.captions = ['Заголовок1', 'Заголовок2'];
               ctrl._beforeMount(options);

               assert.equal(ctrl._view, 'collapsed');
               assert.equal(ctrl._caption, 'Заголовок2');
            });
            it('Test4', function() {
               options.expanded = false;
               options.captions = ['Заголовок1', 'Заголовок2'];
               ctrl._beforeMount(options);

               assert.equal(ctrl._view, 'collapsed');
               assert.equal(ctrl._caption, 'Заголовок2');
            });
            it('Test5', function() {
               options.captions = [];
               ctrl._beforeMount(options);

               assert.equal(ctrl._view, 'collapsed');
               assert.equal(ctrl._caption, '');
            });
            it('Test6', function() {
               options.expanded = false;
               options.captions = [];
               ctrl._beforeMount(options);

               assert.equal(ctrl._view, 'collapsed');
               assert.equal(ctrl._caption, '');
            });
            it('Test7', function() {
               options.captions = ['Заголовок1'];
               ctrl._beforeMount(options);

               assert.equal(ctrl._view, 'collapsed');
               assert.equal(ctrl._caption, '');
            });
            it('Test7', function() {
               options.expanded = false;
               options.captions = ['Заголовок1'];
               ctrl._beforeMount(options);

               assert.equal(ctrl._view, 'collapsed');
               assert.equal(ctrl._caption, '');
            });
            it('Heading with expanded=true', function() {
               options.expanded = true;
               options.captions = ['Заголовок1', 'Заголовок2'];
               ctrl._beforeMount(options);

               assert.equal(ctrl._view, 'expanded');
               assert.equal(ctrl._caption, 'Заголовок1');
            });
            it('mount and click', function() {
               options.captions = ['Заголовок1', 'Заголовок2'];
               ctrl._beforeMount(options);
               assert.equal(ctrl._expanded, false);
               assert.equal(ctrl._view, 'collapsed');
               assert.equal(ctrl._caption, 'Заголовок2');
               ctrl._options = options;
               ctrl._clickHandler();
               ctrl._beforeUpdate(options);
               assert.equal(ctrl._view, 'expanded');
               assert.equal(ctrl._caption, 'Заголовок1');
            });
            it('fontColorStyle', function() {
               assert.equal(spoiler.Heading._calcFontColorStyle(true), 'secondary');
               assert.equal(spoiler.Heading._calcFontColorStyle(false), 'label');
               assert.equal(spoiler.Heading._calcFontColorStyle(true, 'label'), 'label');
               assert.equal(spoiler.Heading._calcFontColorStyle(false, 'label'), 'label');
               assert.equal(spoiler.Heading._calcFontColorStyle(true, 'secondary'), 'secondary');
               assert.equal(spoiler.Heading._calcFontColorStyle(false, 'secondary'), 'secondary');
            });
            it('fontWeight', function() {
               assert.equal(spoiler.Heading._calcFontWeight(true), 'bold');
               assert.equal(spoiler.Heading._calcFontWeight(false), 'default');
               assert.equal(spoiler.Heading._calcFontWeight(true, 'bold'), 'bold');
               assert.equal(spoiler.Heading._calcFontWeight(false, 'bold'), 'bold');
               assert.equal(spoiler.Heading._calcFontWeight(true, 'default'), 'default');
               assert.equal(spoiler.Heading._calcFontWeight(false, 'default'), 'default');
            });

            it('tooltip', () => {
               const heading = new spoiler.Heading();
               let textWidth = 20;
               let captionContainer = 40;

               heading._getTextWidth = () => textWidth;
               heading._children = {
                  captionContainer: {
                     clientWidth: captionContainer
                  }
               };
               heading.saveOptions({
                  tooltip: 'myTooltipOpt'
               });

               heading._mouseenterHandler();
               assert.equal(heading._tooltip, 'myTooltipOpt');

               heading.saveOptions({
                  tooltip: null
               });
               heading._tooltip = '';
               heading._mouseenterHandler();
               assert.equal(heading._tooltip, '');

               textWidth = 60;
               heading._mouseenterHandler(null, 'myCaption');
               assert.equal(heading._tooltip, 'myCaption');

               heading.destroy();
            });
         });
      });
   }
);
