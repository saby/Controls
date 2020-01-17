/**
 * Шаблон, который по умолчанию используется для отображения элементов в {@link Controls/tile:View плитке}.
 * @class Controls/tile:ItemTemplate
 * @mixes Controls/list:BaseItemTemplate
 * @author Авраменко А.С.
 * @see Controls/tile:View
 * @example
 * <pre class="brush: html">
 * <Controls.tile:View>
 *    <ws:itemTemplate>
 *       <ws:partial template="Controls/tile:ItemTemplate">
 *          <ws:contentTemplate>
 *             <img src="{{contentTemplate.itemData.item.Image}}">
 *             <div title="{{contentTemplate.itemData.item.Name}}">
 *                {{contentTemplate.itemData.item.Name}}
 *             </div>
 *          </ws:contentTemplate>
 *       </ws:partial>
 *    </ws:itemTemplate>
 * </Controls.tile:View>
 * </pre>
 * @remark
 * Дополнительно о работе с шаблоном читайте {@link https://wi.sbis.ru/doc/platform/developmentapl/interface-development/controls/list/tile/templates/item/ здесь}.
 * @public
 */


/**
 * @typedef {String} TtitleStyle
 * @variant onhover Заголовок отображается только при наведении мыши на плитку.
 * @variant partial Видна первая строка заголовка. При наведении мыши на плитку, виден весь заголовок (не более 3 строк).
 * @variant accent Заголовок виден всегда, выделен жирным шрифтом и цветом, при наведении на плитку появляется подчеркивание.
 */

/**
 * @name Controls/tile:ItemTemplate#titleStyle
 * @cfg {TtitleStyle} Устанавливает стиль отображения заголовка плитки.
 * @default onhover
 */
