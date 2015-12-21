/* global define, $ws */
define('js!SBIS3.CONTROLS.Data.Source.ISource', [
   'js!SBIS3.CONTROLS.Data.Model',
   'js!SBIS3.CONTROLS.Data.Collection.ObservableList'
], function (Model, ObservableList) {
   'use strict';

   /**
    * Интерфейс источника данных
    * @mixin SBIS3.CONTROLS.Data.Source.ISource
    * @public
    * @author Мальцев Алексей
    */

   return /** @lends SBIS3.CONTROLS.Data.Source.ISource.prototype */{
      $protected: {
         _options: {
            /**
             * @cfg {String} Ресурс, с которым работает источник (имя таблицы, объекта, файла, URL, path и т.п.)
             * @see getResource
             */
            resource: '',

            /**
             * @cfg {SBIS3.CONTROLS.Data.Adapter.IAdapter} Адаптер для работы с данными, по умолчанию {@link SBIS3.CONTROLS.Data.Adapter.Json}
             * @see getAdapter
             * @see setAdapter
             * @see SBIS3.CONTROLS.Data.Adapter.IAdapter
             */
            adapter: null,

            /**
             * @cfg {Function} Конструктор модели, по умолчанию {@link SBIS3.CONTROLS.Data.Model}
             * @see getModel
             * @see setModel
             * @see SBIS3.CONTROLS.Data.Model
             */
            model: Model,

            /**
             * @cfg {Function} Конструктор списка моделей, по умолчанию {@link SBIS3.CONTROLS.Data.Collection.ObservableList}
             * @see getListModule
             * @see setListModule
             * @see SBIS3.CONTROLS.Data.Collection.ObservableList
             */
            listModule: ObservableList,

            /**
             * @cfg {String} Свойство модели, содержащее первичный ключ
             * @see getIdProperty
             * @see setIdProperty
             * @see SBIS3.CONTROLS.Data.Model#idProperty
             */
            idProperty: ''
         }
      },

      /**
       * Возвращает ресурс, с которым работает источник
       * @returns {String}
       * @see resource
       */
      getResource: function () {
         throw new Error('Method must be implemented');
      },

      /**
       * Возвращает адаптер для работы с данными
       * @returns {SBIS3.CONTROLS.Data.Adapter.IAdapter}
       * @see setAdapter
       * @see adapter
       * @see SBIS3.CONTROLS.Data.Adapter.IAdapter
       */
      getAdapter: function () {
         throw new Error('Method must be implemented');
      },

      /**
       * Устанавливает адаптер для работы с данными
       * @param {SBIS3.CONTROLS.Data.Adapter.IAdapter} adapter
       * @see getAdapter
       * @see adapter
       * @see SBIS3.CONTROLS.Data.Adapter.IAdapter
       */
      setAdapter: function (adapter) {
         throw new Error('Method must be implemented');
      },

      /**
       * Возвращает конструктор модели
       * @returns {Function}
       * @see setModel
       * @see model
       * @see SBIS3.CONTROLS.Data.Model
       */
      getModel: function () {
         throw new Error('Method must be implemented');
      },

      /**
       * Устанавливает конструктор модели
       * @param {Function} model
       * @see getModel
       * @see model
       * @see SBIS3.CONTROLS.Data.Model
       * @example
       * <pre>
       *    require(['js!MyModule.Data.MyModel'], function(MyModel) {
       *       dataSource.setModel(MyModel);
       *    });
       * </pre>
       */
      setModel: function (model) {
         throw new Error('Method must be implemented');
      },

      /**
       * Возвращает конструктор списка моделей
       * @returns {Function}
       * @see setListModule
       * @see listModule
       * @see SBIS3.CONTROLS.Data.Collection.List
       */
      getListModule: function () {
         throw new Error('Method must be implemented');
      },

      /**
       * Устанавливает конструктор списка моделей
       * @param {Function} listModule
       * @see getListModule
       * @see listModule
       * @see SBIS3.CONTROLS.Data.Collection.List
       */
      setListModule: function (listModule) {
         throw new Error('Method must be implemented');
      },

      /**
       * Возвращает свойство модели, содержащее первичный ключ
       * @returns {String}
       * @see setIdProperty
       * @see idProperty
       * @see SBIS3.CONTROLS.Data.Model#idProperty
       */
      getIdProperty: function () {
         throw new Error('Method must be implemented');
      },

      /**
       * Устанавливает свойство модели, содержащее первичный ключ
       * @param {String} name
       * @see getIdProperty
       * @see idProperty
       * @see SBIS3.CONTROLS.Data.Model#idProperty
       * @example
       * <pre>
       *    dataSource.setIdProperty('userId');
       * </pre>
       */
      setIdProperty: function (name) {
         throw new Error('Method must be implemented');
      },

      /**
       * Создает пустую модель через источник данных
       * @param {Object} [meta] Дополнительные мета данные
       * @returns {$ws.proto.Deferred} Асинхронный результат выполнения. В колбэке придет {@link SBIS3.CONTROLS.Data.Model}.
       * @see SBIS3.CONTROLS.Data.Model
       * @example
       * <pre>
       *    var dataSource = new Source({
       *       resource: 'Employee'
       *    });
       *    dataSource.create().addCallback(function(employee) {
       *       var newId = employee.get('Id');
       *    });
       * </pre>
       */
      create: function (meta) {
         throw new Error('Method must be implemented');
      },

      /**
       * Читает модель из источника данных
       * @param {String} key Первичный ключ модели
       * @param {Object} [meta] Дополнительные мета данные
       * @returns {$ws.proto.Deferred} Асинхронный результат выполнения. В колбэке придет {@link SBIS3.CONTROLS.Data.Model}.
       * @see SBIS3.CONTROLS.Data.Model
       * @example
       * <pre>
       *    var dataSource = new Source({
       *       resource: 'Employee'
       *    });
       *    dataSource.read(employeeId).addCallback(function(employee) {
       *       var name = employee.get('Name');
       *    });
       * </pre>
       */
      read: function (key, meta) {
         throw new Error('Method must be implemented');
      },

      /**
       * Обновляет модель в источнике данных
       * @param {SBIS3.CONTROLS.Data.Model} model Обновляемая модель
       * @param {Object} [meta] Дополнительные мета данные
       * @returns {$ws.proto.Deferred} Асинхронный результат выполнения
       * @see SBIS3.CONTROLS.Data.Model
       * @example
       * <pre>
       *    var dataSource = new Source({
       *          resource: 'Employee'
       *       }),
       *       employee = new Model({
       *          rawData: {
       *             Id: 13,
       *             Name: 'Paul'
       *          }
       *       });
       *    dataSource.update(employee).addCallback(function() {
       *       //successful update
       *    });
       * </pre>
       */
      update: function (model, meta) {
         throw new Error('Method must be implemented');
      },

      /**
       * Удаляет модель из источника данных
       * @param {String|Array} keys Первичный ключ, или массив первичных ключей модели
       * @param {Object} [meta] Дополнительные мета данные
       * @returns {$ws.proto.Deferred} Асинхронный результат выполнения
       * @example
       * <pre>
       *    var dataSource = new Source({
       *       resource: 'Employee'
       *    });
       *    dataSource.destroy(13).addCallback(function() {
       *       //successful destroy
       *    });
       * </pre>
       */
      destroy: function (keys, meta) {
         throw new Error('Method must be implemented');
      },

      /**
       * Объединяет одну модель с другой
       * @param {String} from Первичный ключ модели-источника
       * @param {String} to Первичный ключ модели-приёмника
       * @returns {$ws.proto.Deferred} Асинхронный результат выполнения
       */
      merge: function (from, to) {
         throw new Error('Method must be implemented');
      },

      /**
       * Создает копию модели
       * @param {String} key Первичный ключ модели
       * @param {Object} [meta] Дополнительные мета данные
       * @returns {$ws.proto.Deferred} Асинхронный результат выполнения
       */
      copy: function (key, meta) {
         throw new Error('Method must be implemented');
      },

      /**
       * @typedef {Object} OrderDetails
       * @property {Boolean} [after=false] Вставить после модели, указанной в {@link to}
       * @property {String} [column] Название столбца, по которому осуществляется сортировка
       * @property {String} [hierColumn] Название столбца, по которому строится иерархия
       */

      /**
       * Выполняет запрос на выборку
       * @param {SBIS3.CONTROLS.Data.Query.Query} [query] Запрос
       * @returns {$ws.proto.Deferred} Асинхронный результат выполнения. В колбэке придет {@link SBIS3.CONTROLS.Data.Source.DataSet}.
       * @see SBIS3.CONTROLS.Data.Query.Query
       * @see SBIS3.CONTROLS.Data.Source.DataSet
       * @example
       * <pre>
       *    var dataSource = new Source({
       *          resource: 'Employee'
       *       }),
       *       query = new Query();
       *    query.select([
       *          'Id',
       *          'Name',
       *          'Position'
       *       ])
       *       .where({
       *          'Position': 'TeamLead',
       *          'Age>=': 18,
       *          'Age<=': 20
       *       })
       *       .orderBy('Age');
       *    dataSource.query(query).addCallback(function(dataSet) {
       *       if (dataSet.getAll().getCount() > 0) {
       *          //Mark Zuckerberg detected
       *       }
       *    });
       * </pre>
       */
      query: function (query) {
         throw new Error('Method must be implemented');
      },

      /**
       * Выполняет команду
       * @param {String} command Команда
       * @param {Object} [data] Данные
       * @returns {$ws.proto.Deferred} Асинхронный результат выполнения. В колбэке придет {@link SBIS3.CONTROLS.Data.Source.DataSet}.
       * @see SBIS3.CONTROLS.Data.Source.DataSet
       * @example
       * <pre>
       *    var dataSource = new Source({
       *       resource: 'Employee'
       *    });
       *    dataSource.call('GiveAGift', {
       *       birthDate: new Date()
       *    }).addCallback(function(dataSet) {
       *       if (dataSet.getAll().getCount() > 0) {
       *          //Today's birthday gifts count
       *       }
       *    });
       * </pre>
       */
      call: function (command, data) {
         throw new Error('Method must be implemented');
      }
   };
});
