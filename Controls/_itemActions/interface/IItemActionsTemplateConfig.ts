import {TActionCaptionPosition, TItemActionsPosition} from './IItemAction';

/**
 * @typedef {String} TActionAlignment
 * @variant horizontal По горизонтали.
 * @variant vertical По вертикали.
 */
export type TActionAlignment = 'horizontal'|'vertical';

/**
 * Интерфейс конфигурации itemActionsTemplate/swipeTemplate
 * @remark Передаётся как scope для шаблона
 * @interface Controls/_itemActions/interface/IItemActionsTemplateConfig
 * @author Аверкиев П.А.
 */

/*
 * Interface of configuration for itemActionsTemplate/swipeTemplate
 * @interface Controls/_itemActions/interface/IItemActionsTemplateConfig
 * @author Аверкиев П.А.
 */

export interface IItemActionsTemplateConfig {
    /**
     * @cfg {Boolean} Настройка видимости панели с опциями записи
     * @description Может применяться в настройках режима редактирования
     */
    /*
     * @cfg {Boolean} Visibility setting for actions panel
     */
    toolbarVisibility?: boolean;

    /**
     * @cfg {String} Опция, позволяющая настраивать фон панели операций над записью.
     * @description Предустановленные варианты 'default' | 'transparent'
     */
    /*
     * @cfg {String} Style postfix of actions panel
     */
    style?: string;

    /**
     * @cfg {String} Размер иконок опций записи
     * @description Принимает значения 's' или 'm' в соответствии со стандартом
     */
    /*
     * @cfg {String} Actions icon size
     */
    size?: string;

    /**
     * @cfg {Controls/itemActions:TItemActionsPosition} Позиция опций записи
     */
    /*
     * @cfg {Controls/itemActions:TItemActionsPosition} Actions position relative to record
     */
    itemActionsPosition?: TItemActionsPosition;

    /**
     * @cfg {Controls/itemActions:TActionAlignment} Варианты расположения опций внутри панели {@link /doc/platform/developmentapl/interface-development/controls/list/actions/item-actions/ опций записи}
     */
    /*
     * @cfg {Controls/itemActions:TActionAlignment} Alignment of actions inside actions panel
     */
    actionAlignment?: TActionAlignment;

    /**
     * @cfg {TActionCaptionPosition} Позиция заголовка для опций записи, когда они отображаются в режиме swipe.
     */
    /*
     * @cfg {TActionCaptionPosition} Action caption position for swipe actions
     */
    actionCaptionPosition?: TActionCaptionPosition;

    /**
     * @cfg {String} CSS класс, позволяющий задать отступы и позицию панели с {@link /doc/platform/developmentapl/interface-development/controls/list/actions/item-actions/handler/ опциями записи} внутри элемента.
     * @default controls-itemActionsV_position_bottomRight
     */
    /*
     * @cfg {String} CSS class, allowing to set position and padding for actions panel relative to record
     */
    itemActionsClass?: string;
}
