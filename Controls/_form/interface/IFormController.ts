/**
 * Интерфейс для контроллера редактирования записи.
 *
 * @interface Controls/_form/interface/IFormController
 * @public
 * @author Красильников А.С.
 */

/*
 * Interface for record editing controller
 *
 * @interface Controls/_form/interface/IFormController
 * @public
 * @author Красильников А.С.
 */

/**
 * @name Controls/_form/interface/IFormController#record
 * @cfg {Types/entity:Model} Устанавливает запись, по данным которой будет инициализирован диалог редактирования.
 */

/*
 * @name Controls/_form/interface/IFormController#record
 * @cfg {Types/entity:Model} Record that produced the control initialization data.
 */

/**
 * @name Controls/_form/interface/IFormController#key
 * @cfg {String} Ключ, с помощью которого будет получена запись.
 */

/*
 * @name Controls/_form/interface/IFormController#key
 * @cfg {String} The key by which the record will be received
 */

/**
 * @name Controls/_form/interface/IFormController#keyProperty
 * @cfg {String} Имя свойства элемента, однозначно идентифицирующего элемент коллекции.
 */

/*
 * @name Controls/_form/interface/IFormController#keyProperty
 * @cfg {String} Name of the item property that uniquely identifies collection item
 */

/**
 * @name Controls/_form/interface/IFormController#isNewRecord
 * @cfg {Boolean} Флаг "Новая запись" означает, что запись инициализируется в источнике данных, но не сохраняется.
 * Если запись помечена флагом isNewRecord, то при сохранении записи запрос на БЛ будет выполнен, даже если запись не изменена.
 * Также при уничтожении контрола будет вызвано удаление записи.
 */

/*
 * @name Controls/_form/interface/IFormController#isNewRecord
 * @cfg {Boolean} "New record" flag, which means that the record is initialized in the data source, but not saved.
 * If the record is marked isNewRecord flag, when saving the record, the request for BL will be executed, even if the record is not changed.
 * Also when control destroying will be called deleting the record.
 */

/**
 * @name Controls/_form/interface/IFormController#confirmationShowingCallback
 * @cfg {Function} Функция, которая определяет должно ли показаться окно с подтверждением сохранения/не сохранения измененных данных при закрытии диалога редактирования записи. Необходимо для случаев, когда есть измененные данные, не связанные с рекордом.
 * @returns {Boolean} true - окно покажется. false - нет.
 */

/**
 * @name Controls/_form/interface/IFormController#createMetaData
 * @cfg {Object} Задает ассоциативный массив, который используется только при создании новой записи для инициализации её начальными значениями. Создание записи выполняется методом, который задан в опции {@link Types/source:ICrud#create}.
 * Также, это значение по умолчанию метода create.
 */

/*
 * @name Controls/_form/interface/IFormController#createMetaData
 * @cfg {Object} Initial values what will be argument of create method called when key option and record option are not exist. More {@link Types/source:ICrud#create}
 * Also its default value for create method.
 */

/**
 * @name Controls/_form/interface/IFormController#readMetaData
 * @cfg {Object} Устанавливает набор инициализирующих значений, которые будут использованы при чтении записи. Подробнее {@link Types/source:ICrud#read}.
 * Также, это значение по умолчанию для метода read.
 */

/*
 * @name Controls/_form/interface/IFormController#readMetaData
 * @cfg {Object} Additional meta data what will be argument of read method called when key option is exists. More {@link Types/source:ICrud#read}
 * Also its default value for read method.
 */

/**
 * @name Controls/_form/interface/IFormController#destroyMetaData
 * @cfg {Object} Устанавливает набор инициализирующих значений, которые будут использованы при уничтожении "черновика". Подробнее {@link Types/source:ICrud#destroy}
 * Также, это значение по умолчанию для метода destroy.
 */

/*
 * @name Controls/_form/interface/IFormController#destroyMetaData
 * @cfg {Object} Additional meta data what will be argument of destroying of draft record. More {@link Types/source:ICrud#destroy}
 * Also its default value for destroy method.
 */

/**
 * @name Controls/_form/interface/IFormController#errorContainer
 * @cfg {Controls/dataSource:error.IContainerConstructor} Компонент для отображения ошибки, он оборачивает весь контент формы.
 * Способ отображения ошибки (диалог, вместо контента или во всю страницу) настраивается через переопределение {@link errorController}.
 * Данную опцию следует определять, если нужно как-то изменить раскладку контента в случае ошибки, если раскладка контрола {@link Controls/_dataSource/_error/Container}, который используется по умолчанию, не устраивает.
 */

