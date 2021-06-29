import {Model} from 'Types/entity';
import {LIST_EDITING_CONSTANTS} from '../BaseControl';

/**
 * Интерфейс для {@link /doc/platform/developmentapl/interface-development/controls/list/ списков} с возможностью {@link /doc/platform/developmentapl/interface-development/controls/list/actions/edit/ редактирования/добавления по месту}.
 *
 * @public
 * @author Авраменко А.С.
 * @see Controls/editableArea:View
 * @remark
 * Разница между этим интерфейсом и {@link Controls/editableArea:View Controls/editableArea:View} заключается в том, что первый используется в списках, а второй - вне их (например, на вкладках).
 */
export interface IEditableList {
    _options: {
        /**
         * @name Controls/_list/interface/IEditableList#editingConfig
         * @cfg {IEditingConfig | undefined} Конфигурация {@link /doc/platform/developmentapl/interface-development/controls/list/actions/edit/ редактирования/добавления по месту}.
         * @demo Controls-demo/list_new/EditInPlace/EmptyActionsWithToolBar/Index
         * @example
         * В следующем примере в режиме редактирования по месту отображаются кнопки "Сохранить" и "Отмена" на панели опций записи.
         * <pre class="brush: html; highlight: [3]">
         * <!-- WML -->
         * <Controls.list:View name="list" keyProperty="id" source="{{_viewSource}}">
         *     <ws:editingConfig editOnClick="{{true}}" toolbarVisibility="{{true}}" />
         *     <ws:itemTemplate>
         *         <ws:partial template="Controls/list:ItemTemplate">
         *             <ws:contentTemplate>
         *                 <ws:partial template="Controls/list:EditingTemplate" value="{{ itemTemplate.item.contents.title }}">
         *                     <ws:editorTemplate>
         *                         <Controls.input:Text bind:value="itemTemplate.item.contents.title" />
         *                     </ws:editorTemplate>
         *                 </ws:partial>
         *             </ws:contentTemplate>
         *         </ws:partial>
         *     </ws:itemTemplate>
         * </Controls.list:View>
         * </pre>
         */
        editingConfig?: IEditingConfig
    };

    /**
     * Запускает {@link /doc/platform/developmentapl/interface-development/controls/list/actions/edit/ редактирование по месту}.
     * Использование метода в списке с режимом "только чтение" невозможно.
     * @function
     * @param {IItemEditOptions} options Параметры редактирования.
     * @returns {TAsyncOperationResult}
     * @remark
     * Используйте этот метод в ситуациях, когда вы хотите начать редактирование из нестандартного места, например, из {@link /doc/platform/developmentapl/interface-development/controls/list/actions/operations/ панели действий элемента}.
     *
     * Promise разрешается после монтирования контрола в DOM.
     *
     * Перед запуском редактирования по месту происходит событие {@link beforeBeginEdit}, а после запуска — {@link afterBeginEdit}.
     *
     * Формат полей редактируемой записи может отличаться от формата полей {@link Types/Collection:RecordSet}, отображаемый списком. Подробнее читайте {@link /doc/platform/developmentapl/interface-development/controls/list/actions/edit/ways-to-start/code/#begin-edit-format здесь}.
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
    beginEdit(): TAsyncOperationResult;

    /**
     * Запускает {@link /doc/platform/developmentapl/interface-development/controls/list/actions/edit/ добавление по месту}.
     * Использование метода в списке с режимом "только чтение" невозможно.
     * @function
     * @param {IItemAddOptions} options Параметры добавления.
     * @returns {TAsyncOperationResult}
     * @remark
     * Promise разрешается после монтирования контрола в DOM.
     *
     * Перед запуском добавления по месту происходит событие {@link beforeBeginEdit beforeBeginEdit}, а после запуска — {@link afterBeginEdit afterBeginEdit}.
     *
     * Вы можете задать позицию, в которой отображается шаблон редактирования строки. Для этого в опции {@link editingConfig} установите значение для параметра {@link IEditingConfig addPosition}. Шаблон редактирования строки может отображаться в начале и в конце списка, группы (если включена {@link Controls/interface/IGroupedList#groupProperty группировка}) или узла (для иерархических списков).
     *
     * В случае, когда метод beginAdd вызван без аргументов, добавляемая запись будет создана при помощи установленного на списке источника данных путем вызова у него метода {@link Types/source:ICrud#create create}.
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
    beginAdd(): TAsyncOperationResult;

    /**
     * Завершает {@link /doc/platform/developmentapl/interface-development/controls/list/actions/edit/ редактирование/добавление по месту} с сохранением введенных данных.
     * Использование метода в списке с режимом "только чтение" невозможно.
     * @function
     * @returns {TAsyncOperationResult}
     * @remark
     * Используйте этот метод, когда вы хотите завершить редактирование в ответ на действие пользователя, например, когда пользователь пытается закрыть диалоговое окно, используйте этот метод для сохранения изменений.
     *
     * Promise разрешается после монтирования контрола в DOM. Если редактирование успешно завершилось, то Promise ничего не возвращает.
     *
     * При завершении редактирования по месту происходят события, подробнее о которых читайте {@link /doc/platform/developmentapl/interface-development/controls/list/actions/edit/events/ здесь}.
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
    commitEdit(): TAsyncOperationResult;

    /**
     * Завершает {@link /doc/platform/developmentapl/interface-development/controls/list/actions/edit/ редактирование/добавление по месту} без сохранения введенных данных.
     * Использование метода в списке с режимом "только чтение" невозможно.
     * @function
     * @returns {TAsyncOperationResult}
     * @remark
     * Используйте этот метод, когда вы хотите завершить редактирование или добавление в ответ на действия пользователя, например, когда пользователь нажимает на кнопку "Отмена".
     *
     * Promise разрешается после монтирования контрола в DOM.
     *
     * При завершении редактирования по месту происходят события, подробнее о которых читайте {@link /doc/platform/developmentapl/interface-development/controls/list/actions/edit/events/ здесь}.
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
    cancelEdit(): TAsyncOperationResult;
}

/**
 * Интерфейс объекта-конфигурации {@link /doc/platform/developmentapl/interface-development/controls/list/actions/edit/ редактирования/добавления по месту}.
 * @interface  Controls/_list/interface/IEditableList#IEditingConfig
 */
export interface IEditingConfig {
    /**
     * @cfg {Boolean} Автоматический запуск добавления по месту при инициализации {@link /doc/platform/developmentapl/interface-development/controls/list/list/empty/ пустого списка}. По умолчанию отключено (false). Подробнее читайте {@link /doc/platform/developmentapl/interface-development/controls/list/actions/edit/ways-to-start/init/ здесь}.
     * @default false
     */
    autoAddOnInit?: boolean;

