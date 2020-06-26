/* eslint-disable */
define('Controls/interface/IFormController', [
], function() {

   /**
    * Интерфейс для контроллера редактирования записи.
    *
    * @interface Controls/interface/IFormController
    * @public
    * @author Красильников А.С.
    */

   /*
    * Interface for record editing controller
    *
    * @interface Controls/interface/IFormController
    * @public
    * @author Красильников А.С.
    */

   /**
    * @name Controls/interface/IFormController#record
    * @cfg {Types/entity:Model} Устанавливает запись, по данным которой будет инициализирован диалог редактирования.
    */

   /*
    * @name Controls/interface/IFormController#record
    * @cfg {Types/entity:Model} Record that produced the control initialization data.
    */

   /**
    * @name Controls/interface/IFormController#key
    * @cfg {String} Ключ, с помощью которого будет получена запись.
    */

   /*
    * @name Controls/interface/IFormController#key
    * @cfg {String} The key by which the record will be received
    */

   /**
    * @name Controls/interface/IFormController#keyProperty
    * @cfg {String} Имя свойства элемента, однозначно идентифицирующего элемент коллекции.
    */

   /*
    * @name Controls/interface/IFormController#keyProperty
    * @cfg {String} Name of the item property that uniquely identifies collection item
    */

   /**
    * @name Controls/interface/IFormController#isNewRecord
    * @cfg {Boolean} Флаг "Новая запись" означает, что запись инициализируется в источнике данных, но не сохраняется.
    * Если запись помечена флагом isNewRecord, то при сохранении записи запрос на БЛ будет выполнен, даже если запись не изменена.
    * Также при уничтожении контрола будет вызвано удаление записи.
    */

   /*
    * @name Controls/interface/IFormController#isNewRecord
    * @cfg {Boolean} "New record" flag, which means that the record is initialized in the data source, but not saved.
    * If the record is marked isNewRecord flag, when saving the record, the request for BL will be executed, even if the record is not changed.
    * Also when control destroying will be called deleting the record.
    */

   /**
    * @name Controls/interface/IFormController#confirmationShowingCallback
    * @cfg {Function} Функция, которая определяет должно ли показаться окно с подтверждением сохранения/не сохранения измененных данных при закрытии диалога редактирования записи. Необходимо для случаев, когда есть измененные данные, не связанные с рекордом.
    * @returns {Boolean} true - окно покажется. false - нет
    */

   /**
    * @name Controls/interface/IFormController#createMetaData
    * @cfg {Object} Задает ассоциативный массив, который используется только при создании новой записи для инициализации её начальными значениями. Создание записи выполняется методом, который задан в опции {@link Types/source:ICrud#create}.
    * Также, это значение по умолчанию метода create.
    */

   /*
    * @name Controls/interface/IFormController#createMetaData
    * @cfg {Object} Initial values what will be argument of create method called when key option and record option are not exist. More {@link Types/source:ICrud#create}
    * Also its default value for create method.
    */

   /**
    * @name Controls/interface/IFormController#readMetaData
    * @cfg {Object} Устанавливает набор инициализирующих значений, которые будут использованы при чтении записи. Подробнее {@link Types/source:ICrud#read}
    * Также, это значение по умолчанию для метода read.
    */

   /*
    * @name Controls/interface/IFormController#readMetaData
    * @cfg {Object} Additional meta data what will be argument of read method called when key option is exists. More {@link Types/source:ICrud#read}
    * Also its default value for read method.
    */

   /**
    * @name Controls/interface/IFormController#destroyMetaData
    * @cfg {Object} Устанавливает набор инициализирующих значений, которые будут использованы при уничтожении "черновика". Подробнее {@link Types/source:ICrud#destroy}
    * Также, это значение по умолчанию для метода destroy.
    */

   /*
    * @name Controls/interface/IFormController#destroyMetaData
    * @cfg {Object} Additional meta data what will be argument of destroying of draft record. More {@link Types/source:ICrud#destroy}
    * Also its default value for destroy method.
    */

   /**
    * @name Controls/interface/IFormController#errorContainer
    * @cfg {Controls/dataSource:error.IContainerConstructor} Компонент для отображения шаблона ошибки по данным от {@link Controls/_dataSource/_error/Controller}
    */

   /**
    * @typedef {Object} updateConfig
    * @description Параметр сохранения
    * @property {Object} additionalData Дополнительные данные, которые будут обрабатываться при синхронизации записи с реестром
    */

   /**
    * @typedef {Object} updateConfig
    * @description Save option
    * @property {Object} additionalData Additional data that will be processed when synchronizing registry entries
    */

   /**
    * Обновляет запись в источнике данных. Подробнее {@link Types/source:ICrud#update}
    * @function Controls/interface/IFormController#update
    * @param {updateConfig} config Параметр сохранения
    */

   /*
    * Updates a record in the data source.  More {@link Types/source:ICrud#update}
    * @function Controls/interface/IFormController#update
    * @param {updateConfig} Save option
    */

   /**
    * Создает пустую запись через источник данных. Подробнее {@link Types/source:ICrud#create}
    * @function Controls/interface/IFormController#create
    * @param {Object} createMetaData
    */

   /*
    * Creates an empty record through a data source. More {@link Types/source:ICrud#create}
    * @function Controls/interface/IFormController#create
    * @param {Object} createMetaData
    */

   /**
    * Считывает запись из источника данных. Подробнее {@link Types/source:ICrud#read}
    * @function Controls/interface/IFormController#read
    * @param {String} key
    * @param {Object} readMetaData
    */

   /*
    * Reads an entry from a data source.  More {@link Types/source:ICrud#read}
    * @function Controls/interface/IFormController#read
    * @param {String} key
    * @param {Object} readMetaData
    */

   /**
    * Удаляет запись из источника данных. Подробнее {@link Types/source:ICrud#delete}
    * @function Controls/interface/IFormController#delete
    * @param {Object} destroyMetaData
    */

   /*
    * Removes an record from the data source. More {@link Types/source:ICrud#delete}
    * @function Controls/interface/IFormController#delete
    * @param {Object} destroyMetaData
    */

   /**
    * Запускает процесс валидации.
    * @function Controls/interface/IFormController#validate
    * @returns {Core/Deferred} Deferred результата валидации.
    */

   /*
    * Starts validating process.
    * @function Controls/interface/IFormController#validate
    * @returns {Core/Deferred} deferred of result of validation
    */

   /**
    * @event Controls/interface/IFormController#createSuccessed Происходит, когда запись создана успешно.
    * @param {Vdom/Vdom:SyntheticEvent} eventObject Дескриптор события.
    * @param {Types/entity:Model} Редактируемая запись.
    */

   /*
    * @event Controls/interface/IFormController#createSuccessed Happens when record create successful
    * @param {Vdom/Vdom:SyntheticEvent} eventObject Descriptor of the event.
    * @param {Types/entity:Model} Editable record
    */

   /**
    * @event Controls/interface/IFormController#createFailed Происходит, когда запись создать не удалось.
    * @param {Vdom/Vdom:SyntheticEvent} eventObject Дескриптор события.
    * @param {Error} Error
    */

   /*
    * @event Controls/interface/IFormController#createFailed Happens when record create failed
    * @param {Vdom/Vdom:SyntheticEvent} eventObject Descriptor of the event.
    * @param {Error} Error
    */

   /**
    * @event Controls/interface/IFormController#readSuccessed Происходит, когда запись прочитана успешно.
    * @param {Vdom/Vdom:SyntheticEvent} eventObject Дескриптор события.
    * @param {Types/entity:Model} Редактируемая запись.
    */

   /*
    * @event Controls/interface/IFormController#readSuccessed Happens when record read successful
    * @param {Vdom/Vdom:SyntheticEvent} eventObject Descriptor of the event.
    * @param {Types/entity:Model} Editable record
    */

   /**
    * @event Controls/interface/IFormController#readFailed Происходит, когда запись прочитать не удалось.
    * @param {Vdom/Vdom:SyntheticEvent} eventObject Дескриптор события.
    * @param {Error} Error
    */

   /*
    * @event Controls/interface/IFormController#readFailed Happens when record read failed
    * @param {Vdom/Vdom:SyntheticEvent} eventObject Descriptor of the event.
    * @param {Error} Error
    */

   /**
    * @event Controls/interface/IFormController#updateSuccessed Происходит, когда запись обновлена успешно.
    * @param {Vdom/Vdom:SyntheticEvent} eventObject Дескриптор события.
    * @param {Types/entity:Model} Редактируемая запись.
    * @param {String} Ключ редактируемой записи.
    */

   /*
    * @event Controls/interface/IFormController#updateSuccessed Happens when record update successful
    * @param {Vdom/Vdom:SyntheticEvent} eventObject Descriptor of the event.
    * @param {Types/entity:Model} Editable record
    * @param {String} Editable record key
    */

   /**
    * @event Controls/interface/IFormController#updateFailed Происходит, когда обновить запись не удалось.
    * @param {Vdom/Vdom:SyntheticEvent} eventObject Дескриптор события.
    * @param {Error} Error
    */

   /*
    * @event Controls/interface/IFormController#updateFailed Happens when record update failed
    * @param {Vdom/Vdom:SyntheticEvent} eventObject Descriptor of the event.
    * @param {Error} Error
    */

   /**
    * @event Controls/interface/IFormController#deleteSuccessed Происходит, когда запись удалена успешно.
    * @param {Vdom/Vdom:SyntheticEvent} eventObject Дескриптор события.
    * @param {Types/entity:Model} Редактируемая запись.
    */

   /*
    * @event Controls/interface/IFormController#deleteSuccessed Happens when record delete successful
    * @param {Vdom/Vdom:SyntheticEvent} eventObject Descriptor of the event.
    * @param {Types/entity:Model} Editable record
    */

   /**
    * @event Controls/interface/IFormController#deleteFailed Происходит, когда запись удалить не удалось.
    * @param {Vdom/Vdom:SyntheticEvent} eventObject Дескриптор события.
    * @param {Error} Error
    */

   /*
    * @event Controls/interface/IFormController#deleteFailed Happens when record delete failed
    * @param {Vdom/Vdom:SyntheticEvent} eventObject Descriptor of the event.
    * @param {Error} Error
    */

   /**
    * @event Controls/interface/IFormController#isNewRecordChanged Происходит, когда запись инициализируется в источнике данных.
    * @param {Vdom/Vdom:SyntheticEvent} eventObject Дескриптор события.
    * @param {Boolean} isNewRecord
    */

   /*
    * @event Controls/interface/IFormController#isNewRecordChanged Happens when the record is initialized in the data source
    * @param {Vdom/Vdom:SyntheticEvent} eventObject Descriptor of the event.
    * @param {Boolean} isNewRecord
    */

   /**
    * @event Controls/interface/IFormController#requestCustomUpdate Происходит перед сохранением записи.
    * В обработчике события можно отменить  базовую логику сохранения (вернуть true) или отложить ее для выполнения пользовательских действий перед сохранением (вернуть Promise<boolean>).
    * Используется, например, для асинхронной валидации или пользовательского сохранения записи.
    * @param {Vdom/Vdom:SyntheticEvent} eventObject Дескриптор события.
    * @example
    * Проверяет данные на сервере перед сохранением.
    * <pre>
    *    _requestCustomUpdateHandler(): Promise<boolean> {
    *       return this._checkDataOnServer();
    *    }
    * </pre>
    */

   /*
    * @event Controls/interface/IFormController#requestCustomUpdate Happens before saving a record. In the event handler the basic saving logic can be canceled or deferred for user actions before saving. It's used, for example, for asynchronous validation or user saving of a record.
    * @param {Vdom/Vdom:SyntheticEvent} eventObject Descriptor of the event.
    * @example
    * Check the data on the server before saving.
    * <pre>
    *    _requestCustomUpdateHandler(): Promise<boolean> {
    *       return this._checkDataOnServer();
    *    }
    * </pre>
    */
});
