import {ICrudPlus} from 'Types/source';
import {ISourceOptions} from 'Controls/_newBrowser/interfaces/ISourceOptions';
import {RecordSet} from 'Types/collection';

export enum MasterVisibilityEnum {
    visible = 'visible',
    hidden = 'hidden'
}

/**
 * Интерфейс описывает структуру настроек master-колонки компонента {@link Controls/catalog:Browser}
 * @interface Controls/catalog:IMasterOptions
 * @public
 * @author Уфимцев Д.Ю.
 */
export interface IMasterOptions extends ISourceOptions {

    //region source options
    /**
     * Источник данных, который будет использован списочным представлением внутри master-колонки.
     * Если не задан, то будет использован источник данных, который указан в основной конфигурации
     * {@link ICatalogOptions.source}
     * @see ICatalogOptions.source
     */
    source?: ICrudPlus;

    /**
     * Имя свойства записи master-списка, содержащего информацию о её идентификаторе.
     */
    keyProperty?: string;
    //endregion

    //region display options
    /**
     * Ширина контентной области master при построении контрола. Значение можно задавать как в пикселях,
     * так и в процентах.
     */
    width?: string | number;

    /**
     * Минимальная ширина контентной области до которой может быть уменьшена ширина master. Значение можно задавать
     * как в пикселях, так и в процентах.
     */
    minWidth?: string | number;

    /**
     * Максимальная ширина контентной области до которой может быть увеличена ширина master. Значение можно задавать
     * как в пикселях, так и в процентах.
     */
    maxWidth?: string | number;

    /**
     * Регулирует видимость master-колонки. Данная опция приоритетнее чем видимость мастера,
     * вычисленная на основании {@link IOptions.listConfiguration|конфигурации}
     * @default 'hidden'
     */
    visibility?: MasterVisibilityEnum;
    //endregion

    itemsReadyCallback?: (items: RecordSet) => void;
}
