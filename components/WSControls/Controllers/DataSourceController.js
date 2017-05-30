define('js!WSControls/Controllers/DataSourceController', [
   'Core/Abstract',
   'js!SBIS3.CONTROLS.Utils.SourceUtil',
   'js!WS.Data/Query/Query'
], function(Abstract, SourceUtil, Query) {
   var DataSourceController = Abstract.extend({
      _useNativeAsMain: true,
      constructor: function(cfg) {

         /*Распихивание данных*/
         this._options = {
            dataSource : cfg.dataSource ? cfg.dataSource : null,
            idProperty : cfg.idProperty
         };

         DataSourceController.superclass.constructor.apply(this, arguments);
         this.dataSource = SourceUtil.prepareSource(this._options.dataSource);
         this.idProperty = this._options.idProperty;
         this.items = this._options.items;
         this.filter = {};
         this.sorting = [];
         this._loader = null;

         this._publish('onBeforeReload', 'onAfterReload');


      },

      reload: function(filter, sorting, offset, limit) {

         var
            def,
            self = this,
            filterChanged = typeof(filter) !== 'undefined',
            sortingChanged = typeof(sorting) !== 'undefined',
            offsetChanged = typeof(offset) !== 'undefined',
            limitChanged = typeof(limit) !== 'undefined';

         this._cancelLoading();
         if (filterChanged) {
            this.setFilter(filter, true);
         }
         if (sortingChanged) {
            this.setSorting(sorting, true);
         }
         this._offset = offsetChanged ? offset : this._offset;
         this._limit = limitChanged ? limit : this._limit;

         if (this.dataSource) {
            var result = this._notify('onBeforeReload', this.filter, this.sorting, this.offset, this._limit);
            if (result) {
               this.filter = result['filter'] || this.filter;
               this.sorting = result['sorting'] || this.sorting;
               this.offset = result['offset'] || this.offset;
               this._limit = result['_limit'] || this._limit;
            }
            def = this._callQuery(this.filter, this.sorting, this.offset, this._limit)
               .addCallback(fHelpers.forAliveOnly(function (list) {
                  self._toggleIndicator(false);
                  self._notify('onDataLoad', list);
                  if (
                     this.getItems()
                     && (list.getModel() === this.getItems().getModel())
                     && (Object.getPrototypeOf(list).constructor == Object.getPrototypeOf(list).constructor)
                     && (Object.getPrototypeOf(list.getAdapter()).constructor == Object.getPrototypeOf(this.getItems().getAdapter()).constructor)
                     ) {
                     this._options._items.setMetaData(list.getMetaData());
                     this._options._items.assign(list);
                     self._drawItemsCallbackDebounce();
                  } else {
                     this._unsetItemsEventHandlers();
                     this._options._items = list;
                     this._options._itemsProjection = this._options._createDefaultProjection.call(this, this._options._items, this._options);
                     this._options._itemsProjection = this._options._applyGroupingToProjection(this._options._itemsProjection, this._options);
                     this._setItemsEventHandlers();
                     this._notify('onItemsReady');
                     this._itemsReadyCallback();
                     self.redraw();
                  }

                  self._checkIdProperty();

                  this._dataLoadedCallback();
                  //self._notify('onBeforeRedraw');
                  return list;
               }, self))
               .addErrback(fHelpers.forAliveOnly(this._loadErrorProcess, self));
            this._loader = def;
         } else {
            if (this._options._itemsProjection) {
               this._redraw();
            }
            def = new Deferred();
            def.callback();
         }

         this._notifyOnPropertyChanged('filter');
         this._notifyOnPropertyChanged('sorting');
         this._notifyOnPropertyChanged('offset');
         this._notifyOnPropertyChanged('limit');

         return def;
      },

      isLoading: function(){
         return this._loader && !this._loader.isReady();
      },

      _cancelLoading: function () {
         if (this.isLoading()) {
            this._loader.cancel();
         }
         this._loader = null;
      },

      setFilter: function(filter, noLoad) {
         this.filter = filter;
         if (this.dataSource && !noLoad) {
            this.reload(this.filter, this.sorting, 0, this.getPageSize());
         } else {
            this._notifyOnPropertyChanged('filter');
         }
      },

      getFilter: function() {
         return this.filter;
      },

      setSorting: function(sorting, noLoad) {
         this.sorting = sorting;
         this._dropPageSave();
         if (this.dataSource && !noLoad) {
            this.reload(this.filter, this.sorting, 0, this.getPageSize());
         }
      },

      getSorting: function() {
         return this.sorting;
      },

      _callQuery: function (filter, sorting, offset, limit) {

         var query = this._getQueryForCall(filter, sorting, offset, limit);

         return this.dataSource.query(query).addCallback((function(dataSet) {
            if (this._options.idProperty && this._options.idProperty !== dataSet.getIdProperty()) {
               dataSet.setIdProperty(this._options.idProperty);
            }
            return dataSet.getAll();
         }).bind(this));
      },

      _getQueryForCall: function(filter, sorting, offset, limit){
         var query = new Query();
         query.where(filter)
            .offset(offset)
            .limit(limit)
            .orderBy(sorting);
         return query;
      }
   });
   return DataSourceController;
});