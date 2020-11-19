/* eslint-disable */
define('Controls/interface/IEditableList', [
], function() {

   /**
    * Интерфейс для списков с возможностью {@link https://wi.sbis.ru/doc/platform/developmentapl/interface-development/controls/list/actions/edit/ редактирования по месту}.
    *
    * @interface Controls/interface/IEditableList
    * @public
    * @author Авраменко А.С.
    * @see Controls/editableArea:View
    * @remark
    * Разница между этим интерфейсом и {@link Controls/editableArea:View Controls/editableArea:View} заключается в том, что первый используется в списках, а второй - вне их (например, на вкладках).
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
    * @property {Types/entity:Model} [options.item] Запись списка, которая будет запущена на редактирование. 
    * Если из обработчика события {@link beforeBeginEdit} также будет возвращена запись, то именно она будет запущена на редактирование вместо первоначальной.
    */

   /*
    * @typedef {Object} ItemEditOptions
    * @property {Types/entity:Model} [options.item] Record with initial data.
    */

   /**
    * @typedef {Enum} AddPositionOption
    * @variant top В начале.
    * @variant bottom В конце.
    */

   /*
    * @typedef {Enum} AddPositionOption
    * @variant top Editing in place will appear at the top of the list.
    * @variant bottom Editing in place will appear at the bottom of the list.
    */

   /**
    * @typedef {Object} EditingConfig
    * @property {Boolean} [editOnClick=false] Если передано значение "true", клик по элементу списка начинает редактирование по месту.
    * @property {Boolean} [autoAdd=false] Если передано значение "true", после окончания редактирования последнего (уже существующего) элемента списка автоматически добавляется новый элемент и начинается его редактирование.
    * @property {Boolean} [autoAddByApplyButton=false] Если передано значение "true", после окончания редактирования только что добавленного элемента списка автоматически добавляется новый элемент и начинается его редактирование.
    * @property {Boolean} [sequentialEditing=true] Если передано значение "true", после окончания редактирования любого элемента списка, кроме последнего, автоматически запускается редактирование следующего элемента списка.
    * @property {Boolean} [toolbarVisibility=false] Определяет, должны ли отображаться кнопки "Сохранить" и "Отмена".
    * Когда кнопки не отображаются, аналогичные действия выполняются с помощью {@link https://wi.sbis.ru/doc/platform/developmentapl/interface-development/controls/list/list/keys/ клавиш}.
    * @property {String} [backgroundStyle=default] Предназначен для настройки фона редактируемой записи.
    * @property {AddPositionOption} [addPosition=bottom] Позиция добавления по месту.
    * В корне списка, в группе (когда включена группировка) или в рамках узла (для иерархических списков).
    * Если в контроле включена {@link https://wi.sbis.ru/doc/platform/developmentapl/interface-development/controls/list/list/grouping/ группировка} элементов, тогда в модели нового элемента необходимо задать поле с группой.
    * @property {Types/entity:Model} [item=undefined] Элемент, который будет запущен на редактирование при первой отрисовке контрола.
    * 
    * Элемент необязательно должен присутствовать в {@link Types/source:DataSet}, который получен от источника данных.
    * Если переданный элемент присутствует в Types/source:DataSet, то будет запущено ее редактирование, а иначе — запустится добавление этого элемента.
    * После редактирования добавляемый элемент сохранится в источнике данных.
    *
    * Создание нового элемента выполняют по следующему алгоритму:
    *
    * 1. В хуке <a href="/doc/platform/developmentapl/interface-development/ui-library/control/#phase-before-mount">_beforeMount()</a> опишите {@link Types/source:SbisService источник данных бизнес-логики} (далее SbisService).
    * 2. Из этого источника запросите набор данных (далее DataSet). Полученный DataSet будет передан в контрол для отрисовки.
    * 3. В {@link Core/Deferred#addCallback обработчике} запроса создайте источник данных {@link Types/source:PrefetchProxy}, в который передайте SbisService и DataSet.
    * 4. Создайте редактируемый элемент и добавьте её в DataSet.
    *     * Примечание: создание редактируемого элемента можно выполнять по некоторому условию (см. пример ниже).
    * 5. Передайте редактируемый элемент в опцию {@link editingConfig}.
    *
    * Далее показан пример создания редактируемого элемента.
    *
    * <pre class="brush: js">
    * // JavaScript
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
    *       // В DataSet добавляется тот самый элемент, который
    *       // запускается на редактирование при первой отрисовке контрола.
    *       if (recordSet.getCount() === 0 && !options.readOnly) {
    *          return self._BLsource.create().addCallback(function (record){
    *             record.set('ВидЦены', <value>);
    *             record.acceptChanges();
    *
    *             // Сохраняем редактируемый элемент.
    *             // Этой настройкой будет передан редактируемый элемент в опцию editingConfig.
    *             self._editRecord = record;
    *          });
    *       } else
    *          return true;
    *    });
    * }
    * </pre>
    *
    * <pre class="brush: html; highlight: [2,4]">
    * <!-- WML -->
    * <Controls.list:DataContainer source="{{_source}}">
    *   <Controls.explorer:View>
    *       <ws:editingConfig item="{{_editRecord}}" />
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
    * @property {Types/entity:Model} [item=undefined] If present, editing of this item will begin on first render.
    */

   /**
    * @typedef {String|Types/entity:Model|Core/Deferred} ItemEditResult
    * @variant cancel Отменить редактирование.
    * @variant options Параметры редактирования.
    * @variant deferred Используется для асинхронной подготовки редактируемого элемента. Необходимо выполнить deffered с {@link ItemEditOptions ItemEditOptions} или 'Cancel'. Если процесс занимает слишком много времени, будет показан индикатор загрузки.
    */

   /*
    * @typedef {String|Types/entity:Model|Core/Deferred} ItemEditResult
    * @variant cancel Cancel start of editing.
    * @variant options Options of editing.
    * @variant deferred Deferred is used for asynchronous preparation of edited record. It is necessary to fullfill deferred with {@link ItemEditOptions ItemEditOptions} or 'Cancel'. If deferred takes too long to resolve then loading indicator will be shown.
    */

   /**
    * @typedef {String|Promise|undefined} EndEditResult
    * @variant Cancel Отмена окончания редактирования или добавления по месту.
    * @variant Promise Применяется для реализации собственной логики сохранения изменений.
    * В этом случае базовая логика сохранения не используется, и поэтому вся ответственность за сохранение изменений перекладывается на прикладного разработчика.
    * Событие {@link afterEndEdit} произойдет после завершения deferred, который возвращен из обработчика события {@link beforeEndEdit}.
    * @variant undefined Использовать базовую логику редактирования или добавления по месту.
    */

   /*
    * @typedef {String|Core/Deferred} EndEditResult
    * @variant Cancel Cancel ending of editing\adding.
    * @variant Deferred Deferred is used for saving with custom logic.
    * @variant undefined
    */

   /**
    * @event Происходит перед началом {@link https://wi.sbis.ru/doc/platform/developmentapl/interface-development/controls/list/actions/edit/ редактирования} или {@link https://wi.sbis.ru/doc/platform/developmentapl/interface-development/controls/list/actions/edit/add/ добавления} по месту.
    * @name Controls/interface/IEditableList#beforeBeginEdit
    * @param {Vdom/Vdom:SyntheticEvent} eventObject Дескриптор события.
    * @param {ItemEditOptions} options Параметры редактирования.
    * @param {Boolean} isAdd Параметр принимает значение true, когда элемент {@link https://wi.sbis.ru/doc/platform/developmentapl/interface-development/controls/list/actions/edit/add/ добавляется по месту}.
    * Добавление элемента происходит в следующих случаях:
    * 1. вызов метода {@link beginAdd}.
    * 2. после окончания редактирования:
    *    * последнего (уже существующего) элемента списка (см. свойство {@link Controls/interface/IEditableList/EditingConfig.typedef autoAdd});
    *    * только что добавленного элемента списка (см. свойство {@link Controls/interface/IEditableList/EditingConfig.typedef autoAddByApplyButton}).
    * @returns {ItemEditResult}
    * @demo Controls-demo/list_new/EditInPlace/BeginEdit/Index
    * @example
    * В следующем примере показано, как запретить редактирование элемента, если он соответствует условию:
    * <pre class="brush: html">
    * <!-- WML -->
    * <Controls.list:View on:beforeBeginEdit="beforeBeginEditHandler()" />
    * </pre>
    * <pre class="brush: js; highlight: [4,5,6,7,8]">
    * // JavaScript
    * define('ModuleName', ['Controls/list'], function(constants) {
    *    ...
    *    beforeBeginEditHandler: function(e, options) {
    *       if (options.item.getId() === 1) {
    *          return constants.editing.CANCEL;
    *       }
    *    }
    * });
    * </pre>
    * В следующем примере показано, как прочитать элемент из БЛ и открыть его для редактирования:
    * <pre class="brush: html">
    * <!-- WML -->
    * <Controls.list:View on:beforeBeginEdit="beforeBeginEditHandler()" />
    * </pre>
    * <pre class="brush: js">
    * // JavaScript
    * beforeBeginEditHandler: function(e, options) {
    *    return this.source.read(options.item.getId()).addCallback(function(result) {
    *       return {
    *          item: result
    *       };
    *    });
    * }
    * </pre>
    * В следующем примере показано, как начать редактирование элемента, созданного на клиенте:
    * <pre class="brush: html">
    * <!-- WML -->
    * <Controls.list:View on:beforeBeginEdit="beforeBeginEditHandler()" />
    * </pre>
    * <pre class="brush: js">
    * // JavaScript
    * define('ModuleName', ['Types/entity'], function(entity) {
    *    ...
    *    beforeBeginEditHandler: function(e, options) {
    *       return {
    *          item: new entity.Model({
    *             rawData: {
    *                //Obviously, you would use something else instead of Date.now() to generate id, but we'll use it here to keep the example simple
    *                id: Date.now(),
    *                title: ''
    *             }
    *          })
    *       }
    *    }
    * });
    * </pre>
    * @see afterBeginEdit
    * @see beforeEndEdit
    * @see afterEndEdit
    * @see editingConfig
    */

   /*
    * @event Occurs before the start of editing.
    * @name Controls/interface/IEditableList#beforeBeginEdit
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
    *    define('ModuleName', ['Controls/list'], function(constants) {
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
    * @event Происходит после начала {@link https://wi.sbis.ru/doc/platform/developmentapl/interface-development/controls/list/actions/edit/ редактирования} или {@link https://wi.sbis.ru/doc/platform/developmentapl/interface-development/controls/list/actions/edit/add/ добавления} по месту.
    * @name Controls/interface/IEditableList#afterBeginEdit
    * @param {Vdom/Vdom:SyntheticEvent} eventObject Дескриптор события.
    * @param {Types/entity:Model} item Редактируемый элемент.
    * @param {Boolean} isAdd Параметр принимает значение true, когда элемент {@link https://wi.sbis.ru/doc/platform/developmentapl/interface-development/controls/list/actions/edit/add/ добавляется по месту}.
    * Добавление элемента происходит в следующих случаях:
    * 1. вызов метода {@link beginAdd}.
    * 2. после окончания редактирования:
    *    * последнего (уже существующего) элемента списка (см. свойство {@link Controls/interface/IEditableList/EditingConfig.typedef autoAdd}).
    *    * только что добавленного элемента списка (см. свойство {@link Controls/interface/IEditableList/EditingConfig.typedef autoAddByApplyButton}).
    * @remark
    * Подпишитесь на событие, если необходимо что-либо сделать после начала редактирования (например, скрыть кнопку "Добавить").
    * Событие запускается, когда подготовка данных успешно завершена и возможно безопасно обновить пользовательский интерфейс.
    * @example
    * В следующем примере показано, как скрыть кнопку "Добавить" после начала редактирования или добавления.
    * <pre class="brush: html; highlight: [2]">
    * <!-- WML -->
    * <Controls.list:View on:afterBeginEdit="afterBeginEditHandler()" />
    * <ws:if data="{{ showAddButton }}">
    *     <Controls.list:AddButton />
    * </ws:if>
    * </pre>
    * <pre class="brush: js">
    * // JavaScript
    * afterBeginEditHandler: function(e, item, isAdd) {
    *    this.showAddButton = false;
    * }
    * </pre>
    * @see beforeBeginEdit
    * @see beforeEndEdit
    * @see afterEndEdit
    */

   /*
    * @event Occurs after the start of editing\adding.
    * @name Controls/interface/IEditableList#afterBeginEdit
    * @param {Vdom/Vdom:SyntheticEvent} eventObject Descriptor of the event.
    * @param {Types/entity:Model} item Editing record.
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
    * @event Происходит перед завершением {@link https://wi.sbis.ru/doc/platform/developmentapl/interface-development/controls/list/actions/edit/ редактирования} или {@link https://wi.sbis.ru/doc/platform/developmentapl/interface-development/controls/list/actions/edit/add/ добавления} элемента.
    * @name Controls/interface/IEditableList#beforeEndEdit
    * @param {Vdom/Vdom:SyntheticEvent} eventObject Дескриптор события.
    * @param {Types/entity:Model} item Редактируемый элемент.
    * @param {Boolean} willSave Параметр принимает значение true, когда отредактированный элемент сохраняется.
    * Такое происходит в следующих случаях:
    * 1. был вызыван метод {@link commitEdit}.
    * 2. пользователь выполнил действие, которое приводит к сохранению:
    *     * закрыл диалог, на котором находится список с редактируемым элементом;
    *     * начал редактирование другого элемента по клику.
    * @param {Boolean} isAdd Параметр принимает значение true, когда элемент {@link https://wi.sbis.ru/doc/platform/developmentapl/interface-development/controls/list/actions/edit/add/ добавляется по месту}.
    * Добавление элемента происходит в следующих случаях:
    * 1. вызов метода {@link beginAdd}.
    * 2. после окончания редактирования:
    *     * последнего (уже существующего) элемента списка (см. свойство {@link Controls/interface/IEditableList/EditingConfig.typedef autoAdd});
    *     * только что добавленного элемента списка (см. свойство {@link Controls/interface/IEditableList/EditingConfig.typedef autoAddByApplyButton}).
    * @returns {EndEditResult}
    * @demo Controls-demo/list_new/EditInPlace/EndEdit/Index
    * @remark
    * Используйте событие, если необходимо проверить данные и отменить изменения. По умолчанию для сохранения изменений вызывается метод обновления списка.
    * Не обновляйте пользовательский интерфейс в обработчике этого события, потому что если во время подготовки данных произойдет ошибка, вам придется откатить изменения.
    * @example
    * В следующем примере показано завершение редактирования элемента, если выполнено условие.
    * <pre class="brush: html;">
    * <!-- WML -->
    * <Controls.list:View on:beforeEndEdit="beforeEndEditHandler()" />
    * </pre>
    * <pre class="brush: js; highlight: [4,5,6,7,8]">
    * // JavaScript
    * define('ModuleName', ['Controls/list'], function(constants) {
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
    * @event Occurs before the end of editing\adding.
    * @name Controls/interface/IEditableList#beforeEndEdit
    * @param {Vdom/Vdom:SyntheticEvent} eventObject Descriptor of the event.
    * @param {Types/entity:Model} item Editing record.
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
    *    define('ModuleName', ['Controls/list'], function(constants) {
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
    * @event Происходит после завершения {@link https://wi.sbis.ru/doc/platform/developmentapl/interface-development/controls/list/actions/edit/ редактирования} иди {@link https://wi.sbis.ru/doc/platform/developmentapl/interface-development/controls/list/actions/edit/add/ добавления}.
    * @name Controls/interface/IEditableList#afterEndEdit
    * @param {Vdom/Vdom:SyntheticEvent} eventObject Дескриптор события.
    * @param {Types/entity:Model} item Редактируемый элемент.
    * @param {Boolean} isAdd Параметр принимает значение true, когда элемент {@link https://wi.sbis.ru/doc/platform/developmentapl/interface-development/controls/list/actions/edit/add/ добавляется по месту}.
    * Добавление элемента происходит в следующих случаях:
    * 1. вызов метода {@link beginAdd}.
    * 2. после окончания редактирования:
    *     * последнего (уже существующего) элемента списка (см. свойство {@link Controls/interface/IEditableList/EditingConfig.typedef autoAdd});
    *     * после окончания редактирования только что добавленного элемента списка (см. свойство {@link Controls/interface/IEditableList/EditingConfig.typedef autoAddByApplyButton}).
    * @remark
    * Подпишитесь на событие, если необходимо что-либо сделать после завершения редактирования (например, показать кнопку "Добавить").
    * Событие запускается, когда редактирование успешно завершено и возможно безопасно обновить пользовательский интерфейс.
    * @demo Controls-demo/list_new/EditInPlace/SlowAdding/Index
    * @example
    * В следующем примере показано, как отобразить кнопку "Добавить" после окончания редактирования или добавления.
    * <pre class="brush: html; highlight: [2]">
    * <!-- WML -->
    * <Controls.list:View on:afterEndEdit="afterEndEditHandler()" />
    * <ws:if data="{{ showAddButton }}">
    *     <Controls.list:AddButton />
    * </ws:if>
    * </pre>
    * <pre class="brush: js">
    * // JavaScript
    * afterEndEditHandler: function() {
    *    this.showAddButton = true;
    * }
    * </pre>
    * @see beforeBeginEdit
    * @see afterBeginEdit
    * @see beforeEndEdit
    */

   /*
    * @event Occurs after the end of editing\adding.
    * @name Controls/interface/IEditableList#afterEndEdit
    * @param {Vdom/Vdom:SyntheticEvent} eventObject Descriptor of the event.
    * @param {Types/entity:Model} item Editing record.
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
    * @cfg {EditingConfig} Конфигурация {@link https://wi.sbis.ru/doc/platform/developmentapl/interface-development/controls/list/actions/edit/ редактирования по месту}.
    * @demo Controls-demo/list_new/EditInPlace/AutoAdd/Index
    * @name Controls/interface/IEditableList#editingConfig
    * @example
    * <pre class="brush: html; highlight: [3]">
    * <!-- WML -->
    * <Controls.list:View>
    *    <ws:editingConfig editOnClick="{{true}}" toolbarVisibility="{{true}}" />
    * </Controls.list:View>
    * </pre>
    */

   /*
    * @cfg {EditingConfig} Configuration for editing in place.
    * @demo Controls-demo/list_new/EditInPlace/AutoAdd/Index
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
    * Начинает {@link https://wi.sbis.ru/doc/platform/developmentapl/interface-development/controls/list/actions/edit/ редактирование по месту}.
    * @function Controls/interface/IEditableList#beginEdit
    * @param {ItemEditOptions} options Параметры редактирования.
    * @returns {Core/Deferred}
    * @remark
    * Перед запуском редактирования по месту происходит событие {@link beforeBeginEdit}, а после запуска — {@link afterBeginEdit}.
    * 
    * Используйте этот метод в ситуациях, когда вы хотите начать редактирование из нестандартного места, например, из {@link https://wi.sbis.ru/doc/platform/developmentapl/interface-development/controls/list-environment/operations/ панели действий элемента}.
    * @example
    * В следующем примере показано, как начать редактирование элемента.
    * <pre class="brush: html;">
    * <!-- WML -->
    * <Controls.list:View name="list" />
    * </pre>
    * <pre class="brush: js;">
    * // JavaScript
    * foo: function() {
    *    this._children.list.beginEdit({
    *       item: this._items.at(0)
    *    });
    * }
    * </pre>
    * @see beginAdd
    * @see commitEdit
    * @see cancelEdit
    * @see beforeBeginEdit
    * @see afterBeginEdit
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
    * Начинает {@link https://wi.sbis.ru/doc/platform/developmentapl/interface-development/controls/list/actions/edit/add/ добавление по месту}.
    * @function Controls/interface/IEditableList#beginAdd
    * @param {ItemEditOptions} options Параметры добавления.
    * @returns {Core/Deferred}
    * @remark
    * Перед запуском добавления по месту происходит событие {@link beforeBeginEdit}, а после запуска — {@link afterBeginEdit}.
    * 
    * Вы можете задать позицию, в которой отображается шаблон редактирования строки. Для этого в опции {@link editingConfig} установите значение для параметра {@link Controls/interface/IEditableList/EditingConfig.typedef addPosition}. Шаблон редактирования строки может отображаться в начале и в конце списка, группы (если включена {@link Controls/interface/IGroupedList#groupProperty группировка}) или узла (для иерархических списков).
    * 
    * Если вы не передадите параметры, будет вызван метод {@link Types/source:ICrud#create create} источника списка, и результат будет добавлен в список.
    * @demo Controls-demo/list_new/EditInPlace/AddItem/Index
    * @demo Controls-demo/list_new/EditInPlace/AddItemInBegin/Index Шаблон редактирования строки отображается в начале списка.
    * @demo Controls-demo/list_new/EditInPlace/AddItemInEnd/Index Шаблон редактирования строки отображается в конце списка.
    * @example
    * В следующем примере показано, как начать добавление элемента.
    * 
    * <pre class="brush: html">
    * <!-- WML -->
    * <Controls.list:View name="list" />
    * </pre>
    * 
    * <pre class="brush: js">
    * // JavaScript
    * foo: function() {
    *    this._children.list.beginAdd();
    * }
    * </pre>
    * @see beginEdit
    * @see commitEdit
    * @see cancelEdit
    * @see beforeBeginEdit
    * @see afterBeginEdit
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
    * Завершает {@link https://wi.sbis.ru/doc/platform/developmentapl/interface-development/controls/list/actions/edit/ редактирование по месту} и сохраняет изменения.
    * @function Controls/interface/IEditableList#commitEdit
    * @returns {Core/Deferred}
    * @remark
    * Используйте этот метод, когда вы хотите завершить редактирование в ответ на действие пользователя, например, когда пользователь пытается закрыть диалоговое окно, используйте этот метод для сохранения изменений.
    * @example
    * В следующем примере показано, как завершить редактирование и сохранить изменения.
    * <pre class="brush: html">
    * <!-- WML -->
    * <Controls.list:View name="list" />
    * </pre>
    * <pre class="brush: js">
    * // JavaScript
    * foo: function() {
    *    this._children.list.commitEdit();
    * }
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
    * Завершает {@link https://wi.sbis.ru/doc/platform/developmentapl/interface-development/controls/list/actions/edit/ редактирование} и отменяет изменения.
    * @function Controls/interface/IEditableList#cancelEdit
    * @returns {Core/Deferred}
    * @remark
    * Используйте этот метод, когда вы хотите завершить редактирование в ответ на действия пользователя, например, когда пользователь нажимает на кнопку "Отмена".
    * @example
    * В следующем примере показано, как завершить редактирование и отменить изменения.
    * <pre class="brush: html">
    * <!-- WML -->
    * <Controls.list:View name="list" />
    * </pre>
    * <pre class="brush: js">
    * // JavaScript
    * foo: function() {
    *    this._children.list.cancelEdit();
    * }
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
