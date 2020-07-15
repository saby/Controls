/**
 * Шаблон, который по умолчанию используется для отображения элементов в {@link Controls/grid:View таблице}.
 *  
 * @class Controls/grid:ItemTemplate
 * @mixes Controls/list:BaseItemTemplate
 * @author Авраменко А.С.
 * @see Controls/interface/IGridItemTemplate#itemTemplate
 * @see Controls/interface/IGridItemTemplate#itemTemplateProperty
 * @see Controls/grid:View
 * @example
 * В следующем примере показано, как изменить параметры шаблона.
 * <pre class="brush: html">
 * <Controls.grid:View>
 *    <ws:itemTemplate>
 *       <ws:partial template="Controls/grid:ItemTemplate" marker="{{false}}" scope="{{ itemTemplate }}" />
 *    </ws:itemTemplate>
 * </Controls.grid:View>
 * </pre>
 * @remark
 * Дополнительно о работе с шаблоном читайте {@link https://wi.sbis.ru/doc/platform/developmentapl/interface-development/controls/list/grid/templates/item/ здесь}.
 * @public
 */