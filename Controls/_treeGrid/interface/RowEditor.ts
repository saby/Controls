/**
 * Шаблон, который используют для настройки отображения элемента контрола {@link Controls/grid:View Таблица} в {@link https://wi.sbis.ru/doc/platform/developmentapl/interface-development/controls/list/grid/edit/ режиме редактирования}.
 * @class Controls/treeGrid:RowEditor
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
     * @name Controls/treeGrid:RowEditor#content
     * @cfg {String|Function} Устанавливает пользовательский шаблон, описывающий содержимое элемента в {@link https://wi.sbis.ru/doc/platform/developmentapl/interface-development/controls/list/grid/edit/ режиме редактирования}.
     * @default undefined
     */
    content?: string;
 }