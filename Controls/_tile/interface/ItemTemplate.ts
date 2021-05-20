/**
 * Шаблон, который по умолчанию используется для отображения элементов в {@link Controls/tile:View плитке}.
 * @class Controls/_tile/interface/ItemTemplate
 * @mixes Controls/list:IBaseItemTemplate
 * @mixes Controls/list:IContentTemplate
 * @author Авраменко А.С.
 * @see Controls/tile:View
 * @example
 * <pre class="brush: html; highlight: [3-12]">
 * <!-- WML -->
 * <Controls.tile:View source="{{_viewSource}}">
 *    <ws:itemTemplate>
 *       <ws:partial template="Controls/tile:ItemTemplate">
 *          <ws:contentTemplate>
 *             <img src="{{contentTemplate.item.contents.Image}}"/>
 *             <div title="{{contentTemplate.item.contents.Name}}">
 *                {{contentTemplate.item.contents.Name}}
 *             </div>
 *          </ws:contentTemplate>
 *       </ws:partial>
 *    </ws:itemTemplate>
 * </Controls.tile:View>
 * </pre>
 * @remark
 * Дополнительно о работе с шаблоном читайте {@link /doc/platform/developmentapl/interface-development/controls/list/tile/item/ здесь}.
 * @public
 * @demo Controls-demo/tileNew/DifferentItemTemplates/CustomTemplate/Index
 */

export default interface IItemTemplateOptions {
   /**
    * @cfg {String} Видимость заголовка плитки.
    * @see titleStyle
    */
   hasTitle?: string;
   /**
    * @cfg {Boolean} Динамическое изменение высоты плитки, когда плитка отображается со статической шириной, т.е. опция {@link Controls/tile:ITile#tileMode tileMode} установлена в значение static.
    */
   staticHeight?: boolean;
   /**
    * @typedef {String} ShadowVisibility
    * @description Допустимые значения для опции {@link shadowVisibility}.
    * @variant visible Отображается.
    * @variant hidden Не отображается.
    * @variant onhover Отображается только при наведении курсора на плитку.
    */
   /**
    * @cfg {ShadowVisibility} Нужно ли отображать тень для плитки.
    * @default visible
    * @demo Controls-demo/Tile/Shadows/Index
    */
   shadowVisibility?: string;
}
