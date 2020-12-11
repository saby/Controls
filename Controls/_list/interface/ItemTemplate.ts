/**
 * Шаблон, который по умолчанию используется для отображения элементов в {@link Controls/list:View плоском списке}.
 * 
 * @class Controls/_list/interface/ItemTemplate
 * @mixes Controls/_list/interface/IBaseItemTemplateOptions
 * @mixes Controls/_list/interface/IContentTemplateOptions
 * @author Авраменко А.С.
 * @see Controls/interface/IItemTemplate#itemTemplate
 * @see Controls/interface/IItemTemplate#itemTemplateProperty
 * @see Controls/list:View
 * @example
 * В следующем примере показано, как изменить параметры шаблона.
 * <pre class="brush: html">
 * <Controls.list:View>
 *    <ws:itemTemplate>
 *       <ws:partial template="Controls/list:ItemTemplate" marker="{{false}}" scope="{{itemTemplate}}"> 
 *          <ws:contentTemplate>
 *             {{contentTemplate.itemData.item.title}}
 *          </ws:contentTemplate>
 *       </ws:partial>
 *    </ws:itemTemplate>
 * </Controls.list:View>
 * </pre>
 * @remark
 * Дополнительно о работе с шаблоном читайте {@link /doc/platform/developmentapl/interface-development/controls/list/list/item-template/ здесь}.
 * @public
 */
export default interface IItemTemplateOptions {
   /**
    * @name Controls/_list/interface/ItemTemplate#displayProperty
    * @cfg {String} Имя поля элемента, данные которого будут отображены в шаблоне.
    * @remark
    * Опцию не используют, если задан пользовательский шаблон в опции {@link Controls/list:ItemTemplate#contentTemplate contentTemplate}.
    * @default title
    */
   displayProperty?: string;
}