    /**
     * @cfg {Boolean} Запуск редактирования по месту при клике по элементу списка. Является частью {@link /doc/platform/developmentapl/interface-development/controls/list/actions/edit/basic/ базовой конфигурации} функционала редактирования по месту. По умолчанию отключено (false).
     * @default false
     */
    editOnClick?: boolean;

    /**
     * @cfg {Boolean} Автоматический запуск добавления нового элемента, происходящий при завершении редактирования последнего элемента списка. По умолчанию отключено (false). Подробнее читайте {@link /doc/platform/developmentapl/interface-development/controls/list/actions/edit/ways-to-start/auto/#add здесь}.
     * @default false
     */
    autoAdd?: boolean;

    /**
     * @cfg {Boolean} Отмена автоматического запуска добавления нового элемента, если завершение добавления предыдущего элемента происходит {@link /doc/platform/developmentapl/interface-development/controls/list/actions/edit/item-actions/#visible кнопкой "Сохранить"} на {@link /doc/platform/developmentapl/interface-development/controls/list/actions/item-actions/ панели опций записи}. По умолчанию автоматический запуск включен (true). Подробнее читайте {@link /doc/platform/developmentapl/interface-development/controls/list/actions/edit/ways-to-start/auto/#add здесь}.
     * @default true
     */
    autoAddByApplyButton?: boolean;

    /**
     * @cfg {Boolean} Автоматический запуск редактирования по месту для следующего элемента, происходящий при завершении редактирования любого (кроме последнего) элемента списка. По умолчанию автоматический запуск включен (true). Подробнее читайте {@link /doc/platform/developmentapl/interface-development/controls/list/actions/edit/ways-to-start/auto/#edit здесь}.
     * @default true
     */
    sequentialEditing?: boolean;

    /**
     * @cfg {Boolean} Видимость кнопок "Сохранить" и "Отмена", отображаемых на {@link /doc/platform/developmentapl/interface-development/controls/list/actions/item-actions/ панели опций записи} в режиме редактирования. По умолчанию кнопки скрыты (false). Подробнее читайте {@link /doc/platform/developmentapl/interface-development/controls/list/actions/edit/item-actions/#visible здесь}.
     * @default false
     */
    toolbarVisibility?: boolean;

    /**
     * @cfg {String} Предназначен для настройки фона редактируемого элемента. Подробнее см {@link /doc/platform/developmentapl/interface-development/controls/list/actions/edit/template/#table-background Цвет фона элемента в режиме редактирования}.
     * @default default
     */
    backgroundStyle?: string;

