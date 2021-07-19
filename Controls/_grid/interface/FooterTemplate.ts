/**
 * Шаблон, который по умолчанию используется для отображения подвала {@link Controls/grid:View таблицы}.
 * 
 * @class Controls/_grid/interface/FooterTemplate
 * @author Авраменко А.С.
 * @see Controls/grid:View#footerTemplate
 * @see Controls/grid:View
 * @example
 * <pre class="brush: html; highlight: [3-7]">
 * <!-- WML -->
 * <Controls.grid:View source="{{_viewSource}}" columns="{{_columns}}">
 *     <ws:footerTemplate>
 *         <ws:partial template="Controls/grid:FooterTemplate">
 *             <Controls.list:AddButton caption="Add record" on:click="_beginAdd()" class="test_add_record_1"/>
 *         </ws:partial>
 *     </ws:footerTemplate>
 * </Controls.grid:View>
 * </pre>
 * @remark
 * Дополнительно о работе с шаблоном читайте {@link /doc/platform/developmentapl/interface-development/controls/list/grid/footer/ здесь}.
 * @public
 * @demo Controls-demo/gridNew/EditInPlace/EditingCell/Index
 */

export default interface IFooterTemplateOptions {
    /**
     * @name Controls/_grid/interface/FooterTemplate#contentTemplate
     * @cfg {TemplateFunction|String} Шаблон, описывающий контент подвала.
     */
    contentTemplate?: string;
 }
 