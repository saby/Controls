import {ICrudPlus, QueryWhereExpression} from 'Types/source';
import {Source as HistorySource} from 'Controls/history';
import {IPopupOptions} from 'Controls/popup';
import {INavigationOptionValue, INavigationSourceConfig} from 'Controls/interface';

export type TNavigation = INavigationOptionValue<INavigationSourceConfig>;

export type TKey = boolean | string | number;

export interface IEditorOptions {
    source?: ICrudPlus | HistorySource;
    keyProperty?: string;
    displayProperty?: string;
    parentProperty?: string;
    nodeProperty?: string;
    minVisibleItems?: number;
    multiSelect?: boolean;
    selectorTemplate?: {
        templateName: string;
        templateOptions?: Record<string, any>;
        popupOptions?: IPopupOptions;
    };
    itemTemplate?: string;
    editorMode?: string;
    filter?: QueryWhereExpression<unknown>;
    navigation?: TNavigation;
    itemTemplateProperty?: string;
}

/**
 * Интерфейс для поддержки просмотра и редактирования полей фильтра.
 * @interface Controls/_filter/View/interface/IFilterItem
 * @public
 * @author Михайлов С.Е.
 */
export interface IFilterItem {
    name: string;
    id?: string;
    value: unknown;
    resetValue?: unknown;
    textValue: string;
    emptyText?: string;
    emptyKey?: TKey;
    doNotSaveToHistory?: boolean;
    visibility?: boolean;
    viewMode?: 'basic' | 'frequent' | 'extended';
    type?: 'dateRange';
    editorOptions?: IEditorOptions;
    [key: string]: any;
}

/**
 * @typedef {Object} Controls/_filter/View/interface/IFilterItem/EditorOptions
 * @property {String} keyProperty Имя свойства, уникально идентифицирующего элемент коллекции.
 * @property {String} displayProperty Имя свойства элемента, содержимое которого будет отображаться. Влияет только на значение при выборе.
 * @property {Types/source:Base} source Объект, который реализует интерфейс {@link Types/source:ICrud} для доступа к данным.
 * Если свойство items указано, то свойство source будет игнорироваться.
 * @property {Boolean} multiSelect Определяет, установлен ли множественный выбор.
 * @property {Controls/_interface/ISelectorDialog} selectorTemplate Шаблон панели выбора элементов.
 * @property {Function|String} itemTemplate Шаблон рендеринга элементов.
 * Подробнее о настройке itemTemplate читайте {@link Controls/_menu/interface/IMenuBase#itemTemplate здесь}.
 * Для задания элемента в качестве заголовка используйте шаблон {@link Controls/filterPopup:SimplePanelEmptyItemTemplate}.
 * @property {String} itemTemplateProperty Имя свойства, содержащего шаблон для рендеринга элементов.
 * Подробнее о настройке itemTemplateProperty читайте {@link Controls/_menu/interface/IMenuBase#itemTemplateProperty здесь}.
 * Для задания элемента в качестве заголовка используйте шаблон {@link Controls/filterPopup:SimplePanelEmptyItemTemplate}.
 * @property {Object} filter Конфигурация фильтра-объект с именами полей и их значениями.
 * Подробнее читайте {@link Controls/_interface/IFilter#filter здесь}.
 * @property {Object} navigation Конфигурация навигации по списку. Настройка навигации источника данных (страницы, смещение, положение) и представления навигации (страницы, бесконечная прокрутка и т. д.).
 * Подробнее читайте {@link Controls/_interface/INavigation#navigation здесь}.
 * @property {String} editorMode Режим отображения редактора. Принимаемые значения смотрите в документации редактора.
 * @property {Number} minVisibleItems Минимальное количество элементов для отображения фильтра. По умолчанию фильтр с одним элементом будет скрыт.
 */