/**
 * @name Controls/_form/interface/IFormController#initializingWay
 * @cfg {String} Устанавливает способ инициализации данных диалога редактирования.
 * @variant 'local' Верстка контрола строится по записи, переданной в опцию {@link Controls/_form/interface/IFormController#record record}, запроса на БЛ нет.
 * @variant 'read' Перед построением верстки выполняется метод "Прочитать" по ключу, переданному в опцию {@link Controls/_form/interface/IFormController#key key}. Построение <b>откладывается</b> до ответа БЛ.
 * @variant 'create' Перед построением верстки выполняется метод "Создать", построение <b>откладывается</b> до ответа БЛ.
 * @variant 'delayedRead' Верстка контрола строится по записи, переданной в опцию {@link Controls/_form/interface/IFormController#record record}, параллельно выполняется метод "Прочитать" по ключу,
 * переданному в опции {@link Controls/_form/interface/IFormController#key key}.
 * Построение вёрстки контрола <b>не откладывается.</b>
 * @variant 'delayedCreate' Верстка контрола строится по записи, переданной в опцию
 * {@link Controls/_form/interface/IFormController#record record}, параллельно выполняется метод "Создать".
 * Построение вёрстки контрола <b>не откладывается.</b>
 * @example
 * <pre class="brush: html; highlight: [2]">
 * <!-- WML -->
 * <Controls.form:Controller initializingWay={{_myInitializingWay}}”>
 *    ...
 * </Controls.form:Controller>
 * </pre>
 * <pre class="brush: js;; highlight: [4]">
 * // TypeScript
 * import {INITIALIZING_WAY} from 'Controls/form';
 * _beforeMount() {
 *     this._myInitializingWay = INITIALIZING_WAY.CREATE;
 * }
 * </pre>
 */

/**
 * @typedef {Object} UpdateConfig
 * @description Параметр сохранения.
 * @property {Object} additionalData Дополнительные данные, которые будут обрабатываться при синхронизации записи с реестром.
 */

/*
 * @typedef {Object} UpdateConfig
 * @description Save option
 * @property {Object} additionalData Additional data that will be processed when synchronizing registry entries
 */

/**
 * Обновляет запись в источнике данных. Подробнее {@link Types/source:ICrud#update}.
 * @function Controls/_form/interface/IFormController#update
 * @param {UpdateConfig} config Параметр сохранения.
 */

/*
 * Updates a record in the data source.  More {@link Types/source:ICrud#update}
 * @function Controls/_form/interface/IFormController#update
 * @param {UpdateConfig} Save option
 */

/**
 * Создает пустую запись через источник данных. Подробнее {@link Types/source:ICrud#create}.
 * @function Controls/_form/interface/IFormController#create
 * @param {Object} createMetaData
 */

/*
 * Creates an empty record through a data source. More {@link Types/source:ICrud#create}
 * @function Controls/_form/interface/IFormController#create
 * @param {Object} createMetaData
 */

/**
 * Считывает запись из источника данных. Подробнее {@link Types/source:ICrud#read}.
 * @function Controls/_form/interface/IFormController#read
 * @param {String} key
 * @param {Object} readMetaData
 */

/*
 * Reads an entry from a data source.  More {@link Types/source:ICrud#read}
 * @function Controls/_form/interface/IFormController#read
 * @param {String} key
 * @param {Object} readMetaData
 */

/**
 * Удаляет запись из источника данных. Подробнее {@link Types/source:ICrud#delete}.
 * @function Controls/_form/interface/IFormController#delete
 * @param {Object} destroyMetaData
 */

/*
 * Removes an record from the data source. More {@link Types/source:ICrud#delete}
 * @function Controls/_form/interface/IFormController#delete
 * @param {Object} destroyMetaData
 */

/**
 * Запускает процесс валидации.
 * @function Controls/_form/interface/IFormController#validate
 * @returns {Core/Deferred} Deferred результата валидации.
 */

/*
 * Starts validating process.
 * @function Controls/_form/interface/IFormController#validate
 * @returns {Core/Deferred} deferred of result of validation
 */

/**
 * @event Происходит, когда запись создана успешно.
 * @name Controls/_form/interface/IFormController#createsuccessed
 * @param {Vdom/Vdom:SyntheticEvent} eventObject Дескриптор события.
 * @param {Types/entity:Model} record Редактируемая запись.
 * @see createfailed
 */

/*
 * @event Happens when record create successful
 * @name Controls/_form/interface/IFormController#createsuccessed
 * @param {Vdom/Vdom:SyntheticEvent} eventObject Descriptor of the event.
 * @param {Types/entity:Model} Editable record
 */

/**
 * @event Происходит, когда запись создать не удалось.
 * @name Controls/_form/interface/IFormController#createfailed
 * @param {Vdom/Vdom:SyntheticEvent} eventObject Дескриптор события.
 * @param {Error} Error
 * @see createsuccessed
 */

/*
 * @event Happens when record create failed
 * @name Controls/_form/interface/IFormController#createfailed
 * @param {Vdom/Vdom:SyntheticEvent} eventObject Descriptor of the event.
 * @param {Error} Error
 */

/**
 * @event Происходит, когда запись прочитана успешно.
 * @name Controls/_form/interface/IFormController#readsuccessed
 * @param {Vdom/Vdom:SyntheticEvent} eventObject Дескриптор события.
 * @param {Types/entity:Model} record Редактируемая запись.
 * @see readfailed
 */

