import {ICrudPlus, QueryWhereExpression} from 'Types/source';
import {Source as HistorySource} from 'Controls/history';
import {IPopupOptions} from 'Controls/popup';
import {INavigationOptionValue, INavigationSourceConfig} from 'Controls/interface';

export type TNavigation = INavigationOptionValue<INavigationSourceConfig>;

export type TKey = boolean | string | number;

/**
 * @interface Controls/filter:EditorOptions
 * @public
 * @author Михайлов С.Е.
 */
export interface IEditorOptions {
    /**
     * Объект, который реализует интерфейс {@link Types/source:ICrud} для доступа к данным.
     * Если свойство items указано, то свойство source будет игнорироваться.
     */
    source?: ICrudPlus | HistorySource;
    /**
     * Имя свойства, уникально идентифицирующего элемент коллекции.
     */
    keyProperty?: string;
    /**
     * Имя свойства элемента, содержимое которого будет отображаться. Влияет только на значение при выборе.
     */
    displayProperty?: string;
    parentProperty?: string;
    nodeProperty?: string;
    /**
     * Минимальное количество элементов для отображения фильтра. По умолчанию фильтр с одним элементом будет скрыт.
     */
    minVisibleItems?: number;
    /**
     * Определяет, установлен ли множественный выбор.
     */
    multiSelect?: boolean;
    /**
     * Шаблон панели выбора элементов.
     */
    selectorTemplate?: {
        templateName: string;
        templateOptions?: Record<string, any>;
        popupOptions?: IPopupOptions;
    };
    /**
     * Шаблон рендеринга элементов.
     * Подробнее о настройке itemTemplate читайте {@link Controls/_menu/interface/IMenuBase#itemTemplate здесь}.
     * Для задания элемента в качестве заголовка используйте шаблон {@link Controls/filterPopup:SimplePanelEmptyItemTemplate}.
     */
    itemTemplate?: string;
    /**
     * Режим отображения редактора. Принимаемые значения смотрите в документации редактора.
     */
    editorMode?: string;
    /**
     * Конфигурация фильтра-объект с именами полей и их значениями.
     * Подробнее читайте {@link Controls/_interface/IFilter#filter здесь}.
     */
    filter?: QueryWhereExpression<unknown>;
    /**
     * Конфигурация навигации по списку. Настройка навигации источника данных (страницы, смещение, положение) и представления навигации (страницы, бесконечная прокрутка и т. д.).
     * Подробнее читайте {@link Controls/_interface/INavigation#navigation здесь}.
     */
    navigation?: TNavigation;
    /**
     * Имя свойства, содержащего шаблон для рендеринга элементов.
     * Подробнее о настройке itemTemplateProperty читайте {@link Controls/_menu/interface/IMenuBase#itemTemplateProperty здесь}.
     * Для задания элемента в качестве заголовка используйте шаблон {@link Controls/filterPopup:SimplePanelEmptyItemTemplate}.
     */
    itemTemplateProperty?: string;
}

/**
 * Интерфейс для поддержки просмотра и редактирования полей фильтра.
 * @public
 * @author Михайлов С.Е.
 */
export interface IFilterItem {
    /**
     * Имя фильтра.
     */
    name: string;
    id?: string;
    /**
     * Текущее значение фильтра.
     */
    value: unknown;
    /**
     * Значение фильтра по умолчанию.
     */
    resetValue?: unknown;
    /**
     * Текстовое значение фильтра. Используется для отображения текста у кнопки фильтра.
     */
    textValue: string;
    /**
     * Текст пункта, значение которого является значением "по-умолчанию" для фильтра. Пункт будет добавлен в начало списка с заданным текстом.
     */
    emptyText?: string;
    /**
     * Первичный ключ для пункта выпадающего списка, который создаётся при установке опции emptyText.
     */
    emptyKey?: TKey;
    /**
     * Флаг для отмены сохранения фильтра в истории.
     */
    doNotSaveToHistory?: boolean;
    /**
     * Отображение фильтра в блоке "Еще можно отобрать".
     * Настройка актуальна только для свойства viewMode, которое установлено в значение "extended".
     */
    visibility?: boolean;
    /**
     * Режим отображения фильтра.
     * @variant frequent Фильтр, отображаемый в быстрых фильтрах.
     * @variant basic Фильтр, отображаемый в блоке "Отбираются".
     * @variant extended Фильтр, отображаемый в блоке "Еще можно отобрать".
     */
    viewMode?: 'basic' | 'frequent' | 'extended';
    /**
     * Тип значения фильтра.
     * Если тип не указан, он будет автоматически определяться по значению фильтра.
     * Для каждого типа будет построен соответствующий редактор этого типа.
     *
     * В настоящей версии фреймворка поддерживается только 1 значение — dateRange.
     * При его установке будет построен контрол {@link Controls/dateRange:RangeShortSelector}.
     */
    type?: 'dateRange';
    /**
     * Опции для редактора.
     */
    editorOptions?: IEditorOptions;
    [key: string]: any;
}

/*
 * @typedef {Object} Controls/filter:EditorOptions
 * @property {String} keyProperty Name of the item property that uniquely identifies collection item.
 * @property {String} displayProperty Name of the item property that content will be displayed. Only affects the value when selecting.
 * @property {Types/source:Base} source Object that implements ICrud interface for data access. If 'items' is specified, 'source' will be ignored.
 * @property {Boolean} multiSelect Determines whether multiple selection is set.
 * @property {Controls/interface:ISelectorDialog} selectorTemplate Items selection panel template.
 * @property {Function} itemTemplate Template for item render. For more information, see {@link Controls/_menu/interface/IMenuBase#itemTemplate}
 * @property {String} itemTemplateProperty Name of the item property that contains template for item render. For more information, see {@link Controls/_menu/interface/IMenuBase#itemTemplateProperty}
 * @property {Object} filter Filter configuration - object with field names and their values. {@link Controls/_interface/IFilter}
 * @property {Object} navigation List navigation configuration. Configures data source navigation (pages, offset, position) and navigation view (pages, infinite scroll, etc.) {@link Controls/_interface/INavigation}
 * @property {Types/collection:IList} items Special structure for the visual representation of the filter. {@link Types/collection:IList}.
 */

