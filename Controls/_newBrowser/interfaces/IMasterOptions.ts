import {ICrudPlus} from 'Types/source';
import {ISourceOptions} from 'Controls/_newBrowser/interfaces/ISourceOptions';

export enum MasterVisibilityEnum {
    visible = 'visible',
    hidden = 'hidden'
}

export interface IMasterOptions extends ISourceOptions {

    //region source options
    /**
     * @name Controls/newBrowser:IMaster#source
     * @cfg {ICrudPlus} Источник данных, который будет использован списочным представлением внутри master-колонки.
     * Если не задан, то будет использован источник данных, который указан в основной конфигурации
     * {@link ICatalogOptions.source}
     * @see ICatalogOptions.source
     */
    source?: ICrudPlus;

    /**
     * @name Controls/newBrowser:IMaster#keyProperty
     * @cfg {string} Имя свойства записи master-списка, содержащего информацию о её идентификаторе.
     */
    keyProperty?: string;
    //endregion

    //region display options
    /**
     * @name Controls/newBrowser:IMaster#width
     * @cfg {string | number} Ширина контентной области master при построении контрола. Значение можно задавать как в пикселях,
     * так и в процентах.
     */
    width?: string | number;

    /**
     * @name Controls/newBrowser:IMaster#minWidth
     * @cfg {string | number} Минимальная ширина контентной области до которой может быть уменьшена ширина master. Значение можно задавать
     * как в пикселях, так и в процентах.
     */
    minWidth?: string | number;

    /**
     * @name Controls/newBrowser:IMaster#maxWidth
     * @cfg {string | number} Максимальная ширина контентной области до которой может быть увеличена ширина master. Значение можно задавать
     * как в пикселях, так и в процентах.
     */
    maxWidth?: string | number;

    /**
     * @name Controls/newBrowser:IMaster#visibility
     * @cfg {MasterVisibilityEnum} Регулирует видимость master-колонки
     * @default 'hidden'
     */
    visibility?: MasterVisibilityEnum;
    //endregion
}

/**
 * Интерфейс описывает структуру настроек master-колонки компонента {@link Controls/catalog:Browser}
 * @interface Controls/newBrowser:IMaster
 * @public
 * @author Уфимцев Д.Ю.
 */