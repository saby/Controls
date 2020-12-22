export interface IExpandableOptions {
   expanded?: boolean;
}

/**
 * Интерфейс для контролов с возможностью переключения состояния развернутости.
 * @public
 * @author Сухоручкин А.С.
 */

/*
 * Interface for components with switchable state of extensibility.
 * @public
 * @author Сухоручкин А.С.
 */ 
export default interface IExpandable {
   readonly '[Controls/_toggle/interface/IExpandable]': boolean;
}
/**
 * @name Controls/_interface/IExpandable#expanded
 * @cfg {Boolean} Устанавливает состояние развернутости.
 */

/*
 * @name Controls/_interface/IExpandable#expanded
 * @cfg {Boolean} The state of extensibility.
 */

/**
 * @event Происходит при изменении состояния развернутости.
 * @name Controls/_interface/IExpandable#expandedChanged
 * @param {Vdom/Vdom:SyntheticEvent} eventObject Дескриптор события.
 * @param {Boolean} expandedState Текущее состояние развёрнутости.
 * @example
 * В следующем примере создается Controls.operations:Button и демонстрируется сценарий использования.
 * <pre class="brush: html">
 * <!-- WML -->
 * <Controls.operations:Button
 *     expanded="{{_options.expanded}}"
 *     on:expandedChanged="_onExpandedChanged()">
 * </Controls.operations:Button>
 * </pre>
 * <pre class="brush: js">
 * // JavaScript
 * _beforeMount: function() {
 *     this._onExpandedChanged = this._onExpandedChanged.bind(this);
 * },
 * _onExpandedChanged: function(e, expandedState) {
 *     this._expandedState = expandedState;
 * }
 * </pre>
 */
/*
 * @event Occurs when the deployment state changes.
 * @name Controls/_interface/IExpandable#expandedChanged
 * @param {Vdom/Vdom:SyntheticEvent} eventObject The event descriptor.
 * @param {Boolean} expandedState The current state of deployment.
 * @example
 * The following example creates Controls.operations:Button and shows how to handle the event.
 * WML:
 * <pre>
 *    <Controls.operations:Button
 *       expanded="{{_options.expanded}}"
 *       on:expandedChanged="_onExpandedChanged()">
 *    </Controls.operations:Button>
 * </pre>
 * JS:
 * <pre>
 *    _beforeMount: function() {
 *       this._onExpandedChanged = this._onExpandedChanged.bind(this);
 *    },
 *
 *    _onExpandedChanged: function(e, expandedState) {
 *       this._expandedState = expandedState;
 *    }
 * </pre>
 */
