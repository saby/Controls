import {TemplateFunction} from 'UI/Base';
import {ISearch} from 'Controls/interface';
import {IMenuControlOptions} from 'Controls/menu';
import {CollectionItem} from 'Controls/display';
import {Model, CrudEntityKey} from 'Types/entity';

export interface IFooterItemData {
    item: CollectionItem<Model>,
    key: CrudEntityKey
}

export interface IMenuPopupOptions extends IMenuControlOptions, ISearch {
    headerContentTemplate: TemplateFunction;
    footerContentTemplate: TemplateFunction;
    closeButtonVisibility: boolean;
    footerItemData: IFooterItemData
}

/**
 * Интерфейс контрола меню
 * @interface Controls/_menu/interface/IMenuPopup
 * @public
 * @author Золотова Э.Е.
 */

/*
 * @interface Controls/_menu/interface/IMenuPopup
 * @public
 * @author Золотова Э.Е.
 */
export default interface IMenuPopup {
    readonly '[Controls/_menu/interface/IMenuPopup]': boolean;
}

/**
 * @name Controls/_menu/interface/IMenuPopup#headerContentTemplate
 * @cfg {function} Контент, располагающийся в шапке окна.
 * @demo Controls-demo/Menu/Popup/HeaderContentTemplate/Index
 * @example
 * WML:
 * <pre>
 * <Controls.menu:Popup
 *       keyProperty="key"
 *       displayProperty="title"
 *       source="{{_source}}">
 *    <ws:headerContentTemplate>
 *        <span>{[Выберите город]}</span>
 *    </ws:headerContentTemplate>
 * </Controls.menu:Popup>
 * </pre>
 * JS:
 * <pre>
 * this._source = new Memory({
 *    keyProperty: 'key',
 *    data: [
 *       {key: 1, title: 'Yaroslavl'},
 *       {key: 2, title: 'Moscow'},
 *       {key: 3, title: 'St-Petersburg'}
 *    ]
 * });
 * </pre>
 */

/**
 * @name Controls/_menu/interface/IMenuPopup#footerContentTemplate
 * @cfg {function} Контент, располагающийся в нижней части окна.
 * @demo Controls-demo/Menu/Popup/FooterContentTemplate/Scroll/Index
 * @example
 * WML:
 * <pre>
 * <Controls.menu:Popup
 *       keyProperty="key"
 *       displayProperty="title"
 *       source="{{_source}}">
 *    <ws:headerContentTemplate>
 *        <span>{[Выберите город]}</span>
 *    </ws:headerContentTemplate>
 * </Controls.menu:Popup>
 * </pre>
 * JS:
 * <pre>
 * this._source = new Memory({
 *    keyProperty: 'key',
 *    data: [
 *       {key: 1, title: 'Yaroslavl'},
 *       {key: 2, title: 'Moscow'},
 *       {key: 3, title: 'St-Petersburg'}
 *    ]
 * });
 * </pre>
 */

/**
 * @name Controls/_menu/interface/IMenuPopup#searchParam
 * @cfg {String} Имя поля фильтра, в значение которого будет записываться текст для поиска.
 * Фильтр с этим значением будет отправлен в поисковой запрос в источнику данных.
 * @demo Controls-demo/Menu/Popup/SearchParam/Index
 * @example
 * <pre>
 * <Controls.menu:Popup
 *       keyProperty="key"
 *       displayProperty="title"
 *       searchParam="title"
 *       source="{{_source}}">
 * </Controls.menu:Popup>
 * </pre>
 * JS:
 * <pre>
 * this._source = new Memory({
 *    keyProperty: 'key',
 *    data: [
 *       {key: 1, title: 'Yaroslavl'},
 *       {key: 2, title: 'Moscow'},
 *       {key: 3, title: 'St-Petersburg'}
 *    ]
 * });
 * </pre>
 */

/**
 * @name Controls/_menu/interface/IMenuPopup#emptyTemplate
 * @cfg {Function} Шаблон, который будет отображаться в выпадающем списке, если поисковой запрос не вернул результатов.
 * @demo Controls-demo/Menu/Popup/SearchParam/EmptyTemplate/Index
 */

/**
 * @name Controls/_menu/interface/IMenuPopup#footerItemData
 * @cfg {IFooterItemData} Данные для {@link Controls/_menu/interface/IMenuPopup#footerContentTemplate шаблона нижней части окна}.
 */
