import {ICrudPlus} from 'Types/source';
import {TemplateFunction} from 'UI/Base';
import {
    IColumn,
    IHeaderCell,
    IFilterOptions,
    IGroupingOptions,
    IHierarchyOptions,
    INavigationOptions,
    INavigationSourceConfig,
    IPromiseSelectableOptions,
    ISortingOptions,
    ISourceOptions,
    ISearchOptions
} from 'Controls/interface';
import {RecordSet} from 'Types/collection';
import {IHierarchySearchOptions} from 'Controls/interface/IHierarchySearch';

/**
 * Enum со списком доступных вариантов отображения контента в detail-колонке
 */
export enum DetailViewMode {
    // Плоский список
    list = 'list',
    // Плитка
    tile = 'tile',
    // Таблица
    table = 'table',
    // Результаты поиска
    search = 'search'
}

export
    interface IDetailOptions
    extends
        IFilterOptions,
        ISortingOptions,
        IHierarchyOptions,
        IGroupingOptions,
        ISourceOptions,
        ISearchOptions,
        IHierarchySearchOptions,
        IPromiseSelectableOptions,
        INavigationOptions<INavigationSourceConfig> {

    //region source options
    /**
     * @name Controls/newBrowser:IDetail#source
     * @cfg {ICrudPlus} Источник данных, который будет использован списочным представлением внутри detail-колонки.
     * Если не задан, то будет использован источник данных, который указан в основной конфигурации
     * {@link ICatalogOptions.source}
     *
     * @see ICatalogOptions.source
     */
    source?: ICrudPlus;

    /**
     * @name Controls/newBrowser:IDetail#keyProperty
     * @cfg {String} Имя свойства записи detail-списка, содержащего информацию о её идентификаторе.
     */
    keyProperty?: string;
    //endregion

    //region templates
    /**
     * @name Controls/newBrowser:IDetail#customItemTemplate
     * @cfg {TemplateFunction|string} Кастомный шаблон отображения итема плоского списка.
     *
     * @remark
     * Имеет смысл задавать, если нужно польностью переопределить
     * шаблон итема плоского списка.
     */
    customItemTemplate?: TemplateFunction | string;

    /**
     * @name Controls/newBrowser:IDetail#customTileItemTemplate
     * @cfg {TemplateFunction|string} Кастомный шаблон отображения итема плитки
     */
    customTileItemTemplate?: TemplateFunction | string;

    /**
     * @name Controls/newBrowser:IDetail#emptyTemplate
     * @cfg {TemplateFunction|string} Пользовательский шаблон отображения пустого списка.
     */
    emptyTemplate?: TemplateFunction | string;

    /**
     * @name Controls/newBrowser:IDetail#afterBreadCrumbsTemplate
     * @cfg {TemplateFunction|string} Пользовательский шаблон, который будет выведен справа от хлебных
     * крошек
     */
    afterBreadCrumbsTemplate?: TemplateFunction | string;
    //endregion

    /**
     * @name Controls/newBrowser:IDetail#imageProperty
     * @cfg {string} Название поле записи в котором лежит ссылка на картинку
     */
    imageProperty?: string;

    /**
     * @name Controls/newBrowser:IDetail#descriptionProperty
     * @cfg {string} Имя поля записи в котором лежит описание итема и которое
     * нужно вывести в области контента
     */
    descriptionProperty?: string;

    /**
     * @name Controls/newBrowser:IDetail#gradientColorProperty
     * @cfg {string} Имя поля записи в котором лежит цвет градиента для итема.
     * Можно указывать в любом формате, который поддерживается в CSS.
     */
    gradientColorProperty?: string;

    displayProperty?: string;

    hasChildrenProperty?: string;

    /**
     * @name Controls/newBrowser:IDetail#columns
     * @cfg {IColumn[]} Конфигурация колонок таблицы.
     */
    columns?: IColumn[];

    /**
     * @name Controls/newBrowser:IDetail#header
     * @cfg {IHeaderCell} Конфигурация заголовка таблицы.
     */
    header?: IHeaderCell;

    /**
     * @name Controls/newBrowser:IDetail#backgroundColor
     * @cfg {String} Цвет фона detail-колонки
     */
    backgroundColor?: string;

    searchStartingWith?: string;

    dataLoadCallback?: (items: RecordSet, direction: string) => void;
}

/**
 * Интерфейс описывает структуру настроек detail-колонки компонента {@link Controls/newBrowser:Browser}
 * @interface Controls/newBrowser:IDetail
 * @public
 * @author Уфимцев Д.Ю.
 */