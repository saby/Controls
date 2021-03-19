import {ICrudPlus} from 'Types/source';

export interface IToolbarSourceOptions {
    source?: ICrudPlus;
}

/**
 * Интерфейс для доступа к источнику данных, который возвращает данные в формате, необходимом для контрола Toolbar или контролов, реализующих Toolbar (например Controls/operationsPanel).
 *
 * @interface Controls/_toolbars/IToolbarSource
 * @public
 * @author Герасимов А.М.
 */
export default interface IToolbarSource {
    readonly '[Controls/_toolbars/IToolbarSource]': boolean;
}

/**
 * @typedef {String} Controls/_toolbars/IToolbarSource/ShowType
 * @default 1
 * @variant 0 Элемент отображается только в меню. Рекомендуем использовать константу toolbar.showType.MENU.
 * @variant 1 Элемент отображается в меню и в тулбаре.Рекомендуем использовать константу toolbar.showType.MENU_TOOLBAR.
 * @variant 2 Элемент отображается только в тулбаре. Рекомендуем использовать константу toolbar.showType.TOOLBAR.
 */

/*
 * @typedef {String} Controls/_toolbars/IToolbarSource/ShowType
 * @variant showType.MENU item is displayed only in the menu
 * @variant showType.MENU_TOOLBAR item is displayed in the menu and toolbar
 * @variant showType.TOOLBAR item is displayed only in the toolbar
 */

/**
 * @typedef {String} Controls/_toolbars/IToolbarSource/CaptionPosition
 * @variant left Текст расположен перед иконкой.
 * @variant right Текст расположен после иконки.
 */
export interface IToolBarItem {
    readonly?: boolean;
    caption?: string;
    contrastBackground?: boolean;
    iconStyle?: string;
    icon?: string;
    title?: string;
    showHeader?: boolean;
    tooltip?: string;
    showType?: 0 | 1 | 2;
    viewMode?: string;
    captionPosition?: 'left' | 'right';
    buttonStyle?: string;
}
/**
 * @typedef {Object} Controls/_toolbars/IToolbarSource/Item
 * @property {Boolean} [item.readOnly] Определяет, может ли пользователь изменить значение контрола. См. {@link UI/_base/Control#readOnly подробнее}.
 * @property {String} [item.caption] Текст кнопки элемента. См. {@link Controls/interface/ICaption#caption подробнее}.
 * @property {Boolean} [item.contrastBackground] Определяет, имеет ли кнопка элемента фон. См. {@link Controls/buttons:IButton#contrastBackground подробнее}.
 * @property {String} [item.iconStyle] Цвет иконки элемента. См. {@link Controls/interface/IIconStyle#iconStyle подробнее}.
 * @property {String} [item.icon] Иконка элемента. См. {@link Controls/interface/IIcon#icon подробнее}.
 * @property {String} [item.title] Текст элемента.
 * @property {Boolean} [item.showHeader] Определяет, будет ли отображаться шапка у выпадающего списка элемента.
 * @property {String} [item.tooltip] Текст подсказки, при наведении на элемент тулбара. См. {@link Controls/interface/ITooltip#tooltip подробнее}.
 * @property {Controls/_toolbars/IToolbarSource/ShowType.typedef} [item.showType] Определяет, где будет отображаться элемент. Значение берется из утилиты {@link Controls/Utils/Toolbar}.
 * @property {String} [item.viewMode] Стиль отображения кнопки элемента. См. {@link Controls/buttons:Button#viewMode подробнее}.
 * @property {Controls/_toolbars/IToolbarSource/CaptionPosition.typedef} [item.captionPosition] Определяет, с какой стороны расположен текст кнопки относительно иконки.
 * @property {String} [item.buttonStyle] Стиль отображения кнопки. См. {@link Controls/buttons:IButton#buttonStyle подробнее}.
 */
/*
 * @typedef {Object} Controls/_toolbars/IToolbarSource/Item
 * @property {Boolean} [item.readOnly] Determines item readOnly state.
 * @property {String} [item.caption] Caption of toolbar element.
 * @property {String} [item.iconStyle] Icon style of toolbar element.
 * @property {String} [item.icon] Icon of toolbar element.
 * @property {String} [item.title] Determines item caption.
 * @property {Boolean} [item.showHeader] Indicates whether folders should be displayed.
 * @property {String} [item.tooltip] Text of the tooltip shown when the item is hovered over.
 * @property {Controls/_toolbars/IToolbarSource/ShowType.typedef} [item.showType] Determines where item is displayed. The value is taken from the util 'Controls/Utils/Toolbar'. {@link Controls/Utils/Toolbar Details}
 * @property {Controls/_toolbars/IToolbarSource/CaptionPosition.typedef} [item.captionPosition]
 * @property {String} [item.buttonStyle] Button style of toolbar element.
 * @property {String} [item.buttonViewMode] Button style of toolbar element.
 */

/**
 * @typedef {Object} Controls/_toolbars/IToolbarSource/SourceCfg
 * @property {Item} [SourceCfg.item] Формат исходной записи.
 */

/*
 * @typedef {Object} Controls/_toolbars/IToolbarSource/SourceCfg
 * @property {Item} [SourceCfg.item] Format of source record.
 */

/**
 * @name Controls/_toolbars/IToolbarSource#source
 * @cfg {Controls/_toolbars/IToolbarSource/SourceCfg.typedef} Объект, который реализует интерфейс {@link Types/source:ICrud}, необходимый для работы с источником данных.
 * @default undefined
 * @remark
 * Может иметь свойства 'title' и 'showType':
 * * 'title' определяет заголовок элемента.
 * * 'showType' определяет, где будет отображаться элемент. Значение берется из утилиты 'Controls/Utils/Toolbar'. {@link Controls/Utils/Toolbar Подробнее}:
 *     * showType.MENU - Элемент отображается только в меню
 *     * showType.MENU_TOOLBAR - Элемент отображается в меню и в тулбаре
 *     * showType.TOOLBAR - Элемент отображается только в тулбаре
 * Для readOnly элемента, установите значение 'true' в поле readOnly.
 * @example
 * Кнопки будут отображены из источника _source. Первый элемент выравнен по левому краю, другие элементы выравнены по правому краю по умолчанию.
 * <pre class="brush: html; highlight: [2]">
 * <!-- WML -->
 * <Controls.toolbars:View keyProperty="key" source="{{_source}}" />
 * </pre>
 * <pre class="brush: html; highlight: [2]">
 * import {showType} from 'Controls/Utils/Toolbar';
 * this._source = new source.Memory({
 *     keyProperty: 'key',
 *     data: [{
 *         id: '1',
 *         showType: showType.TOOLBAR,
 *         icon: 'icon-Time',
 *         iconStyle: 'secondary',
 *         '@parent': false,
 *         parent: null,
 *         contrastBackground: true
 *     }]
 * })
 * </pre>
 */

/**
 * @name Controls/_toolbars/IToolbarSource#keyProperty
 * @cfg {String} Имя свойства, содержащего информацию об идентификаторе текущей строки.
 * @remark Например, идентификатор может быть первичным ключом записи в базе данных.
 */
