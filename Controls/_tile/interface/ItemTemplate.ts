/**
 * Шаблон, который по умолчанию используется для отображения элементов в {@link Controls/tile:View плитке}.
 * @class Controls/_tile/interface/ItemTemplate
 * @mixes Controls/list:IBaseItemTemplate
 * @mixes Controls/list:IContentTemplate
 * @author Авраменко А.С.
 * @see Controls/tile:View
 * @example
 * <pre class="brush: html">
 * <!-- WML -->
 * <Controls.tile:View>
 *    <ws:itemTemplate>
 *       <ws:partial template="Controls/tile:ItemTemplate">
 *          <ws:contentTemplate>
 *             <img src="{{contentTemplate.itemData.item.Image}}"/>
 *             <div title="{{contentTemplate.itemData.item.Name}}">
 *                {{contentTemplate.itemData.item.Name}}
 *             </div>
 *          </ws:contentTemplate>
 *       </ws:partial>
 *    </ws:itemTemplate>
 * </Controls.tile:View>
 * </pre>
 * @remark
 * Дополнительно о работе с шаблоном читайте {@link /doc/platform/developmentapl/interface-development/controls/list/tile/item/ здесь}.
 * @public
 * @demo Controls-demo/Tile/DifferentItemTemplates/CustomTemplate/Index
 */

export default interface IItemTemplateOptions {
   /**
    * @cfg {Boolean} Подпись к плитке.
    * @see titleStyle
    */
   hasTitle?: string;
   /**
    * @cfg {Number} Ширина плитки. Значение задаётся в px.
    * @remark Ширина папки настраивается в опции {@link folderWidth}.
    * @see staticHeight
    * @see folderWidth
    */
   itemWidth?: number;
   /**
    * @cfg {Number} Будет ли автоматически изменяться высота плитки, когда плитка отображается со статической шириной, т.е. опция {@link tileMode} установлена в значение static.
    */
   staticHeight?: boolean;
   /**
    * @cfg {Number} Ширина папки. Значение задаётся в px.
    * @see itemWidth
    * @see staticHeight
    */
   folderWidth?: number;
   /**
    * @typedef {String} ShadowVisibility
    * @variant visible Отображается.
    * @variant hidden Не отображается.
    * @variant onhover Отображается только при наведении на плитку.
    */
   /**
    * @cfg {ShadowVisibility} Нужно ли отображать тень для плитки.
    * @default visible
    */
   shadowVisibility?: string;
}
