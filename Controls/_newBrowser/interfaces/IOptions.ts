import {ICrudPlus} from 'Types/source';
import {IControlOptions} from 'UI/Base';
import {IMasterOptions} from 'Controls/_newBrowser/interfaces/IMasterOptions';
import {CatalogDetailViewMode, IDetailOptions} from 'Controls/_newBrowser/interfaces/IDetailOptions';
import {ISourceOptions} from 'Controls/_newBrowser/interfaces/ISourceOptions';

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
     * Идентификатор папки, содержимое которой нужно отобразить в каталоге
     */
    root?: string;

    /**
     * Уникальный идентификатор контрола, по которому будет сохраняться конфигурация в хранилище данных.
     */
    propStorageId?: string;

    /**
     * Режим отображения списка
     * @default CatalogDetailViewMode.list
     */
    viewMode: CatalogDetailViewMode;

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
}
