/**
 * Created by as.suhoruchkin on 21.07.2015.
 */
define('js!SBIS3.CONTROLS.MoveHandlers', ['js!SBIS3.CONTROLS.MoveDialog','js!SBIS3.CONTROLS.Data.SbisMoveStrategy', 'js!SBIS3.CONTROLS.Data.BaseMoveStrategy'], function(MoveDialog, SbisMoveStrategy, BaseMoveStrategy) {
   var MoveHandlers = {
      $protected: {
        _moveStrategy: undefined
      },
      moveRecordsWithDialog: function(records) {
         records = this._getRecordsForMove(records);
         if (records.length) {
            new MoveDialog({
               linkedView: this,
               records: records
            });
         }
      },
      _getRecordsForMove: function(records) {
         if (!Array.isArray(records) || !records.length) {
            records = this.getSelectedKeys().length ? this.getSelectedKeys() :
               this.getSelectedKey() ? [this.getSelectedKey()] : [];
         }
         return records;
      },
      selectedMoveTo: function(moveTo) {
         this._move(this._selectedRecords, moveTo);
      },
      _move: function(records, moveTo) {
         var
            record,
            recordTo,
            isNodeTo = true,
            self = this,
            /*TODO переделать не на ParallelDeferred*/
            deferred = new $ws.proto.ParallelDeferred();

         if (moveTo !== null) {
            recordTo = this._dataSet.getRecordByKey(moveTo);
            if (recordTo) {
               isNodeTo = recordTo.get(this._options.hierField + '@');
            }
         }

         if (this._checkRecordsForMove(records, moveTo)) {
            for (var i = 0; i < records.length; i++) {
               record = $ws.helpers.instanceOfModule(records[i], 'SBIS3.CONTROLS.Record') ? records[i] : this._dataSet.getRecordByKey(records[i]);
               if (isNodeTo) {

                  this.getMoveStrategy().hierarhyMove(record, recordTo);
               } else {
                  this.getMoveStrategy().move(record, recordTo, true);


               }
            }
            deferred.done().getResult().addCallback(function() {
               if (deferred.getResult().isSuccessful()) {
                  self.removeItemsSelectionAll();
                  if (isNodeTo) {
                     self.setCurrentRoot(moveTo);
                  }
                  self.reload();
               }
            });
         }
      },
      _checkRecordsForMove: function(records, moveTo) {
         var
            key,
            toMap = this._getParentsMap(moveTo);
         if (moveTo === undefined) {
            return false;
         }
         for (var i = 0; i < records.length; i++) {
            key = '' + ($ws.helpers.instanceOfModule(records[i], 'SBIS3.CONTROLS.Record') ? records[i].getKey() : records[i]);
            if ($.inArray(key, toMap) !== -1) {
               $ws.helpers.alert('Вы не можете переместить запись саму в себя!', {}, this);
               return false;
            }
         }

         return true;
      },
      _getParentsMap: function(parentKey) {
         var
            dataSet = this.getDataSet(),
            hierField = this.getHierField(),
            /*
               TODO: проверяем, что не перемещаем папку саму в себя, либо в одного из своих детей.
               В текущей реализации мы можем всего-лишь из метаданных вытащить путь от корня до текущего открытого раздела.
               Это костыль, т.к. мы расчитываем на то, что БЛ при открытии узла всегда вернет нам путь до корня.
               Решить проблему можно следующими способами:
               1. во первых в каталоге номенклатуры перемещение сделано не по стандарту. при нажатии в операциях над записью кнопки "переместить" всегда должен открываться диалог выбора папки. сейчас же они без открытия диалога сразу что-то перемещают и от этого мы имеем проблемы. Если всегда перемещать через диалог перемещения, то у нас всегда будет полная иерархия, и мы сможем определять зависимость между двумя узлами, просто пройдясь вверх по иерархии.
               2. тем не менее это не отменяет сценария обычного Ctrl+C/Ctrl+V. В таком случае при операции Ctrl+C нам нужно запоминать в метаданные для перемещения текущую позицию иерархии от корня (если это возможно), чтобы в будущем при вставке произвести анализ на корректность операции
               3. это не исключает ситуации, когда БЛ не возвращает иерархию до корня, либо пользователь самостоятельно пытается что-то переместить с помощью интерфейса IDataSource.move. В таком случае мы считаем, что БЛ вне зависимости от возможности проверки на клиенте, всегда должна проверять входные значения при перемещении. В противном случае это приводит к зависанию запроса.
            */
            path = dataSet.getMetaData().path,
            toMap = path ? $.map(path.getChildItems(), function(elem) {
               return '' + elem;
            }) : [];
         var record = dataSet.getRecordByKey(parentKey);
         while (record) {
            parentKey = '' + record.getKey();
            if ($.inArray(parentKey, toMap) === -1) {
               toMap.push(parentKey);
            }
            parentKey = dataSet.getParentKey(record, hierField);
            record = dataSet.getRecordByKey(parentKey);
         }
         return toMap;
      },
      /**
       * Возвращает стратегию перемещения
       * @see SBIS3.CONTROLS.Data.IMoveStrategy
       * @returns {SBIS3.CONTROLS.Data.IMoveStrategy}
       */
      getMoveStrategy: function () {
         return this._moveStrategy || (this._moveStrategy = this._makeMoveStrategy());
      },
      /**
       * Создает стратегию перемещения в зависимости от источника данных
       * @returns {SBIS3.CONTROLS.Data.IMoveStrategy}
       * @private
       */
      _makeMoveStrategy: function () {
         if($ws.helpers.instanceOfModule(this._dataSource,'SBIS3.CONTROLS.Data.Source.SbisService') ||
            $ws.helpers.instanceOfModule(this._dataSource,'SBIS3.CONTROLS.SbisServiceSource')
         ) {
            return new SbisMoveStrategy({
               dataSource: this._dataSource,
               hierField: this._options.hierField
            });
         } else {
            return new BaseMoveStrategy({
               dataSource: this._dataSource,
               hierField: this._options.hierField
            });
         }
      },
      /**
       * Устанавливает стратегию перемещения
       * @see SBIS3.CONTROLS.Data.IMoveStrategy
       * @param {SBIS3.CONTROLS.Data.IMoveStrategy} strategy - стратегия перемещения
       */
      setMoveStrategy: function (strategy){
         if(!$ws.halpers.instanceOfMixin('SBIS3.CONTROLS.Data.IMoveStrategy')){
            throw new Error('The strategy must implemented interfaces the SBIS3.CONTROLS.Data.IMoveStrategy.')
         }
         this._moveStrategy = strategy;
      },

      moveRecordDown: function(tr, id, record) {
         var nextItem = this.getNextItemById(id),
            nextId = nextItem.data('id');
         moveRecord.call(this, record, nextId, id, false);
      },
      moveRecordUp: function(tr, id, record) {
         var prevItem = this.getPrevItemById(id),
            prevId = prevItem.data('id');
         moveRecord.call(this, record, prevId, id, true);
      }
   };
   function moveRecord(itemRecord, moveTo, current, up){
      var self = this;
      this.getMoveStrategy().move(itemRecord, this._dataSet.getRecordByKey(moveTo), up).addCallback(function(){
         self._moveItemTo(current, moveTo, up);
      }).addErrback(function(e){
         $ws.core.alert(e.message);
      });

   }
   return MoveHandlers;
});