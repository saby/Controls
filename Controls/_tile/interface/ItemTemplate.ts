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

export default interface IItemTemplateOptions {
   /**
    * @name Controls/tile:ItemTemplate#hasTitle
    * @cfg {Boolean} Подпись к плитке.
    * @see titleStyle
    */
   hasTitle?: string; 
   /**
    * @typedef {String} TitleStyle
    * @variant onhover Заголовок отображается только при наведении мыши на плитку.
    * @variant partial Видна первая строка заголовка. При наведении мыши на плитку, виден весь заголовок (не более 3 строк).
    * @variant accent Заголовок виден всегда, выделен жирным шрифтом и цветом, при наведении на плитку появляется подчеркивание.
    */
   /**
    * @name Controls/tile:ItemTemplate#titleStyle
    * @cfg {TitleStyle} Стиль отображения заголовка плитки.
    * @default onhover
    * @see hasTitle
    */
   titleStyle?: string;
   /**
    * @name Controls/tile:ItemTemplate#itemWidth
    * @cfg {Number} Ширина плитки. Значение задаётся в px.
    * @remark Ширина папки настраивается в опции {@link folderWidth}.
    * @see staticHeight
    * @see folderWidth
    */
   itemWidth?: number;
   /**
    * @name Controls/tile:ItemTemplate#staticHeight
    * @cfg {Number} Высота плитки или папки. Значение задаётся в px.
    * @see itemWidth
    * @see folderWidth
    */
   staticHeight?: number;
   /**
    * @name Controls/tile:ItemTemplate#folderWidth
    * @cfg {Number} Ширина папки. Значение задаётся в px.
    * @see itemWidth
    * @see staticHeight
    */
   folderWidth?: number;
   /**
    * @name Controls/tile:ItemTemplate#shadowVisibility
    * @cfg {Boolean} Нужно ли отображать тень для плитки.
    */
   shadowVisibility?: boolean;
}