define(['Controls/suggest', 'Types/entity', 'Env/Env'], function(suggest, entity, Env) {
   'use strict';

   describe('Controls/_suggest/Input/Search/Suggest', function() {

      var sandbox;

      beforeEach(function() {
         sandbox = sinon.createSandbox();
      });

      afterEach(function() {
         sandbox.restore();
      });

      it('_close', function() {
         var searchSuggest = new suggest.SearchInput();
         var valueChangedFired = false;

         searchSuggest._notify = function(eventName) {
            if (eventName === 'valueChanged') {
               valueChangedFired = true;
            }
         };

         //case 1, value is empty
         searchSuggest.saveOptions({value: ''});
         searchSuggest._close();
         assert.isFalse(valueChangedFired);

         //case 2, value is not empty
         searchSuggest.saveOptions({value: 'test'});
         searchSuggest._close();
         assert.isTrue(valueChangedFired);
      });

      it('_suggestMarkedKeyChanged', function() {
         var searchSuggest = new suggest.SearchInput();
         searchSuggest._suggestMarkedKeyChanged(null, null);
         assert.isFalse(searchSuggest._markedKeyChanged);

         searchSuggest._suggestMarkedKeyChanged(null, 'test');
         assert.isTrue(searchSuggest._markedKeyChanged);
      });

      it('_searchClick', function() {
         var searchSuggest = new suggest.SearchInput();
         searchSuggest._suggestState = true;

         var searchClickNotifyed = false;
         var suggestStateChangedNotifyed = false;
         var searchClickResult = true;
         var isSuggestClosed = false;

         searchSuggest._notify = function(eventName) {
            if (eventName === 'searchClick') {
               searchClickNotifyed = true;
            }
            if (eventName === 'suggestStateChanged') {
               suggestStateChangedNotifyed = true;
            }
            return searchClickResult;
         };
         searchSuggest._children = {
            suggestController: {
               closeSuggest: () => {
                  isSuggestClosed = true;
               }
            }
         };

         searchSuggest._suggestMarkedKeyChanged(null, 'test');
         searchSuggest._searchClick(null,{
            which: Env.constants.key.enter
         });
         assert.isFalse(searchClickNotifyed);
         assert.isTrue(searchSuggest._suggestState);

         searchSuggest._suggestMarkedKeyChanged(null, null);
         searchSuggest.saveOptions({
            value: 'testValue'
         });
         searchSuggest._searchClick(null, {
            which: 'any'
         });
         assert.isTrue(searchClickNotifyed);
         assert.isFalse(searchSuggest._suggestState);
         assert.isTrue(suggestStateChangedNotifyed);
         assert.isTrue(isSuggestClosed);

         searchSuggest._suggestState = true;
         searchClickResult = false;
         searchSuggest._searchClick();
         assert.isTrue(searchSuggest._suggestState);
      });

      it('_choose', () => {
         const searchSuggest = new suggest.SearchInput();
         let isActivated = false;
         searchSuggest.activate = () => { isActivated = true; };
         const model = new entity.Model({
            rawData: {
               id: 0,
               title: 'test'
            }
         });
         const stubNotify = sandbox.stub(searchSuggest, '_notify');

         searchSuggest.saveOptions({
            displayProperty: 'title'
         });

         searchSuggest._choose(null, model);

         assert.isTrue(stubNotify.withArgs('valueChanged', ['test']).calledOnce);
         assert.isTrue(isActivated);
      });

      describe('_resetClick', () => {
         let searchSuggest;
         let stubNotify;
         beforeEach(() => {
            searchSuggest = new suggest.SearchInput();
            searchSuggest._suggestState = true;
            stubNotify = sandbox.stub(searchSuggest, '_notify');
         });

         it('autoDropDown = true', () => {
            searchSuggest._options = { autoDropDown: true };

            searchSuggest._resetClick();

            assert.isTrue(stubNotify.withArgs('resetClick').calledOnce);
            assert.isTrue(searchSuggest._suggestState);
         });

         it('autoDropDown = false', () => {
            searchSuggest._options = { autoDropDown: false };

            searchSuggest._resetClick();

            assert.isFalse(searchSuggest._suggestState);
            assert.isTrue(stubNotify.withArgs('resetClick').calledOnce);
         });
      });

   });
});