/*
 * @event Happens when record read successful
 * @name Controls/_form/interface/IFormController#readsuccessed
 * @param {Vdom/Vdom:SyntheticEvent} eventObject Descriptor of the event.
 * @param {Types/entity:Model} Editable record
 */

/**
 * @event Происходит, когда запись прочитать не удалось.
 * @name Controls/_form/interface/IFormController#readfailed
 * @param {Vdom/Vdom:SyntheticEvent} eventObject Дескриптор события.
 * @param {Error} Error
 * @see readsuccessed
 */

/*
 * @event Happens when record read failed
 * @name Controls/_form/interface/IFormController#readfailed
 * @param {Vdom/Vdom:SyntheticEvent} eventObject Descriptor of the event.
 * @param {Error} Error
 */

/**
 * @event Происходит, когда запись обновлена успешно.
 * @name Controls/_form/interface/IFormController#updatesuccessed
 * @param {Vdom/Vdom:SyntheticEvent} eventObject Дескриптор события.
 * @param {Types/entity:Model} record Редактируемая запись.
 * @param {String} key Ключ редактируемой записи.
 * @see updatefailed
 */

/*
 * @event Happens when record update successful
 * @name Controls/_form/interface/IFormController#updatesuccessed
 * @param {Vdom/Vdom:SyntheticEvent} eventObject Descriptor of the event.
 * @param {Types/entity:Model} Editable record
 * @param {String} Editable record key
 */

/**
 * @event Происходит, когда обновить запись не удалось.
 * @name Controls/_form/interface/IFormController#updatefailed
 * @param {Vdom/Vdom:SyntheticEvent} eventObject Дескриптор события.
 * @param {Error} Error
 * @see updatesuccessed
 */

/*
 * @event Happens when record update failed
 * @name Controls/_form/interface/IFormController#updatefailed
 * @param {Vdom/Vdom:SyntheticEvent} eventObject Descriptor of the event.
 * @param {Error} Error
 */

/**
 * @event Происходит, когда запись удалена успешно.
 * @name Controls/_form/interface/IFormController#deletesuccessed
 * @param {Vdom/Vdom:SyntheticEvent} eventObject Дескриптор события.
 * @param {Types/entity:Model} record Редактируемая запись.
 * @see deletefailed
 */

/*
 * @event Happens when record delete successful
 * @name Controls/_form/interface/IFormController#deletesuccessed
 * @param {Vdom/Vdom:SyntheticEvent} eventObject Descriptor of the event.
 * @param {Types/entity:Model} Editable record
 */

/**
 * @event Происходит, когда запись удалить не удалось.
 * @name Controls/_form/interface/IFormController#deletefailed
 * @param {Vdom/Vdom:SyntheticEvent} eventObject Дескриптор события.
 * @param {Error} Error
 * @see deletesuccessed
 */

/*
 * @event Happens when record delete failed
 * @name Controls/_form/interface/IFormController#deletefailed
 * @param {Vdom/Vdom:SyntheticEvent} eventObject Descriptor of the event.
 * @param {Error} Error
 */

/**
 * @event Происходит, когда запись инициализируется в источнике данных.
 * @name Controls/_form/interface/IFormController#isNewRecordChanged
 * @param {Vdom/Vdom:SyntheticEvent} eventObject Дескриптор события.
 * @param {Boolean} isNewRecord
 */

/*
 * @event Happens when the record is initialized in the data source
 * @name Controls/_form/interface/IFormController#isNewRecordChanged
 * @param {Vdom/Vdom:SyntheticEvent} eventObject Descriptor of the event.
 * @param {Boolean} isNewRecord
 */

/**
 * @event Происходит перед сохранением записи.
 * @name Controls/_form/interface/IFormController#requestCustomUpdate
 * @param {Vdom/Vdom:SyntheticEvent} eventObject Дескриптор события.
 * @param {Types/entity:Model} record Редактируемая запись.
 * @remark
 * В обработчике события можно отменить  базовую логику сохранения (вернуть true) или отложить ее для выполнения пользовательских действий перед сохранением (вернуть Promise<boolean>).
 * Используется, например, для асинхронной валидации или пользовательского сохранения записи.
 * @example
 * Проверяет данные на сервере перед сохранением.
 * <pre class="brush: js;">
 * // TypeScript
 * _requestCustomUpdateHandler(): Promise<boolean> {
 *     return this._checkDataOnServer();
 * }
 * </pre>
 */

/*
 * @event Happens before saving a record. In the event handler the basic saving logic can be canceled or deferred for user actions before saving. It's used, for example, for asynchronous validation or user saving of a record.
 * @name Controls/_form/interface/IFormController#requestCustomUpdate
 * @param {Vdom/Vdom:SyntheticEvent} eventObject Descriptor of the event.
 * @param {Types/entity:Model} record Editable record.
 * @example
 * Check the data on the server before saving.
 * <pre>
 *    _requestCustomUpdateHandler(): Promise<boolean> {
 *       return this._checkDataOnServer();
 *    }
 * </pre>
 */
