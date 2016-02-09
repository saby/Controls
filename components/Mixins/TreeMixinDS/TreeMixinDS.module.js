define('js!SBIS3.CONTROLS.TreeMixinDS', ['js!SBIS3.CORE.Control'], function (Control) {
   /**
    * Позволяет контролу отображать данные имеющие иерархическую структуру и работать с ними.
    * @mixin SBIS3.CONTROLS.TreeMixinDS
    * @public
    * @author Крайнов Дмитрий Олегович
    */

   var TreeMixinDS = /** @lends SBIS3.CONTROLS.TreeMixinDS.prototype */{
      /**
       * @event onNodeExpand После разворачивания ветки
       * @param {$ws.proto.EventObject} eventObject Дескриптор события.
       * @param {String} key ключ разворачиваемой ветки
       * @example
       * <pre>
       *    onNodeExpand: function(event){
       *       $ws.helpers.question('Продолжить?');
       *    }
       * </pre>
       *
       * @event onNodeCollapse После сворачивания ветки
       * @param {$ws.proto.EventObject} eventObject Дескриптор события.
       * @param {String} key ключ разворачиваемой ветки
       * @example
       * <pre>
       *    onNodeCollapse: function(event){
       *       $ws.helpers.question('Продолжить?');
       *    }
       * </pre>
       */
      $protected: {
         _folderOffsets : {},
         _folderHasMore : {},
         _treePagers : {},
         _treePager: null,
         _options: {
            /**
             * @cfg {Boolean} При открытия узла закрывать другие
             */
            singleExpand: false,

            /**
             * @cfg {Boolean} Опция задаёт режим разворота. false Без разворота
             */
            expand: false,
            openedPath : {},
            folderFooterTpl: undefined,
            /**
             * @cfg {Boolean}
             * Разрешить проваливаться в папки
             * Если выключено, то папки можно открывать только в виде дерева, проваливаться в них нельзя
             */
            allowEnterToFolder: true
         },
         _foldersFooters: {}
      },

      $constructor : function() {
         var filter = this.getFilter() || {};
         if (this._options.expand) {
            filter['Разворот'] = 'С разворотом';
            filter['ВидДерева'] = 'Узлы и листья';
         }
         this.setFilter(filter, true);
      },
      _getRecordsForRedraw: function() {
         /*Получаем только рекорды с parent = curRoot*/
         var
            self = this,
            records = [];
         if (this._options.expand) {
            this.hierIterate(this._dataSet, function (record) {
               if (self._options.displayType == 'folders') {
                  if (record.get(self._options.hierField + '@')) {
                     records.push(record);
                  }
               }
               else {
                  records.push(record);
               }
            });
         }
         else {
            return this._getRecordsForRedrawCurFolder();
         }

         return records;
      },

      /**
       * Закрыть определенный узел
       * @param {String} key Идентификатор раскрываемого узла
       */
      collapseNode: function (key) {
         /* Закроем узел, только если он раскрыт */
         if(!this.getOpenedPath()[key]) {
            return;
         }

         this._drawExpandArrow(key, false);
         this._collapseChilds(key);
         delete(this._options.openedPath[key]);
         this._nodeClosed(key);
         this._notify('onNodeCollapse', key);
      },

      //Рекурсивно удаляем из индекса открытых узлов все дочерние узлы закрываемого узла
      _collapseChilds: function(key){
         var tree = this._dataSet._indexTree;
         if (tree[key]){
            for (var i = 0; i < tree[key].length; i++){
               this._collapseChilds(tree[key][i]);
               delete(this._options.openedPath[tree[key][i]]);
            }
         }
      },

      /**
       * Закрыть или открыть определенный узел
       * @param {String} key Идентификатор раскрываемого узла
       */

      toggleNode: function (key) {
         this[this.getOpenedPath()[key] ? 'collapseNode' : 'expandNode'](key);
      },

      _findExpandByElement: function(elem){
         if (elem.hasClass('js-controls-TreeView__expand')) {
            return elem;
         }
         else {
            var closest = elem.closest('.js-controls-TreeView__expand');
            if (elem.closest('.js-controls-TreeView__expand').length){
               return closest
            }
            else {
               return elem;
            }
         }
      },
      _createTreeFilter: function(key) {
         var
            filter = $ws.core.clone(this.getFilter()) || {};
         if (this._options.expand) {
            filter['Разворот'] = 'С разворотом';
            filter['ВидДерева'] = 'Узлы и листья';
         }
         this.setFilter($ws.core.clone(filter), true);
         filter[this._options.hierField] = key;
         return filter;
      },

      expandNode: function (key) {
         /* Если узел уже открыт, то ничего делать не надо*/
         if(this.getOpenedPath()[key]) {
            return;
         }

         var self = this,
             tree = this._dataSet.getTreeIndex(this._options.hierField, true);

         this._folderOffsets[key || 'null'] = 0;
         if (this._options.singleExpand){
            $.each(this._options.openedPath, function(openedKey, _value){
               if (key != openedKey){
                  self.collapseNode(openedKey);
               }
            });
         }
         if (!tree[key]){
            this._toggleIndicator(true);
            return this._callQuery(this._createTreeFilter(key), this.getSorting(), 0, this._limit).addCallback(function (dataSet) {
               // TODO: Отдельное событие при загрузке данных узла. Сделано так как тут нельзя нотифаить onDataLoad,
               // так как на него много всего завязано. (пользуется Янис)
               self._folderHasMore[key] = dataSet.getMetaData().more;
               self._notify('onDataMerge', dataSet);
               self._toggleIndicator(false);
               self._nodeDataLoaded(key, dataSet);
               self._notify('onNodeExpand', key);
            });
         } else {
            var child = tree[key];
            var records = [];
            if (child){
               for (var i = 0; i < child.length; i++){
                  records.push(this._dataSet.getRecordById(child[i]));
               }
               this._options.openedPath[key] = true;
               this._drawLoadedNode(key, records, this._folderHasMore[key]);
               this._notify('onNodeExpand', key);
            }
         }
      },
      /**
       * Получить текущий набор открытых элементов иерархии
       */
      getOpenedPath: function(){
         return this._options.openedPath;
      },

      _drawLoadedNode: function(key, records){
         this._drawExpandArrow(key);
         for (var i = 0; i < records.length; i++) {
            var record = records[i];
            var targetContainer = this._getTargetContainer(record);
            if (targetContainer) {
               if (this._options.displayType == 'folders') {
                  if (record.get(this._options.hierField + '@')) {
                     this._drawAndAppendItem(record, targetContainer);
                  }
               }
               else {
                  this._drawAndAppendItem(record, targetContainer);
               }
            }
         }
      },

      _drawExpandArrow: function(key, flag){
         var itemCont = $('.controls-ListView__item[data-id="' + key + '"]', this.getContainer().get(0));
         $('.js-controls-TreeView__expand', itemCont).first().toggleClass('controls-TreeView__expand__open', flag);
      },

      _nodeDataLoaded : function(key, dataSet) {
         var self = this;
         this._dataSet.merge(dataSet, {remove: false});
         this._dataSet.getTreeIndex(this._options.hierField, true);
         var records = [];
         dataSet.each(function (record) {
            records.push(record);
         });
         this._options.openedPath[key] = true;
         self._drawLoadedNode(key, records, self._folderHasMore[key]);
      },

      _nodeClosed : function(key) {

      },

      /* здесь добавляется запись "Еще 50" в корень таблицы, но сейчас мы включаем подгрузку по скроллу в папках, значит этот код не нужен
      _processPaging: function() {
         var more, nextPage;
         if (!this._treePager) {
            more = this._dataSet.getMetaData().more;
            //Убираем текст "Еще n", если включена бесконечная подгрузка
            nextPage = this.isInfiniteScroll() ? false : this._hasNextPage(more);
            var
               container = this.getContainer().find('.controls-TreePager-container'),
               self = this;
            this._treePager = new TreePagingLoader({
               pageSize: this._options.pageSize,
               opener: this,
               hasMore: nextPage,
               element: container,
               handlers : {
                  'onClick' : function(){
                     self._folderLoad();
                  }
               }
            });
         }
         more = this._dataSet.getMetaData().more;
         nextPage = this._hasNextPage(more);
         this._treePager.setHasMore(nextPage);
      },
       */
      _folderLoad: function(id) {
         var
            self = this,
            filter = id ? this._createTreeFilter(id) : this.getFilter();
         this._loader = this._callQuery(filter, this.getSorting(), (id ? this._folderOffsets[id] : this._folderOffsets['null']) + this._limit, this._limit).addCallback($ws.helpers.forAliveOnly(function (dataSet) {
            //ВНИМАНИЕ! Здесь стрелять onDataLoad нельзя! Либо нужно определить событие, которое будет
            //стрелять только в reload, ибо между полной перезагрузкой и догрузкой данных есть разница!
            self._notify('onDataMerge', dataSet);
            self._loader = null;
            //нам до отрисовки для пейджинга уже нужно знать, остались еще записи или нет
            if (id) {
               self._folderOffsets[id] += self._limit;
            }
            else {
               self._folderOffsets['null'] += self._limit;
            }
            self._folderHasMore[id] = dataSet.getMetaData().more;
            if (!self._hasNextPageInFolder(dataSet.getMetaData().more, id)) {
               if (typeof id != 'undefined') {
                  self._treePagers[id].setHasMore(false)
               }
               else {
                  self._treePager.setHasMore(false)
               }
               self._hideLoadingIndicator();
            }
            //Если данные пришли, нарисуем
            if (dataSet.getCount()) {
               var records = dataSet._getRecords();
               self._dataSet.merge(dataSet, {remove: false});
               self._dataSet.getTreeIndex(self._options.hierField, true);
               self._drawItemsFolderLoad(records, id);
               self._dataLoadedCallback();
            }

         }, self)).addErrback(function (error) {
            //Здесь при .cancel приходит ошибка вида DeferredCanceledError
            return error;
         });
      },

      _drawItemsFolderLoad: function(records) {
         this._drawItems(records);
      },

      _createFolderPager: function(key, container, more) {
         var
            self = this,
            nextPage = this._hasNextPageInFolder(more, key);

         if (this._options.pageSize) {
            this._treePagers[key] = new TreePagingLoader({
               pageSize: this._options.pageSize,
               opener: this,
               hasMore: nextPage,
               element: container,
               id: key,
               handlers: {
                  'onClick': function () {
                     self._folderLoad(this._options.id);
                  }
               }
            });
         }
      },

      _hasNextPageInFolder: function(more, id) {
         if (!id) {
            return typeof (more) !== 'boolean' ? more > (this._folderOffsets['null'] + this._options.pageSize) : !!more;
         }
         else {
            return typeof (more) !== 'boolean' ? more > (this._folderOffsets[id] + this._options.pageSize) : !!more;
         }
      },
      _createFolderFooter: function(key) {
         var
             footerTpl = this._options.folderFooterTpl,
             options = this._getFolderFooterOptions(key),
             container = $('<div class="controls-TreeView__folderFooterContainer">' + (footerTpl ? footerTpl(options) : '') + '</div>');
         this._destroyFolderFooter([key]);
         this._createFolderPager(key, $('<div class="controls-TreePager-container">').appendTo(container), options.more);
         this._foldersFooters[key] = container;
      },
      _getFolderFooterOptions: function(key) {
         return {
            keys: key,
            more: this._folderHasMore[key]
         };
      },
      _destroyFolderFooter: function(items) {
         var
             controls,
             self = this;
         $ws.helpers.forEach(items, function(item) {
            if (self._foldersFooters[item]) {
               controls = self._foldersFooters[item].find('.ws-component');
               for (var i = 0; i < controls.length; i++) {
                  controls[i].wsControl.destroy();
               }
               self._foldersFooters[item].remove();
               delete self._foldersFooters[item];
            }
         });
      },

      before: {
         reload : function() {
            this._folderOffsets['null'] = 0;
         },
         _keyboardHover: function(e) {
            switch(e.which) {
               case $ws._const.key.m:
                  e.ctrlKey && this.moveRecordsWithDialog();
                  break;
            }
         },
         _dataLoadedCallback: function () {
            //this._options.openedPath = {};
            if (this._options.expand) {
               var tree = this._dataSet.getTreeIndex(this._options.hierField);
               for (var i in tree) {
                  if (tree.hasOwnProperty(i) && i != 'null' && i != this._curRoot) {
                     this._options.openedPath[i] = true;
                  }
               }
            }
         },
         destroy : function() {
            if (this._treePager) {
               this._treePager.destroy();
            }
         },
         _clearItems: function() {
            var self = this;
            $ws.helpers.forEach(this._foldersFooters, function(val, key) {
               self._destroyFolderFooter([key]);
            });
         }
      },
      after : {
         _modifyOptions: function (opts) {
            var tpl = opts.folderFooterTpl;
            //Если нам передали шаблон как строку вида !html, то нужно из нее сделать функцию
            if (tpl && typeof tpl === 'string' && tpl.match(/^html!/)) {
               opts.folderFooterTpl = require(tpl);
            }
            return opts;
         }
      },

      _elemClickHandlerInternal: function (data, id, target) {
         var
            nodeID = $(target).closest('.controls-ListView__item').data('id'),
            closestExpand = this._findExpandByElement($(target));

         if (closestExpand.hasClass('js-controls-TreeView__expand')) {
            this.toggleNode(nodeID);
         }
         else {
            if ((this._options.allowEnterToFolder) && ((data.get(this._options.hierField + '@')))){
               this.setCurrentRoot(nodeID);
               this.reload();
            }
            else {
               this._activateItem(id);
            }
         }
      }
   };

   var TreePagingLoader = Control.Control.extend({
      $protected :{
         _options : {
            id: null,
            pageSize : 20,
            hasMore : false
         }
      },
      $constructor : function(){
         this._container.addClass('controls-TreePager');
         this.setHasMore(this._options.hasMore);
      },
      setHasMore: function(more) {
         this._options.hasMore = more;
         if (this._options.hasMore) {
            this._container.html('Еще ' + this._options.pageSize);
         }
         else {
            this._container.empty();
         }
      }
   });

   return TreeMixinDS;

});

