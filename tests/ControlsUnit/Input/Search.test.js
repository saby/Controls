define(
   [
      'Controls/_search/Input/Search'
   ],
   function(searchExport) {
      'use strict';
      const Search = searchExport.default;

      describe('Controls/_search/Input/Search', function() {
         var valueSearch;


         describe('search', function() {
            it('Click on search', function() {
               let search = new Search();
               let searched = false;
               let activated = false;
               const eventMock = {stopPropagation: () => {}};

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
               search._searchClick(eventMock);
               assert.isFalse(searched);
               assert.isFalse(activated);

               search._options.readOnly = false;
               search._searchClick(eventMock);
               assert.isTrue(activated);

               searched = activated = false;
               search._searchClick(eventMock);
               assert.isFalse(searched);
               assert.isTrue(activated);

            });

            it('_resetClick', function() {
               let search = new Search();
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
               let search = new Search();
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

            it('reset', function() {
               let valueReseted = false;
               let search = new Search();
               search._resetClick = () => { valueReseted = true; };
               search.reset();
               assert.isTrue(valueReseted);
            });

            it('Enter click', function() {
               let search = new Search();
               let activated = false;
               let eventStopped;
               search._notify = (e, args) => {
                  assert.equal(e, 'searchClick');
               };
               search.activate = () => {
                  activated = true;
               };
               search._keyUpHandler({
                  nativeEvent: {
                     which: 13 // enter key
                  },
                  stopPropagation: () => {
                     eventStopped = true;
                  }
               });
               assert.isTrue(activated);
               assert.isTrue(eventStopped);
            });

            it('Focus out', function() {
               let search = new Search();

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
               let search = new Search();
               search._beforeMount({ readOnly: false, value: '' });
               assert.isFalse(Search._private.isVisibleResetButton.call(search));

               search._viewModel.displayValue = 'test text';
               assert.isTrue(Search._private.isVisibleResetButton.call(search));

               search._options.readOnly = true;
               assert.isFalse(Search._private.isVisibleResetButton.call(search));
            });
         });
      });
   }
);
