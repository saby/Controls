import {TemplateFunction} from 'UI/Base';
import {ISearch} from 'Controls/interface';
import {IMenuControlOptions} from 'Controls/menu';

export interface IMenuPopupOptions extends IMenuControlOptions, ISearch {
    headerContentTemplate: TemplateFunction;
    footerContentTemplate: TemplateFunction;
    closeButtonVisibility: boolean;
    applyButtonAlign?: string;
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

/**
 * @typedef {String} ApplyButtonAlign
 * @variant top Кнопка расположена наверху.
 * @variant bottom Кнопка расположена внизу.
 */
export default interface IMenuPopup {
    readonly '[Controls/_menu/interface/IMenuPopup]': boolean;
}

/**
 * @name Controls/_menu/interface/IMenuPopup#applyButtonAlign
 * @cfg {ApplyButtonAlign} Устанавливает вертикальное выравнивание для кнопки подтверждения выбора.
 */

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
 * @name Controls/_menu/interface/IMenuPopup#closeButtonVisibility
 * @cfg {Boolean} Видимость кнопки закрытия.
 * @remark В значении true кнопка отображается.
 * @demo Controls-demo/Menu/Popup/CloseButtonVisibility/Index
 * @example
 * <pre class="brush: html; highlight: [6]">
 * <!-- WML -->
 * <Controls.menu:Popup
 *       keyProperty="key"
 *       displayProperty="title"
 *       source="{{_source}}"
 *       closeButtonVisibility="{{true}}">
 * </Controls.menu:Popup>
 * </pre>
 * <pre class="brush: js">
 * // JS
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
