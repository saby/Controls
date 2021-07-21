/**
 * Шаблон отображения шапки меню.
 * @class Controls/dropdown:HeaderTemplate
 * @mixes Controls/interface:ICaption
 * @mixes Controls/interface:IIcon
 * @mixes Controls/dropdown:IIconSize
 * @public
 * @author Герасимов А.М.
 * @example
 * Меню с текстом заголовка — "Add".
 * <pre class="brush: html; highlight: [6-8];">
 * <!-- WML -->
 * <Controls.dropdown:Button
 *    keyProperty="id"
 *    source="{{_source)}}"
 *    tooltip="Add">
 *    <ws:headerTemplate>
 *        <ws:partial template="Controls/dropdown:HeaderTemplate" caption="Add"/>
 *    </ws:headerTemplate>
 *    </Controls.dropdown:Button>
 * </pre>
 * <pre class="brush: js; highlight: [6-8];">
 * // JavaScript
 * _source: null,
 * _beforeMount: function() {
 *    this._source = new source.Memory ({
 *       data: [
 *          { id: 1, title: 'Task in development' },
 *          { id: 2, title: 'Error in development' }
 *       ],
 *       keyProperty: 'id'
 *    });
 * }
 * </pre>
 */
