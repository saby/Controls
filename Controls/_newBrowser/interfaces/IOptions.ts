import {ICrudPlus, QueryWhereExpression} from 'Types/source';
import {TKey} from 'Controls/interface';
import {IControlOptions, TemplateFunction} from 'UI/Base';
import {IMasterOptions} from 'Controls/_newBrowser/interfaces/IMasterOptions';
import {ISourceOptions} from 'Controls/_newBrowser/interfaces/ISourceOptions';
import {DetailViewMode, IDetailOptions} from 'Controls/_newBrowser/interfaces/IDetailOptions';
import {IBrowserViewConfig} from 'Controls/_newBrowser/interfaces/IBrowserViewConfig';
import {RecordSet} from 'Types/collection';

/**
 * Интерфейс описывает структуру настроек компонента {@link Controls/newBrowser:Browser}
 * @public
 * @author Уфимцев Д.Ю.
 */
export interface IOptions extends IControlOptions, ISourceOptions {
    /**
     * @cfg
     * Базовый источник данных, который будет использован по умолчанию для списков,
     * отображаемых в каталоге. Может быть перекрыт на уровне конкретного блока каталога.
     *
     * @remark
     * Актуально использовать для уменьшения кол-ва задаваемых опций. Например,
     * когда списки в обоих колонках используют один и тот же источник данных.
     *
     * @see IMasterOptions.source
     * @see IDetailOptions.source
     */
    source?: ICrudPlus;

    /**
     * @cfg
     * Имя свойства, содержащего информацию об идентификаторе текущей
     * строки в master и detail колонках.
     *
     * Значение данной опции передается в одноименную опцию списков,
     * отображаемых в колонках каталога.
     *
     * Оно так же может быть перекрыто на уровне конкретной колонки каталога.
     *
     * @remark
     * Актуально использовать для уменьшения кол-ва задаваемых опций. Например,
     * когда списки в обоих колонках используют один и тот же источник данных
     * или в качестве идентификации записей используют одно и тоже поле.
     *
     * @see IMasterOptions.keyProperty
     * @see IDetailOptions.keyProperty
     */
    keyProperty?: string;

    /**
     * @cfg
     * Идентификатор узла, содержимое которой нужно отобразить в detail-колонке.
     */
    root?: TKey;

    /**
     * @cfg
     * Фильтр данных, который будет применен к списку в detail-колонке.
     */
    filter?: QueryWhereExpression<unknown>;

    /**
     * @cfg
     * Значение строки поиска для данных в detail-колонке.
     */
    searchValue?: string;

    /**
     * @cfg
     * Ф-ия, которая будет вызвана после получения данных для detail-колонки.
     */
    dataLoadCallback?: (items: RecordSet, direction: string) => void;

    /**
     * @cfg
     * Идентификатор узла, содержимое которой нужно отобразить в master-колонке.
     * Если undefined, то используется значение из опции {@link root}
     */
    masterRoot?: TKey;

    /**
     * @cfg
     * Уникальный идентификатор контрола, по которому будет сохраняться конфигурация в хранилище данных.
     *
     * @remark
     * Например, на основании этой опции собирается значение, передающееся в одноименную опцию компонента
     * Controls.masterDetail:Base
     */
    propStorageId?: string;
    /**
     * @cfg
     * Флаг, указывающий на необходимость обернуть контент внутри master в scroll
     */
    wrapMasterInScroll: boolean;

    /**
     * @cfg
     * Флаг, указывающий на необходимость обернуть контент внутри detail в scroll
     */
    wrapDetailInScroll: boolean;


    /**
     * @cfg
     * Пользовательский режим отображения списка. Если задан, то является
     * приоритетным и настройка из listConfiguration не применяется.
     *
     * @remark
     * Приоритетнее этой опции является только режим поиска, который определяется
     * при наличии опции {@link searchValue}
     *
     * @see listConfiguration
     */
    userViewMode?: DetailViewMode;

    /**
     * @cfg
     * Конфигурация списка, которая будет применена по умолчанию.
     */
    listConfiguration?: IBrowserViewConfig;

    /**
     * @cfg
     * Конфигурация master-колонки. Если не задана, то мастер-колонка не отображается.
     * Также видимость мастер колонки можно регулировать опцией {@link IMasterOptions.visibility}.
     *
     * @remark
     * Здесь вы можете указать дополнительные опции для Controls.explorer:View, отображаемом
     * в master колонке
     *
     * @see IMasterOptions.visibility
     */
    master?: IMasterOptions;

    /**
     * @cfg
     * Конфигурация detail-колонки.
     *
     * @remark
     * Здесь вы можете указать дополнительные опции для Controls.explorer:View, отображаемом
     * в detail колонке
     */
    detail?: IDetailOptions;

    /**
     * @cfg
     * Шаблон, который будет выведен над мастер-списком
     */
    masterHeaderTemplate?: TemplateFunction | string;

    /**
     * @cfg
     * Шаблон, который будет выведен над detail-списком
     */
    detailHeaderTemplate?: TemplateFunction | string;

    /**
     * @cfg
     * Шаблон, который будет выведен под detail-списком
     */
    detailFooterTemplate?: TemplateFunction | string;
}
