import {ICrudPlus} from 'Types/source';
import {TemplateFunction} from 'UI/Base';
import {IColumn, IHeaderCell} from 'Controls/grid';
import {
    IFilterOptions,
    IGroupingOptions,
    IHierarchyOptions,
    INavigationOptions,
    INavigationSourceConfig,
    IPromiseSelectableOptions,
    ISortingOptions,
    ISourceOptions
} from 'Controls/interface';

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

/**
 * Интерфейс описывает структуру настроек detail-колонки компонента {@link Controls/newBrowser:Browser}
 * @interface Controls/newBrowser:IDetailOptions
 * @public
 * @author Уфимцев Д.Ю.
 */
export
    interface IDetailOptions
    extends
        IFilterOptions,
        ISortingOptions,
        IHierarchyOptions,
        IGroupingOptions,
        ISourceOptions,
        IPromiseSelectableOptions,
        INavigationOptions<INavigationSourceConfig> {

    //region source options
    /**
     * Источник данных, который будет использован списочным представлением внутри detail-колонки.
     * Если не задан, то будет использован источник данных, который указан в основной конфигурации
     * {@link ICatalogOptions.source}
     *
     * @see ICatalogOptions.source
     */
    source?: ICrudPlus;

    /**
     * Имя свойства записи detail-списка, содержащего информацию о её идентификаторе.
     */
    keyProperty?: string;
    //endregion

    //region templates
    /**
     * Кастомный шаблон отображения итема плоского списка.
     *
     * @remark
     * Имеет смысл задавать, если нужно польностью переопределить
     * шаблон итема плоского списка.
     */
    customItemTemplate?: TemplateFunction | string;

    /**
     * Кастомный шаблон отображения итема плитки
     */
    customTileItemTemplate?: TemplateFunction | string;

    /**
     * Пользовательский шаблон отображения пустого списка.
     */
    emptyTemplate?: TemplateFunction | string;

    /**
     * Пользовательский шаблон, который будет выведен справа от хлебных
     * крошек
     */
    afterBreadCrumbsTemplate?: TemplateFunction | string;
    //endregion

    /**
     * Название поле записи в котором лежит ссылка на картинку
     */
    imageProperty?: string;

    /**
     * Имя поля записи в котором лежит описание итема и которое
     * нужно вывести в области контента
     */
    descriptionProperty?: string;

    /**
     * Имя поля записи в котором лежит цвет градиента для итема.
     * Можно указывать в любом формате, который поддерживается в CSS.
     */
    gradientColorProperty?: string;

    /**
     * Конфигурация колонок таблицы.
     */
    columns?: IColumn[];

    /**
     * Конфигурация заголовка таблицы.
     */
    header?: IHeaderCell;

    /**
     * Цвет фона detail-колонки
     */
    backgroundColor?: string;

    searchStartingWith?: string;
}
