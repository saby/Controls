/* eslint-disable */
define('Controls/interface/IEditableList', [
], function() {

   /**
    * Интерфейс для {@link /doc/platform/developmentapl/interface-development/controls/list/ списков} с возможностью {@link /doc/platform/developmentapl/interface-development/controls/list/actions/edit/ редактирования/добавления по месту}.
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
    * @typedef {Object} Controls/interface/IEditableList/ItemEditOptions
    * @property {Types/entity:Model} [item] Запись, которая будет запущена на редактирование.
    * Если из обработчика события {@link beforeBeginEdit} также будет возвращена запись, то именно она будет запущена на редактирование вместо первоначальной.
    * @property {Types/entity:Model} [targetItem] Запись списка, рядом с которой будет запущено добавление по месту.
    * @property {Controls/interface/IEditableList/AddPositionOption} [addPosition] Позиция добавляемой записи. В случае, если в параметрах был передан targetItem, позиция определяется относительно его, иначе - всего списка.
    */

   /*
    * @typedef {Object} Controls/interface/IEditableList/ItemEditOptions
    * @property {Types/entity:Model} [item] Record with initial data.
    * @property {Types/entity:Model} [targetItem] Target record for adding item. Adding will start near it.
    * @property {Controls/interface/IEditableList/AddPositionOption} [addPosition] Position of adding item.
    */

   /**
    * @typedef {Enum} Controls/interface/IEditableList/AddPositionOption
    * @description Допустимые значения для свойства {@link Controls/interface/IEditableList/EditingConfig.typedef addPositionOption}.
    * @variant top В начале.
    * @variant bottom В конце.
    */

   /*
    * @typedef {Enum} Controls/interface/IEditableList/AddPositionOption
    * @variant top Editing in place will appear at the top of the list.
    * @variant bottom Editing in place will appear at the bottom of the list.
    */

   /**
    * @typedef {Enum} Controls/interface/IEditableList/TEditingMode
    * @description Допустимые значения для свойства {@link Controls/interface/IEditableList/EditingConfig.typedef mode}.
    * @variant row Редактирование всей строки.
    * @variant cell Редактирование отдельной ячейки.
    * @demo Controls-demo/grid/EditInPlace/SingleCellEditable/Index
    */

   /*
    * @typedef {Enum} Controls/interface/IEditableList/TEditingMode
    * @variant row Editing of whole row.
    * @variant cell Editing of separated cell.
    * @demo Controls-demo/grid/EditInPlace/SingleCellEditable/Index
    */

   /**
    * @typedef {Object} Controls/interface/IEditableList/EditingConfig
    * @description Конфигурация {@link /doc/platform/developmentapl/interface-development/controls/list/actions/edit/ редактирования/добавления по месту}.
    * @property {Boolean} [autoAddOnInit=false] Автоматический запуск добавления по месту при инициализации {@link /doc/platform/developmentapl/interface-development/controls/list/list/empty/ пустого списка}. По умолчанию отключено (false). Подробнее читайте {@link /doc/platform/developmentapl/interface-development/controls/list/actions/edit/ways-to-start/init/ здесь}.
    * @property {Boolean} [editOnClick=false] Запуск редактирования по месту при клике по элементу списка. Является частью {@link /doc/platform/developmentapl/interface-development/controls/list/actions/edit/basic/ базовой конфигурации} функционала редактирования по месту. По умолчанию отключено (false).
    * @property {Boolean} [autoAdd=false] Автоматический запуск добавления нового элемента, происходящий при завершении редактирования последнего элемента списка. По умолчанию отключено (false). Подробнее читайте {@link /doc/platform/developmentapl/interface-development/controls/list/actions/edit/ways-to-start/auto/#add здесь}.
    * @property {Boolean} [autoAddByApplyButton=true] Отмена автоматического запуска добавления нового элемента, если завершение добавления предыдущего элемента происходит {@link /doc/platform/developmentapl/interface-development/controls/list/actions/edit/item-actions/#visible кнопкой "Сохранить"} на {@link /doc/platform/developmentapl/interface-development/controls/list/actions/item-actions/ панели опций записи}. По умолчанию автоматический запуск включен (true). Подробнее читайте {@link /doc/platform/developmentapl/interface-development/controls/list/actions/edit/ways-to-start/auto/#add здесь}.
    * @property {Boolean} [sequentialEditing=true] Автоматический запуск редактирования по месту для следующего элемента, происходящий при завершении редактирования любого (кроме последнего) элемента списка. По умолчанию автоматический запуск включен (true). Подробнее читайте {@link /doc/platform/developmentapl/interface-development/controls/list/actions/edit/ways-to-start/auto/#edit здесь}.
    * @property {Boolean} [toolbarVisibility=false] Видимость кнопок "Сохранить" и "Отмена", отображаемых на {@link /doc/platform/developmentapl/interface-development/controls/list/actions/item-actions/ панели опций записи} в режиме редактирования. По умолчанию кнопки скрыты (false). Подробнее читайте {@link /doc/platform/developmentapl/interface-development/controls/list/actions/edit/item-actions/#visible здесь}.
    * @property {String} [backgroundStyle=default] Предназначен для настройки фона редактируемого элемента.
    * @property {Controls/interface/IEditableList/TEditingMode} [mode=row] Определяет режим редактирования в {@link /doc/platform/developmentapl/interface-development/controls/list/grid/ таблице}.
    * @property {Controls/interface/IEditableList/AddPositionOption.typedef} [addPosition=bottom] Позиция добавления по месту. Подробнее читайте {@link /doc/platform/developmentapl/interface-development/controls/list/actions/edit/ways-to-start/code/#add-position здесь}.
    * @property {Types/entity:Model} [item=undefined] Автоматический запуск редактирования/добавления по месту при инициализации списка. Подробнее читайте {@link /doc/platform/developmentapl/interface-development/controls/list/actions/edit/ways-to-start/init/ здесь}.
    */

   /*
    * @typedef {Object} Controls/interface/IEditableList/EditingConfig
    * @property {Boolean} [autoAddOnInit=false] If true, auto adding will start on initializing if list is empty.
    * @property {Boolean} [editOnClick=false] If true, click on list item starts editing in place.
    * @property {Boolean} [autoAdd=false] If true, after the end of editing of the last list item, new item adds automatically and its editing begins.
    * @property {Boolean} [sequentialEditing=true] If true, after the end of editing of any list item other than the last, editing of the next list item starts automatically.
    * @property {Boolean} [toolbarVisibility=false] Determines whether buttons 'Save' and 'Cancel' should be displayed.
    * @property {Controls/interface/IEditableList/TEditingMode} [mode=row] Determines editing mode in grid.
    * @property {AddPosition} [addPosition] Editing in place position.
    * @property {Types/entity:Model} [item=undefined] If present, editing of this item will begin on first render.
    */

   /**
    * @typedef {String|Types/entity:Model|Core/Deferred} ItemEditResult
    * @description Значения, которые можно возвращать из обработчика события {@link beforeBeginEdit}.
    * @variant Сancel Отменить редактирование/добавление по месту.
    * @variant Skip Пропустить запуск редактирования и незамедлительно попробовать начать редактирование следующей записи. Доступна только при запуске редактирования, добавление не поддерживает данную функцию.
    * @variant options Параметры редактирования/добавление по месту.
    * @variant Promise Используется для асинхронной подготовки редактируемого элемента. Подробнее читайте {@link /doc/platform/developmentapl/interface-development/controls/list/actions/edit/events/#before-begin-edit здесь}.
    */

   /*
    * @typedef {String|Types/entity:Model|Core/Deferred} ItemEditResult
    * @variant cancel Cancel start of editing.
    * @variant options Options of editing.
    * @variant deferred Deferred is used for asynchronous preparation of edited record. It is necessary to fullfill deferred with {@link ItemEditOptions ItemEditOptions} or 'Cancel'. If deferred takes too long to resolve then loading indicator will be shown.
    */

   /**
    * @typedef {String|Promise|undefined} Controls/interface/IEditableList/EndEditResult
    * @description Значения, которые можно возвращать из обработчика события {@link beforeEndEdit}.
    * @variant Cancel Отмена окончания редактирования/добавления по месту.
    * @variant Promise Применяется для реализации собственной логики сохранения изменений.
    * @variant undefined Использовать базовую логику редактирования/добавления по месту.
    */

   /*
    * @typedef {String|Core/Deferred} Controls/interface/IEditableList/EndEditResult
    * @variant Cancel Cancel ending of editing\adding.
    * @variant Deferred Deferred is used for saving with custom logic.
    * @variant undefined
    */

   /**
    * @event Controls/interface/IEditableList#beforeBeginEdit Происходит перед запуском {@link /doc/platform/developmentapl/interface-development/controls/list/actions/edit/ редактирования/добавления по месту}.
    * @param {Vdom/Vdom:SyntheticEvent} eventObject Дескриптор события.
    * @param {Controls/interface/IEditableList/ItemEditOptions.typedef} options Параметры редактирования.
    * @param {Boolean} isAdd Параметр принимает значение true, когда элемент добавляется по месту.
    * Добавление элемента происходит в следующих случаях:
    * 1. вызов метода {@link beginAdd}.
    * 2. после окончания редактирования:
    *     * последнего (уже существующего) элемента списка (см. свойство {@link Controls/interface/IEditableList/EditingConfig.typedef autoAdd});
    *     * только что добавленного элемента списка (см. свойство {@link Controls/interface/IEditableList/EditingConfig.typedef autoAddByApplyButton}).
    * @returns {Controls/interface/IEditableList/ItemEditResult.typedef}
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
    * @markdown
    */

   /*
    * @event Controls/interface/IEditableList#beforeBeginEdit Occurs before the start of editing.
    * @param {Vdom/Vdom:SyntheticEvent} eventObject Descriptor of the event.
    * @param {Controls/interface/IEditableList/ItemEditOptions.typedef} options Options of editing.
    * @param {Boolean} isAdd
    * @returns {Controls/interface/IEditableList/ItemEditResult.typedef}
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
    * @event Controls/interface/IEditableList#afterBeginEdit Происходит после запуска {@link /doc/platform/developmentapl/interface-development/controls/list/actions/edit/ редактирования/добавления по месту}.
    * @param {Vdom/Vdom:SyntheticEvent} eventObject Дескриптор события.
    * @param {Types/entity:Model} item Редактируемый элемент.
    * @param {Boolean} isAdd Параметр принимает значение true, когда элемент добавляется по месту.
    * Добавление элемента происходит в следующих случаях:
    * 1. вызов метода {@link beginAdd}.
    * 2. после окончания редактирования:
    *     * последнего (уже существующего) элемента списка (см. свойство {@link Controls/interface/IEditableList/EditingConfig.typedef autoAdd}).
    *     * только что добавленного элемента списка (см. свойство {@link Controls/interface/IEditableList/EditingConfig.typedef autoAddByApplyButton}).
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

   /*
    * @event Controls/interface/IEditableList#afterBeginEdit Occurs after the start of editing\adding.
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
    * @event Controls/interface/IEditableList#beforeEndEdit Происходит перед завершением {@link /doc/platform/developmentapl/interface-development/controls/list/actions/edit/ редактирования/добавления по месту}.
    * @param {Vdom/Vdom:SyntheticEvent} eventObject Дескриптор события.
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
    *     * последнего (уже существующего) элемента списка (см. свойство {@link Controls/interface/IEditableList/EditingConfig.typedef autoAdd});
    *     * только что добавленного элемента списка (см. свойство {@link Controls/interface/IEditableList/EditingConfig.typedef autoAddByApplyButton}).
    * @returns {Controls/interface/IEditableList/EndEditResult.typedef}
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

   /*
    * @event Controls/interface/IEditableList#beforeEndEditOccurs before the end of editing\adding.
    * @param {Vdom/Vdom:SyntheticEvent} eventObject Descriptor of the event.
    * @param {Types/entity:Model} item Editing record.
    * @param {Boolean} willSave Determines whether changes to editing item will be saved.
    * @param {Boolean} isAdd Flag which allows to differentiate between editing and adding.
    * @returns {Controls/interface/IEditableList/EndEditResult.typedef}
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
    * @event Controls/interface/IEditableList#afterEndEdit Происходит после завершения {@link /doc/platform/developmentapl/interface-development/controls/list/actions/edit/ редактирования/добавления по месту}.
    * @param {Vdom/Vdom:SyntheticEvent} eventObject Дескриптор события.
    * @param {Types/entity:Model} item Редактируемый элемент.
    * @param {Boolean} isAdd Параметр принимает значение true, когда элемент добавляется по месту.
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
    * @markdown
    */

   /*
    * @event Controls/interface/IEditableList#afterEndEdit Occurs after the end of editing\adding.
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
    * @cfg {Controls/interface/IEditableList/EditingConfig.typedef} Конфигурация {@link /doc/platform/developmentapl/interface-development/controls/list/actions/edit/ редактирования/добавления по месту}.
    * @demo Controls-demo/list_new/EditInPlace/EmptyActionsWithToolBar/Index
    * @name Controls/interface/IEditableList#editingConfig
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

   /*
    * @cfg {Controls/interface/IEditableList/EditingConfig.typedef} Configuration for editing in place.
    * @demo Controls-demo/list_new/EditInPlace/EmptyActionsWithToolBar/Index
    * @name Controls/interface/IEditableList#editingConfig
    * @example
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

   /**
    * Запускает {@link /doc/platform/developmentapl/interface-development/controls/list/actions/edit/ редактирование по месту}.
    * @function Controls/interface/IEditableList#beginEdit
    * @param {Controls/interface/IEditableList/ItemEditOptions.typedef} options Параметры редактирования.
    * @returns {Promise}
    * @remark
    * Метод возвращает Promise после монтирования контрола в DOM.
    *
    * Перед запуском редактирования по месту происходит событие {@link beforeBeginEdit}, а после запуска — {@link afterBeginEdit}.
    *
    * Используйте этот метод в ситуациях, когда вы хотите начать редактирование из нестандартного места, например, из {@link /doc/platform/developmentapl/interface-development/controls/list/actions/operations/ панели действий элемента}.
    *
    * Формат полей редактируемой записи может отличаться от формата полей Types/Collection:RecordSet, отображаемый списком. Подробнее читайтет {@link /doc/platform/developmentapl/interface-development/controls/list/actions/edit/ways-to-start/code/#begin-edit-format здесь}.
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
    * @param {Controls/interface/IEditableList/ItemEditOptions.typedef} options Options of editing.
    * @returns {Promise}
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
    * Запускает {@link /doc/platform/developmentapl/interface-development/controls/list/actions/edit/ добавление по месту}.
    * @function Controls/interface/IEditableList#beginAdd
    * @param {Controls/interface/IEditableList/ItemEditOptions.typedef} options Параметры добавления.
    * @returns {Promise}
    * @remark
    * Перед запуском добавления по месту происходит событие {@link Controls/interface/IEditableList#beforeBeginEdit beforeBeginEdit}, а после запуска — {@link Controls/interface/IEditableList#afterBeginEdit afterBeginEdit}.
    *
    * Вы можете задать позицию, в которой отображается шаблон редактирования строки. Для этого в опции {@link editingConfig} установите значение для параметра {@link Controls/interface/IEditableList/EditingConfig.typedef addPosition}. Шаблон редактирования строки может отображаться в начале и в конце списка, группы (если включена {@link Controls/interface/IGroupedList#groupProperty группировка}) или узла (для иерархических списков).
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

   /*
    * Starts adding.
    * @function Controls/interface/IEditableList#beginAdd
    * @param {Controls/interface/IEditableList/ItemEditOptions.typedef} options Options of adding.
    * @returns {Promise}
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
    * Завершает {@link /doc/platform/developmentapl/interface-development/controls/list/actions/edit/ редактирование/добавление по месту} с сохранением введенных данных.
    * @function Controls/interface/IEditableList#commitEdit
    * @returns {Promise}
    * @remark
    * Используйте этот метод, когда вы хотите завершить редактирование в ответ на действие пользователя, например, когда пользователь пытается закрыть диалоговое окно, используйте этот метод для сохранения изменений.
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

   /*
    * Ends editing and commits changes.
    * @function Controls/interface/IEditableList#commitEdit
    * @returns {Promise}
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
    * Завершает {@link /doc/platform/developmentapl/interface-development/controls/list/actions/edit/ редактирование/добавление по месту} без сохранения введенных данных.
    * @function Controls/interface/IEditableList#cancelEdit
    * @returns {Promise}
    * @remark
    * Используйте этот метод, когда вы хотите завершить редактирование или добавление в ответ на действия пользователя, например, когда пользователь нажимает на кнопку "Отмена".
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

   /*
    * Ends editing and discards changes.
    * @function Controls/interface/IEditableList#cancelEdit
    * @returns {Promise}
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
