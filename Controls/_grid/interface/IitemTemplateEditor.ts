/**
 * Шаблон, который используется для отображения строки {@link Controls/grid:View} без деления на ячейки в {@link /doc/platform/developmentapl/interface-development/controls/list/actions/edit//template/#item-editor-template режиме редактирования}.
 * @class Controls/_grid/interface/IitemTemplateEditor
 * @author Авраменко А.С.
 * @see Controls/treeGrid:View#
 * @example
 * <!-- WML -->
 * <Controls.grid:View>
 *    <ws:itemEditorTemplate>
 *       <ws:partial 
 *         scope="{{itemEditorTemplate}}" 
 *         template="Controls/grid:ItemEditorTemplate">
 *         <div>
 *            Этот шаблон отображается в режиме редактирования.
 *         </div>
 *       </ws:partial>
 *    </ws:itemEditorTemplate>
 * </Controls.grid:View>
 */