/*
 * @typedef {Object} Controls/_filter/View/interface/IFilterItem/EditorOptions
 * @property {String} keyProperty Name of the item property that uniquely identifies collection item.
 * @property {String} displayProperty Name of the item property that content will be displayed. Only affects the value when selecting.
 * @property {Types/source:Base} source Object that implements ICrud interface for data access. If 'items' is specified, 'source' will be ignored.
 * @property {Boolean} multiSelect Determines whether multiple selection is set.
 * @property {Controls/interface/ISelectorDialog} selectorTemplate Items selection panel template.
 * @property {Function} itemTemplate Template for item render. For more information, see {@link Controls/_menu/interface/IMenuBase#itemTemplate}
 * @property {String} itemTemplateProperty Name of the item property that contains template for item render. For more information, see {@link Controls/_menu/interface/IMenuBase#itemTemplateProperty}
 * @property {Object} filter Filter configuration - object with field names and their values. {@link Controls/_interface/IFilter}
 * @property {Object} navigation List navigation configuration. Configures data source navigation (pages, offset, position) and navigation view (pages, infinite scroll, etc.) {@link Controls/_interface/INavigation}
 * @property {Types/collection:IList} items Special structure for the visual representation of the filter. {@link Types/collection:IList}.
 */

/**
 * @typedef {String} Controls/_filter/View/interface/IFilterItem/FilterViewMode
 * @variant frequent Фильтр, отображаемый в быстрых фильтрах.
 * @variant basic Фильтр, отображаемый в блоке "Отбираются".
 * @variant extended Фильтр, отображаемый в блоке "Еще можно отобрать".
 */

/*
 * @typedef {String} Controls/_filter/View/interface/IFilterItem/FilterViewMode
 * @variant frequent Filter is displayed in fast filters.
 * @variant basic Filter is displayed in the "Selected" block.
 * @variant extended Filter is displayed if the "Also possible to select" block.
 */

/**
 * @typedef {Object} Controls/_filter/View/interface/IFilterItem/FilterItem
 * @property {String} name Имя фильтра.
 * @property {*} value Текущее значение фильтра.
 * @property {*} resetValue Значение фильтра по умолчанию.
 * @property {String} textValue Текстовое значение фильтра. Используется для отображения текста у кнопки фильтра.
 * @property {String} emptyText Текст пункта, значение которого является значением "по-умолчанию" для фильтра. Пункт будет добавлен в начало списка с заданным текстом.
 * @property {String|Number} emptyKey Первичный ключ для пункта выпадающего списка, который создаётся при установке опции emptyText.
 * @property {Controls/_filter/View/interface/IFilterItem/EditorOptions.typedef} editorOptions Опции для редактора.
 * @property {Controls/_filter/View/interface/IFilterItem/FilterViewMode.typedef} viewMode Режим отображения фильтра.
 * @property {Boolean} doNotSaveToHistory Флаг для отмены сохранения фильтра в истории.
 * @property {Boolean} visibility Отображение фильтра в блоке "Еще можно отобрать".
 * @property {String} type Тип значения фильтра.
 * Если тип не указан, он будет автоматически определяться по значению фильтра.
 * Для каждого типа будет построен соответствующий редактор этого типа.
 *
 * В настоящей версии фреймворка поддерживается только 1 значение — dateRange.
 * При его установке будет построен контрол {@link Controls/dateRange:RangeShortSelector}.
 */

/*
 * @typedef {Object} Controls/_filter/View/interface/IFilterItem/FilterItem
 * @property {String} name Name of filter field
 * @property {*} value Current filter field value
 * @property {*} resetValue Value for reset
 * @property {String} textValue Text value of filter field.  Used to display a textual representation of the filter
 * @property {Controls/_filter/View/interface/IFilterItem/EditorOptions.typedef} editorOptions Options for editor
 * @property {Controls/_filter/View/interface/IFilterItem/FilterViewMode.typedef} viewMode Filter view mode
 * @property {Boolean} doNotSaveToHistory Flag to cancel saving filter in history
 */
