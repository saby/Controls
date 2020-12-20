export type TSelectedKey = number|string|null;

export interface ISingleSelectableOptions {
   selectedKey?: TSelectedKey;
   keyProperty?: string;
}
/**
 * Интерфейс для выбора элементов в списках с одиночным выбором (единовременно может быть выбран только один элемент).
 * @public
 * @author Авраменко А.С.
 * @see Controls/_interface/IMultiSelectable
 * @see Controls/interface/IPromisedSelectable
 */
/*
 * Interface for item selection in lists where only one item can be selected at a time.
 * @public
 * @author Авраменко А.С.
 * @see Controls/_interface/IMultiSelectable
 * @see Controls/interface/IPromisedSelectable
 */

export default interface ISingleSelectable {
   readonly '[Controls/_interface/ISingleSelectable]': boolean;
}
/**
 * @name Controls/_interface/ISingleSelectable#selectedKey
 * @cfg {Number|String} Ключ выбранного элемента коллекции.
 * @default Undefined
 * @example
 * <pre class="brush: html">
 * <!-- WML -->
 * <Controls.toggle:RadioGroup bind:selectedKey="_selectedKey"/>
 * </pre>
 * <pre class="brush: js">
 * // JavaScript
 * _beforeMount: function() {
 *    this._selectedKey = '1';
 * }
 * </pre>
 * @see selectedKeyChanged
 * @see keyProperty
 */
/*
 * @name Controls/_interface/ISingleSelectable#selectedKey
 * @cfg {Number|String} Selected item key.
 * @default Undefined
 * @example
 * The following example creates RadioGroup and selects first item. Subsequent changes made to selectedKey will be synchronized through binding mechanism.
 * <pre>
 *    <Controls.toggle:RadioGroup bind:selectedKey="_selectedKey"/>
 * </pre>
 * <pre>
 *    _beforeMount: function() {
 *       this._selectedKey = '1';
 *    }
 * </pre>
 * @see selectedKeyChanged
 * @see keyProperty
 */

/**
 * @event Происходит при изменении выбранного значения.
 * @name Controls/_interface/ISingleSelectable#selectedKeyChanged
 * @param {Vdom/Vdom:SyntheticEvent} eventObject Дескриптор события.
 * @param {Number|String} key Ключ выбранного элемента коллекции.
 * @example
 * <pre class="brush: html">
 * <!-- WML -->
 * <Controls.source:SelectedKey on:selectedKeyChanged="onSelectedKeyChanged()" bind:selectedKey="_selectedKey">
 *    <Controls.operations:Panel source="{{ _panelSource }} />
 * </Controls.source:SelectedKey>
 * </pre>
 * <pre class="brush: js">
 * // JavaScript
 * _beforeMount: function() {
 *    this._selectedKey = undefined;
 * },
 * onSelectedKeyChanged: function(e, selectedKey) {
 *    this._panelSource = this._getPanelSource(selectedKey);
 * }
 * </pre>
 * @see selectedKey
 */
/*
 * @event Occurs when selection was changed.
 * @name Controls/_interface/ISingleSelectable#selectedKeyChanged
 * @param {Vdom/Vdom:SyntheticEvent} eventObject Descriptor of the event.
 * @param {Number|String} key Selected item key.
 * @example
 * The following example creates RadioGroup with empty selection. Subsequent changes made to selectedKey will be synchronized through binding mechanism. Source of the operations panel will be updated every time selectedKey change.
 * <pre>
 *    <Controls.source:SelectedKey on:selectedKeyChanged="onSelectedKeyChanged()" bind:selectedKey="_selectedKey">
 *       <Controls.operations:Panel source="{{ _panelSource }} />
 *    </Controls.source:SelectedKey>
 * </pre>
 * <pre>
 *    _beforeMount: function() {
 *       this._selectedKey = undefined;
 *    },
 *    onSelectedKeyChanged: function(e, selectedKey) {
 *       //Note that we simultaneously have event handler and bind for the same option, so we don't have to update state manually.
 *       this._panelSource = this._getPanelSource(selectedKey);
 *    }
 * </pre>
 * @see selectedKey
 */
