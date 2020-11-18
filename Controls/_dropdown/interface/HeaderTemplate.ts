/**
 * Шаблон отображения для шапки меню.
 * @class Controls/_dropdown/interface/HeaderTemplate
 * @mixes Controls/_interface/ICaption
 * @mixes Controls/_interface/IIcon
 * @mixes Controls/_dropdown/interface/IIconSize
 * @public
 * @author Герасимов А.М.
 * @example
 * Меню с текстом заголовка — "Add".
 * <pre class="brush: html">
 * <Controls.dropdown:Button
 *    keyProperty="id"
 *    source="{{_source)}}"
 *    tooltip="Add">
 *    <ws:headerTemplate>
 *        <ws:partial template="Controls/dropdown:HeaderTemplate" caption="Add"/>
 *    </ws:headerTemplate>
 *    </Controls.dropdown:Button>
 * </pre>
 * <pre class="brush: js">
 *    _source: null,
 *    _beforeMount: function() {
 *        this._source = new source.Memory ({
 *           data: [
 *              { id: 1, title: 'Task in development' },
 *              { id: 2, title: 'Error in development' }
 *           ],
 *           keyProperty: 'id'
 *        });
 *   }
 * </pre>
 */
