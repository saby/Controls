define(
   [
      'UI/Base',
      'Controls/search'
   ],
   function(Base, searchMod) {
      'use strict';

      describe('Controls/_search/Input/Search', function() {
         var valueSearch;


         describe('search', function() {
            it('Click on search', function() {
               let search = new searchMod.Input();
               let searched = false;
               let activated = false;

               search._beforeMount({});
               search._notify = (e, args) => {
                  if (e === 'searchClick') {
                     searched = true;
                  }
               };
               search.activate = () => {
                  activated = true;
               };

               search._options.readOnly = true;
               search._searchClick({});
               assert.isFalse(searched);
               assert.isFalse(activated);

               search._options.readOnly = false;
               search._searchClick({});
               assert.isTrue(activated);

               searched = activated = false;
               search._searchClick({});
               assert.isFalse(searched);
               assert.isTrue(activated);

            });

            it('_resetClick', function() {
               let search = new searchMod.Input();
               let resetClicked = false;
               let activated = false;

               search._beforeMount({
                  value: ''
               });

               search._notify = (e, args) => {
                  if (e == 'resetClick') {
                     resetClicked = true;
                  } else if (e == 'valueChanged') {
                     assert.equal(args[0], '');
                  }
               };
               search.activate = () => {
                  activated = true;
               };

               search._resetClick();
               assert.isTrue(resetClicked);
               assert.isTrue(activated);
               resetClicked = activated = false;
               search._options.readOnly = true;
               search._searchClick();
               assert.isFalse(resetClicked);
               assert.isFalse(activated);
            });

            it('_resetClick', function() {
               let search = new searchMod.Input();
               let eventPreventDefault = false;
               let eventStopPropagation = false;
               let event = {
                  stopPropagation: () => {
                     eventStopPropagation = true;
                  },
                  preventDefault: () => {
                     eventPreventDefault = true;
                  }
               };

               search._resetMousedown(event);
               assert.isTrue(eventPreventDefault);
               assert.isTrue(eventStopPropagation);
            });

            it('Enter click', function() {
               let search = new searchMod.Input();
               let activated = false;
               search._notify = (e, args) => {
                  assert.equal(e, 'searchClick');
               };
               search.activate = () => {
                  activated = true;
               };
               search._keyUpHandler({
                  nativeEvent: {
                     which: 13 // enter key
                  }
               });
               assert.isTrue(activated);
            });

            it('Focus out', function() {
               let search = new searchMod.Input();

               const beforeMount = search._beforeMount;

               search._beforeMount = function() {
                  beforeMount.apply(this, arguments);

                  search._children[this._fieldName] = {
                     selectionStart: 0,
                     selectionEnd: 0,
                     value: '',
                     focus: function() {},
                     setSelectionRange: function(start, end) {
                        this.selectionStart = start;
                        this.selectionEnd = end;
                     }
                  };
               };

               search._options = {};
               search._beforeMount({
                  value: null
               });
               search._options.trim = true;
               search._options.value = null;

               search._focusOutHandler();
            });

            it('isVisibleResetButton', function() {
               let search = new searchMod.Input();
               search._beforeMount({ readOnly: false, value: '' });
               assert.isFalse(searchMod.Input._private.isVisibleResetButton.call(search));

               search._viewModel.displayValue = 'test text';
               assert.isTrue(searchMod.Input._private.isVisibleResetButton.call(search));

               search._options.readOnly = true;
               assert.isFalse(searchMod.Input._private.isVisibleResetButton.call(search));
            });
         });
      });
   }
);
