import {IEditableList, IEditingConfig} from 'Controls/list';

/**
 * @typedef {Enum} TEditingMode
 * @description Допустимые значения для свойства {@link IGridEditingConfig mode}.
 * @variant row Редактирование всей строки.
 * @variant cell Редактирование отдельных ячеек.
 */
type TEditingMode = 'row' | 'cell';

/**
 * @typedef {Object} IGridEditingConfig
 * @description Интерфейс объекта-конфигурации {@link /doc/platform/developmentapl/interface-development/controls/list/actions/edit/ редактирования/добавления по месту}.
 * @property {Boolean} [addPosition=false] Автоматический запуск добавления по месту при инициализации {@link /doc/platform/developmentapl/interface-development/controls/list/list/empty/ пустого списка}. По умолчанию отключено (false). Подробнее читайте {@link /doc/platform/developmentapl/interface-development/controls/list/actions/edit/ways-to-start/init/ здесь}.
 * @property {Boolean} [editOnClick=false] Запуск редактирования по месту при клике по элементу списка. Является частью {@link /doc/platform/developmentapl/interface-development/controls/list/actions/edit/basic/ базовой конфигурации} функционала редактирования по месту. По умолчанию отключено (false).
 * @property {Boolean} [autoAdd=false] Автоматический запуск добавления нового элемента, происходящий при завершении редактирования последнего элемента списка. По умолчанию отключено (false). Подробнее читайте {@link /doc/platform/developmentapl/interface-development/controls/list/actions/edit/ways-to-start/auto/#add здесь}.
 * @property {Boolean} [autoAddByApplyButton=true] Отмена автоматического запуска добавления нового элемента, если завершение добавления предыдущего элемента происходит {@link /doc/platform/developmentapl/interface-development/controls/list/actions/edit/item-actions/#visible кнопкой "Сохранить"} на {@link /doc/platform/developmentapl/interface-development/controls/list/actions/item-actions/ панели опций записи}. По умолчанию автоматический запуск включен (true). Подробнее читайте {@link /doc/platform/developmentapl/interface-development/controls/list/actions/edit/ways-to-start/auto/#add здесь}.
 * @property {Boolean} [sequentialEditing=true] Автоматический запуск редактирования по месту для следующего элемента, происходящий при завершении редактирования любого (кроме последнего) элемента списка. По умолчанию автоматический запуск включен (true). Подробнее читайте {@link /doc/platform/developmentapl/interface-development/controls/list/actions/edit/ways-to-start/auto/#edit здесь}.
 * @property {Boolean} [toolbarVisibility=false] Видимость кнопок "Сохранить" и "Отмена", отображаемых на {@link /doc/platform/developmentapl/interface-development/controls/list/actions/item-actions/ панели опций записи} в режиме редактирования. По умолчанию кнопки скрыты (false). Подробнее читайте {@link /doc/platform/developmentapl/interface-development/controls/list/actions/edit/item-actions/#visible здесь}.
 * @property {String} [backgroundStyle=default] Предназначен для настройки фона редактируемого элемента. Подробнее см {@link /doc/platform/developmentapl/interface-development/controls/list/actions/edit/template/#table-background Цвет фона элемента в режиме редактирования}.
 * @property {TEditingMode} [mode=row] Режим редактирования таблицы.
 * @property {TAddPosition} [addPosition=bottom] Позиция добавления по месту. Подробнее читайте {@link /doc/platform/developmentapl/interface-development/controls/list/actions/edit/ways-to-start/code/#add-position здесь}.
 * @property {Types/entity:Model} [item=undefined] Автоматический запуск редактирования/добавления по месту при инициализации списка. Подробнее читайте {@link /doc/platform/developmentapl/interface-development/controls/list/actions/edit/ways-to-start/init/ здесь}.
 */
export interface IGridEditingConfig extends IEditingConfig {
    mode?: TEditingMode;
}

/**
 * Интерфейс для {@link /doc/platform/developmentapl/interface-development/controls/grid/ таблиц} с возможностью {@link /doc/platform/developmentapl/interface-development/controls/list/actions/edit/ редактирования/добавления по месту}.
 *
 * @public
 * @author Авраменко А.С.
 * @mixes Controls/list:IEditableList
 * @see Controls/editableArea:View
 * @remark
 * Разница между этим интерфейсом и {@link Controls/editableArea:View Controls/editableArea:View} заключается в том, что первый используется в списках, а второй - вне их (например, на вкладках).
 */
export interface IEditableGrid extends IEditableList {
    _options: {
        /**
         * @name Controls/_grid/interface/IEditableGrid#editingConfig
         * @cfg {IGridEditingConfig | undefined} Конфигурация {@link /doc/platform/developmentapl/interface-development/controls/list/actions/edit/ редактирования/добавления по месту}.
         */
        editingConfig: IGridEditingConfig;
    };
}
