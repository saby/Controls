define(['Controls/deprecatedList', 'Types/source', 'Types/collection', 'Core/Deferred', 'Core/core-clone', 'Controls/history', 'Types/entity'], function(deprecatedList, sourceLib, collection, Deferred, clone, history, entity) {

   if (typeof mocha !== 'undefined') {
      //Из-за того, что загрузка через Core/moduleStubs добавляет в global Lib/Control/LoadingIndicator/LoadingIndicator,
      //чтобы потом брать его из кэша
      mocha.setup({globals: ['Controls/Controllers/_Search']});
   }


   describe('Controls.deprecatedList:Container', function () {
      var listLayout, listLayoutWithPrefetch, listOptions, getListOptionsWithPrefetch, listSource, listSourceData, listSearchParam, listPrefetchSource, listOptionsWithPrefetch;

      var getFilledContext = function() {
         return {
            filterLayoutField: {
               filter: {
                  title: 'Sasha'
               }
            },
            searchLayoutField: {
               searchValue: 'Sasha'
            }
         };
      };

      var getEmptyContext = function() {
         return {
            filterLayoutField: {
               filter: {
                  title: ''
               }
            },
            searchLayoutField: {
               searchValue: ''
            }
         };
      };

      before(function() {
         listSourceData = [{ id: 1, title: 'Sasha' },
            { id: 2, title: 'Dmitry' },
            { id: 3, title: 'Andrey' },
            { id: 4, title: 'Aleksey' },
            { id: 5, title: 'Sasha' }];
         listSource = new sourceLib.Memory({
            data: listSourceData,
            keyProperty: 'id'
         });
         listPrefetchSource = new sourceLib.PrefetchProxy({
            target: listSource,
            data: {
               query: new collection.RecordSet({
                  rawData: listSourceData
               })
            }
         });
         listSearchParam = 'title';
         listOptions = {
            source: listSource,
            searchParam: listSearchParam,
            searchDelay: 0,
            minSearchLength: 3,
            filter: {},
            reverseList: false,
            navigation: {
               source: 'page',
               view: 'page',
               sourceConfig: {
                  pageSize: 10,
                  page: 0,
                  hasMore: false
               }
            }
         };
         getListOptionsWithPrefetch = function() {
            return {
               source: listPrefetchSource,
               searchParam: listSearchParam,
               searchDelay: 0,
               minSearchLength: 3,
               filter: {},
               navigation: {
                  source: 'page',
                  view: 'page',
                  sourceConfig: {
                     pageSize: 10,
                     page: 0,
                     hasMore: false
                  }
               }
            };
         };
         listOptionsWithPrefetch = getListOptionsWithPrefetch();
         listLayout = new deprecatedList.Container(listOptions);
         listLayout.saveOptions(listOptions);

         listLayoutWithPrefetch = new deprecatedList.Container(listOptionsWithPrefetch);
         listLayoutWithPrefetch.saveOptions(listOptionsWithPrefetch);
      });

      it('.updateFilter', function() {
         deprecatedList.Container._private.updateFilter(listLayout, {testKey: 'testFilter'});
         assert.deepEqual(listLayout._filter, {testKey: 'testFilter'});

         deprecatedList.Container._private.updateFilter(listLayout, {testKey: 'testFilter2'});
         assert.deepEqual(listLayout._filter, {testKey: 'testFilter2'});
      });

      describe('.updateSource', function() {
         var recordSet = new collection.RecordSet({
            rawData: [
               { id: 1, title: 'Sasha' },
               { id: 2, title: 'Dmitry' }
            ]
         });

         recordSet.setMetaData({ more: 123 });

         it('list is not reverse', function() {
            listLayout._data = recordSet;
            deprecatedList.Container._private.updateSource(listLayout, false);
            assert.deepEqual(recordSet.getRawData(), listLayout._source._$data.query.getRawData());
            assert.deepEqual(listLayout._source._$data.query.getMetaData(), { more: 123 });
         });

         it('list is reverse', function() {
            listLayout._data = recordSet;
            deprecatedList.Container._private.updateSource(listLayout, true);
            assert.deepEqual(recordSet.getRawData().reverse(), listLayout._source._$data.query.getRawData());
         });
      });

      it('.abortCallback', function() {
         deprecatedList.Container._private.abortCallback(listLayout, {});
         assert.deepEqual(listSourceData, listLayout._source._$data);
      });

      it('.searchErrback', function() {
         var errbackCalled = false;
         var errbackCalledWithPrefetch = false;
         listLayout._options.searchErrback = function() {
            errbackCalled = true;
         };
         listLayoutWithPrefetch._options.searchErrback = function() {
            errbackCalledWithPrefetch = true;
         };
         listLayoutWithPrefetch._options.source = listSource;

         deprecatedList.Container._private.searchErrback(listLayout, {canceled: true});
         assert.isTrue(!!listLayout._source._$data);

         deprecatedList.Container._private.searchErrback(listLayout, {});

         assert.deepEqual(null, listLayout._source._$data);
         assert.isTrue(errbackCalled);

         deprecatedList.Container._private.searchErrback(listLayoutWithPrefetch, {});

         assert.deepEqual(null, listLayoutWithPrefetch._source._$data);
         assert.isTrue(errbackCalledWithPrefetch);
      });

      it('_beforeMount', function() {
         var listLayout = new deprecatedList.Container(getListOptionsWithPrefetch());
         listLayout._searchMode = true;
         listLayout._beforeMount(getListOptionsWithPrefetch());

         assert.equal(listLayout._source.getModel(), getListOptionsWithPrefetch().source._$target.getModel());
      });

      it('.searchCallback', function() {
         var recordSet = new collection.RecordSet({
            rawData:[
               { id: 1, title: 'Sasha' },
               { id: 2, title: 'Dmitry' }
            ]
         });
         listLayout._searchDeferred = new Deferred();
         deprecatedList.Container._private.searchCallback(listLayout, {data: recordSet}, {testField: 'testValue'});
         assert.deepEqual(recordSet.getRawData(), listLayout._source._$data.query.getRawData());
         assert.deepEqual(listLayout._filter, {testField: 'testValue'});
      });

      it('.searchValueChanged', function(done) {
         var opts = clone(listOptions);
         var searchStarted = false;
         opts.searchStartCallback = function() {
            searchStarted = true;
         };
         var listLayout = new deprecatedList.Container(opts);
         listLayout._beforeMount(opts);
         deprecatedList.Container._private.searchValueChanged(listLayout, 'Sasha');
         assert.equal(listLayout._searchValue, 'Sasha');
         assert.isFalse(searchStarted);

         setTimeout(function() {
            assert.deepEqual(listLayout._filter, {title: 'Sasha'});
            assert.deepEqual(listLayout._source._$data.query.getRawData(), [
               { id: 1, title: 'Sasha' },
               { id: 5, title: 'Sasha' }
               ]);
            assert.isTrue(searchStarted);
            deprecatedList.Container._private.searchValueChanged(listLayout, '');
            assert.equal(listLayout._searchValue, '');
            setTimeout(function() {
               assert.deepEqual(listLayout._filter, {});
               assert.deepEqual(listLayout._source._$data, listSourceData);
               done();
            }, 100);
         }, 100);
      });

      it('.getSearchController', function() {
         listLayout._searchController = undefined;


         assert.isFalse(!!listLayout._searchController);

         var searchController = deprecatedList.Container._private.getSearchController(listLayout);
         var historySource = new history.Source({
            originSource: listSource,
            historySource: new history.Service({
               historyId: 'historyField'
            })
         });

         assert.isTrue(!!listLayout._searchController);
         assert.equal(searchController._moduleName, 'Controls/search:_SearchController');
         assert.equal(searchController._options.searchParam, listSearchParam);
         assert.equal(searchController._options.source, listSource);

         listLayoutWithPrefetch._searchController = undefined;
         searchController = deprecatedList.Container._private.getSearchController(listLayoutWithPrefetch);

         assert.isTrue(searchController._options.source instanceof sourceLib.Memory);

         listLayoutWithPrefetch._searchController = undefined;
         listLayoutWithPrefetch._options.source = historySource;
         searchController = deprecatedList.Container._private.getSearchController(listLayoutWithPrefetch);
         assert.isTrue(searchController._options.source instanceof history.Source);
      });

      it('._beforeUpdate', function(done) {
         /* Изолированный тест beforeUpdate */
         var
            newOpts = clone(listOptions),
            listLayout = new deprecatedList.Container(listOptions),
            context = {
            filterLayoutField: {
               filter: {}
            },
            searchLayoutField: {
               searchValue: ''
            }
         };

         listLayout._saveContextObject({
            filterLayoutField: {filter: {}},
            searchLayoutField: {searchValue: ''}
         });

         /* emulate _beforeMount */
         listLayout.saveOptions(listOptions);
         deprecatedList.Container._private.resolveOptions(listLayout, listOptions);
         listLayout._data =  new collection.RecordSet({
            rawData: listSourceData
         });
         listLayout._beforeUpdate(listOptions, context);

         /* Nothing changes */
         assert.deepEqual(listLayout._filter, {});
         assert.deepEqual(listLayout._source._$data, listSourceData);

         // reverseList changed
         var reversedData = clone(listSourceData).reverse();
         newOpts.reverseList = true;
         listLayout._beforeUpdate(newOpts, context);
         assert.deepEqual(listLayout._source._$data.query.getAll().getRawData(), reversedData);

         // reverseList changed with not origin source
         listLayout._source = new sourceLib.PrefetchProxy({
            target: listOptions.source
         });
         listLayout._beforeUpdate(newOpts, context);
         assert.deepEqual(listLayout._source._$data.query.getAll().getRawData(), reversedData);

         listLayout._source = listOptions.source;
         newOpts.reverseList = false;

         /* SearchValue changed */
         context.searchLayoutField.searchValue = 'Sasha';
         listLayout._beforeUpdate(listOptions, context);
         setTimeout(function() {
            assert.deepEqual(listLayout._filter, {title: 'Sasha'});
            assert.deepEqual(listLayout._source._$data.query.getRawData(), [
               { id: 1, title: 'Sasha' },
               { id: 5, title: 'Sasha' }
            ]);

            /* To reset source and context*/
            listLayout._saveContextObject({
               filterLayoutField: {filter: {title: 'Sasha'}},
               searchLayoutField: {searchValue: 'Sasha'}
            });
            deprecatedList.Container._private.abortCallback(listLayout, {});
            /* check reset */
            assert.deepEqual(listLayout._filter, {});
            assert.deepEqual(listLayout._source._$data, listSourceData);

            /* change source */
            var newSource = new sourceLib.Memory({
               data: listSourceData,
               keyProperty: 'id'
            });
            newOpts = clone(listOptions);
            newOpts.source = newSource;
            listLayout._beforeUpdate(newOpts, context);
            assert.equal(listLayout._searchController._options.source, newSource);


            /* Change context filter */
            listLayout._saveContextObject({
               filterLayoutField: {filter: {title: ''}},
               searchLayoutField: {searchValue: 'Sasha'}
            });
            context.filterLayoutField.filter = { title: 'Sasha' };
            listLayout._beforeUpdate(newOpts, context);
            setTimeout(function() {
               assert.deepEqual(listLayout._filter, {title: 'Sasha'});

               var newNavigation = {
                  source: 'page',
                  view: 'page',
                  sourceConfig: {
                     pageSize: 2,
                     page: 0,
                     hasMore: false
                  }
               };
               newOpts = clone(newOpts);
               newOpts.navigation = newNavigation;
               newOpts.source = new sourceLib.Memory({
                  data: listSourceData,
                  keyProperty: 'id'
               });

               listLayout._searchMode = true;
               context.filterLayoutField.filter = {test: 'testFilter'};
               let listLayoutSource = listLayout._source;
               listLayout._beforeUpdate(newOpts, context);

               assert.deepEqual(listLayout._searchController._options.navigation, newNavigation);
               assert.deepEqual(listLayout._searchController._options.filter, {test: 'testFilter'});
               assert.isTrue(listLayout._source !== newOpts.source);
               assert.isTrue(listLayout._source === listLayoutSource);

               listLayout._filter = {scTest: 'scTest'};
               listLayout._beforeUpdate(newOpts, context);
               assert.deepEqual(listLayout._searchController.getFilter(), {test: 'testFilter'});
               assert.isTrue(listLayout._source === listLayoutSource);

               done();
            }, 50);
         }, 50);
      });

      it('_beforeUpdate: changed reverse list', function() {
         let
            isReverseData = false,
            newOpts = clone(listOptions),
            listLayout = new deprecatedList.Container(listOptions),
            defaultUpdateSource = deprecatedList.Container._private.updateSource;

         deprecatedList.Container._private.updateSource = function() {
            isReverseData = true;
         };

         newOpts.reverseList = true;
         listLayout._data = [];
         listLayout._beforeUpdate(newOpts);
         assert.isTrue(isReverseData);
         deprecatedList.Container._private.updateSource = defaultUpdateSource;
      });

      it('Container/List::_private.isFilterChanged', function() {
         var listLayout = new deprecatedList.Container(listOptions);
         var context = getFilledContext();

         listLayout._saveContextObject(getEmptyContext());
         assert.isTrue(deprecatedList.Container._private.isFilterChanged(listLayout, context));

         listLayout._saveContextObject(getFilledContext());
         assert.isFalse(deprecatedList.Container._private.isFilterChanged(listLayout, context));

         listLayout._filter = getFilledContext().filterLayoutField.filter;
         assert.isFalse(deprecatedList.Container._private.isFilterChanged(listLayout, context));

         listLayout._filter = getEmptyContext().filterLayoutField.filter;
         assert.isFalse(deprecatedList.Container._private.isFilterChanged(listLayout, context));

         listLayout._saveContextObject(getEmptyContext());
         listLayout._filter = getEmptyContext().filterLayoutField.filter;
         assert.isTrue(deprecatedList.Container._private.isFilterChanged(listLayout, context));

         listLayout._saveContextObject(getEmptyContext());
         listLayout._filter = getFilledContext().filterLayoutField.filter;
         assert.isTrue(deprecatedList.Container._private.isFilterChanged(listLayout, context));
      });

      it('Container/List::_private.isSearchValueChanged', function() {
         var listLayout = new deprecatedList.Container(listOptions);
         listLayout._beforeMount(listOptions);
         var context = getFilledContext();

         listLayout._saveContextObject(getEmptyContext());
         assert.isTrue(deprecatedList.Container._private.isSearchValueChanged(listLayout, context));

         listLayout._saveContextObject(getFilledContext());
         assert.isFalse(deprecatedList.Container._private.isSearchValueChanged(listLayout, context));

         listLayout._searchValue = getFilledContext().searchLayoutField.searchValue;
         assert.isFalse(deprecatedList.Container._private.isSearchValueChanged(listLayout, context));

         listLayout._searchValue = getEmptyContext().searchLayoutField.searchValue;
         assert.isTrue(deprecatedList.Container._private.isSearchValueChanged(listLayout, getEmptyContext()));

      });

      it('Container/List::_private.getSearchValueFromContext', function () {
         var listLayout = new deprecatedList.Container(listOptions);
         var context = getFilledContext();
         var emptyContext = getEmptyContext();

         assert.equal('Sasha', deprecatedList.Container._private.getSearchValueFromContext(listLayout, context));
         assert.equal('', deprecatedList.Container._private.getSearchValueFromContext(listLayout, emptyContext));
      });

      it('Container/List::_private.getFilterFromContext', function () {
         var listLayout = new deprecatedList.Container(listOptions);
         var context = getFilledContext();
         var emptyContext = getEmptyContext();

         assert.deepEqual({title: 'Sasha'}, deprecatedList.Container._private.getFilterFromContext(listLayout, context));
         assert.deepEqual({title: ''}, deprecatedList.Container._private.getFilterFromContext(listLayout, emptyContext));
      });

      it('reverseData', function() {
         var sbisSource = new sourceLib.SbisService();
         var recordSetSbis = new collection.RecordSet({
            rawData: {
               d: [
                  [1, 'Инженер-программист'],
                  [2, 'Руководитель группы']
               ],
               s: [
                  {
                     n: 'id',
                     t: 'ЧислоЦелое'
                  },
                  {
                     n: 'code_name',
                     t: 'Текст'
                  }
               ]
            },
            adapter: new entity.adapter.Sbis()
         });

         var reversedData = deprecatedList.Container._private.reverseData(recordSetSbis.getRawData(), sbisSource);
         assert.deepEqual(reversedData,
            {
               d: [
                  [2, 'Руководитель группы'],
                  [1, 'Инженер-программист']
               ],
               s: [
                  {
                     n: 'id',
                     t: 'ЧислоЦелое'
                  },
                  {
                     n: 'code_name',
                     t: 'Текст'
                  }
               ],
               _type: 'recordset'
            });
      });

   });

});