    /**
     * @cfg {TAddPosition} Позиция добавления по месту. Подробнее читайте {@link /doc/platform/developmentapl/interface-development/controls/list/actions/edit/ways-to-start/code/#add-position здесь}.
     * @default bottom
     */
    addPosition?: TAddPosition;

    /**
     * @cfg {Types/entity:Model} Автоматический запуск редактирования/добавления по месту при инициализации списка. Подробнее читайте {@link /doc/platform/developmentapl/interface-development/controls/list/actions/edit/ways-to-start/init/ здесь}.
     * @default undefined
     */
    item?: Model;
}

/**
 * @typedef {Promise<void | IOperationCanceledResult>} TAsyncOperationResult
 * @deacription Результат выполнения методов {@link beginAdd}, {@link beginEdit}, {@link cancelEdit} и {@link commitEdit}.
 */
type TAsyncOperationResult = Promise<void | IOperationCanceledResult>;

/**
 * @typedef {Object} IOperationCanceledResult
 * @deacription Объект, который может возвращать Promise при вызове методов {@link beginAdd}, {@link beginEdit}, {@link cancelEdit} и {@link commitEdit}.
 * @property {Boolean} canceled Свойство установлено в значение true при отмене:
 *
 * * завершения редактирование/добавление по месту без сохранения введенных данных.
 * * запуска добавления по месту.
 * * запуска редактирования по месту.
 * * при ошибке валидации.
 */
interface IOperationCanceledResult { canceled: true; }

/**
 * @typedef {Enum} TAddPosition
 * @description Допустимые значения для свойства {@link IEditingConfig addPosition}.
 * @variant top В начале.
 * @variant bottom В конце.
 */
type TAddPosition = 'top' | 'bottom';

/**
 * @typedef {Object} IItemAddOptions
 * @property {Types/entity:Model} [item] Запись, которая будет запущена на добавление.
 * Если из обработчика события {@link beforeBeginEdit} также будет возвращена запись, то именно она будет запущена на добавление вместо первоначальной.
 * @property {Types/entity:Model} [targetItem] Запись списка, рядом с которой будет запущено добавление по месту.
 * @property {Boolean} [shouldActivateInput] Флаг, определяющий, следует ли усстанавливать фокус в поле ввода, после старта добавления.
 * @property {TAddPosition} [addPosition] Позиция добавляемой записи. В случае, если в параметрах был передан targetItem, позиция определяется относительно его, иначе - всего списка.
 */
interface IItemAddOptions {
    item?: Model;
    targetItem?: Model;
    shouldActivateInput?: boolean;
    addPosition?: TAddPosition;
}

/**
 * @typedef {Object} IItemEditOptions
 * @property {Types/entity:Model} [item] Запись, которая будет запущена на редактирование.
 * Если из обработчика события {@link beforeBeginEdit} также будет возвращена запись, то именно она будет запущена на редактирование вместо первоначальной.
 * @property {Boolean} [shouldActivateInput] Флаг, определяющий, следует ли усстанавливать фокус в поле ввода, после старта редактирования.
 */
interface IItemEditOptions {
    item?: Model;
    shouldActivateInput?: boolean;
}

/**
 * @typedef {Object} IBeforeBeginEditEventResultOptions
 * @property {Types/entity:Model} [item=undefined] Запись, которая будет запущена на редактирование/добавление.
 */
interface IBeforeBeginEditEventResultOptions { item?: Model; }

/**
 * @typedef {String | IBeforeBeginEditEventResultOptions} TBeforeBeginEditEventSyncResult
 * @description Синхронные значения, которые можно возвращать из обработчика события {@link beforeBeginEdit}.
 * @variant {String} Сancel Отменить редактирование/добавление по месту.
 * @variant {IBeforeBeginEditEventResultOptions} options Параметры редактирования/добавления по месту.
 */
type TBeforeBeginEditEventSyncResult = LIST_EDITING_CONSTANTS.CANCEL | IBeforeBeginEditEventResultOptions;

/**
 * @typedef {TBeforeBeginEditEventSyncResult | Promise<TBeforeBeginEditEventSyncResult>} TBeforeBeginEditEventResult
 * @description Значения, которые можно возвращать из обработчика события {@link beforeBeginEdit}.
 */
type TBeforeBeginEditEventResult = TBeforeBeginEditEventSyncResult | Promise<TBeforeBeginEditEventSyncResult>;

/**
 * @typedef {String | undefined} TBeforeEndEditEventSyncResult
 * @description Синхронные значения, которые можно возвращать из обработчика события {@link beforeEndEdit}.
 * @variant {String} Сancel Отмена окончания редактирования/добавления по месту.
 * @variant undefined Использовать базовую логику редактирования/добавления по месту.
 */
type TBeforeEndEditEventSyncResult = LIST_EDITING_CONSTANTS.CANCEL | undefined;

/**
 * @typedef {TBeforeEndEditEventSyncResult | Promise<TBeforeEndEditEventSyncResult>} TBeforeEndEditEventResult
 * @description Значения, которые можно возвращать из обработчика события {@link beforeEndEdit}.
 */
type TBeforeEndEditEventResult = TBeforeBeginEditEventSyncResult | Promise<TBeforeBeginEditEventSyncResult>;

/**
 * @event Controls/_list/interface/IEditableList#beforeBeginEdit Происходит перед запуском {@link /doc/platform/developmentapl/interface-development/controls/list/actions/edit/ редактирования/добавления по месту}.
 * @param {UICommon/Events:SyntheticEvent} eventObject Дескриптор события.
 * @param {IItemEditOptions | IItemAddOptions} options Параметры редактирования.
 * @param {Boolean} isAdd Параметр принимает значение true, когда элемент добавляется по месту.
 * Добавление элемента происходит в следующих случаях:
 * 1. вызов метода {@link beginAdd}.
 * 2. после окончания редактирования:
 *     * последнего (уже существующего) элемента списка (см. свойство {@link IEditingConfig autoAdd});
 *     * только что добавленного элемента списка (см. свойство {@link IEditingConfig autoAddByApplyButton}).
 * @returns {TBeforeBeginEditEventResult}
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
 *    return this.source.read(options.item.getId()).then(function(result) {
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
 * @markdown
 */

/**
 * @event Controls/_list/interface/IEditableList#afterBeginEdit Происходит после запуска {@link /doc/platform/developmentapl/interface-development/controls/list/actions/edit/ редактирования/добавления по месту}.
 * @param {UICommon/Events:SyntheticEvent} eventObject Дескриптор события.
 * @param {Types/entity:Model} item Редактируемый элемент.
 * @param {Boolean} isAdd Параметр принимает значение true, когда элемент добавляется по месту.
 * Добавление элемента происходит в следующих случаях:
 * 1. вызов метода {@link beginAdd}.
 * 2. после окончания редактирования:
 *     * последнего (уже существующего) элемента списка (см. свойство {@link IEditingConfig autoAdd}).
 *     * только что добавленного элемента списка (см. свойство {@link IEditingConfig autoAddByApplyButton}).
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
 * @markdown
 */

/**
 * @event Controls/_list/interface/IEditableList#beforeEndEdit Происходит перед завершением {@link /doc/platform/developmentapl/interface-development/controls/list/actions/edit/ редактирования/добавления по месту}.
 * @param {UICommon/Events:SyntheticEvent} eventObject Дескриптор события.
 * @param {Types/entity:Model} item Редактируемый элемент.
 * @param {Boolean} willSave Параметр принимает значение true, когда отредактированный элемент сохраняется.
 * Такое происходит в следующих случаях:
 * 1. был вызыван метод {@link commitEdit}.
 * 2. пользователь выполнил действие, которое приводит к сохранению:
 *     * закрыл диалог, на котором находится список с редактируемым элементом;
 *     * начал редактирование другого элемента по клику.
 * @param {Boolean} isAdd Параметр принимает значение true, когда элемент добавляется по месту.
 * Добавление элемента происходит в следующих случаях:
 * 1. вызов метода {@link beginAdd}.
 * 2. после окончания редактирования:
 *     * последнего (уже существующего) элемента списка (см. свойство {@link IEditingConfig autoAdd});
 *     * только что добавленного элемента списка (см. свойство {@link IEditingConfig autoAddByApplyButton}).
 * @returns {TBeforeEndEditEventResult}
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
 * @markdown
 */

/**
 * @event Controls/_list/interface/IEditableList#afterEndEdit Происходит после завершения {@link /doc/platform/developmentapl/interface-development/controls/list/actions/edit/ редактирования/добавления по месту}.
 * @param {UICommon/Events:SyntheticEvent} eventObject Дескриптор события.
 * @param {Types/entity:Model} item Редактируемый элемент.
 * @param {Boolean} isAdd Параметр принимает значение true, когда элемент добавляется по месту.
 * Добавление элемента происходит в следующих случаях:
 * 1. вызов метода {@link beginAdd}.
 * 2. после окончания редактирования:
 *     * последнего (уже существующего) элемента списка (см. свойство {@link IEditingConfig autoAdd});
 *     * после окончания редактирования только что добавленного элемента списка (см. свойство {@link IEditingConfig autoAddByApplyButton}).
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
 * @markdown
 */
