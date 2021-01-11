import {ICrudPlus} from 'Types/source';
import {TemplateFunction} from 'UI/Base';
import {ISourceOptions} from 'Controls/_newBrowser/interfaces/ISourceOptions';

/**
 * Enum со списком доступных вариантов отображения контента в detail-колонке
 */
export enum CatalogDetailViewMode {
    list = 'list',
    tile = 'tile',
    table = 'table'
}

/**
 * Интерфейс описывает структуру настроек detail-колонки компонента {@link Controls/newBrowser:Browser}
 * @interface Controls/newBrowser:IDetailOptions
 * @public
 * @author Уфимцев Д.Ю.
 */
export interface IDetailOptions extends ISourceOptions {
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

    //region display options
    /**
     * Опции для компонента {@link Controls/list:View}, который отображается
     * в detail-колонке в режиме {@link CatalogDetailViewMode.list}
     *
     * Данные опции перекрывают опции, вычисленные на основании конфигурации
     * {@link ICatalogOptions.detail|detail-колонки}
     *
     * @see viewMode
     */
    list?: object;

    /**
     * Опции для компонента {@link Controls/treeGrid:View}, который отображается
     * в detail-колонке в режиме {@link CatalogDetailViewMode.table}
     *
     * Данные опции перекрывают опции, вычисленные на основании конфигурации
     * {@link ICatalogOptions.detail|detail-колонки}
     *
     * @see viewMode
     */
    table?: object;
    //endregion

    //region item templates
    /**
     * Кастомный шаблон отображения итема плоского списка
     */
    listItemTemplate?: TemplateFunction | string;

    /**
     * Кастомный шаблон отображения итема плитки
     */
    tileItemTemplate?: TemplateFunction | string;

    /**
     * Шаблон отображения контента, который будет внедрен в дефолтный
     * шаблон отображения итема.
     */
    itemContent: TemplateFunction | string;

    /**
     * Шаблон отображения футера, который будет внедрен в дефолтный
     * шаблон отображения итема.
     */
    itemFooter: TemplateFunction | string;
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

    columns?: unknown;
}
