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
 * @typedef {Object} Item
 * @property {Boolean} [item.readOnly] Определяет, может ли пользователь изменить значение контрола. {@link UI/_base/Control#readOnly Подробнее}
 * @property {String} [item.caption] Текст кнопки элемента. {@link Controls/_interface/ICaption#caption Подробнее}
 * @property {Boolean} [item.contrastBackground] Определяет, имеет ли кнопка элемента фон.{@link Controls/_buttons/Button#contrastBackground Подробнее}
 * @property {String} [item.iconStyle] Определяет цвет иконки элемента.{@link Controls/_interface/IIconStyle#iconStyle Подробнее}
 * @property {String} [item.icon] Определяет иконку элемента. {@link Controls/_interface/IIcon#icon Подробнее}
 * @property {String} [item.title] Определеяет текст элемента.
 * @property {Boolean} [item.showHeader] Определяет, будет ли отображаться шапка у выпадающего списка элемента.
 * @property {String} [item.tooltip] Текст подсказки, при наведении на элемент тулбара. {@link Controls/_interface/ITooltip#tooltip Подробнее}
 * @property {Enum} [item.showType] Определяет, где будет отображаться элемент. Значение берется из утилиты 'Controls/Utils/Toolbar'. {@link Controls/Utils/Toolbar Подробнее}
 * Доступные значения:
 * showType.MENU - Элемент отображается только в меню
 * showType.MENU_TOOLBAR - Элемент отображается в меню и в тулбаре
 * showType.TOOLBAR - Элемент отображается только в тулбаре
 * @property {String} [item.viewMode] Определяет стиль отображения кнопки элемента.{@link Controls/_buttons/Button#viewMode Подробнее }
 */
/*
 * @typedef {Object} Item
 * @property {Boolean} [item.readOnly] Determines item readOnly state.
 * @property {String} [item.buttonCaption] Caption of toolbar element.
 * @property {Boolean} [item.buttonTransparent] Transparent of toolbar element.
 * @property {String} [item.iconStyle] Icon style of toolbar element.
 * @property {String} [item.icon] Icon of toolbar element.
 * @property {String} [item.title] Determines item caption.
 * @property {Boolean} [item.showHeader] Indicates whether folders should be displayed.
 * @property {String} [item.tooltip] Text of the tooltip shown when the item is hovered over.
 * @property {Enum} [item.showType] Determines where item is displayed. The value is taken from the util 'Controls/Utils/Toolbar'. {@link Controls/Utils/Toolbar Details}
 * Values:
 * showType.MENU - item is displayed only in the menu
 * showType.MENU_TOOLBAR - item is displayed in the menu and toolbar
 * showType.TOOLBAR - item is displayed only in the toolbar
 * @property {String} [item.buttonStyle] Button style of toolbar element.
 * @property {String} [item.buttonViewMode] Button style of toolbar element.
 */

/**
 * @typedef {Object} SourceCfg
 * @property {Item} [SourceCfg.item] Формат исходной записи.
 */

/*
 * @typedef {Object} SourceCfg
 * @property {Item} [SourceCfg.item] Format of source record.
 */

/**
 * @name Controls/_toolbars/IToolbarSource#source
 * @cfg {SourceCfg} Объект, который реализует интерфейс {@link Types/source/ICrud ICrud}, необходимый для работы с источником данных.
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
 * <pre>
 *    <Controls.toolbars:View keyProperty="key" source="{{_source}}" />
 * </pre>
 * <pre>
 *    import {showType} from 'Controls/Utils/Toolbar';
 *      .....
 *    this._source = new source.Memory({
 *        keyProperty: 'key',
 *        data: [
 *        {
 *           id: '1',
 *           showType: showType.TOOLBAR,
 *           icon: 'icon-Time',
 *           '@parent': false,
 *           parent: null
 *        },
 *        {
 *           id: '2',
 *           title: 'Moscow',
 *           '@parent': false,
 *           parent: null
 *        },
 *        {
 *           id: '3',
 *           title: 'St-Petersburg',
 *           '@parent': false,
 *           parent: null
 *        }
 *        ]
 *    })
 * </pre>
 */

/**
 * @name Controls/_toolbars/IToolbarSource#keyProperty
 * @cfg {String} Имя свойства, содержащего информацию об идентификаторе текущей строки.
 * @remark Например, идентификатор может быть первичным ключом записи в базе данных.
 */
