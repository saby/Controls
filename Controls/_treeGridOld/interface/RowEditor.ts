/**
 * Шаблон, который используют для настройки отображения элемента контрола {@link Controls/treeGrid:View Дерево} в {@link /doc/platform/developmentapl/interface-development/controls/list/actions/edit/ режиме редактирования}.
 * 
 * @class Controls/_treeGridOld/interface/RowEditor
 * @author Авраменко А.С.
 * @see Controls/treeGrid:View#itemTemplate
 * @example
 * <pre class="brush: html">
 * <Controls.treeGrid:View>
 *    <ws:itemTemplate>
 *       <ws:partial template="Controls/treeGrid:RowEditor" scope="{{itemTemplate}}">
 *          <div>
 *             Этот шаблон отображается в режиме редактирования.
 *             <Controls.dropdown:Combobox bind:selectedKey="content.item.contents.documentSign"  />
 *          </div>
 *       </ws:partial>
 *    </ws:itemTemplate>
 * </Controls.treeGrid:View>
 * </pre>
 * @public
 * @deprecated Для редактирования строк используйте {@link /docs/js/Controls/grid/IGridControl/options/colspanCallback/ механизм объединения колонок строки (колспана)}.
 */

export default interface IRowEditorOptions {
    /**
     * @cfg {String|TemplateFunction} Пользовательский шаблон, описывающий содержимое элемента в {@link /doc/platform/developmentapl/interface-development/controls/list/actions/edit/ режиме редактирования}.
     * @default undefined
     */
    content?: string;
 }