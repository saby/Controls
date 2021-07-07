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
 * @public
 * @author Аверкиев П.А.
 */

/*
 * Interface of configuration for itemActionsTemplate/swipeTemplate
 * @interface Controls/_itemActions/interface/IItemActionsTemplateConfig
 * @public
 * @author Аверкиев П.А.
 */

export interface IItemActionsTemplateConfig {
    /**
     * @name Controls/_itemActions/itemActions/interface/IItemActionsTemplateConfig#toolbarVisibility
     * @description Может применяться в настройках режима редактирования
     * @cfg {Boolean} Настройка видимости панели с опциями записи
     */
    /*
     * @name Controls/_itemActions/itemActions/interface/IItemActionsTemplateConfig#toolbarVisibility
     * @cfg {Boolean} Visibility setting for actions panel
     */
    toolbarVisibility?: boolean;

    /**
     * @name Controls/_itemActions/itemActions/interface/IItemActionsTemplateConfig#style
     * @cfg {String} Стиль отображения панели с опциями записи.
     * @description Принимает значения 'master' | 'default' | 'transparent'
     */
    /*
     * @name Controls/_itemActions/itemActions/interface/IItemActionsTemplateConfig#style
     * @cfg {String} Style of actions panel
     */
    style?: 'master'|'default'|'transparent';

    /**
     * @name Controls/_itemActions/itemActions/interface/IItemActionsTemplateConfig#size
     * @cfg {String} Размер иконок опций записи
     * @description Принимает значения 's' или 'm' в соответствии со стандартом
     */
    /*
     * @name Controls/_itemActions/itemActions/interface/IItemActionsTemplateConfig#size
     * @cfg {String} Actions icon size
     */
    size?: string;

    /**
     * @name Controls/_itemActions/itemActions/interface/IItemActionsTemplateConfig#itemActionsPosition
     * @cfg {Controls/itemActions:TItemActionsPosition} Позиция опций записи
     */
    /*
     * @name Controls/_itemActions/itemActions/interface/IItemActionsTemplateConfig#itemActionsPosition
     * @cfg {Controls/itemActions:TItemActionsPosition} Actions position relative to record
     */
    itemActionsPosition?: TItemActionsPosition;

    /**
     * @name Controls/_itemActions/itemActions/interface/IItemActionsTemplateConfig#actionAlignment
     * @cfg {Controls/itemActions:TActionAlignment} Варианты расположения опций внутри панели {@link https://wi.sbis.ru/doc/platform/developmentapl/interface-development/controls/list/list/item-actions/ опций записи}
     */
    /*
     * @name Controls/_itemActions/itemActions/interface/IItemActionsTemplateConfig#actionAlignment
     * @cfg {Controls/itemActions:TActionAlignment} Alignment of actions inside actions panel
     */
    actionAlignment?: TActionAlignment;

    /**
     * @name Controls/_itemActions/itemActions/interface/IItemActionsTemplateConfig#actionCaptionPosition
     * @cfg {Controls/itemActions:TActionCaptionPosition} Позиция заголовка для опций записи, когда они отображаются в режиме swipe.
     */
    /*
     * @name Controls/_itemActions/itemActions/interface/IItemActionsTemplateConfig#actionCaptionPosition
     * @cfg {Controls/itemActions:TActionCaptionPosition} Action caption position for swipe actions
     */
    actionCaptionPosition?: TActionCaptionPosition;

    /**
     * @name Controls/_itemActions/itemActions/interface/IItemActionsTemplateConfig#itemActionsClass
     * @cfg {String} CSS класс, позволяющий задать отступы и позицию панели с {@link https://wi.sbis.ru/doc/platform/developmentapl/interface-development/controls/list/list/item-actions/ опциями записи} внутри элемента.
     * @default controls-itemActionsV_position_bottomRight
     */
    /*
     * @name Controls/_itemActions/itemActions/interface/IItemActionsTemplateConfig#itemActionsClass
     * @cfg {Controls/itemActions:TActionCaptionPosition} CSS class, allowing to set position and padding for actions panel relative to record
     */
    itemActionsClass?: string;
}
