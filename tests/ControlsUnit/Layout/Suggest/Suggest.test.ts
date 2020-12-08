import {_InputController} from 'Controls/suggest';
import Deferred = require('Core/Deferred');
import {assert} from 'chai';
import {SyntheticEvent} from 'UI/Vdom';
import {List, RecordSet} from 'Types/collection';
import {constants} from 'Env/Env';
import {load} from 'Core/library';
import {Stack} from 'Controls/popup';
import {Model} from 'Types/entity';
import * as sinon from 'sinon';
import {Memory} from 'Types/source';
import {Controller as SearchController, SearchResolver as SearchResolverController} from 'Controls/searchNew';
import {NewSourceController as SourceController} from 'Controls/dataSource';
import {PrefetchProxy} from 'Types/source';

describe('Controls/suggest', () => {

   describe('Controls.Container.Suggest.Layout', () => {
      const IDENTIFICATORS = [1, 2, 3];

      const getMemorySource = (): Memory => {
         return new Memory({
            data: [{id: 1}, {id: 2}, {id: 3}]
         });
      };

      const getComponentObject = (customOptions: object = {}) => {
         const controller = new _InputController({});
         const options = {
            source: getMemorySource(),
            suggestTemplate: {},
            footerTemplate: {}
         };
         controller.saveOptions({...options, ...customOptions});
         return controller;
      };

      const getContainer = (size) => {
         return {
            getBoundingClientRect: () => {
               return {
                  toJSON: () => {
                     return size;
                  }
               };
            }
         };
      };

      const getDropDownContainer = (height) => {
         return {
            getBoundingClientRect: () => {
               return {
                  bottom: 0,
                  top: 0,
                  height
               };
            }
         };
      };

      const getRecentKeys = (component: _InputController) => component._getRecentKeys();

      _InputController._getRecentKeys = () => {
         return Deferred.success(IDENTIFICATORS);
      };

      const getHistorySource = (component: _InputController) => component._getHistoryService();

      _InputController._getHistoryService = () => {
         return {
            addCallback(func) {
               func({
                  update(item) {
                     item._isUpdateHistory = true;
                  }
               });
            }
         };
      };

      it('Suggest::_getHistoryService', (done) => {
         const controller = getComponentObject({
            historyId: 'TEST_HISTORY_ID_GET_SOURCE'
         });
         getHistorySource(controller).addCallback((historyService) => {
            assert.equal(12, historyService._$recent);
            assert.equal('TEST_HISTORY_ID_GET_SOURCE', historyService._$historyId);
            done();
         });
      });

      it('Suggest::_suggestStateNotify', () => {
         const inputContainer = getComponentObject({
            suggestState: true
         });
         let stateNotifyed = false;
         inputContainer._notify = (eventName, args) => {
            stateNotifyed = true;
         };
         inputContainer._forceUpdate = () => {};
         inputContainer._suggestStateNotify( true);
         assert.isFalse(stateNotifyed);

         inputContainer._suggestStateNotify(false);
         assert.isTrue(stateNotifyed);
      });

      it('Suggest::close', () => {
         let state;
         let isReady = true;
         let isCallCancel = false;
         let isSourceControllerNulled = false;
         let isTimerCleared = false;

         const inputContainer = getComponentObject({
            suggestState: true
         });
         inputContainer._sourceController = {
            destroy: () => isSourceControllerNulled = true
         };
         inputContainer._searchResolverController = {
            clearTimer: () => isTimerCleared = true
         };

         inputContainer._notify = (eventName, args) => {
            state = args[0];
         };
         inputContainer._dependenciesDeferred = {
            isReady: () => isReady,
            cancel: () => { isCallCancel = true; }
         };
         inputContainer.closeSuggest();
         assert.isFalse(state);
         assert.isFalse(isCallCancel);

         assert.isTrue(isSourceControllerNulled);
         assert.isTrue(isTimerCleared);
         assert.isNull(inputContainer._sourceController);
         assert.isNull(inputContainer._searchResult);

         isReady = false;
         inputContainer.closeSuggest();
         assert.isTrue(isCallCancel);
         assert.equal(inputContainer._dependenciesDeferred, null);
      });

      it('Suggest::_closeHandler', () => {
         const suggestComponent = getComponentObject();
         let propagationStopped = false;
         const event = {
            stopPropagation: () => {
               propagationStopped = true;
            }
         };
         suggestComponent._loading = true;
         suggestComponent._showContent = true;

         suggestComponent._closeHandler(event);
         assert.isTrue(propagationStopped);
         assert.equal(suggestComponent._loading, null);
         assert.equal(suggestComponent._showContent, false);
      });

      it('Suggest::_open', (done) => {
         const inputContainer = getComponentObject({
            suggestState: false
         });
         let state;

         inputContainer._inputActive = true;
         inputContainer._notify = (eventName, args) => {
            state = args[0];
         };
         inputContainer._forceUpdate = () => {};
         inputContainer._open();
         inputContainer._dependenciesDeferred.addCallback(() => {
            assert.isTrue(state);

            state = false;
            inputContainer._options.suggestState = false;
            inputContainer._open();
            inputContainer._inputActive = false;
            inputContainer._dependenciesDeferred.addCallback(() => {
               assert.isFalse(state);
               done();
            });
         });
      });

      it('Suggest::_shouldShowSuggest', () => {
         const inputContainer = getComponentObject();
         inputContainer._inputActive = true;
         const result = new List({items: [1, 2, 3]});
         const emptyResult = new List();

         // case 1. emptyTemplate - is null/undefined, searchValue - is empty string/null
         assert.isTrue(!!inputContainer._shouldShowSuggest(result));
         assert.isFalse(!!inputContainer._shouldShowSuggest(emptyResult));

         // case 2. emptyTemplate is set, searchValue - is empty string/null
         inputContainer._options.emptyTemplate = {};
         assert.isTrue(!!inputContainer._shouldShowSuggest(result));
         assert.isTrue(!!inputContainer._shouldShowSuggest(emptyResult));

         // case 3. emptyTemplate is set, searchValue - is set
         inputContainer._searchValue = 'test';
         assert.isTrue(!!inputContainer._shouldShowSuggest(result));
         assert.isTrue(!!inputContainer._shouldShowSuggest(emptyResult));

         // case 4. emptyTemplate is set, search - is empty string, historyId is set
         inputContainer._searchValue = '';
         inputContainer._options.historyId = '123';
         assert.isFalse(!!inputContainer._shouldShowSuggest(emptyResult));
         assert.isTrue(!!inputContainer._shouldShowSuggest(result));

         // emptyTemplate is set, search - is set, historyId is set
         inputContainer._searchValue = '123';
         inputContainer._options.historyId = '123';
         assert.isTrue(!!inputContainer._shouldShowSuggest(emptyResult));
         assert.isTrue(!!inputContainer._shouldShowSuggest(result));

         inputContainer._tabsSelectedKey = 'testTab';
         inputContainer._searchValue = '';
         assert.isTrue(!!inputContainer._shouldShowSuggest(emptyResult));
         assert.isTrue(!!inputContainer._shouldShowSuggest(result));

         // case 6. emptyTemplate is null/undefined, search - is empty string, historyId is set
         inputContainer._options.emptyTemplate = null;
         assert.isFalse(!!inputContainer._shouldShowSuggest(emptyResult));
         assert.isTrue(!!inputContainer._shouldShowSuggest(result));
      });

      it('_suggestDirectionChangedCallback', () => {
         const inputController = getComponentObject();

         inputController._suggestOpened = false;
         inputController._suggestDirectionChangedCallback('up');
         assert.isNull(inputController._suggestDirection);
      });

      it('Suggest::_prepareFilter', () => {
         const inputContainer = getComponentObject();
         const resultFilter = {
            currentTab: 1,
            searchParam: 'test',
            filterTest: 'filterTest'
         };

         let filter = inputContainer._prepareFilter({filterTest: 'filterTest'}, 'searchParam',
            'test', 3, 1, [1, 2]);
         assert.deepEqual(filter, resultFilter);

         const newFilter = {...resultFilter, ...{historyKeys: [1, 2]}};
         filter = inputContainer._prepareFilter({filterTest: 'filterTest'}, 'searchParam',
            'test', 20, 1, [1, 2]);
         assert.deepEqual(filter, newFilter);
      });

      it('Suggest::_setFilter', () => {
         const inputContainer = getComponentObject();
         inputContainer._options.searchParam = 'searchParam';
         inputContainer._searchValue = 'test';
         inputContainer._tabsSelectedKey = 1;
         const filter = {
            test: 'test'
         };
         const resultFilter = {
            searchParam: 'test',
            test: 'test',
            currentTab: 1
         };
         inputContainer._setFilter(filter, inputContainer._options);
         assert.deepEqual(inputContainer._filter, resultFilter);
         // TODO: Нужен кейс на sourceController().setFilter?
      });

      it('Suggest::_loadStart', () => {
         const inputContainer = getComponentObject();
         let isCallShowIndicator = false;
         let isCallHideIndicator = false;
         let errorFired = false;

         inputContainer._children.indicator = {
            show: () => isCallShowIndicator = true,
            hide: () => isCallHideIndicator = true
         };

         inputContainer._loadStart();
         assert.isTrue(inputContainer._loading);
         assert.isTrue(isCallShowIndicator);
         assert.isTrue(isCallHideIndicator);

         inputContainer._children = {};
         try {
            inputContainer._loadStart();
         } catch (e) {
            errorFired = true;
         }
         assert.isFalse(errorFired);
      });

      it('Suggest::_loadEnd', () => {
         const options = {
            searchDelay: 300,
            suggestState: true
         };
         const inputContainer = new _InputController({});
         let errorFired = false;

         inputContainer._loading = null;
         inputContainer.saveOptions(options);
         inputContainer._children = {};

         try {
            inputContainer._loadEnd();
         } catch (e) {
            errorFired = true;
         }

         assert.isFalse(errorFired);
         assert.equal(inputContainer._loading, null);

         inputContainer._loading = true;
         inputContainer._loadEnd();
         assert.equal(inputContainer._loading, null);

         inputContainer._loading = true;
         inputContainer._loadEnd(
            new RecordSet({items: [1]})
         );
         assert.isNotTrue(inputContainer._loading);

         inputContainer._destroyed = false;
         inputContainer._showContent = true;
         inputContainer._loadEnd(null);
         assert.isFalse(inputContainer._showContent);
      });

      it('Suggest::_searchErrback', () => {
         const inputContainer = getComponentObject();
         let isIndicatorVisible = true;
         inputContainer._forceUpdate = () => {};
         inputContainer._children = {};
         inputContainer._children.indicator = {
            hide: () => {
               isIndicatorVisible = false;
            }
         };

         inputContainer._loading = null;
         inputContainer._searchErrback({canceled: true});
         assert.isTrue(inputContainer._loading === null);

         inputContainer._loading = true;
         inputContainer._searchErrback({canceled: true});
         assert.isFalse(inputContainer._loading);

         inputContainer._loading = true;
         inputContainer._searchErrback({canceled: false});
         assert.isFalse(isIndicatorVisible);
         assert.isFalse(inputContainer._loading);
      });

      it('Suggest::_searchErrback without children', () => {
         const inputContainer = getComponentObject();
         inputContainer._children = {};

         inputContainer._loading = true;
         inputContainer._searchErrback({canceled: false});
         assert.isFalse(inputContainer._loading);
      });

      it('Suggest::searchErrback', () => {
         const suggest = new _InputController({});
         suggest._loading = true;
         suggest._searchErrback({canceled: true});
         assert.isFalse(suggest._loading);
      });

      it('Suggest::check footer template', () => {
         let footerTpl;
         const compat = constants.compat;
         constants.compat = true;

         return load('Controls/suggestPopup').then((result) => {
            footerTpl = result.FooterTemplate;
            assert.equal(footerTpl(), '<div class="controls-Suggest__footer"></div>');
            assert.equal(footerTpl({
               showMoreButtonTemplate: 'testShowMore'
            }), '<div class="controls-Suggest__footer">testShowMore</div>');
            assert.equal(footerTpl({
               showMoreButtonTemplate: 'testShowMore',
               showSelectorButtonTemplate: 'testShowSelector'
            }), '<div class="controls-Suggest__footer">testShowMoretestShowSelector</div>');
         }).finally(() => {
            constants.compat = compat;
         });
      });

      it('Suggest::_showAllClick', () => {
         const suggest = getComponentObject();
         let stackOpened = false;
         const eventResult = false;
         let openCfg;

         suggest._notify = (event, options) => {
            openCfg = options;
            return eventResult;
         };
         suggest._showContent = true;
         Stack.openPopup = () => {
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

      it('Suggest::_moreClick', () => {
         let isNotifyShowSelector = false;
         const suggest = getComponentObject();

         Stack.openPopup = () => {};

         suggest._options.suggestTemplate = {
            templateName: 'test',
            templateOptions: {}
         };

         suggest._notify = (eventName, data) => {
            if (eventName === 'showSelector') {
               isNotifyShowSelector = true;
               assert.deepEqual(data[0].templateOptions.filter, suggest._filter);
            }
         };
         suggest._filter = {};
         suggest._moreClick();
         assert.isTrue(isNotifyShowSelector);
      });

      it('Suggest::_inputActivated - request should call once', async () => {
         const sandbox = sinon.createSandbox();
         const inputContainer = getComponentObject({
            searchParam: 'searchParam',
            autoDropDown: true,
            minSearchLength: 3,
            historyId: 'testFieldHistoryId',
            keyProperty: 'Identificator',
            source: getMemorySource()
         });
         if (!document) {
            sandbox.stub(inputContainer, '_getActiveElement').callsFake(() => ({
               classList: {
                  contains: () => false
               }
            }));
         }
         inputContainer._getRecentKeys = () => {
            return Promise.resolve(null);
         };
         const loadSpy = sandbox.stub(inputContainer, '_loadHistoryKeys').callsFake(() => {
            inputContainer._historyLoad = new Deferred();
            return Promise.resolve();
         });
         inputContainer._inputActive = true;

         inputContainer._inputActivated();
         await inputContainer._inputActivated();

         assert.isTrue(loadSpy.calledOnce);

         inputContainer._sourceController.cancelLoading();
         inputContainer._historyLoad = Deferred.success('testResult');
         await inputContainer._inputActivated();

         assert.isTrue(loadSpy.calledThrice);

         sandbox.restore();
      });

      it('Suggest::_inputActivated/_inputClicked with autoDropDown', () => {
         const inputContainer = getComponentObject({
            searchParam: 'searchParam',
            autoDropDown: true,
            minSearchLength: 3,
            readOnly: true,
            historyId: 'testFieldHistoryId',
            keyProperty: 'Identificator',
            source: getMemorySource(),
            emptyTemplate: 'test'
         });
         let suggestState = false;
         const event = {
            stopPropagation: () => {}
         };

         const stub = sinon.stub(inputContainer._getSourceController(), 'getItems').callsFake(() => ({
            getCount: () => 1
         }));

         if (!document) {
            inputContainer._getActiveElement = () => {
               return {
                  classList: {
                     contains: () => {
                        return false;
                     }
                  }
               };
            };
         }

         inputContainer._setFilter({}, inputContainer._options);
         inputContainer._notify = (event, val) => {
            if (event === 'suggestStateChanged') {
               suggestState = val[0] as boolean;
            }
         };

         inputContainer._getRecentKeys = () => {
            return Deferred.success(IDENTIFICATORS);
         };

         return inputContainer._inputActivatedHandler().then(() => {
            inputContainer._options.readOnly = false;
         }).then(() => {
            inputContainer._inputActivatedHandler().then(() => {
               inputContainer._dependenciesDeferred.addCallback(() => {
                  assert.isTrue(suggestState);
                  assert.deepEqual(inputContainer._filter.historyKeys, IDENTIFICATORS);

                  inputContainer._changeValueHandler(null, '');
                  assert.isTrue(suggestState);
                  assert.equal(inputContainer._searchValue, '');

                  inputContainer._close(event);
                  inputContainer._filter = {};
                  inputContainer._inputClicked().then(() => {
                     inputContainer._dependenciesDeferred.addCallback(() => {
                        assert.isTrue(suggestState);
                        assert.deepEqual(inputContainer._filter.historyKeys, IDENTIFICATORS);

                        inputContainer._close(event);
                        inputContainer._options.readOnly = true;
                        inputContainer._inputActivatedHandler().then(() => {
                           inputContainer._dependenciesDeferred.addCallback(() => {
                              assert.isFalse(suggestState);

                              inputContainer._inputClicked().then(() => {
                                 inputContainer._dependenciesDeferred.addCallback(() => {
                                    assert.isFalse(suggestState);

                                    inputContainer._options.historyId = '';
                                    inputContainer._filter = {};
                                    inputContainer._options.readOnly = false;

                                    inputContainer._inputActivatedHandler().then(() => {
                                       inputContainer._dependenciesDeferred.addCallback(() => {
                                          assert.isTrue(suggestState);
                                          assert.deepEqual(inputContainer._filter, {searchParam: ''});

                                          inputContainer._options.suggestState = true;
                                          inputContainer._filter = {};
                                          inputContainer._inputActivatedHandler().then(() => {
                                             inputContainer._dependenciesDeferred.addCallback(() => {
                                                assert.deepEqual(inputContainer._filter, {});

                                                suggestState = false;
                                                inputContainer._options.suggestState = false;
                                                inputContainer._options.validationStatus = 'invalid';
                                                inputContainer._inputActivatedHandler().then(() => {
                                                   assert.isFalse(suggestState, 'suggest opened on activated with validationStatus: "invalid"');

                                                   inputContainer._options.autoDropDown = false;
                                                   inputContainer._options.validationStatus = 'valid';
                                                   inputContainer._options.historyId = 'test';

                                                   const sandBox = sinon.createSandbox();
                                                   sandBox.replace(inputContainer, '_getRecentKeys', () => {
                                                      inputContainer._historyLoad = Promise.resolve(['test']);
                                                      return inputContainer._historyLoad;
                                                   });

                                                   inputContainer._inputActivatedHandler().then(() => {
                                                      sandBox.restore();
                                                      inputContainer._historyLoad.addCallback(() => {
                                                         assert.isTrue(suggestState);

                                                         stub.restore();

                                                         Promise.resolve();
                                                      });
                                                   });
                                                });
                                             });
                                          });
                                       });
                                    });
                                 });
                              });
                           });
                        });
                     });
                  });
               });
            });
         });
      });

      describe('Suggest::_resolveLoad', () => {
         const sandbox = sinon.createSandbox();
         let inputContainer;
         let searchCallbackSpy;
         let loadEndSpy;
         let dataLoadCallbackSpy;
         const setItemsSpy = sandbox.spy(SourceController.prototype, 'setItems');

         const recordSet = new RecordSet({
            rawData: [{id: 1}, {id: 2}, {id: 3}],
            keyProperty: 'id'
         });

         beforeEach(() => {
            inputContainer = getComponentObject({
               searchStartCallback: () => {},
               searchParam: 'testtt',
               dataLoadCallback: () => {}
            });
            searchCallbackSpy = sandbox.spy(inputContainer._options, 'searchStartCallback');
            dataLoadCallbackSpy = sandbox.spy(inputContainer._options, 'dataLoadCallback');
            loadEndSpy = sandbox.spy(inputContainer, '_loadEnd');
         });
         afterEach(() => sandbox.reset());

         after(() => sandbox.restore());

         it('value is not specified', async () => {
            inputContainer._inputActive = true;
            sandbox.stub(SourceController.prototype, 'load')
               .callsFake(() => Promise.resolve(recordSet));
            const result = await inputContainer._resolveLoad();

            assert.isTrue(searchCallbackSpy.calledOnce);
            assert.equal(recordSet, result);
            assert.isTrue(dataLoadCallbackSpy.withArgs(recordSet).calledOnce);
            assert.isTrue(setItemsSpy.withArgs(recordSet).calledOnce);
            assert.isTrue(loadEndSpy.calledOnce);
         });

         it('value is specified', async () => {
            const value = 'test1';
            inputContainer._inputActive = true;
            sandbox.stub(SearchController.prototype, 'search')
               .callsFake(() => Promise.resolve(recordSet));

            const result = await inputContainer._resolveLoad(value);

            assert.isTrue(searchCallbackSpy.calledOnce);

            assert.equal(inputContainer._searchValue, value);
            assert.equal(recordSet, result);
            assert.isTrue(dataLoadCallbackSpy.withArgs(recordSet).calledOnce);
            assert.isTrue(setItemsSpy.withArgs(recordSet).calledOnce);
            assert.deepEqual(inputContainer._filter, {testtt: 'test1'});
            assert.equal(inputContainer._markerVisibility, 'visible');
            assert.isTrue(loadEndSpy.calledOnce);
         });
      });

      it('Suggest::_resolveSearch', async () => {
         const inputContainer = getComponentObject({
            searchDelay: 300,
            minSearchLength: 3
         });

         const resolverSpy = sinon.spy(SearchResolverController.prototype, 'resolve');

         await inputContainer._resolveSearch('test');

         assert.instanceOf(inputContainer._searchResolverController, SearchResolverController);
         assert.isTrue(resolverSpy.calledWith('test'));

         resolverSpy.restore();
      });

      describe('Suggest::_searchResetCallback', async () => {
         const recordSet = new RecordSet({
            rawData: [{id: 1}, {id: 2}, {id: 3}],
            keyProperty: 'id'
         });
         const sandbox = sinon.createSandbox();
         let inputContainer;
         let getSearchControllerStub;
         let setItemsSpy;

         beforeEach(() => {
            inputContainer = getComponentObject();
            getSearchControllerStub = sandbox.stub(inputContainer, '_getSearchController').callsFake(() => ({
               reset: () => Promise.resolve(recordSet)
            }));
            setItemsSpy = sandbox.stub(inputContainer, '_setItems');
         });

         afterEach(() => sandbox.reset());

         after(() => sandbox.restore());

         it('openWithHistory case :: suggest should stay opened', async () => {
            sandbox.stub(inputContainer, '_openWithHistory');
            sandbox.stub(inputContainer, '_shouldSearch').callsFake(() => false);

            inputContainer._options.historyId = 'historyField';
            inputContainer._options.suggestState = false;
            inputContainer._options.autoDropDown = false;
            await inputContainer._searchResetCallback();

            assert.isTrue(setItemsSpy.withArgs(recordSet).calledOnce);
         });

         it('default case with autoDropDown :: suggest should stay opened', async () => {
            sandbox.stub(inputContainer, '_shouldSearch').callsFake(() => true);
            sandbox.stub(inputContainer, '_open');
            sandbox.stub(inputContainer, '_setFilter');

            inputContainer._options.historyId = 'historyField';
            inputContainer._options.suggestState = false;
            inputContainer._options.autoDropDown = true;
            await inputContainer._searchResetCallback();

            assert.isTrue(setItemsSpy.withArgs(recordSet).calledOnce);
         });

         it('only autoDropDown :: suggest should stay opened', async () => {
            sandbox.stub(inputContainer, '_shouldSearch').callsFake(() => true);

            inputContainer._options.historyId = undefined;
            inputContainer._options.autoDropDown = true;
            await inputContainer._searchResetCallback();

            assert.isTrue(setItemsSpy.withArgs(recordSet).calledOnce);
         });

         it('autoDropDown is False :: suggest should close, setItems not called', async () => {
            sandbox.stub(inputContainer, '_shouldSearch').callsFake(() => false);
            const closeSpy = sandbox.spy(inputContainer, '_close');

            inputContainer._options.historyId = undefined;
            inputContainer._options.autoDropDown = false;
            await inputContainer._searchResetCallback();

            assert.isFalse(setItemsSpy.called);
            assert.isTrue(closeSpy.calledOnce);
         });
      });

      it('Suggest::_loadDependencies', (done) => {
         const inputContainer = getComponentObject();
         const options = {
            footerTemplate: 'test',
            suggestTemplate: 'test',
            emptyTemplate: 'test'
         };
         inputContainer._loadDependencies(options).addCallback(() => {
            assert.isTrue(inputContainer._dependenciesDeferred.isReady());
         });

         const dep = inputContainer._dependenciesDeferred;
         inputContainer._getTemplatesToLoad = () => [];
         inputContainer._loadDependencies(options).addCallback(() => {
            assert.deepEqual(inputContainer._dependenciesDeferred, dep);
            done();
         });
      });

      it('Suggest::_processResultData', () => {
         const navigation = {
            source: 'page',
            view: 'page',
            sourceConfig: {
               pageSize: 2,
               page: 0,
               hasMore: false
            }
         };

         const inputContainer = getComponentObject({
            navigation,
            source: getMemorySource()
         });
         const queryRecordSet = new RecordSet({
            rawData: [{id: 1}, {id: 2}, {id: 3}],
            keyProperty: 'id'
         });

         inputContainer._notify = () => {};
         inputContainer._searchValue = 'notEmpty';
         inputContainer._inputActive = true;

         queryRecordSet.setMetaData({
            results: new Model({
               rawData: {
                  tabsSelectedKey: 'testId',
                  switchedStr: 'testStr'
               }
            }),
            more: 10
         });

         inputContainer._getSourceController().setItems(queryRecordSet);
         inputContainer._processResultData(queryRecordSet);

         assert.equal(inputContainer._searchResult, queryRecordSet);
         assert.equal(inputContainer._tabsSelectedKey, 'testId');
         assert.equal(inputContainer._misspellingCaption, 'testStr');
         assert.equal(inputContainer._moreCount, 7);

         const queryRecordSetEmpty = new RecordSet();
         queryRecordSetEmpty.setMetaData({
            results: new Model({
               rawData: {
                  tabsSelectedKey: 'testId2',
                  switchedStr: 'testStr2'
               }
            })
         });
         inputContainer._suggestMarkedKey = 'test';

         inputContainer._sourceController = null;
         inputContainer._getSourceController().setItems(queryRecordSetEmpty);

         inputContainer._processResultData(queryRecordSetEmpty);

         assert.equal(inputContainer._suggestMarkedKey, null);
         assert.notEqual(inputContainer._searchResult, queryRecordSet);
         assert.isNull(inputContainer._searchResult);
         assert.equal(inputContainer._tabsSelectedKey, 'testId2');
         assert.equal(inputContainer._misspellingCaption, null);
      });

      it('Suggest::_tabsSelectedKeyChanged', () => {
         const suggestComponent = getComponentObject({
            source: getMemorySource()
         });
         let suggestActivated = false;
         let updated = false;
         suggestComponent.activate = () => {
            suggestActivated = true;
         };
         suggestComponent._forceUpdate = () => {
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

      it('Suggest::_beforeMount', () => {
         const suggestComponent = getComponentObject();

         suggestComponent._beforeMount({
            searchParam: 'title',
            minSearchLength: 3,
            filter: {test: 5},
            value: '123',
            source: getMemorySource()
         });

         assert.deepEqual(suggestComponent._filter, {
            test: 5,
            title: '123'
         });
      });

      it('Suggest::_beforeUpdate', async () => {
         const suggestComponent = getComponentObject({
            emptyTemplate: 'anyTpl',
            footerTemplate: 'anyTp',
            suggestState: true,
            value: '',
            trim: true,
            searchParam: 'testSearchParam',
            minSearchLength: 3
         });
         suggestComponent._loadDependencies = () => Deferred.success(true);
         const sandbox = sinon.createSandbox();
         const dependenciesDeferred = {
            isReady: () => {
               return true;
            }
         };
         suggestComponent._loading = true;
         suggestComponent._showContent = true;
         suggestComponent._dependenciesDeferred = dependenciesDeferred;
         suggestComponent._inputActive = true;
         suggestComponent._suggestMarkedKey = 'test';

         suggestComponent._beforeUpdate({
            suggestState: false, emptyTemplate: 'anotherTpl',
            footerTemplate: 'anotherTpl',  value: 'te',
            source: getMemorySource()
         });
         assert.isFalse(suggestComponent._showContent, null);
         assert.equal(suggestComponent._loading, null);
         assert.deepEqual(suggestComponent._dependenciesDeferred, dependenciesDeferred);
         assert.equal(suggestComponent._searchValue, '');
         assert.equal(suggestComponent._filter, null);
         assert.equal(suggestComponent._suggestMarkedKey, null);

         suggestComponent._beforeUpdate({
            suggestState: false, emptyTemplate: 'anotherTpl',
            footerTemplate: 'anotherTpl', value: '   ',
            source: getMemorySource()
         });
         assert.equal(suggestComponent._filter, null);
         assert.equal(suggestComponent._searchValue, '');

         suggestComponent._beforeUpdate({
            suggestState: false, emptyTemplate: 'anotherTpl',
            footerTemplate: 'anotherTpl', value: 'test',
            searchParam: 'testSearchParam',
            minSearchLength: 3,
            source: getMemorySource()
         });
         assert.deepEqual(suggestComponent._filter, {testSearchParam: 'test'});
         assert.equal(suggestComponent._searchValue, 'test');

         const notifySpy = sandbox.spy(suggestComponent, '_notify');

         suggestComponent._options.suggestState = true;
         suggestComponent._options.value = 'test';
         suggestComponent._beforeUpdate({
            suggestState: true, emptyTemplate: 'anotherTpl',
            footerTemplate: 'anotherTpl', value: '',
            source: getMemorySource()
         });
         assert.equal(suggestComponent._searchValue, '');
         assert.deepEqual(suggestComponent._dependenciesDeferred, dependenciesDeferred);
         assert.isTrue(notifySpy.withArgs('suggestStateChanged', [false]).called);

         suggestComponent._searchValue = 'test';
         suggestComponent._beforeUpdate({
            suggestState: false, emptyTemplate: 'anotherTpl',
            footerTemplate: 'anotherTpl', value: '',
            searchParam: 'testSearchParam',
            source: getMemorySource()
         });
         assert.deepEqual(suggestComponent._filter, {testSearchParam: ''});
         assert.equal(suggestComponent._searchValue, '');
         sinon.assert.calledOnce(suggestComponent._notify);

         suggestComponent._options.suggestState = false;
         suggestComponent._options.value = '';
         suggestComponent._beforeUpdate({
            suggestState: false,
            value: 'test',
            minSearchLength: 3,
            source: getMemorySource()
         });
         assert.equal(suggestComponent._searchValue, 'test');
         sinon.assert.calledOnce(suggestComponent._notify);

         suggestComponent._options.validationStatus = 'valid';
         suggestComponent._beforeUpdate({
            suggestState: true,
            value: '',
            validationStatus: 'invalid',
            source: getMemorySource()
         });
         assert.isNull(suggestComponent._loading, 'load started with validationStatus: "invalid"');

         suggestComponent._options.validationStatus = 'invalid';
         suggestComponent._options.suggestState = true;
         suggestComponent._loading = true;
         suggestComponent._beforeUpdate({
            suggestState: true,
            value: '',
            validationStatus: 'invalid',
            source: getMemorySource()
         });
         assert.isTrue(suggestComponent._loading);

         suggestComponent._options.value = '';
         suggestComponent._searchValue = '';
         suggestComponent._beforeUpdate({
            suggestState: false, value: null,
            source: getMemorySource()
         });
         assert.equal(suggestComponent._searchValue, '');

         suggestComponent._inputActive = false;
         suggestComponent._beforeUpdate({
            suggestState: false, emptyTemplate: 'anotherTpl',
            footerTemplate: 'anotherTpl', value: 'test',
            searchParam: 'testSearchParam',
            minSearchLength: 3,
            source: getMemorySource()
         });
         assert.deepEqual(suggestComponent._filter, {testSearchParam: 'test'});
         assert.equal(suggestComponent._searchValue, 'test');

         suggestComponent._dependenciesDeferred = dependenciesDeferred;
         suggestComponent._options.suggestState = false;
         suggestComponent._searchValue = 'testValue';
         suggestComponent._searchResult = undefined;

         const resolveLoadStub = sandbox.stub(suggestComponent, '_resolveLoad').callsFake(() => Promise.resolve());
         const newOptions = {
            suggestState: true,
            searchParam: 'testSearchParam',
            minSearchLength: 3,
            source: getMemorySource()
         };
         suggestComponent._beforeUpdate(newOptions);

         assert.isTrue(resolveLoadStub.withArgs('testValue', newOptions).calledOnce);

         suggestComponent._options.suggestState = true;
         suggestComponent._searchValue = '';
         suggestComponent._searchResult = undefined;
         suggestComponent._options.filter = {param: 'old_test'};
         suggestComponent._showContent = true;
         resolveLoadStub.reset();
         suggestComponent._beforeUpdate({
            suggestState: true,
            searchParam: 'testSearchParam',
            minSearchLength: 3,
            source: getMemorySource(),
            filter: {param: 'new_test'}
         });

         assert.isTrue(resolveLoadStub.calledOnce);

         sandbox.restore();
      });

      describe('_beforeUpdate hook', () => {
         it('source is empty on mount', () => {
            const options = {
               emptyTemplate: 'anyTpl',
               footerTemplate: 'anyTp',
               suggestState: true,
               value: '',
               trim: true,
               searchParam: 'testSearchParam',
               minSearchLength: 3,
               source: null
            };

            const inputController = getComponentObject(options);

            assert.ok(inputController._getSourceController().getState().source === null);

            options.source = new Memory();
            inputController._beforeUpdate(options);

            assert.ok(inputController._getSourceController().getState().source !== null);
         });
      });

      it('PrefetchProxy source should became to original source type', async () => {
         const inputContainer = getComponentObject({
            searchParam: 'testSearchParam',
            minSearchLength: 3,
            source: new PrefetchProxy({target: getMemorySource()})
         });

         inputContainer._getSourceController();

         assert.instanceOf(inputContainer._getSourceController().getState().source, Memory);
      });

      it('Suggest::_updateSuggestState', async () => {
         const inputContainer = getComponentObject({
            filter: {},
            searchParam: 'testSearchParam',
            minSearchLength: 3,
            historyId: 'historyField',
            emptyTemplate: 'test'
         });
         let suggestOpened = false;

         const stub = sinon.stub(inputContainer._getSourceController(), 'getItems').callsFake(() => ({
            getCount: () => 1
         }));

         inputContainer._searchValue = 'te';
         inputContainer._historyKeys = [1, 2];
         inputContainer._inputActive = true;

         inputContainer._options.autoDropDown = true;
         inputContainer._updateSuggestState();
         assert.deepEqual(inputContainer._filter, {
            testSearchParam: 'te', historyKeys: inputContainer._historyKeys
         });

         inputContainer._searchValue = 'test';
         inputContainer._updateSuggestState();
         assert.deepEqual(inputContainer._filter, {testSearchParam: 'test'});

         inputContainer._open = () => {
            suggestOpened = true;
         };
         inputContainer._options.autoDropDown = false;
         inputContainer._options.minSearchLength = 10;
         inputContainer._filter = {};
         inputContainer._updateSuggestState();
         assert.deepEqual(inputContainer._filter, {
            testSearchParam: 'test', historyKeys: inputContainer._historyKeys
         });
         assert.isTrue(suggestOpened);

         inputContainer._getRecentKeys = () => {
            return Promise.resolve(null);
         };

         suggestOpened = false;
         inputContainer._options.autoDropDown = false;
         inputContainer._historyKeys = null;
         inputContainer._filter = {};

         await inputContainer._updateSuggestState();
         assert.deepEqual(inputContainer._filter, {testSearchParam: 'test'});
         assert.isFalse(suggestOpened);

         stub.callsFake(() => ({
            getCount: () => 0
         }));
         suggestOpened = false;
         inputContainer._options.autoDropDown = true;
         inputContainer._options.historyId = null;
         inputContainer._filter = {};
         inputContainer._options.emptyTemplate = undefined;
         inputContainer._updateSuggestState();

         assert.deepEqual(inputContainer._filter, {});
         assert.isFalse(suggestOpened);

         stub.restore();
      });

      it('Suggest::_misspellClick', async () => {
         let value;
         const suggestComponent = getComponentObject();

         suggestComponent.activate = () => {
            suggestComponent._inputActive = true;
         };
         suggestComponent._notify = (event, val) => {
            if (event === 'valueChanged') {
               value = val[0];
            }
         };
         suggestComponent._options.minSearchLength = 3;
         suggestComponent._misspellingCaption = 'test';
         await suggestComponent._misspellClick();

         assert.equal(value, 'test');
         assert.equal(suggestComponent._misspellingCaption, '');
         assert.equal(suggestComponent._searchValue, 'test');
         assert.isTrue(suggestComponent._inputActive);
      });

      it('Suggest::_setMisspellingCaption', () => {
         const inputContainer = getComponentObject();

         inputContainer._setMisspellingCaption('test');
         assert.equal(inputContainer._misspellingCaption, 'test');
      });

      it('Suggest::_select', () => {
         const item = {
            _isUpdateHistory: false
         };
         const suggestComponent = getComponentObject();
         suggestComponent._getHistoryService = () => {
            return {
               addCallback(func) {
                  func({
                     update(item) {
                        item._isUpdateHistory = true;
                     }
                  });
               }
            };
         };

         suggestComponent._select(null, item);
         assert.isFalse(item._isUpdateHistory);
         suggestComponent._options.historyId = 'testFieldHistoryId';
         suggestComponent._select(null, item);
         assert.isTrue(item._isUpdateHistory);
      });

      it('Suggest::markedKeyChangedHandler', () => {
         const suggestComponent = getComponentObject();
         suggestComponent._markedKeyChangedHandler(null, 'test');
         assert.equal(suggestComponent._suggestMarkedKey, 'test');

         suggestComponent._markedKeyChangedHandler(null, 'test2');
         assert.equal(suggestComponent._suggestMarkedKey, 'test2');
      });

      it('Suggest::_keyDown', () => {
         const suggestComponent = getComponentObject();
         let eventPreventDefault = false;
         let eventStopPropagation = false;
         let suggestStateChanged = false;
         let eventTriggered = false;
         let suggestActivated = false;
         suggestComponent._children = {
            inputKeydown: {
               start: () => {
                  eventTriggered = true;
               }
            }
         };

         suggestComponent._notify = (event) => {
            if (event === 'suggestStateChanged') {
               suggestStateChanged = true;
            }
         };

         suggestComponent.activate = () => {
            suggestActivated = true;
         };

         function getEvent(keyCode: number): SyntheticEvent<KeyboardEvent> {
            return {
               nativeEvent: {
                  keyCode
               },
               preventDefault: () => {
                  eventPreventDefault = true;
               },
               stopPropagation: () => {
                  eventStopPropagation = true;
               }
            };
         }
         suggestComponent._keydown(getEvent(constants.key.down));
         assert.isFalse(eventPreventDefault);
         assert.isFalse(eventStopPropagation);
         assert.isFalse(suggestActivated);

         suggestComponent._options.suggestState = true;

         suggestComponent._keydown(getEvent(constants.key.down));
         assert.isTrue(eventPreventDefault);
         assert.isTrue(eventStopPropagation);
         assert.isTrue(suggestActivated);
         eventPreventDefault = false;
         suggestActivated = false;

         suggestComponent._keydown(getEvent(constants.key.up));
         assert.isTrue(eventPreventDefault);
         assert.isTrue(suggestActivated);
         eventPreventDefault = false;
         suggestActivated = false;

         suggestComponent._keydown(getEvent(constants.key.enter));
         assert.isFalse(eventPreventDefault);
         assert.isFalse(suggestActivated);
         eventPreventDefault = false;

         suggestComponent._suggestMarkedKey = 'test';
         suggestComponent._keydown(getEvent(constants.key.enter));
         assert.isTrue(eventPreventDefault);
         assert.isTrue(suggestActivated);

         eventPreventDefault = false;
         suggestActivated = false;
         suggestComponent._keydown(getEvent('test'));
         assert.isFalse(eventPreventDefault);
         assert.isTrue(eventTriggered);
         assert.isFalse(suggestActivated);

         eventPreventDefault = false;
         suggestComponent._keydown(getEvent(constants.key.esc));
         assert.isTrue(suggestStateChanged);
         assert.isFalse(suggestActivated);
      });

      it('Suggest::_openWithHistory', () => {
         const suggestComponent = getComponentObject({
            minSearchLength: 3,
            searchParam: 'search',
            autoDropDown: true
         });

         suggestComponent._filter = {};
         suggestComponent._historyKeys = [7, 8];
         suggestComponent._searchValue = '';
         suggestComponent._openWithHistory();
         assert.deepEqual(suggestComponent._filter, {search: '', historyKeys: [7, 8]});

         suggestComponent._historyKeys = [];
         suggestComponent._options.autoDropDown = false;
         suggestComponent._openWithHistory();
         assert.deepEqual(suggestComponent._filter, {search: ''});
      });

      it('Suggest:_getRecentKeys', () => {
         const inputContainer = getComponentObject();
         inputContainer._getHistoryService = () => {
            const hService = {
               query: () => new Deferred.fail(new Error('History Service'))
            };
            return new Deferred.success(hService);
         };
         return new Promise((resolve) => {
            getRecentKeys(inputContainer).addCallback((keys) => {
               assert.deepEqual([], keys);
               resolve();
            });
         });
      });

      it('Suggest::_inputClicked', () => {
         const suggestComponent = getComponentObject();

         suggestComponent._inputClicked();
         assert.isTrue(suggestComponent._inputActive);
      });

      it('Suggest::_closePopup', () => {
         let isClosePopup = false;
         const suggestComponent = new _InputController({});

         suggestComponent._children.layerOpener = {
            close: () => {
               isClosePopup = true;
            }
         };

         suggestComponent._closePopup();
         assert.isTrue(isClosePopup);
      });

      it('Suggest::_openPopup', () => {
         const isOpenPopup = false;
         const suggestComponent = getComponentObject({
            suggestTemplate: {}
         });
         suggestComponent._options.suggestTemplate = {};

         const filter = {
            historyKeys: [1, 2, 3]
         };
         const templateOptions = suggestComponent._getTemplateOptions(filter);

         suggestComponent._notify = (items, data) => {
            assert.deepEqual(data[0], templateOptions);
            assert.deepEqual(templateOptions.templateOptions.filter, {});
            return true;
         };

         suggestComponent._openSelector(templateOptions);
         assert.isFalse(isOpenPopup);
      });

      it('changeValueHandler', async () => {
         const suggestComponent = getComponentObject({
            suggestTemplate: {},
            value: 'testValue',
            searchParam: 'testSearchParam',
            filter: '',
            minSearchLength: 3
         });

         await suggestComponent._beforeMount(suggestComponent._options);
         assert.strictEqual(suggestComponent._filter.testSearchParam, 'testValue');

         suggestComponent._changeValueHandler({}, '');
         assert.strictEqual(suggestComponent._filter.testSearchParam, '');
      });

      it('changeValueHandler without suggestTemplate', async () => {
         let searchResolved = false;
         const suggestComponent = getComponentObject({});

         suggestComponent._resolveSearch = () => {
            searchResolved = true;
            return Promise.resolve();
         };
         suggestComponent._options.suggestTemplate = null;

         suggestComponent._changeValueHandler({}, '');
         assert.isFalse(searchResolved);
      });

      describe('_beforeUnmount', () => {

         it('_beforeUnmount while load dependencies', () => {
            const suggestComponent = getComponentObject(_InputController.getDefaultOptions());
            suggestComponent._loadDependencies(suggestComponent._options);
            assert.ok(suggestComponent._dependenciesDeferred);

            suggestComponent._beforeUnmount();
            assert.ok(!suggestComponent._dependenciesDeferred);
         });

         it('_beforeUnmount while load searchLib', () => {
            const suggestComponent = getComponentObject(_InputController.getDefaultOptions());
            suggestComponent._getSearchLibrary();
            assert.ok(suggestComponent._searchLibraryLoader);

            const spy = sinon.spy(suggestComponent._searchLibraryLoader, 'cancel');
            suggestComponent._beforeUnmount();
            assert.ok(spy.callCount === 1);
            assert.ok(!suggestComponent._searchLibraryLoader);
         });

      });
   });
});
