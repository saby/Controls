/* eslint-disable */
define('Controls/interface/IEditableList', [
], function() {

   /**
    * Интерфейс для списков с возможностью редактирования по месту.
    *
    * @interface Controls/interface/IEditableList
    * @public
    * @author Авраменко А.С.
    * @see Controls/View
    * @remark
    * Разница между этим интерфейсом и {@link Controls/View Controls/editableArea:View} заключается в том, что первый используется в списках, а второй - вне их (например, на вкладках).
    */

   /*
    * Interface for lists that have editing. The difference between this interface and {@link Controls/View Controls/editableArea:View} is that the former is used in lists and the latter is used outside of them (e.g., in tabs).
    *
    * @interface Controls/interface/IEditableList
    * @public
    * @author Авраменко А.С.
    * @see Controls/View
    */

   /**
    * @typedef {Object} ItemEditOptions
    * @property {Types/entity:Record} [options.item] Запись с исходными данными.
    */

   /*
    * @typedef {Object} ItemEditOptions
    * @property {Types/entity:Record} [options.item] Record with initial data.
    */

   /**
    * @typedef {Enum} AddPositionOption
    * @variant top Редактирование по месту откроется в начале списка.
    * @variant bottom Редактирование по месту откроется в конце списка.
    * @default bottom
    */

   /*
    * @typedef {Enum} AddPositionOption
    * @variant top Editing in place will appear at the top of the list.
    * @variant bottom Editing in place will appear at the bottom of the list.
    * @default bottom
    */

   /**
    * @typedef {Object} EditingConfig
    * @property {Boolean} [editOnClick=false] Если передано значение "true", клик по элементу списка начинает редактирование по месту.
    * @property {Boolean} [autoAdd=false] Если передано значение "true", после окончания редактирования последнего (уже сущестсвующего) элемента списка автоматически добавляется новый элемент и начинается его редактирование.
    * @property {Boolean} [autoAddByApplyButton=false] Если передано значение "true", после окончания редактирования только что добавленного элемента списка автоматически добавляется новый элемент и начинается его редактирование.
    * @property {Boolean} [sequentialEditing=true] Если передано значение "true", после окончания редактирования любого элемента списка, кроме последнего, автоматически запускается редактирование следующего элемента списка.
    * @property {Boolean} [toolbarVisibility=false] Определяет, должны ли отображаться кнопки "Сохранить" и "Отмена".
    * @property {AddPositionOption} [addPosition] Позиция редактирования по месту.
    * @property {Types/entity:Record} [item=undefined] Запись, которая будет запущена на редактирование при первой отрисовке списка.
    * Такая запись должна присутствовать в {@link Types/source:DataSet}, который получен от источника данных и отрисован контролом.
    * Когда выполнено это условие, после редактирования такой записи она удачно сохраняется в источнике данных.
    *
    * Создание записи выполняют по следующему алгоритму:
    *
    * 1. В хуке <a href="/doc/platform/developmentapl/interface-development/ui-library/control/#phase-before-mount">_beforeMount()</a> опишите {@link Types/source:SbisService источник данных бизнес-логики} (далее SbisService).
    * 2. Из этого источника запросите набор данных (далее DataSet). Полученный DataSet будет передан в контрол для отрисовки.
    * 3. В {@link Core/Deferred#addCallback обработчике} запроса создайте источник данных {@link Types/source:PrefetchProxy}, в который передайте SbisService и DataSet.
    * 4. Создайте редактируемую запись и добавьте её в DataSet.
    *     * Примечание: создание редактируемой записи можно выполнять по некоторому условию (см. пример ниже).
    * 5. Передайте редактируемую запись в опцию {@link editingConfig}.
    *
    * Далее показан пример создания редактируемой записи.
    *
    * * JavaScript
    * <pre class="brush: js">
    * _BLsource: null,
    * _editRecord: null,
    * _source: null,
    *
    * // Хук отрабатывает до отрисовки контрола.
    * _beforeMount: function(options) {
    *
    *    // Создаём экземпляр источника данных.
    *    this._BLsource = new source.SbisService({ ... });
    *
    *    // Асинхронно получаем набор данных, который отрисует контрол.
    *    return this._BLsource.query(query).addCallback(function (DataSet) {
    *       var recordSet = DataSet.getAll();
    *       self._source = new source.PrefetchProxy({
    *          data: {
    *
    *             // Это набор данных, который отрисует контрол.
    *             query: DataSet
    *          },
    *
    *          // Это целевой источник бизнес-логика.
    *          target: self._BLsource
    *       });
    *
    *       // Здесь создано прикладное условие.
    *       // В DataSet добавляется та самая запись, которая
    *       // запускается на редактирование при первой отрисовке контрола.
    *       if (recordSet.getCount() === 0 && !options.readOnly) {
    *          return self._BLsource.create().addCallback(function (record){
    *             record.set('ВидЦены', <value>);
    *             record.acceptChanges();
    *
    *             // Сохраняем редактируемую запись.
    *             // Этой настройкой будет передана редактируемая запись в опцию editingConfig.
    *             self._editRecord = record;
    *          });
    *       } else
    *          return true;
    *    });
    * }
    * </pre>
    * * WML
    * <pre>
    * <Controls.list:DataContainer source="{{_source}}">
    *   <Controls.explorer:View>
    *       <ws:editingConfig item="{{ _editRecord }}" />
    *   </Controls.explorer:View>
    * </Controls.list:DataContainer>
    * </pre>
    */

   /*
    * @typedef {Object} EditingConfig
    * @property {Boolean} [editOnClick=false] If true, click on list item starts editing in place.
    * @property {Boolean} [autoAdd=false] If true, after the end of editing of the last list item, new item adds automatically and its editing begins.
    * @property {Boolean} [sequentialEditing=true] If true, after the end of editing of any list item other than the last, editing of the next list item starts automatically.
    * @property {Boolean} [toolbarVisibility=false] Determines whether buttons 'Save' and 'Cancel' should be displayed.
    * @property {AddPosition} [addPosition] Editing in place position.
    * @property {Types/entity:Record} [item=undefined] If present, editing of this item will begin on first render.
    */

   /**
    * @typedef {String|Types/entity:Record|Core/Deferred} ItemEditResult
    * @variant cancel Отменить начало редактирования.
    * @variant options Параметры редактирования.
    * @variant deferred Используется для асинхронной подготовки редактируемой записи. Необходимо выполнить deffered с {@link ItemEditOptions ItemEditOptions} или 'Cancel'. Если процесс занимает слишком много времени, будет показан индикатор загрузки.
    */

   /*
    * @typedef {String|Types/entity:Record|Core/Deferred} ItemEditResult
    * @variant cancel Cancel start of editing.
    * @variant options Options of editing.
    * @variant deferred Deferred is used for asynchronous preparation of edited record. It is necessary to fullfill deferred with {@link ItemEditOptions ItemEditOptions} or 'Cancel'. If deferred takes too long to resolve then loading indicator will be shown.
    */

   /**
    * @typedef {String|Promise} EndEditResult
    * @variant Cancel Отмена окончания редактирования или добавления записи.
    * @variant Promise Применяется для реализации собственной логики сохранения изменений.
    * В этом случае базовая логика сохранения не используется, и поэтому вся ответственность за сохранение изменений перекладывается на прикладного разработчика.
    * Событие {@link afterEndEdit} произойдет после завершения deferred, который возвращен из обработчика события {@link beforeEndEdit}.
    */

   /*
    * @typedef {String|Core/Deferred} EndEditResult
    * @variant Cancel Cancel ending of editing\adding.
    * @variant Deferred Deferred is used for saving with custom logic.
    */

   /**
    * @event Controls/interface/IEditableList#beforeBeginEdit Происходит перед началом редактирования.
    * @param {Vdom/Vdom:SyntheticEvent} eventObject Дескриптор события.
    * @param {ItemEditOptions} options Параметры редактирования.
    * @param {Boolean} isAdd Значение true является признаком, что запись добавляется по месту.
    * @returns {ItemEditResult}
    * @example
    * В следующем примере показано, как запретить редактирование элемента, если он соответствует условию:
    * WML:
    * <pre>
    *    <Controls.list:View on:beforeBeginEdit="beforeBeginEditHandler()" />
    * </pre>
    * JS:
    * <pre>
    *    define('ModuleName', ['Controls/Constants'], function(constants) {
    *       ...
    *       beforeBeginEditHandler: function(e, options) {
    *          if (options.item.getId() === 1) {
    *             return constants.editing.CANCEL;
    *          }
    *       }
    *    });
    * </pre>
    * В следующем примере показано, как прочитать элемент из БЛ и открыть его для редактирования:
    * WML:
    * <pre>
    *    <Controls.list:View on:beforeBeginEdit="beforeBeginEditHandler()" />
    * </pre>
    * JS:
    * <pre>
    *    beforeBeginEditHandler: function(e, options) {
    *       return this.source.read(options.item.getId()).addCallback(function(result) {
    *          return {
    *             item: result
    *          };
    *       });
    *    }
    * </pre>
    * В следующем примере показано, как начать редактирование элемента, созданного на клиенте:
    * WML:
    * <pre>
    *    <Controls.list:View on:beforeBeginEdit="beforeBeginEditHandler()" />
    * </pre>
    * JS:
    * <pre>
    *    define('ModuleName', ['Types/entity'], function(entity) {
    *       ...
    *       beforeBeginEditHandler: function(e, options) {
    *          return {
    *             item: new entity.Model({
    *                rawData: {
    *                   //Obviously, you would use something else instead of Date.now() to generate id, but we'll use it here to keep the example simple
    *                   id: Date.now(),
    *                   title: ''
    *                }
    *             })
    *          }
    *       }
    *    });
    * </pre>
    * @see afterBeginEdit
    * @see beforeEndEdit
    * @see afterEndEdit
    * @see editingConfig
    */

   /*
    * @event Controls/interface/IEditableList#beforeBeginEdit Occurs before the start of editing.
    * @param {Vdom/Vdom:SyntheticEvent} eventObject Descriptor of the event.
    * @param {ItemEditOptions} options Options of editing.
    * @param {Boolean} isAdd
    * @returns {ItemEditResult}
    * @example
    * The following example shows how to prevent editing of an element if it matches condition:
    * WML:
    * <pre>
    *    <Controls.list:View on:beforeBeginEdit="beforeBeginEditHandler()" />
    * </pre>
    * JS:
    * <pre>
    *    define('ModuleName', ['Controls/Constants'], function(constants) {
    *       ...
    *       beforeBeginEditHandler: function(e, options) {
    *          if (options.item.getId() === 1) {
    *             return constants.editing.CANCEL;
    *          }
    *       }
    *    });
    * </pre>
    * The following example shows how to read item from BL and open it for editing.
    * WML:
    * <pre>
    *    <Controls.list:View on:beforeBeginEdit="beforeBeginEditHandler()" />
    * </pre>
    * JS:
    * <pre>
    *    beforeBeginEditHandler: function(e, options) {
    *       return this.source.read(options.item.getId()).addCallback(function(result) {
    *          return {
    *             item: result
    *          };
    *       });
    *    }
    * </pre>
    * The following example shows how to start editing with an item created on the client.
    * WML:
    * <pre>
    *    <Controls.list:View on:beforeBeginEdit="beforeBeginEditHandler()" />
    * </pre>
    * JS:
    * <pre>
    *    define('ModuleName', ['Types/entity'], function(entity) {
    *       ...
    *       beforeBeginEditHandler: function(e, options) {
    *          return {
    *             item: new entity.Model({
    *                rawData: {
    *                   //Obviously, you would use something else instead of Date.now() to generate id, but we'll use it here to keep the example simple
    *                   id: Date.now(),
    *                   title: ''
    *                }
    *             })
    *          }
    *       }
    *    });
    * </pre>
    * @see afterBeginEdit
    * @see beforeEndEdit
    * @see afterEndEdit
    * @see editingConfig
    */

   /**
    * @event Controls/interface/IEditableList#afterBeginEdit Происходит после начала редактирования\добавления.
    * @param {Vdom/Vdom:SyntheticEvent} eventObject Дескриптор события.
    * @param {Types/entity:Record} item Редактируемая запись.
    * @param {Boolean} isAdd Флаг, который позволяет различать редактирование и добавление.
    * @remark
    * Подпишитесь на событие, если необходимо что-либо сделать после начала редактирования (например, скрыть кнопку "Добавить").
    * Событие запускается, когда подготовка данных успешно завершена и возможно безопасно обновить пользовательский интерфейс.
    * @example
    * В следующем примере показано, как скрыть кнопку "Добавить" после начала редактирования\добавления.
    * WML:
    * <pre>
    *    <Controls.list:View on:afterBeginEdit="afterBeginEditHandler()" />
    *    <ws:if data="{{ showAddButton }}">
    *       <Controls.list:AddButton />
    *    </ws:if>
    * </pre>
    * JS:
    * <pre>
    *    afterBeginEditHandler: function(e, item, isAdd) {
    *       this.showAddButton = false;
    *    }
    * </pre>
    * @see beforeBeginEdit
    * @see beforeEndEdit
    * @see afterEndEdit
    */

   /*
    * @event Controls/interface/IEditableList#afterBeginEdit Occurs after the start of editing\adding.
    * @param {Vdom/Vdom:SyntheticEvent} eventObject Descriptor of the event.
    * @param {Types/entity:Record} item Editing record.
    * @param {Boolean} isAdd Flag which allows to differentiate between editing and adding.
    * @remark
    * This event is useful if you want to do something after the editing has started, for example hide an add button.
    * The main difference between this event and {@link beforeBeginEdit beforeBeginEdit} is that this event fires when the preparation of the data has successfully finished and it is safe to update your UI.
    * @example
    * The following example shows how to hide the add button after the start of editing\adding.
    * WML:
    * <pre>
    *    <Controls.list:View on:afterBeginEdit="afterBeginEditHandler()" />
    *    <ws:if data="{{ showAddButton }}">
    *       <Controls.list:AddButton />
    *    </ws:if>
    * </pre>
    * JS:
    * <pre>
    *    afterBeginEditHandler: function(e, item, isAdd) {
    *       this.showAddButton = false;
    *    }
    * </pre>
    * @see beforeBeginEdit
    * @see beforeEndEdit
    * @see afterEndEdit
    */

   /**
    * @event Controls/interface/IEditableList#beforeEndEdit Происходит перед завершением редактирования или добавления записи.
    * @param {Vdom/Vdom:SyntheticEvent} eventObject Дескриптор события.
    * @param {Types/entity:Record} item Редактируемая запись.
    * @param {Boolean} willSave Определяет, будут ли сохранены изменения в редактируемом элементе.
    * @param {Boolean} isAdd Аргумент принимает значение true, если событие произошло перед добавлением записи, и false — в случае редактирования.
    * @returns {EndEditResult}
    * @demo Controls-demo/list_new/EditInPlace/EndEdit/Index
    * @remark
    * Используйте событие, если необходимо проверить данные и отменить изменения. По умолчанию для сохранения изменений вызывается метод обновления списка.
    * Не обновляйте пользовательский интерфейс в обработчике этого события, потому что если во время подготовки данных произойдет ошибка, вам придется откатить изменения.
    * @example
    * В следующем примере показано завершение редактирования элемента, если выполнено условие.
    * <pre class="brush:html;">
    * <!-- WML -->
    *    <Controls.list:View on:beforeEndEdit="beforeEndEditHandler()" />
    * </pre>
    * <pre class="brush: js; highlight: [4,5,6,7,8]">
    * // JavaScript
    * define('ModuleName', ['Controls/Constants'], function(constants) {
    *    ...
    *    beforeEndEditHandler: function(e, item, commit, isAdd) {
    *       if (!item.get('text').length) {
    *          return constants.editing.CANCEL;
    *       }
    *    }
    * });
    * </pre>
    * @see beforeBeginEdit
    * @see afterBeginEdit
    * @see afterEndEdit
    */

   /*
    * @event Controls/interface/IEditableList#beforeEndEdit Occurs before the end of editing\adding.
    * @param {Vdom/Vdom:SyntheticEvent} eventObject Descriptor of the event.
    * @param {Types/entity:Record} item Editing record.
    * @param {Boolean} willSave Determines whether changes to editing item will be saved.
    * @param {Boolean} isAdd Flag which allows to differentiate between editing and adding.
    * @returns {EndEditResult}
    * @remark
    * This event is useful if you want to validate data and cancel if needed or if you want to handle saving yourself. By default, list's update method will be called to save changes.
    * Don't update your UI in the handler of this event because if an error happens during preparation of data you'll have to rollback your changes.
    * @example
    * The following example shows how to prevent the end of editing of an element if it matches condition:
    * WML:
    * <pre>
    *    <Controls.list:View on:beforeEndEdit="beforeEndEditHandler()" />
    * </pre>
    * JS:
    * <pre>
    *    define('ModuleName', ['Controls/Constants'], function(constants) {
    *       ...
    *       beforeEndEditHandler: function(e, item, commit, isAdd) {
    *          if (!item.get('text').length) {
    *             return constants.editing.CANCEL;
    *          }
    *       }
    *    });
    * </pre>
    * @see beforeBeginEdit
    * @see afterBeginEdit
    * @see afterEndEdit
    */

   /**
    * @event Controls/interface/IEditableList#afterEndEdit Происходит после завершения редактирования\добавления.
    * @param {Vdom/Vdom:SyntheticEvent} eventObject Дескриптор события.
    * @param {Types/entity:Record} item Редактируемая запись.
    * @param {Boolean} isAdd Флаг, который позволяет различать редактирование и добавление.
    * @remark
    * Подпишитесь на событие, если необходимо что-либо сделать после завершения редактирования (например, показать кнопку "Добавить").
    * Событие запускается, когда редактирование успешно завершено и возможно безопасно обновить пользовательский интерфейс.
    * @example
    * В следующем примере показано, как отобразить кнопку "Добавить" после окончания редактирования\добавления.
    * WML:
    * <pre>
    *    <Controls.list:View on:afterEndEdit="afterEndEditHandler()" />
    *    <ws:if data="{{ showAddButton }}">
    *       <Controls.list:AddButton />
    *    </ws:if>
    * </pre>
    * JS:
    * <pre>
    *    afterEndEditHandler: function() {
    *       this.showAddButton = true;
    *    }
    * </pre>
    * @see beforeBeginEdit
    * @see afterBeginEditа
    * @see beforeEndEdit
    */

   /*
    * @event Controls/interface/IEditableList#afterEndEdit Occurs after the end of editing\adding.
    * @param {Vdom/Vdom:SyntheticEvent} eventObject Descriptor of the event.
    * @param {Types/entity:Record} item Editing record.
    * @param {Boolean} isAdd Flag which allows to differentiate between editing and adding.
    * @remark
    * This event is useful if you want to do something after the end of editing, for example show an add button.
    * The main difference between this event and {@link beforeEndEdit beforeEndEdit} is that this event fires when the editing has successfully finished and it is safe to update your UI.
    * @example
    * The following example shows how to show the add button after the end of editing\adding.
    * WML:
    * <pre>
    *    <Controls.list:View on:afterEndEdit="afterEndEditHandler()" />
    *    <ws:if data="{{ showAddButton }}">
    *       <Controls.list:AddButton />
    *    </ws:if>
    * </pre>
    * JS:
    * <pre>
    *    afterEndEditHandler: function() {
    *       this.showAddButton = true;
    *    }
    * </pre>
    * @see beforeBeginEdit
    * @see afterBeginEdit
    * @see beforeEndEdit
    */

   /**
    * @cfg {EditingConfig} Конфигурация редактирования по месту.
    * <a href="/materials/Controls-demo/app/Controls-demo%2FList%2FList%2FEditableListPG">Example</a>.
    * @name Controls/interface/IEditableList#editingConfig
    * @example
    * WML:
    * <pre>
    *    <Controls.list:View>
    *       <ws:editingConfig editOnClick="{{true}}" toolbarVisibility="{{true}}" />
    *    </Controls.list:View>
    * </pre>
    */

   /*
    * @cfg {EditingConfig} Configuration for editing in place.
    * <a href="/materials/Controls-demo/app/Controls-demo%2FList%2FList%2FEditableListPG">Example</a>.
    * @name Controls/interface/IEditableList#editingConfig
    * @example
    * WML:
    * <pre>
    *    <Controls.list:View>
    *       <ws:editingConfig editOnClick="{{true}}" toolbarVisibility="{{true}}" />
    *    </Controls.list:View>
    * </pre>
    */

   /**
    * Начинает редактирование по месту.
    * @function Controls/interface/IEditableList#beginEdit
    * @param {ItemEditOptions} options Параметры редактирования.
    * @returns {Core/Deferred}
    * @remark
    * Используйте этот метод в ситуациях, когда вы хотите начать редактирование из нестандартного места, например, из панели действий элемента.
    * @example
    * В следующем примере показано, как начать редактирование элемента.
    * WML:
    * <pre>
    *    <Controls.list:View name="list" />
    * </pre>
    * JS:
    * <pre>
    *    foo: function() {
    *       this._children.list.beginEdit({
    *          item: this._items.at(0)
    *       });
    *    }
    * </pre>
    * @see beginAdd
    * @see commitEdit
    * @see cancelEdit
    */

   /*
    * Starts editing.
    * @function Controls/interface/IEditableList#beginEdit
    * @param {ItemEditOptions} options Options of editing.
    * @returns {Core/Deferred}
    * @remark
    * Use this method in situations when you want to start editing from an unusual location, e.g., from item actions.
    * @example
    * The following example shows how to start editing of an item.
    * WML:
    * <pre>
    *    <Controls.list:View name="list" />
    * </pre>
    * JS:
    * <pre>
    *    foo: function() {
    *       this._children.list.beginEdit({
    *          item: this._items.at(0)
    *       });
    *    }
    * </pre>
    * @see beginAdd
    * @see commitEdit
    * @see cancelEdit
    */

   /**
    * Начинает добавление элемента.
    * @function Controls/interface/IEditableList#beginAdd
    * @param {ItemEditOptions} options Параметры добавления.
    * @returns {Core/Deferred}
    * @remark
    * Если вы не передадите параметры, будет вызван метод {@link Types/source:ICrud#create create} источника списка, и результат будет добавлен в список.
    * @example
    * В следующем примере показано, как начать добавление элемента.
    * WML:
    * <pre>
    *    <Controls.list:View name="list" />
    * </pre>
    * JS:
    * <pre>
    *    foo: function() {
    *       this._children.list.beginAdd();
    *    }
    * </pre>
    * @see beginEdit
    * @see commitEdit
    * @see cancelEdit
    */

   /*
    * Starts adding.
    * @function Controls/interface/IEditableList#beginAdd
    * @param {ItemEditOptions} options Options of adding.
    * @returns {Core/Deferred}
    * @remark
    * If you don't pass the options then {@link Types/source:ICrud#create create} method of the list's source will be called and the result will be added to the list.
    * @example
    * The following example shows how to start editing of an item.
    * WML:
    * <pre>
    *    <Controls.list:View name="list" />
    * </pre>
    * JS:
    * <pre>
    *    foo: function() {
    *       this._children.list.beginAdd();
    *    }
    * </pre>
    * @see beginEdit
    * @see commitEdit
    * @see cancelEdit
    */

   /**
    * Завершает редактирование и фиксирует изменения.
    * @function Controls/interface/IEditableList#commitEdit
    * @returns {Core/Deferred}
    * @remark
    * Используйте этот метод, когда вы хотите завершить редактирование в ответ на действие пользователя,
    * например, когда пользователь пытается закрыть диалоговое окно, используйте этот метод для сохранения изменений.
    * @example
    * В следующем примере показано, как завершить редактирование и зафиксировать изменения.
    * WML:
    * <pre>
    *    <Controls.list:View name="list" />
    * </pre>
    * JS:
    * <pre>
    *    foo: function() {
    *       this._children.list.commitEdit();
    *    }
    * </pre>
    * @see beginEdit
    * @see beginAdd
    * @see cancelEdit
    */

   /*
    * Ends editing and commits changes.
    * @function Controls/interface/IEditableList#commitEdit
    * @returns {Core/Deferred}
    * @remark
    * Use this method when you want to end editing in response to user action, e.g., when a user tries to close a dialog you'd use this method to save changes.
    * @example
    * The following example shows how to end editing and commit changes.
    * WML:
    * <pre>
    *    <Controls.list:View name="list" />
    * </pre>
    * JS:
    * <pre>
    *    foo: function() {
    *       this._children.list.commitEdit();
    *    }
    * </pre>
    * @see beginEdit
    * @see beginAdd
    * @see cancelEdit
    */

   /**
    * Завершает редактирование и удаляет изменения.
    * @function Controls/interface/IEditableList#cancelEdit
    * @returns {Core/Deferred}
    * @remark
    * Используйте этот метод, когда вы хотите завершить редактирование в ответ на действия пользователя, например, когда пользователь нажимает на кнопку "Отмена".
    * @example
    * В следующем примере показано, как завершить редактирование и отменить изменения.
    * WML:
    * <pre>
    *    <Controls.list:View name="list" />
    * </pre>
    * JS:
    * <pre>
    *    foo: function() {
    *       this._children.list.cancelEdit();
    *    }
    * </pre>
    * @see beginEdit
    * @see beginAdd
    * @see commitEdit
    */

   /*
    * Ends editing and discards changes.
    * @function Controls/interface/IEditableList#cancelEdit
    * @returns {Core/Deferred}
    * @remark
    * Use this method when you want to end editing in response to user action, e.g., when a user clicks on a 'Cancel' button.
    * @example
    * The following example shows how to end editing and discard changes.
    * WML:
    * <pre>
    *    <Controls.list:View name="list" />
    * </pre>
    * JS:
    * <pre>
    *    foo: function() {
    *       this._children.list.cancelEdit();
    *    }
    * </pre>
    * @see beginEdit
    * @see beginAdd
    * @see commitEdit
    */

});
