/**
 * Шаблон, который по умолчанию используется для отображения {@link Controls/grid:View таблицы} без элементов.
 * 
 * @class Controls/_gridOld/interface/EmptyTemplate
 * @author Авраменко А.С.
 * @extends Controls/list:EmptyTemplate
 * @see Controls/grid:View#emptyTemplate
 * @see Controls/grid:View
 * @example
 * <pre class="brush: html; highlight: [3-7]">
 * <!-- WML -->
 * <Controls.grid:View source="{{_viewSource}}" columns="{{_columns}}">
 *     <ws:emptyTemplate>
 *         <ws:partial template="Controls/grid:EmptyTemplate">
 *             <ws:contentTemplate>No data available!</ws:contentTemplate>
 *         </ws:partial>
 *     </ws:emptyTemplate>
 * </Controls.grid:View>
 * </pre>
 * @remark
 * Дополнительно о работе с шаблоном читайте {@link /doc/platform/developmentapl/interface-development/controls/list/grid/empty/ здесь}.
 * @public
 */

export default interface IEmptyTemplateOptions {
    contentTemplate?: string;
    topSpacing?: string;
    bottomSpacing?: string;
 }
 