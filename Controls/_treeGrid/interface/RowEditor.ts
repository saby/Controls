/**
 * Шаблон, который используют для настройки отображения элемента контрола {@link Controls/treeGrid:View Дерево} в {@link /doc/platform/developmentapl/interface-development/controls/list/actions/edit/ режиме редактирования}.
 * 
 * @class Controls/_treeGrid/interface/RowEditor
 * @author Авраменко А.С.
 * @see Controls/treeGrid:View#itemTemplate
 * @example
 * <pre class="brush: html">
 * <Controls.treeGrid:View>
 *    <ws:itemTemplate>
 *       <ws:partial template="Controls/treeGrid:RowEditor" scope="{{itemTemplate}}">
 *          <div>
 *             Этот шаблон отображается в режиме редактирования.
 *             <Controls.dropdown:Combobox bind:selectedKey="content.itemData.item.documentSign"  />
 *          </div>
 *       </ws:partial>
 *    </ws:itemTemplate>
 * </Controls.treeGrid:View>
 * </pre>
 * @public
 */

export default interface IRowEditorOptions {
    /**
     * @cfg {String|Function} Пользовательский шаблон, описывающий содержимое элемента в {@link /doc/platform/developmentapl/interface-development/controls/list/actions/edit/ режиме редактирования}.
     * @default undefined
     */
    content?: string;
 }