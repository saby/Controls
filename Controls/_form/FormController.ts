import rk = require('i18n!Controls');
import Control = require('Core/Control');
import cInstance = require('Core/core-instance');
import tmpl = require('wml!Controls/_form/FormController/FormController');
import Deferred = require('Core/Deferred');
import {Logger} from 'UI/Utils';
import dataSource = require('Controls/dataSource');


   /**
    * Контроллер, в котором определена логика CRUD-методов, выполняемых над редактируемой записью.
    * В частном случае контрол применяется для создания <a href="https://wi.sbis.ru/doc/platform/developmentapl/interface-development/forms-and-validation/editing-dialog/">диалогов редактирования записи</a>. Может выполнять запросы CRUD-методов на БЛ.
    * @category FormController
    * @class Controls/_form/FormController
    * @extends Core/Control
    * @mixes Controls/_interface/ISource
    * @mixes Controls/interface/IFormController
    * @implements Controls/_interface/IErrorController
    * @demo Controls-demo/Popup/Edit/Opener
    * @control
    * @public
    * @author Красильников А.С.
    */

   /*
    * Record editing controller. The control stores data about the record and can execute queries CRUD methods on the BL.
    * <a href="https://wi.sbis.ru/doc/platform/developmentapl/interface-development/forms-and-validation/editing-dialog/">More information and details.</a>.
    * @category FormController
    * @class Controls/_form/FormController
    * @extends Core/Control
    * @mixes Controls/_interface/ISource
    * @mixes Controls/interface/IFormController
    * @implements Controls/_interface/IErrorController
    * @demo Controls-demo/Popup/Edit/Opener
    * @control
    * @public
    * @author Красильников А.С.
    */

   /**
    * Объект с состоянием, полученным при серверном рендеринге.
    * @typedef {Object}
    * @name ReceivedState
    * @property {*} [data]
    * @property {Controls/dataSource:error.ViewConfig} [errorConfig]
    */

   /*
    * Object with state from server side rendering
    * @typedef {Object}
    * @name ReceivedState
    * @property {*} [data]
    * @property {Controls/dataSource:error.ViewConfig} [errorConfig]
    */

   /**
    * @typedef {Object}
    * @name CrudResult
    * @property {*} [data]
    * @property {Controls/dataSource:error.ViewConfig} [errorConfig]
    * @property {Controls/dataSource:error.ViewConfig} [error]
    */

   /**
    * Удаляет оригинал ошибки из CrudResult перед вызовом сриализатора состояния,
    * который не сможет нормально разобрать/собрать экземпляр случайной ошибки.
    * @param {CrudResult} crudResult
    * @return {ReceivedState}
    */
   var getState = function(crudResult) {
      delete crudResult.error;
      return crudResult;
   };


   /**
    * Получение результата из обертки <CrudResult>
    * @param {CrudResult} [crudResult]
    * @return {Promise}
    */

   /*
    * getting result from <CrudResult> wrapper
    * @param {CrudResult} [crudResult]
    * @return {Promise}
    */
   var getData = function(crudResult) {
      if (!crudResult) {
         return Promise.resolve();
      }
      if (crudResult.data) {
         return Promise.resolve(crudResult.data);
      }
      return Promise.reject(crudResult.error);
   };

   var _private = {
      checkRecordType: function(record) {
         return cInstance.instanceOfModule(record, 'Types/entity:Record');
      },
      readRecordBeforeMount: (instance, cfg) => {
         // если в опции не пришел рекорд, смотрим на ключ key, который попробуем прочитать
         // в beforeMount еще нет потомков, в частности _children.crud, поэтому будем читать рекорд напрямую
         return instance._source.read(cfg.key, cfg.readMetaData).then((record) => {
            instance._setRecord(record);
            instance._readInMounting = { isError: false, result: record };

            if (instance._isMount) {
               _private.readRecordBeforeMountNotify(instance);
            }

            return {
               data: record
            };
         }, (e: Error) => {
            instance._readInMounting = { isError: true, result: e };
            return instance._processError(e).then(getState);
         });
      },
      readRecordBeforeMountNotify: function(instance) {
         if (!instance._readInMounting.isError) {
            instance._notifyHandler('readSuccessed', [instance._readInMounting.result]);

            // перерисуемся
            instance._readHandler(instance._record);
         } else {
            instance._notifyHandler('readFailed', [instance._readInMounting.result]);
         }
         instance._readInMounting = null;
      },

      createRecordBeforeMount: function(instance, cfg) {
         // если ни рекорда, ни ключа, создаем новый рекорд и используем его
         // в beforeMount еще нет потомков, в частности _children.crud, поэтому будем создавать рекорд напрямую
         return instance._source.create(cfg.initValues || cfg.createMetaData).then(function(record) {
            instance._setRecord(record);
            instance._createdInMounting = { isError: false, result: record };

            if (instance._isMount) {
               _private.createRecordBeforeMountNotify(instance);
            }
            return {
               data: record
            };
         }, function(e) {
            instance._createdInMounting = { isError: true, result: e };
            return instance._processError(e).then(getState);
         });
      },

      createRecordBeforeMountNotify: function(instance) {
         if (!instance._createdInMounting.isError) {
            instance._notifyHandler('createSuccessed', [instance._createdInMounting.result]);

            // зарегистрируем пендинг, перерисуемся
            instance._createHandler(instance._record);
         } else {
            instance._notifyHandler('createFailed', [instance._createdInMounting.result]);
         }
         instance._createdInMounting = null;
      }
   };

   var FormController = Control.extend({
      _template: tmpl,
      _record: null,
      _isNewRecord: false,
      _createMetaDataOnUpdate: null,
      _errorContainer: dataSource.error.Container,

      constructor: function(options) {
         FormController.superclass.constructor.apply(this, arguments);
         options = options || {};
         this.__errorController = options.errorController || new dataSource.error.Controller({});
      },
      _beforeMount: function(cfg, _, receivedState) {
         this._source = cfg.source || cfg.dataSource;
         if (cfg.dataSource) {
             Logger.warn('FormController: Use option "source" instead of "dataSource"', this);
         }
         if (cfg.initValues) {
             Logger.warn('FormController: Use option "createMetaData" instead of "initValues"', this);
         }
         if (cfg.destroyMeta) {
             Logger.warn('FormController: Use option "destroyMetaData " instead of "destroyMeta"', this);
         }
         if (cfg.idProperty) {
             Logger.warn('FormController: Use option "keyProperty " instead of "idProperty"', this);
         }

         receivedState = receivedState || {};
         var receivedError = receivedState.errorConfig;
         var receivedData = receivedState.data;

         if (receivedError) {
            return this._showError(receivedError);
         }
         var record = receivedData || cfg.record;

         // use record
         if (record && _private.checkRecordType(record)) {
            this._setRecord(record);
            this._isNewRecord = !!cfg.isNewRecord;

            // If there is a key - read the record. Not waiting for answer BL
            if (cfg.key !== undefined && cfg.key !== null) {
               _private.readRecordBeforeMount(this, cfg);
            }
         } else if (cfg.key !== undefined && cfg.key !== null) {
            return _private.readRecordBeforeMount(this, cfg);
         } else {
            return _private.createRecordBeforeMount(this, cfg);
         }
      },
      _afterMount: function() {
         // если рекорд был создан во время beforeMount, уведомим об этом
         if (this._createdInMounting) {
            _private.createRecordBeforeMountNotify(this);
         }

         // если рекорд был прочитан через ключ во время beforeMount, уведомим об этом
         if (this._readInMounting) {
            _private.readRecordBeforeMountNotify(this);
         }
         this._createChangeRecordPending();
         this._isMount = true;
      },
      _beforeUpdate: function(newOptions) {
         let self = this;
         if (newOptions.dataSource || newOptions.source) {
            this._source = newOptions.source || newOptions.dataSource;
            //Сбрасываем состояние, только если данные поменялись, иначе будет зацикливаться
            // создание записи -> ошибка -> beforeUpdate
            if (this._source !== this._options.source && this._source !== this._options.dataSource) {
               this._createMetaDataOnUpdate = null;
            }
         }

         if (newOptions.record && this._options.record !== newOptions.record) {
            this._setRecord(newOptions.record);
         }
         if (newOptions.key !== undefined && this._options.key !== newOptions.key) {
            if (newOptions.record && newOptions.record.isChanged()) {
               this._showConfirmPopup('yesno').addCallback(function(answer) {
                  if (answer === true) {
                     self.update().addCallback(function(res) {
                        self.read(newOptions.key, newOptions.readMetaData);
                        return res;
                     });
                  } else {
                     self._tryDeleteNewRecord().addCallback(() => {
                        self.read(newOptions.key, newOptions.readMetaData);
                     });
                  }
               });
            } else {
               self.read(newOptions.key, newOptions.readMetaData);
            }
            return;
         }
         // Если нет ключа и записи - то вызовем метод создать. Состояние isNewRecord обновим после того, как запись вычитается
         // Иначе можем удалить рекорд, к которому новое значение опции isNewRecord не относится
         const createMetaData = newOptions.initValues || newOptions.createMetaData;
         // Добавил защиту от циклических вызовов: У контрола стреляет _beforeUpdate, нет рекорда и ключа => вызывается
         // создание записи. Метод падает с ошибкой. У контрола стреляет _beforeUpdate, вызов метода создать повторяется бесконечно.
         // Нельзя чтобы контрол ддосил БЛ.
         if (newOptions.key === undefined && !newOptions.record && this._createMetaDataOnUpdate !== createMetaData) {
            this._createMetaDataOnUpdate = createMetaData;
            this.create(newOptions.initValues || newOptions.createMetaData).addCallback(function() {
               if (newOptions.hasOwnProperty('isNewRecord')) {
                  self._isNewRecord = newOptions.isNewRecord;
               }
               self._createMetaDataOnUpdate = null;
            });
         } else {
            if (newOptions.hasOwnProperty('isNewRecord')) {
               this._isNewRecord = newOptions.isNewRecord;
            }
         }
      },
      _afterUpdate: function() {
         if (this._wasCreated || this._wasRead || this._wasDestroyed) {
            // сбрасываем результат валидации, если только произошло создание, чтение или удаление рекорда
            this._children.validation.setValidationResult(null);
            this._wasCreated = false;
            this._wasRead = false;
            this._wasDestroyed = false;
         }
      },
      _beforeUnmount: function() {
         // when FormController destroying, its need to check new record was saved or not. If its not saved, new record trying to delete.
         this._tryDeleteNewRecord();
      },
      _setRecord: function(record) {
         if (!record || _private.checkRecordType(record)) {
            this._record = record;
         }
      },
      _getRecordId: function() {
         if (!this._record.getId && !this._options.idProperty && !this._options.keyProperty) {
             Logger.error('FormController: Рекорд не является моделью и не задана опция idProperty, указывающая на ключевое поле рекорда', this);
             return null;
         }
         var keyProperty = this._options.idProperty || this._options.keyProperty;
         return keyProperty ? this._record.get(keyProperty) : this._record.getId();
      },

      _tryDeleteNewRecord: function() {
         if (this._needDestroyRecord()) {
            return this._source.destroy(this._getRecordId(), this._options.destroyMeta || this._options.destroyMetaData);
         }
         return (new Deferred()).callback();
      },
      _needDestroyRecord: function() {
         // Destroy record when:
         // 1. The record obtained by the method "create"
         // 2. The "create" method returned the key
         return this._record && this._isNewRecord && this._getRecordId();
      },

      _createChangeRecordPending(): void {
         const self = this;
         self._notify('registerPending', [new Deferred(), {
            showLoadingIndicator: false,
            validate(): boolean {
               return self._record && self._record.isChanged();
            },
            onPendingFail(forceFinishValue: boolean, deferred: Promise<boolean>): void {
               self._showConfirmDialog(deferred, forceFinishValue);
            }
         }], { bubbling: true });
      },

      _confirmDialogResult(answer: boolean, def: Promise<boolean>): void {
         if (answer === true) {
            this.update().addCallbacks((res) => {
               if (!res.validationErrors) {
                  // если нет ошибок в валидации, просто завершаем пендинг с результатом
                  if (!def.isReady()) {
                     def.callback(res);
                  }
               } else {
                  // если валидация не прошла, нам нужно оставить пендинг, но отменить ожидание завершения пендинга,
                  // чтобы оно не сработало, когда пендинг завершится.
                  // иначе попробуем закрыть панель, не получится, потом сохраним рекорд и панель закроется сама собой
                  this._notify('cancelFinishingPending', [], {bubbling: true});
               }
               return res;
            }, (err: Error) => {
               this._notify('cancelFinishingPending', [], {bubbling: true});
            });
         } else if (answer === false) {
            if (!def.isReady()) {
               def.callback(false);
            }
         } else {
            // if user press 'cancel' button, then cancel finish pendings
            this._notify('cancelFinishingPending', [], {bubbling: true});
         }
      },

      _showConfirmDialog(def: Promise<boolean>, forceFinishValue: boolean): void {
         if (forceFinishValue !== undefined) {
            this._confirmDialogResult(forceFinishValue, def);
         } else {
            this._showConfirmPopup('yesnocancel', rk('Чтобы продолжить редактирование, нажмите \'Отмена\'')).then((answer) => {
               this._confirmDialogResult(answer, def);
               return answer;
            });
         }
      },

      _showConfirmPopup(type: string, details: string): Promise<string> {
         return this._children.popupOpener.open({
            message: rk('Сохранить изменения?'),
            details,
            type
         });
      },

      create: function(createMetaData) {
         createMetaData = createMetaData || this._options.initValues || this._options.createMetaData;
         return this._children.crud.create(createMetaData).addCallbacks(
            this._createHandler.bind(this),
            this._crudErrback.bind(this)
         );
      },
      _createHandler: function(record) {
         this._updateIsNewRecord(true);
         this._wasCreated = true;
         this._forceUpdate();
         return record;
      },
      read: function(key, readMetaData) {
         readMetaData = readMetaData || this._options.readMetaData;
         return this._children.crud.read(key, readMetaData).addCallbacks(
            this._readHandler.bind(this),
            this._crudErrback.bind(this)
         );
      },
      _readHandler: function(record) {
         this._wasRead = true;
         this._updateIsNewRecord(false);
         this._forceUpdate();
         this._hideError();
         return record;
      },

      update: function() {
         var updateResult = new Deferred(),
            self = this;

         function updateCallback(result) {
            // if result is true, custom update called and we dont need to call original update.
            if (result !== true) {
               self._notifyToOpener('updateStarted', [self._record, self._getRecordId()]);
               var res = self._update().addCallback(getData);
               updateResult.dependOn(res);
            } else {
               updateResult.callback(true);
               self._updateIsNewRecord(false);
            }
         }

         // maybe anybody want to do custom update. check it.
         var result = this._notify('requestCustomUpdate', [], { bubbling: true });

         // pending waiting while update process finished
         var def = new Deferred();
         self._notify('registerPending', [def, { showLoadingIndicator: false }], { bubbling: true });
         def.dependOn(updateResult);

         if (result && result.then) {
            result.then(function(defResult) {
               updateCallback(defResult);
               return defResult;
            }, function(err) {
               updateResult.errback(err);
               return err;
            });
         } else {
            updateCallback(result);
         }
         return updateResult;
      },
      _update: function() {
         var self = this,
            record = this._record,
            updateDef = new Deferred();

         // запускаем валидацию
         var validationDef = this._children.validation.submit();
         validationDef.addCallback(function(results) {
            if (!results.hasErrors) {
               // при успешной валидации пытаемся сохранить рекорд
               self._notify('validationSuccessed', [], { bubbling: true });
               var res = self._children.crud.update(record, self._isNewRecord);

               // fake deferred used for code refactoring
               if (!(res && res.addCallback)) {
                  res = new Deferred();
                  res.callback();
               }
               res.addCallback(function(arg) {
                  self._updateIsNewRecord(false);

                  updateDef.callback({ data: true });
                  return arg;
               });
               res.addErrback((error: Error) => {
                  updateDef.errback(error);
                  return self._processError(error, dataSource.error.Mode.dialog);
               });
            } else {
               // если были ошибки валидации, уведомим о них
               var validationErrors = self._children.validation.isValid();
               self._notify('validationFailed', [validationErrors], { bubbling: true });
               updateDef.callback({
                  data: {
                     validationErrors: validationErrors
                  }
               });
            }
         });
         validationDef.addErrback(function(e) {
            updateDef.errback(e);
            return e;
         });
         return updateDef;
      },
      delete: function(destroyMetaData) {
         destroyMetaData = destroyMetaData || this._options.destroyMeta || this._options.destroyMetaData;
         var self = this;
         var resultDef = this._children.crud.delete(this._record, destroyMetaData);

         resultDef.addCallbacks(function(record) {
            self._setRecord(null);
            self._wasDestroyed = true;
            self._updateIsNewRecord(false);
            self._forceUpdate();
            return record;
         }, function(error) {
            return self._crudErrback(error, dataSource.error.Mode.dialog);
         });
         return resultDef;
      },

      validate: function() {
         return this._children.validation.submit();
      },

      /**
       *
       * @param {Error} error
       * @param {Controls/_dataSource/_error/Mode} [mode]
       * @return {Promise<*>}
       * @private
       */
      _crudErrback: function(error, mode) {
         return this._processError(error, mode).then(getData);
      },

      _updateIsNewRecord: function(value) {
         if (this._isNewRecord !== value) {
            this._isNewRecord = value;
            this._notify('isNewRecordChanged', [value]);
         }
      },

      /**
       * @param {Error} error
       * @param {Controls/_dataSource/_error/Mode} [mode]
       * @return {Promise.<CrudResult>}
       * @private
       */
      _processError: function(error, mode) {
         var self = this;
         return self.__errorController.process({
            error: error,
            mode: mode || dataSource.error.Mode.include
         }).then(function(errorConfig) {
            self._showError(errorConfig);
            return {
               error: error,
               errorConfig: errorConfig
            };
         });
      },

      /**
       * @private
       */
      _showError: function(errorConfig) {
         this.__error = errorConfig;
      },

      _hideError: function() {
         if (this.__error) {
            this.__error = null;
         }
      },

      _onCloseErrorDialog: function() {
         if (!this._record) {
            this._notify('close', [], { bubbling: true });
         }
      },

      _crudHandler: function(event) {
         var eventName = event.type;
         var args = Array.prototype.slice.call(arguments, 1);
         event.stopPropagation(); // FC the notification event by itself
         this._notifyHandler(eventName, args);
      },

      _notifyHandler: function(eventName, args) {
         this._notifyToOpener(eventName, args);
         this._notify(eventName, args, { bubbling: true });
      },

      _notifyToOpener: function(eventName, args) {
         var handlers = {
            'updatestarted': '_getUpdateStartedData',
            'updatesuccessed': '_getUpdateSuccessedData',
            'createsuccessed': '_getCreateSuccessedData',
            'readsuccessed': '_getReadSuccessedData',
            'deletesuccessed': '_getDeleteSuccessedData',
            'updatefailed': '_getUpdateFailedData'
         };
         var resultDataHandlerName = handlers[eventName.toLowerCase()];
         if (this[resultDataHandlerName]) {
            var resultData = this[resultDataHandlerName].apply(this, args);
            this._notify('sendResult', [resultData], { bubbling: true });
         }
      },

       _getUpdateStartedData(record, key) {
          let config = this._getUpdateSuccessedData(record, key);
          config.formControllerEvent = 'updateStarted';
          return config;
       },

      _getUpdateSuccessedData: function(record, key) {
         var additionalData = {
            key: key,
            isNewRecord: this._isNewRecord
         };
         return this._getResultData('update', record, additionalData);
      },

      _getDeleteSuccessedData: function(record) {
         return this._getResultData('delete', record);
      },

      _getCreateSuccessedData: function(record) {
         return this._getResultData('create', record);
      },

      _getReadSuccessedData: function(record) {
         return this._getResultData('read', record);
      },

      _getUpdateFailedData: function(error, record) {
         var additionalData = {
            record: record,
            error: error,
            isNewRecord: this._isNewRecord
         };
         return this._getResultData('updateFailed', record, additionalData);
      },
      _getResultData: function(eventName, record, additionalData) {
         return {
            formControllerEvent: eventName,
            record: record,
            additionalData: additionalData || {}
         };
      }
   });

   FormController._private = _private;
   export = FormController;

