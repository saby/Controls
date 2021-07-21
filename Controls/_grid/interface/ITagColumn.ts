import {IColumn} from 'Controls/grid';

/**
 * @typedef {String} Controls/_grid/interface/ITagColumn/TActionDisplayMode
 * @description Стиль тега
 * @variant info
 * @variant danger
 * @variant primary
 * @variant success
 * @variant warning
 * @variant secondary
 */
/*
 * @typedef {String} Controls/_grid/interface/ITagColumn/TActionDisplayMode
 * @variant info
 * @variant danger
 * @variant primary
 * @variant success
 * @variant warning
 * @variant secondary
 */
export type TTagStyle = 'info' | 'danger' | 'primary' | 'success' | 'warning' | 'secondary';

/**
 * Интерфейс для конфигурации колонки c тегом в {@link Controls/grid:View таблице} и {@link Controls/treeGrid:View дереве с колонками}.
 *
 * @interface Controls/_grid/interface/ITagColumn
 * @public
 * @author Аверкиев П.А.
 */
/*
 * Interface for column with enabled tagTemplate in controls {@link Controls/grid:View Таблица} & {@link Controls/treeGrid:View Дерево}.
 *
 * @interface Controls/_grid/interface/ITagColumn
 * @public
 * @author Аверкиев П.А.
 */
export interface ITagColumn extends IColumn {
    /**
     * @name Controls/_grid/interface/ITagColumn#tagStyleProperty
     * @cfg {String} Имя свойства, содержащего стиль тега.
     */
    /*
     * @name Controls/_grid/interface/ITagColumn#tagStyleProperty
     * @cfg {String} Name of the property that contains tag style
     */
    tagStyleProperty?: string;
}
