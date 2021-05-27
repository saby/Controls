/**
 * Шаблон, который используется для отображения строки {@link Controls/grid:View} без деления на ячейки в {@link /doc/platform/developmentapl/interface-development/controls/list/actions/edit/template/#item-editor-template режиме редактирования}.
 * @class Controls/_grid/interface/IitemEditorTemplate
 * @author Авраменко А.С.
 * @see Controls/treeGrid:View#
 * @example
 * <pre class="brush: html; highlight: [2-10]">
 * <!-- WML -->
 * <Controls.grid:View source="{{_viewSource}}" columns="{{_columns}}">
 *    <ws:editingConfig editOnClick="{{true}}" />
 *    <ws:itemEditorTemplate>
 *       <ws:partial scope="{{itemEditorTemplate}}" 
 *          template="Controls/grid:ItemEditorTemplate">
 *         <Controls.input:Text contrastBackground="{{true}}"
 *            bind:value="itemEditorTemplate.item.contents.title"/>
 *       </ws:partial>
 *    </ws:itemEditorTemplate>
 * </Controls.grid:View>
 * </pre>
 */
