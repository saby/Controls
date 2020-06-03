define(['Controls/suggest', 'Types/collection', 'Types/entity', 'Env/Env', 'Controls/history', 'Core/Deferred', 'Controls/popup'], function(suggestMod, collection, entity, Env, history, Deferred, popupLib) {
'use strict';
   describe('Controls.Container.Suggest.Layout', function() {
      var IDENTIFICATORS = [1, 2, 3];

      var getSearchResult = function(hasMore, countItems) {
         return {
            hasMore: hasMore,
            data: {
               getCount: function() {
                  return countItems;
               }
            }
         }
      };

      var getComponentObject = function() {
         const controller = new suggestMod._InputController();
         const options = {
            suggestTemplate: {},
            footerTemplate: {}
         };
         controller.saveOptions(options);
         return controller;
      };

      var getContainer = function(size) {
         return {
            getBoundingClientRect: function() {
               return {
                  toJSON: function() {
                     return size;
                  }
               };
            }
         };
      };

      var getDropDownContainer = function(height) {
         return {
            getBoundingClientRect: function() {
               return {
                  bottom: 0,
                     top: 0,
                     height: height
               };
            }
         };
      };

      let getRecentKeys = suggestMod._InputController._private.getRecentKeys;

      suggestMod._InputController._private.getRecentKeys = function() {
         return Deferred.success(IDENTIFICATORS);
      };

      var getHistorySource = suggestMod._InputController._private.getHistoryService;

      suggestMod._InputController._private.getHistoryService = function() {
         return {
            addCallback: function(func) {
               func({
                  update: function(item) {
                     item._isUpdateHistory = true;
                  }
               });
            }
         }
      };

      it('Suggest::getHistoryService', function(done) {
         getHistorySource({_options: {historyId: 'TEST_HISTORY_ID_GET_SOURCE'}}).addCallback(function(historyService) {
            assert.equal(12, historyService._recent);
            assert.equal('TEST_HISTORY_ID_GET_SOURCE', historyService._historyId);
            done();
         });
      });

      it('Suggest::_private.hasMore', function() {
         assert.isTrue(suggestMod._InputController._private.hasMore(getSearchResult(true)));
         assert.isFalse(suggestMod._InputController._private.hasMore(getSearchResult(false)));
      });

      it('Suggest::_private.suggestStateNotify', function () {
         var self = getComponentObject();
         var stateNotifyed = false;
         self._options.suggestState = true;
         self._notify = function(eventName, args) {
            stateNotifyed = true;
         };
         self._forceUpdate = function () {};
         suggestMod._InputController._private.suggestStateNotify(self, true);
         assert.isFalse(stateNotifyed);

         suggestMod._InputController._private.suggestStateNotify(self, false);
         assert.isTrue(stateNotifyed);
      });

      it('Suggest::_private.close', function() {
         let
            state,
            isReady = true,
            isCallCancel = false,
            self = getComponentObject();

         self._options.suggestState = true;
         self._notify = function(eventName, args) {
            state = args[0];
         };
         self._dependenciesDeferred = {
            isReady: () => { return isReady },
            cancel: () => { isCallCancel = true }
         };
         suggestMod._InputController._private.close(self);
         assert.isFalse(state);
         assert.isFalse(isCallCancel);

         isReady = false;
         suggestMod._InputController._private.close(self);
         assert.isTrue(isCallCancel);
         assert.equal(self._dependenciesDeferred, null);
      });

      it('Suggest::_close', function() {
         const suggestComponent = new suggestMod._InputController();
         let propagationStopped = false;
         const event = {
            stopPropagation: () => {
               propagationStopped = true;
            }
         };
         suggestComponent._loading = true;
         suggestComponent._showContent = true;

         suggestComponent._close(event);
         assert.isTrue(propagationStopped);
         assert.equal(suggestComponent._loading, null);
         assert.equal(suggestComponent._showContent, false);
      });

      it('Suggest::_private.open', function (done) {
         var self = getComponentObject();
         var state;
         self._options.suggestState = false;
         self._inputActive = true;
         self._notify = function(eventName, args) {
            state = args[0];
         };
         self._forceUpdate = function () {};
         suggestMod._InputController._private.open(self);
         self._dependenciesDeferred.addCallback(function() {
            assert.isTrue(state);

            state = false;
            self._options.suggestState = false;
            suggestMod._InputController._private.open(self);
            self._inputActive = false;
            self._dependenciesDeferred.addCallback(function() {
               assert.isFalse(state);
               done();
            });
         });
      });

      it('Suggest::_private.shouldSearch', function () {
         var self = getComponentObject();
         self._options.minSearchLength = 3;

         self._inputActive = true;
         assert.isTrue(suggestMod._InputController._private.shouldSearch(self, 'test'));
         assert.isFalse(suggestMod._InputController._private.shouldSearch(self, 't'));
         assert.isFalse(!!suggestMod._InputController._private.shouldSearch(self, null));

         self._inputActive = false;
         assert.isFalse(suggestMod._InputController._private.shouldSearch(self, 'test'));
         assert.isFalse(suggestMod._InputController._private.shouldSearch(self, 't'));
      });

      it('Suggest::_private.shouldShowSuggest', function () {
         var self = getComponentObject();
         var result = {
            data: new collection.List({items: [1,2,3]})
         };
         var emptyResult = {
            data: new collection.List()
         };

         //case 1. emptyTemplate - is null/undefined, searchValue - is empty string/null
         assert.isTrue(!!suggestMod._InputController._private.shouldShowSuggest(self, result));
         assert.isFalse(!!suggestMod._InputController._private.shouldShowSuggest(self, emptyResult));

         //case 2. emptyTemplate is set, searchValue - is empty string/null
         self._options.emptyTemplate = {};
         assert.isTrue(!!suggestMod._InputController._private.shouldShowSuggest(self, result));
         assert.isTrue(!!suggestMod._InputController._private.shouldShowSuggest(self, emptyResult));

         //case 3. emptyTemplate is set, searchValue - is set
         self._searchValue = 'test';
         assert.isTrue(!!suggestMod._InputController._private.shouldShowSuggest(self, result));
         assert.isTrue(!!suggestMod._InputController._private.shouldShowSuggest(self, emptyResult));

         //case 4. emptyTemplate is set, search - is empty string, historyId is set
         self._searchValue = '';
         self._options.historyId = '123';
         assert.isFalse(!!suggestMod._InputController._private.shouldShowSuggest(self, emptyResult));
         assert.isTrue(!!suggestMod._InputController._private.shouldShowSuggest(self, result));

         //emptyTemplate is set, search - is set, historyId is set
         self._searchValue = '123';
         self._options.historyId = '123';
         assert.isTrue(!!suggestMod._InputController._private.shouldShowSuggest(self, emptyResult));
         assert.isTrue(!!suggestMod._InputController._private.shouldShowSuggest(self, result));

         self._tabsSelectedKey = 'testTab';
         self._searchValue = '';
         assert.isTrue(!!suggestMod._InputController._private.shouldShowSuggest(self, emptyResult));
         assert.isTrue(!!suggestMod._InputController._private.shouldShowSuggest(self, result));

         //case 6. emptyTemplate is null/undefined, search - is empty string, historyId is set
         self._options.emptyTemplate = null;
         assert.isFalse(!!suggestMod._InputController._private.shouldShowSuggest(self, emptyResult));
         assert.isTrue(!!suggestMod._InputController._private.shouldShowSuggest(self, result));
      });

      it('Suggest::_private.prepareFilter', function() {
         let self = getComponentObject();
         let resultFilter = {
            currentTab: 1,
            searchParam: 'test',
            filterTest: 'filterTest'
         };

         let filter = suggestMod._InputController._private.prepareFilter({filterTest: 'filterTest'}, 'searchParam', 'test', 3, 1, [1, 2]);
         assert.deepEqual(filter, resultFilter);

         resultFilter.historyKeys = [1, 2];
         filter = suggestMod._InputController._private.prepareFilter({filterTest: 'filterTest'}, 'searchParam', 'test', 20, 1, [1, 2]);
         assert.deepEqual(filter, resultFilter);
      });

      it('Suggest::_private.setFilter', function() {
         var self = getComponentObject();
         self._options.searchParam = 'searchParam';
         self._searchValue = 'test';
         self._tabsSelectedKey = 1;
         var filter = {
            test: 'test'
         };
         var resultFilter = {
            searchParam: 'test',
            test: 'test',
            currentTab: 1
         };
         suggestMod._InputController._private.setFilter(self, filter, self._options);
         assert.deepEqual(self._filter, resultFilter);
      });

      it('Suggest::_searchStart', function() {
         let suggest = new suggestMod._InputController();
         let isCallShowIndicator = false;
         let isCallHideIndicator = false;

         suggest._children.indicator = {
            show: () => isCallShowIndicator = true,
            hide: () => isCallHideIndicator = true
         };

         suggest._searchStart();
         assert.isTrue(suggest._loading);
         assert.isTrue(isCallShowIndicator);
         assert.isTrue(isCallHideIndicator);
      });

      it('Suggest::_searchEnd', function() {
         var suggest = new suggestMod._InputController();
         var errorFired = false;
         var options = {
            searchDelay: 300,
            suggestState: true
         };

         suggest._loading = null;
         suggest.saveOptions(options);
         suggest._searchDelay = 0;
         suggest._children = {};

         try {
            suggest._searchEnd();
         } catch (e) {
            errorFired = true;
         }

         assert.equal(options.searchDelay, suggest._searchDelay);
         assert.isFalse(errorFired);
         assert.equal(suggest._loading, null);

         suggest._loading = true;
         suggest._searchEnd();
         assert.equal(suggest._loading, null);

         suggest._loading = true;
         suggest._searchEnd({
            data: new collection.RecordSet({items: [1]})
         });
         assert.isFalse(suggest._loading);
      });

      it('Suggest::_private.searchErrback', function() {
         var self = getComponentObject();
         var isIndicatorVisible = true;
         self._forceUpdate = function() {};
         self._children = {};
         self._children.indicator = {
            hide: function() {
               isIndicatorVisible = false;
            }
         };

         self._loading = null;
         suggestMod._InputController._private.searchErrback(self, {canceled: true});
         assert.isTrue(self._loading === null);

         self._loading = true;
         suggestMod._InputController._private.searchErrback(self, {canceled: true});
         assert.isFalse(self._loading);

         return new Promise(function(resolve) {
            self._loading = true;
            suggestMod._InputController._private.searchErrback(self, {canceled: false}).then(function() {
               assert.equal(self._emptyTemplate(), '<div class="controls-Suggest__empty"> Справочник недоступен </div>');
               assert.isFalse(isIndicatorVisible);
               assert.isFalse(self._loading);
               resolve();
            });
         });
      });

      it('Suggest::_private.setSearchValue', function() {
         var self = {};

         suggestMod._InputController._private.setSearchValue(self, 'test');
         assert.equal(self._searchValue, 'test');

         suggestMod._InputController._private.setSearchValue(self, '');
         assert.equal(self._searchValue, '');
      });

      it('Suggest::_searchErrback', function() {
         var suggest = new suggestMod._InputController();
         suggest._loading = true;
         suggest._searchErrback({canceled: true});
         assert.isFalse(suggest._loading);
      });

      it('Suggest::check footer template', function(done) {
         var footerTpl;

         requirejs(['Controls/suggestPopup'], function(result) {
            let compat = Env.constants.compat;
            Env.constants.compat = true;

            footerTpl = result.FooterTemplate;

            assert.equal(footerTpl(), '<div class="controls-Suggest__footer"></div>');
            assert.equal(footerTpl({showMoreButtonTemplate: 'testShowMore'}), '<div class="controls-Suggest__footer">testShowMore</div>');
            assert.equal(footerTpl({showMoreButtonTemplate: 'testShowMore', showSelectorButtonTemplate: 'testShowSelector'}), '<div class="controls-Suggest__footer">testShowMoretestShowSelector</div>');
            done();

            Env.constants.compat = compat;
         });
      });

      it('Suggest::showAllClick', function() {
         var suggest = new suggestMod._InputController();
         var stackOpened = false;
         var eventResult = false;
         var openCfg;

         suggest._notify = (event, options) => { openCfg = options; return eventResult; };
         suggest._showContent = true;
         popupLib.Stack.openPopup = () => {
            stackOpened = true;
         };

         suggest._options.suggestTemplate = {
            templateName: 'test',
            templateOptions: {}
         };

         suggest._showAllClick();

         assert.isFalse(stackOpened);
         assert.isFalse(suggest._showContent);
         assert.isTrue(!!openCfg);
      });

      it('Suggest::_moreClick', function() {
         let
            isNotifyShowSelector = false,
            suggest = new suggestMod._InputController();

         popupLib.Stack.openPopup = () => {};

         suggest._options.suggestTemplate = {
            templateName: 'test',
            templateOptions: {}
         };

         suggest._notify = function(eventName, data) {
            if (eventName === 'showSelector') {
               isNotifyShowSelector = true;
               assert.deepEqual(data[0].templateOptions.filter, suggest._filter);
            }
         };

         suggest._moreClick();
         assert.isTrue(isNotifyShowSelector);
      });

      it('Suggest::_inputActivated/inputClicked with autoDropDown', function() {
         var self = getComponentObject();
         var suggestComponent = new suggestMod._InputController();
         var suggestState = false;
         const event = {
            stopPropagation: () => {}
         };

         if (!document) {
            suggestMod._InputController._private.getActiveElement = function() {
               return {
                  classList: {
                     contains: function() {
                        return false;
                     }
                  }
               }
            };
         }

         self._options.searchParam = 'searchParam';
         self._options.autoDropDown = true;
         self._options.minSearchLength = 3;
         self._options.readOnly = true;
         self._options.historyId = 'testFieldHistoryId';
         self._options.keyProperty = 'Identificator';

         suggestComponent._searchDelay = 300;
         suggestComponent.saveOptions(self._options);
         suggestMod._InputController._private.setFilter(suggestComponent, {}, suggestComponent._options);
         suggestComponent._notify = function(event, val) {
            if (event === 'suggestStateChanged') {
               suggestState = val[0];
            }
         };

         suggestComponent._inputActivated();
         assert.equal(suggestComponent._searchDelay, 300);
         suggestComponent._options.readOnly = false;


         return new Promise(function(resolve) {
            suggestComponent._inputActivated();
            assert.equal(suggestComponent._searchDelay, 0);

            suggestComponent._dependenciesDeferred.addCallback(function() {
               assert.isTrue(suggestState);
               assert.deepEqual(suggestComponent._filter['historyKeys'], IDENTIFICATORS);

               suggestComponent._changeValueHandler(null, '');
               assert.isTrue(suggestState);
               assert.equal(suggestComponent._searchValue, '');

               suggestComponent._close(event);
               suggestComponent._filter = {};
               suggestComponent._inputClicked();

               suggestComponent._dependenciesDeferred.addCallback(function() {
                  assert.isTrue(suggestState);
                  assert.deepEqual(suggestComponent._filter['historyKeys'], IDENTIFICATORS);

                  suggestComponent._close(event);
                  self._options.readOnly = true;
                  suggestComponent._inputActivated();
                  suggestComponent._dependenciesDeferred.addCallback(function() {
                     assert.isFalse(suggestState);

                     suggestComponent._inputClicked();
                     suggestComponent._dependenciesDeferred.addCallback(function() {
                        assert.isFalse(suggestState);

                        suggestComponent._options.historyId = '';
                        suggestComponent._filter = {};
                        suggestComponent._options.readOnly = false;
                        suggestComponent._inputActivated();

                        suggestComponent._dependenciesDeferred.addCallback(function() {
                           assert.isTrue(suggestState);
                           assert.deepEqual(suggestComponent._filter, {searchParam: ''});

                           suggestComponent._options.suggestState = true;
                           suggestComponent._filter = {};
                           suggestComponent._inputActivated();

                           suggestComponent._dependenciesDeferred.addCallback(function() {
                              assert.deepEqual(suggestComponent._filter, {});

                              suggestState = false;
                              suggestComponent._options.suggestState = false;
                              suggestComponent._options.validationStatus = 'invalid';
                              suggestComponent._inputActivated();

                              assert.isFalse(suggestState, 'suggest opened on activated with validationStatus: "invalid"');
                              resolve();
                           });
                        });
                     });
                  });
               });
            });
         });
      });

      it('Suggest::_changeValueHandler', function() {
         var self = getComponentObject();
         var suggestComponent = new suggestMod._InputController();

         self._options.searchParam = 'searchParam';
         self._options.keyProperty = 'Identificator';
         self._options.minSearchLength = 3;
         self._options.searchDelay = 300;

         suggestComponent.saveOptions(self._options);
         suggestComponent._inputActive = true;
         suggestComponent._searchDelay = 0;

         suggestComponent._changeValueHandler(null, 't');
         assert.equal(suggestComponent._searchValue, '');
         assert.equal(suggestComponent._searchDelay, 300);

         suggestComponent._changeValueHandler(null, 'te');
         assert.equal(suggestComponent._searchValue, '');

         suggestComponent._changeValueHandler(null, 'test');
         assert.equal(suggestComponent._searchValue, 'test');

         self._options.trim = true;
         suggestComponent._changeValueHandler(null, '  ');
         assert.equal(suggestComponent._searchValue, '');

         self._options.historyId = 'testFieldHistoryId';
         self._options.autoDropDown = true;
         suggestComponent._changeValueHandler(null, 'te');
         assert.equal(suggestComponent._searchValue, '');
         assert.deepEqual(suggestComponent._filter.historyKeys, IDENTIFICATORS);
         self._options.historyId = '';
         suggestComponent._changeValueHandler(null, 'test');
         assert.deepEqual(suggestComponent._filter, {searchParam: 'test'});
         suggestComponent._changeValueHandler(null, 'te');
         assert.deepEqual(suggestComponent._filter, {searchParam: '', historyKeys: IDENTIFICATORS});
      });

      it('Suggest::_private.loadDependencies', function(done) {
         var self = getComponentObject();
         var options = {
            footerTemplate: 'test',
            suggestTemplate: 'test',
            emptyTemplate: 'test',
         };
         suggestMod._InputController._private.loadDependencies(self, options).addCallback(function() {
            assert.isTrue(self._dependenciesDeferred.isReady());
         });

         var dep = self._dependenciesDeferred;
         suggestMod._InputController._private.getTemplatesToLoad = function() {return []};
         suggestMod._InputController._private.loadDependencies(self, options).addCallback(function() {
            assert.deepEqual(self._dependenciesDeferred, dep);
            done();
         });
      });

      it('Suggest::_private.processResultData', function() {
         var self = getComponentObject();
         var queryRecordSet = new collection.RecordSet({
            rawData: [{id: 1}, {id: 2}, {id: 3}],
            keyProperty: 'id'
         });
         var resultData = {
            data: queryRecordSet,
            hasMore: true
         };

         self._notify = function() {};
         self._searchValue = 'notEmpty';

         queryRecordSet.setMetaData({
            results: new entity.Model({
               rawData: {
                  tabsSelectedKey: 'testId',
                  switchedStr: 'testStr'
               }
            }),
            more: 10
         });

         suggestMod._InputController._private.processResultData(self, resultData);

         assert.equal(self._searchResult.data, queryRecordSet);
         assert.equal(self._tabsSelectedKey, 'testId');
         assert.equal(self._misspellingCaption, 'testStr');
         assert.equal(resultData.more, 7)

         var queryRecordSetEmpty = new collection.RecordSet();
         queryRecordSetEmpty.setMetaData({
            results: new entity.Model({
               rawData: {
                  tabsSelectedKey: 'testId2',
                  switchedStr: 'testStr2'
               }
            })
         });
         self._suggestMarkedKey = 'test';
         suggestMod._InputController._private.processResultData(self, {data: queryRecordSetEmpty});

         assert.equal(self._suggestMarkedKey, null);
         assert.notEqual(self._searchResult.data, queryRecordSet);
         assert.equal(self._searchResult.data, queryRecordSetEmpty);
         assert.equal(self._tabsSelectedKey, 'testId2');
         assert.equal(self._misspellingCaption, 'testStr2');
      });

      it('Suggest::_tabsSelectedKeyChanged', function() {
         var suggestComponent = new suggestMod._InputController();
         var suggestActivated = false;
         var updated = false;
         suggestComponent.activate = function() {
            suggestActivated = true;
         };
         suggestComponent._forceUpdate = function() {
            updated = true;
         };
         suggestComponent._filter = {};
         suggestComponent._filter.currentTab = null;
         suggestComponent._tabsSelectedKey = 'checkChanged';

         /* tabSelectedKey not changed, filter must be not changed too */
         suggestComponent._tabsSelectedKeyChanged('checkChanged');
         assert.equal(suggestComponent._filter.currentTab, null);
         assert.isTrue(updated);

         /* tabSelectedKey changed, filter must be changed */
         suggestComponent._suggestMarkedKey = 'test';
         suggestComponent._tabsSelectedKeyChanged('test');
         assert.equal(suggestComponent._filter.currentTab, 'test');
         assert.isTrue(suggestActivated);
         assert.isTrue(suggestComponent._suggestMarkedKey === null);
      });

      it('Suggest::searchDelay on tabChange', function() {
         var suggestComponent = new suggestMod._InputController();
         suggestComponent.activate = function() {};

         suggestComponent._tabsSelectedKeyChanged('test');
         assert.equal(suggestComponent._searchDelay, 0);
      });

      it('Suggest::_beforeMount', function() {
         let suggestComponent = new suggestMod._InputController();

         suggestComponent._beforeMount({
            searchParam: 'title',
            minSearchLength: 3,
            filter: {test: 5},
            value: '123'
         });

         assert.deepEqual(suggestComponent._filter, {
            test: 5,
            title: '123'
         });
      });

      it('Suggest::_beforeUpdate', function() {
         var options = {
            emptyTemplate: 'anyTpl',
            footerTemplate: 'anyTp',
            suggestState: true,
            value: '',
            trim: true,
            searchParam: 'testSearchParam',
            minSearchLength: 3
         };
         suggestMod._InputController._private.loadDependencies = function() {return Deferred.success(true)};
         var suggestComponent = new suggestMod._InputController(options);
         var sandbox = sinon.createSandbox();
         var dependenciesDeferred = {
            isReady: function() {
               return true;
            }
         };

         suggestComponent.saveOptions(options);
         suggestComponent._loading = true;
         suggestComponent._showContent = true;
         suggestComponent._dependenciesDeferred = dependenciesDeferred;
         suggestComponent._inputActive = true;
         suggestComponent._suggestMarkedKey = 'test';

         suggestComponent._beforeUpdate({suggestState: false, emptyTemplate: 'anotherTpl', footerTemplate: 'anotherTpl',  value: 'te'});
         assert.isFalse(suggestComponent._showContent, null);
         assert.equal(suggestComponent._loading, null);
         assert.deepEqual(suggestComponent._dependenciesDeferred, dependenciesDeferred);
         assert.equal(suggestComponent._searchValue, '');
         assert.equal(suggestComponent._filter, null);
         assert.equal(suggestComponent._suggestMarkedKey, null);

         suggestComponent._beforeUpdate({suggestState: false, emptyTemplate: 'anotherTpl', footerTemplate: 'anotherTpl', value: '   '});
         assert.equal(suggestComponent._filter, null);
         assert.equal(suggestComponent._searchValue, '');

         suggestComponent._beforeUpdate({suggestState: false, emptyTemplate: 'anotherTpl', footerTemplate: 'anotherTpl', value: 'test', searchParam: 'testSearchParam'});
         assert.deepEqual(suggestComponent._filter, {testSearchParam: 'test'});
         assert.equal(suggestComponent._searchValue, 'test');

         sandbox.stub(suggestComponent, '_notify');

         suggestComponent._options.suggestState = true;
         suggestComponent._options.value = 'test';
         suggestComponent._beforeUpdate({suggestState: true, emptyTemplate: 'anotherTpl', footerTemplate: 'anotherTpl', value: ''});
         assert.equal(suggestComponent._searchValue, '');
         assert.deepEqual(suggestComponent._dependenciesDeferred, dependenciesDeferred);
         sinon.assert.calledWith(suggestComponent._notify, 'suggestStateChanged', [false]);

         suggestComponent._searchValue = 'test';
         suggestComponent._beforeUpdate({suggestState: false, emptyTemplate: 'anotherTpl', footerTemplate: 'anotherTpl', value: '', searchParam: 'testSearchParam'});
         assert.deepEqual(suggestComponent._filter, {testSearchParam: ''});
         assert.equal(suggestComponent._searchValue, '');
         sinon.assert.calledOnce(suggestComponent._notify);

         suggestComponent._options.suggestState = false;
         suggestComponent._options.value = '';
         suggestComponent._beforeUpdate({suggestState: false, value: 'test'});
         assert.equal(suggestComponent._searchValue, 'test');
         sinon.assert.calledOnce(suggestComponent._notify);

         suggestComponent._options.validationStatus = 'valid';
         suggestComponent._beforeUpdate({suggestState: true, value: '', validationStatus: 'invalid'});
         assert.isNull(suggestComponent._loading, 'load started with validationStatus: "invalid"');

         suggestComponent._options.validationStatus = 'invalid';
         suggestComponent._options.suggestState = true;
         suggestComponent._loading = true;
         suggestComponent._beforeUpdate({suggestState: true, value: '', validationStatus: 'invalid'});
         assert.isTrue(suggestComponent._loading);

         sandbox.restore();
      });

      it('Suggest::_updateSuggestState', function() {
         var compObj = getComponentObject();
         compObj._options.fitler = {};
         compObj._options.searchParam = 'testSearchParam';
         compObj._options.minSearchLength = 3;
         compObj._options.historyId = 'historyField';


         var suggestComponent = new suggestMod._InputController();

         suggestComponent.saveOptions(compObj._options);
         suggestComponent._searchValue = 'te';
         suggestComponent._historyKeys = [1, 2];
         suggestComponent._inputActive = true;

         compObj._options.autoDropDown = true;
         //compObj._options.suggestState = true;
         suggestMod._InputController._private.updateSuggestState(suggestComponent);
         assert.deepEqual(suggestComponent._filter, {testSearchParam: 'te', historyKeys: suggestComponent._historyKeys});

         suggestComponent._searchValue = 'test';
         suggestMod._InputController._private.updateSuggestState(suggestComponent);
         assert.deepEqual(suggestComponent._filter, {testSearchParam: 'test'});

         compObj._options.autoDropDown = false;
         compObj._options.minSearchLength = 10;
         suggestComponent._filter = {};
         suggestMod._InputController._private.updateSuggestState(suggestComponent);
         assert.deepEqual(suggestComponent._filter, {});
      });

      it('Suggest::_missSpellClick', function() {
         var
            value,
            suggestComponent = new suggestMod._InputController();

         suggestComponent.activate = function() {
            suggestComponent._inputActive = true;
         }
         suggestComponent._notify = function(event, val) {
            if (event === 'valueChanged') {
               value = val[0];
            }
         };
         suggestComponent._options.minSearchLength = 3;
         suggestComponent._misspellingCaption = 'test';
         suggestComponent._missSpellClick();

         assert.equal(value, 'test');
         assert.equal(suggestComponent._misspellingCaption, '');
         assert.equal(suggestComponent._searchValue, 'test');
         assert.isTrue(suggestComponent._inputActive);
      });

      it('Suggest::_private.setMissSpellingCaption', function() {
         var self = {};

         suggestMod._InputController._private.setMissSpellingCaption(self, 'test');
         assert.equal(self._misspellingCaption, 'test');
      });

      it('Suggest::_select', function() {
         var
            item = {
               _isUpdateHistory: false
            },
            suggestComponent = new suggestMod._InputController();

         suggestComponent._select(item);
         assert.isFalse(item._isUpdateHistory);
         suggestComponent._options.historyId = 'testFieldHistoryId';
         suggestComponent._select(item);
         assert.isTrue(item._isUpdateHistory);
      });

      it('Suggest::_markedKeyChangedHandler', function() {
         var suggestComponent = new suggestMod._InputController();
         suggestComponent._markedKeyChangedHandler(null, 'test');
         assert.equal(suggestComponent._suggestMarkedKey, 'test');

         suggestComponent._markedKeyChangedHandler(null, 'test2');
         assert.equal(suggestComponent._suggestMarkedKey, 'test2');
      });


      it('Suggest::_keyDown', function() {
         var suggestComponent = new suggestMod._InputController();
         var eventPreventDefault = false;
         var eventStopPropagation = false;
         var suggestStateChanged = false;
         var eventTriggered = false;
         var suggestActivated = false;
         suggestComponent._children = {
            inputKeydown: {
               start: function() {
                  eventTriggered = true;
               }
            }
         };

         suggestComponent._notify = (event) => {
            if (event === 'suggestStateChanged') {
               suggestStateChanged = true;
            }
         };

         suggestComponent.activate = function() {
            suggestActivated = true;
         };

         function getEvent(keyCode) {
            return {
               nativeEvent: {
                  keyCode: keyCode
               },
               preventDefault: () => {
                  eventPreventDefault = true;
               },
               stopPropagation: () => {
                  eventStopPropagation = true;
               }
            };
         }
         suggestComponent._keydown(getEvent(Env.constants.key.down));
         assert.isFalse(eventPreventDefault);
         assert.isFalse(eventStopPropagation);
         assert.isFalse(suggestActivated);

         suggestComponent._options.suggestState = true;

         suggestComponent._keydown(getEvent(Env.constants.key.down));
         assert.isTrue(eventPreventDefault);
         assert.isTrue(eventStopPropagation);
         assert.isTrue(suggestActivated);
         eventPreventDefault = false;
         suggestActivated = false;

         suggestComponent._keydown(getEvent(Env.constants.key.up));
         assert.isTrue(eventPreventDefault);
         assert.isTrue(suggestActivated);
         eventPreventDefault = false;
         suggestActivated = false;

         suggestComponent._keydown(getEvent(Env.constants.key.enter));
         assert.isFalse(eventPreventDefault);
         assert.isFalse(suggestActivated);
         eventPreventDefault = false;

         suggestComponent._suggestMarkedKey = 'test';
         suggestComponent._keydown(getEvent(Env.constants.key.enter));
         assert.isTrue(eventPreventDefault);
         assert.isTrue(suggestActivated);

         eventPreventDefault = false;
         suggestActivated = false;
         suggestComponent._keydown(getEvent('test'));
         assert.isFalse(eventPreventDefault);
         assert.isTrue(eventTriggered);
         assert.isFalse(suggestActivated);

         eventPreventDefault = false;
         suggestComponent._keydown(getEvent(Env.constants.key.esc));
         assert.isTrue(suggestStateChanged);
         assert.isFalse(suggestActivated);
      });

      it('Suggest::_private.openWithHistory', function () {
         var suggestComponent = new suggestMod._InputController();

         suggestComponent._filter = {};
         suggestComponent._historyKeys = [7, 8];
         suggestComponent._searchValue = '';
         suggestComponent._options.minSearchLength = 3;
         suggestComponent._options.searchParam = 'search';
         suggestMod._InputController._private.openWithHistory(suggestComponent);
         assert.deepEqual(suggestComponent._filter, {search: '', historyKeys: [7, 8]});
      });

      it('Suggest::_private.getRecentKeys', function() {
         let self = {};
         suggestMod._InputController._private.getHistoryService = function() {
            let hService = { query: () => { return new Deferred.fail(new Error('History Service')); } };
            return new Deferred.success(hService);
         };
         return new Promise(function(resolve) {
            getRecentKeys(self).addCallback(function(keys) {
               assert.deepEqual([], keys);
               resolve();
            });
         });
      });

      it('Suggest::_inputClicked', function() {
         var suggestComponent = new suggestMod._InputController();

         suggestComponent._inputClicked();
         assert.isTrue(suggestComponent._inputActive);
      });


      it('Suggest::_private.isEmptyData', function() {
         assert.isTrue(!!suggestMod._InputController._private.isEmptyData(getSearchResult(undefined, 0)));
         assert.isFalse(!!suggestMod._InputController._private.isEmptyData(getSearchResult(undefined, 1)));
      });

      it('Suggest::_private.closePopup', function() {
         let
            isClosePopup = false,
            suggestComponent = new suggestMod._InputController();

         suggestComponent._children.layerOpener = {
            close: function() {
               isClosePopup = true;
            }
         }

         suggestMod._InputController._private.closePopup(suggestComponent);
         assert.isTrue(isClosePopup);
      });
   });
});
