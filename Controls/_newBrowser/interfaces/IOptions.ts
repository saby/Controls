import {ICrudPlus} from 'Types/source';
import {TKey} from 'Controls/interface';
import {IControlOptions, TemplateFunction} from 'UI/Base';
import {IMasterOptions} from 'Controls/_newBrowser/interfaces/IMasterOptions';
import {ISourceOptions} from 'Controls/_newBrowser/interfaces/ISourceOptions';
import {DetailViewMode, IDetailOptions} from 'Controls/_newBrowser/interfaces/IDetailOptions';

/**
 * Интерфейс описывает структуру настроек компонента {@link Controls/newBrowser:Browser}
 * @interface Controls/newBrowser:IOptions
 * @public
 * @author Уфимцев Д.Ю.
 */
export interface IOptions extends IControlOptions, ISourceOptions {
    /**
     * Базовый источник данных, который будет использован по умолчанию для списков, отображаемых в каталоге.
     * Может быть перекрыт на уровне конкретного блока каталога.
     *
     * @remark
     * Актуально использовать для уменьшения кол-ва задаваемых опций. Например, когда списки в обоих колонках используют
     * один и тот же источник данных
     *
     * @see IMasterOptions.source
     * @see IDetailOptions.source
     */
    source?: ICrudPlus;

    /**
     * Имя свойства, содержащего информацию об идентификаторе текущей строки в master и detail колонках.
     * Значение данной опции передается в одноименную опцию списков, отображаемых в колонках каталога.
     * Оно так же может быть перекрыто на уровне конкретной колонки каталога.
     *
     * @remark
     * Актуально использовать для уменьшения кол-ва задаваемых опций. Например, когда списки в обоих колонках
     * используют один и тот же источник данных или в качестве идентификации записей используют одно и тоже поле.
     *
     * @see IMasterOptions.keyProperty
     * @see IDetailOptions.keyProperty
     */
    keyProperty?: string;

    /**
     * Идентификатор папки, содержимое которой нужно отобразить в detail-колонке
     */
    root?: TKey;

    /**
     * Идентификатор папки, содержимое которой нужно отобразить в master-колонке.
     * Если не задан, то используется значение из опции {@link root}
     */
    masterRoot?: TKey;

    /**
     * Уникальный идентификатор контрола, по которому будет сохраняться конфигурация в хранилище данных.
     */
    propStorageId?: string;

    /**
     * Пользовательский режим отображения списка. Если задан, то является
     * приоритетным и настройка из listConfiguration не применяется.
     */
    userViewMode?: DetailViewMode;

    /**
     * Конфигурация master-колонки. Если не задана, то мастер-колонка не отображается.
     * Также видимость мастер колонки можно регулировать опцией
     * {@link IMasterOptions.visibility}
     *
     * @see IMasterOptions.visibility
     */
    master?: IMasterOptions;

    /**
     * Конфигурация detail-колонки.
     */
    detail?: IDetailOptions;

    /**
     * Шаблон, который будет выведен под detail-списком
     */
    detailFooterTemplate?: TemplateFunction | string;
}
