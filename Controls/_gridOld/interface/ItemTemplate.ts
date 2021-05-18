/**
 * Шаблон, который по умолчанию используется для отображения элементов в {@link Controls/grid:View таблице}.
 *  
 * @class Controls/_gridOld/interface/ItemTemplate
 * @mixes Controls/list:IBaseItemTemplate
 * @author Авраменко А.С.
 * @see Controls/interface/IGridItemTemplate#itemTemplate
 * @see Controls/interface/IGridItemTemplate#itemTemplateProperty
 * @see Controls/grid:View
 * @example
 * В следующем примере показано, как изменить параметры шаблона.
 * <pre class="brush: html; highlight: [3-5]">
 * <!-- WML -->
 * <Controls.grid:View source="{{_viewSource}}" columns="{{_columns}}">
 *    <ws:itemTemplate>
 *       <ws:partial template="Controls/grid:ItemTemplate" marker="{{false}}" scope="{{ itemTemplate }}" />
 *    </ws:itemTemplate>
 * </Controls.grid:View>
 * </pre>
 * @remark
 * Дополнительно о работе с шаблоном читайте {@link /doc/platform/developmentapl/interface-development/controls/list/grid/item/ здесь}.
 * @public
 */