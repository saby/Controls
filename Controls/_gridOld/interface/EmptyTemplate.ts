/**
 * Шаблон, который по умолчанию используется для отображения подвала {@link Controls/grid:View таблицы} без деления на колонки.
 * 
 * @class Controls/_gridOld/interface/EmptyTemplate
 * @author Авраменко А.С.
 * @see Controls/grid:View#emptyTemplate
 * @example
 * В следующем примере показано, как изменить параметры шаблона.
 * <pre class="brush: html">
 * <!-- WML -->
 * <Controls.grid:View columns="{{_columns}}" source="{{_viewSource}}">
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
    /**
     * @cfg {String|TemplateFunction} Пользовательский шаблон.
     * @default undefined
     */
     contentTemplate?: string;
 }