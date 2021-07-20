/**
 * Интерфейс редакторов propertyGrid.
 * @author Герасимов А.М.
 * @public
 */

/*
 * Interface of editor of PropertyGrid.
 * @interface Controls/_propertyGrid/IEditor
 * @author Герасимов А.М.
 */

export default interface IEditor {
    /**
     * @event Происходит после изменения значения свойства.
     * @name Controls/_propertyGrid/IEditor#propertyValueChanged
     * @param {UICommon/Events:SyntheticEvent} event Дескриптор события.
     * @param {*} value Новое значение свойства.
     */

    /*
     * @event After property value changed.
     * @name Controls/_propertyGrid/IEditor#propertyValueChanged
     * @param {Event} event Event description.
     * @param {*} value New value of property.
     */
}

/**
 * @name Controls/_propertyGrid/IEditor#propertyValue
 * @cfg {*} Текущее значение свойства.
 * @example
 * <pre class="brush: html">
 * <!-- WML -->
 * <Controls.dropdown:Selector on:selectedKeysChanged="_selectedKeysChanged()" selectedKeys="{{_options.propertyValue}}"/>
 * </pre>
 * 
 * <pre class="brush: js">
 * // TypeScript
 * import { Control, TemplateFunction } from 'UI/Base';
 * import template = require('wml!MyEditor');
 *
 * class MyEditor extends Control implements IEditor {
 *    protected _template: Function = TemplateFunction;
 *
 *    _selectedKeysChanged(event: Event, selectedKeys: Array<number>): void {
 *       this._notify('propertyValueChanged', [selectedKeys], {bubbling: true});
 *    }
 * }
 * 
 * export default MyEditor; 
 * </pre>
 */
