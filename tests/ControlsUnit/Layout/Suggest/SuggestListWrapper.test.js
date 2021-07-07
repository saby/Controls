define(['wml!Controls/_suggestPopup/_ListWrapper', 'wml!ControlsUnit/Layout/Suggest/resources/template'],
   function(suggestListWrapperTpl, testTemplate) {
      'use strict';

      describe('Controls.Container.Suggest.Layout._SuggestListWrapper', function() {

         it('template test', function() {
            var withoutTabsSelectedKey = '<div>tabsSelectedKey: test1</div>';
            var withSelectedKey = '<div>tabsSelectedKey: test</div>';

            assert.equal(withoutTabsSelectedKey, suggestListWrapperTpl(
               {
                  _options: {
                     templateName: testTemplate,
                     templateOptions: {
                        tabsSelectedKey: 'test1'
                     },
                     tabsSelectedKey: null
                  }
               }
            ));
            assert.equal(withSelectedKey, suggestListWrapperTpl(
               {
                  _options: {
                     templateName: testTemplate,
                     templateOptions: {
                        tabsSelectedKey: 'test1'
                     },
                     tabsSelectedKey: 'test'
                  }
               }
            ));
         });

      });
   }
);
