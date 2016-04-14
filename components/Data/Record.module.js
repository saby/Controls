/* global define, $ws */
define('js!SBIS3.CONTROLS.Data.Record', [
   'js!SBIS3.CONTROLS.Data.IObject',
   'js!SBIS3.CONTROLS.Data.Collection.IEnumerable',
   'js!SBIS3.CONTROLS.Data.Entity.Abstract',
   'js!SBIS3.CONTROLS.Data.Entity.OptionsMixin',
   'js!SBIS3.CONTROLS.Data.Entity.ObservableMixin',
   'js!SBIS3.CONTROLS.Data.SerializableMixin',
   'js!SBIS3.CONTROLS.Data.FormattableMixin',
   'js!SBIS3.CONTROLS.Data.Serializer',
   'js!SBIS3.CONTROLS.Data.Collection.ArrayEnumerator',
   'js!SBIS3.CONTROLS.Data.Di',
   'js!SBIS3.CONTROLS.Data.Utils',
   'js!SBIS3.CONTROLS.Data.Factory',
   'js!SBIS3.CONTROLS.Data.Format.StringField',
   'js!SBIS3.CONTROLS.Data.ContextField.Record'
], function (
   IObject,
   IEnumerable,
   Abstract,
   OptionsMixin,
   ObservableMixin,
   SerializableMixin,
   FormattableMixin,
   Serializer,
   ArrayEnumerator,
   Di,
   Utils,
   Factory,
   StringField,
   ContextFieldRecord
) {
   'use strict';

   /**
    * Запись - обертка над данными.
    * @class SBIS3.CONTROLS.Data.Record
    * @extends SBIS3.CONTROLS.Entity.Abstract
    * @mixes SBIS3.CONTROLS.Data.IObject
    * @mixes SBIS3.CONTROLS.Data.Collection.IEnumerable
    * @mixes SBIS3.CONTROLS.Data.Entity.OptionsMixin
    * @mixes SBIS3.CONTROLS.Data.Entity.ObservableMixin
    * @mixes SBIS3.CONTROLS.Data.SerializableMixin
    * @mixes SBIS3.CONTROLS.Data.FormattableMixin
    * @public
    * @author Мальцев Алексей
    */

   var Record = Abstract.extend([IObject, IEnumerable, OptionsMixin, ObservableMixin, SerializableMixin, FormattableMixin], /** @lends SBIS3.CONTROLS.Data.Record.prototype */{
      _moduleName: 'SBIS3.CONTROLS.Data.Record',

      /**
       * @cfg {SBIS3.CONTROLS.Data.Collection.RecordSet} Рекордсет, которому принадлежит запись. Может не принадлежать рекордсету.
       * @name SBIS3.CONTROLS.Data.Record#owner
       * @see getOwner
       */
      $owner: null,

      /**
       * @member {Object.<String, *>} Измененные поля и оригинальные значения
       */
      _changedFields: null,

      /**
       * @member {Object} Объект содержащий закэшированные инстансы значений-объектов
       */
      _propertiesCache: null,

      constructor: function $Record(options) {
         options = options || {};
         if (options) {
            if ('data' in options && !('rawData' in options)) {
               options.rawData = options.data;
               Utils.logger.stack('SBIS3.CONTROLS.Data.Record: option "data" is deprecated and will be removed in 3.7.4. Use "rawData" instead.', 1);
            }
         }

         this._changedFields = {};
         Record.superclass.constructor.call(this, options);
         OptionsMixin.constructor.call(this, options);
         FormattableMixin.constructor.call(this, options);
         this._publish('onPropertyChange');
         this.setRawData(this.$rawData);
      },

      //region SBIS3.CONTROLS.Data.IObject

      get: function (name) {
         if (this._hasInPropertiesCache(name)) {
            return this._getFromPropertiesCache(name);
         }

         var hasValue = this._getRawDataAdapter().has(name),
            value = hasValue ? this._getRawDataValue(name) : undefined;

         if (this._isFieldValueCacheable(value)) {
            this._setToPropertiesCache(name, value);
         }

         return value;
      },

      set: function (name, value) {
         if (!name) {
            Utils.logger.stack('SBIS3.CONTROLS.Data.Record::set(): property name is empty, value can\'t be setted.');
         }

         var oldValue = this._getRawDataValue(name);
         if (!this._isEqualValues(oldValue, value)) {
            this._setRawDataValue(name, value);
            if (!this.has(name)) {
               this._addRawDataField(name);
            }
            this._setChanged(name, oldValue);
            if (this._hasInPropertiesCache(name) &&
               value !== this._propertiesCache[name]
            ) {
               this._unsetFromPropertiesCache(name);
            }
            this._notify('onPropertyChange', name, value);
         }
      },

      has: function (name) {
         return Array.indexOf(this._getRawDataFields(), name) > -1;
      },

      //endregion SBIS3.CONTROLS.Data.IObject

      //region SBIS3.CONTROLS.Data.Collection.IEnumerable

      /**
       * Возвращает энумератор для перебора названий полей записи
       * @returns {SBIS3.CONTROLS.Data.Collection.ArrayEnumerator}
       */
      getEnumerator: function () {
         return new ArrayEnumerator({
            items: this._getRawDataFields()
         });
      },

      /**
       * Перебирает все поля записи
       * @param {Function(String, *)} callback Ф-я обратного вызова для каждого поля. Первым аргументом придет название поля, вторым - его значение.
       * @param {Object} [context] Контекст вызова callback.
       */
      each: function (callback, context) {
         var enumerator = this.getEnumerator(),
            name;
         while ((name = enumerator.getNext())) {
            callback.call(
               context || this,
               name,
               this.get(name)
            );
         }
      },

      //endregion SBIS3.CONTROLS.Data.Collection.IEnumerable

      //region SBIS3.CONTROLS.Data.SerializableMixin

      _getSerializableState: function(state) {
         state = SerializableMixin._getSerializableState.call(this, state);
         state = FormattableMixin._getSerializableState.call(this, state);
         state._changedFields = this._changedFields;
         return state;
      },

      _setSerializableState: function(state) {
         return SerializableMixin._setSerializableState(state)
            .callNext(
               FormattableMixin._setSerializableState(state)
            )
            .callNext(function() {
               this._changedFields = state._changedFields;
            });
      },

      //endregion SBIS3.CONTROLS.Data.SerializableMixin

      //region SBIS3.CONTROLS.Data.FormattableMixin

      setRawData: function(rawData) {
         FormattableMixin.setRawData.call(this, rawData);
         this._clearPropertiesCache();
         this._notify('onPropertyChange');
      },

      setAdapter: function (adapter) {
         FormattableMixin.setAdapter.call(this, adapter);
         this._clearPropertiesCache();
      },

      addField: function(format, at, value) {
         this._checkFormatIsWritable();
         format = this._buildField(format);
         FormattableMixin.addField.call(this, format, at);

         if (value !== undefined) {
            this.set(format.getName(), value);
         }
      },

      removeField: function(name) {
         this._checkFormatIsWritable();
         FormattableMixin.removeField.call(this, name);
      },

      removeFieldAt: function(at) {
         this._checkFormatIsWritable();
         FormattableMixin.removeFieldAt.call(this, at);
      },

      /**
       * Создает адаптер для сырых данных
       * @returns {SBIS3.CONTROLS.Data.Adapter.IRecord}
       * @protected
       */
      _createRawDataAdapter: function () {
         return this.getAdapter().forRecord(this.$rawData);
      },

      /**
       * Проверяет, что формат записи доступен для записи
       * @protected
       */
      _checkFormatIsWritable: function() {
         if (this.$owner) {
            throw new Error('Record format has read only access. You should change recordset format instead. See option "owner" for details.');
         }
      },

      //endregion SBIS3.CONTROLS.Data.FormattableMixin

      //region Public methods

      /**
       * Возвращает признак, что поле с указанным именем было изменено.
       * Если name не передано, то проверяет, что изменено хотя бы одно поле.
       * @param {String} [name] Имя поля
       * @returns {Boolean}
       */
      isChanged: function (name) {
         return name ?
            this._changedFields.hasOwnProperty(name) :
            !Object.isEmpty(this._changedFields);
      },

      /**
       * Проверяет эквивалентность формата и данных другой записи.
       * @param {SBIS3.CONTROLS.Data.Record} record Запись, эквивалентность которой проверяется
       * @returns {Boolean}
       */
      isEqual: function (record) {
         if (record === this) {
            return true;
         }
         if (!record) {
            return false;
         }
         if (!$ws.helpers.instanceOfModule(record, 'SBIS3.CONTROLS.Data.Record')) {
            return false;
         }
         //TODO: когда появятся форматы, сделать через сравнение форматов
         return $ws.helpers.isEqualObject(
            this.getRawData(),
            record.getRawData()
         );
      },

      /**
       * Клонирует запись
       * @returns {SBIS3.CONTROLS.Data.Record}
       */
      clone: function() {
         var serializer = new Serializer();
         return JSON.parse(
            JSON.stringify(this, serializer.serialize),
            serializer.deserialize
         );
      },

      /**
       * Возвращает рекордсет, которому принадлежит запись. Может не принадлежать рекордсету.
       * @returns {SBIS3.CONTROLS.Data.Collection.RecordSet}
       * @see owner
       */
      getOwner: function() {
         return this.$owner;
      },

      /**
       *  Возвращает массив названий измененных полей.
       *  @returns {Array}
       */
      getChanged: function() {
         return Object.keys(this._changedFields);
      },

      /**
       * Забывает измененные поля.
       */
      applyChanges: function() {
         this._changedFields = {};
      },

      //endregion Public methods

      //region Protected methods

      /**
       * Проверяет наличие закэшированного значения поля
       * @param {String} name Название поля
       * @return {Boolean}
       * @protected
       */
      _hasInPropertiesCache: function (name) {
         return this._propertiesCache && this._propertiesCache.hasOwnProperty(name);
      },

      /**
       * Возвращает закэшированноое значение поля
       * @param {String} name Название поля
       * @return {Object}
       * @protected
       */
      _getFromPropertiesCache: function (name) {
         return this._propertiesCache[name];
      },

      /**
       * Кэширует значение поля
       * @param {String} name Название поля
       * @param {Object} value Значение поля
       * @protected
       */
      _setToPropertiesCache: function (name, value) {
         if (this._propertiesCache === null) {
            this._propertiesCache = {};
         }
         this._propertiesCache[name] = value;
      },

      /**
       * Удаляет закэшированноое значение поля
       * @param {String} name Название поля
       * @protected
       */
      _unsetFromPropertiesCache: function (name) {
         delete this._propertiesCache[name];
      },

      /**
       * Обнуляет кэш значений полей
       * @protected
       */
      _clearPropertiesCache: function () {
         this._propertiesCache = null;
      },

      /**
       * Возвращает признак, что значение поля кэшируемое
       * @returns {Boolean}
       * @protected
       */
      _isFieldValueCacheable: function(value) {
         return value && value instanceof Object;
      },

      /**
       * Добавляет поле в список полей
       * @param {String} name Название поля
       * @protected
       */
      _addRawDataField: function(name) {
         this._getRawDataFields().push(name);
      },

      /**
       * Возвращает значение поля из "сырых" данных, прогнанное через фабрику
       * @param {String} name Название поля
       * @returns {*}
       * @protected
       */
      _getRawDataValue: function(name) {
         var adapter = this._getRawDataAdapter();

         try {
            return Factory.cast(
               adapter.get(name),
               adapter.getSharedFormat(name),
               this.getAdapter()
            );
         } catch (e) {
            return undefined;
         }
      },

      /**
       * Прогоняет значение поля через фабрику и сохраняет его в "сырых" данных
       * @param {String} name Название поля
       * @param {*} value Значение поля
       * @protected
       */
      _setRawDataValue: function(name, value) {
         var adapter = this._getRawDataAdapter(),
            format;
         try {
            format = adapter.getSharedFormat(name);
         } catch (e) {
            format = 'String';
         }

         adapter.set(
            name,
            Factory.serialize(
               value,
               format,
               this.getAdapter()
            )
         );

         if (!(this.$rawData instanceof Object)) {
            this.$rawData = adapter.getData();
         }
      },

      /**
       * Сравнивает два значения на эквивалентность (в том числе через интерфейс сравнения)
       * @param {Boolean} a Значение A
       * @param {Boolean} b Значение B
       * @returns {Boolean}
       * @protected
       */
      _isEqualValues: function(a, b) {
         if (a === b) {
            return true;
         }

         if (this._isComparable(a) && this._isComparable(b)) {
            return a.isEqual(b);
         }

         if (a && $ws.helpers.instanceOfModule(a, 'SBIS3.CONTROLS.Data.Types.Enum') &&
            b && $ws.helpers.instanceOfModule(b, 'SBIS3.CONTROLS.Data.Types.Enum')
         ) {
            return a.equals(b);
         }

         if (a && $ws.helpers.instanceOfModule(a, 'SBIS3.CONTROLS.Data.Types.Flags') &&
            b && $ws.helpers.instanceOfModule(b, 'SBIS3.CONTROLS.Data.Types.Flags')
         ) {
            return a.equals(b);
         }

         return false;
      },

      /**
       * Проверяет наличие интерфейса сравнения у объекта
       * @param {Object} value
       * @returns {Boolean}
       * @protected
       */
      _isComparable: function(value) {
         if (!value) {
            return false;
         }
         return $ws.helpers.instanceOfModule(value, 'SBIS3.CONTROLS.Data.Record');
      },

      /**
       * Устанавливает признак изменения поля
       * @param {String} name Название поля
       * @param {Boolean} value Старое значение поля
       * @protected
       */
      _setChanged: function (name, value) {
         if (!this._changedFields.hasOwnProperty(name)) {
            this._changedFields[name] = [value];
         }
      },

      /**
       * Снимает признак изменения поля
       * @param {String} name Название поля
       * @protected
       */
      _unsetChanged: function (name) {
         delete this._changedFields[name];
      }

      //endregion Protected methods
   });

   Di.register('record', Record);

   $ws.proto.Context.registerFieldType(new ContextFieldRecord({module: Record}));

   return Record;
});
