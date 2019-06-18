/**
 * Interface for input tags (colored indicators in the right top corner).
 *
 * @interface Controls/interface/IInputTag
 * @public
 * @author Krasilnikov A.S.
 */
interface IInputTag {
    readonly _options: {
        /**
         * @name Controls/interface/IInputTag#tagStyle
         * @cfg {String} Style of the tag (colored indicator shown at the top right corner of the field).
         * @variant secondary
         * @variant success
         * @variant primary
         * @variant danger
         * @variant info
         * @remark
         * Tag is used to show some information about the field (e.g. if the field is required). Frequently, Infobox with the tip is shown when you click or hover on the tag (see tagClick, tagHover).
         * @example
         * In this example, the field will be rendered with "danger" to show that it is required. When you click on tag, the Infobox with message "This field is required" will be shown.
         * <pre>
         *    <Controls.input:Text tagStyle="danger" on:tagClick="tagClickHandler()"/>
         *    <Controls.Opener.Infobox name="infoboxOpener"/>
         * </pre>
         *
         * <pre>
         *    Control.extend({
         *       ...
         *       _tagClickHandler(target) {
         *          this._children.infoboxOpener.open({
         *             target: target,
         *             text: 'This field is required'
         *          });
         *       }
         *       ...
         *    });
         * </pre>
         * @see tagHover
         * @see tagClick
         */
        tagStyle?: 'info' | 'danger' | 'primary' | 'success' | 'secondary';
    }
}

/**
 * @event Occurs when tag was clicked.
 * @name Controls/interface/IInputTag#tagClick
 * @param {Object} event Native event object. Can be used to get target (DOM node of the tag) to show Infobox.
 * @remark The event will never fire unless you specify tagStyle option on the field.
 * @example
 * In this example, when you click on tag, the Infobox with message "This field is required" will be shown.
 * <pre>
 *    <Controls.input:Text tagStyle="danger" on:tagClick="tagClickHandler()"/>
 *    <Controls.Opener.Infobox name="infoboxOpener"/>
 * </pre>
 *
 * <pre>
 *    Control.extend({
 *       ...
 *       _tagClickHandler(event) {
 *          this._children.infoboxOpener.open({
 *             target: event.target,
 *             text: 'This field is required'
 *          });
 *       }
 *       ...
 *    });
 * </pre>
 * @see tagStyle
 * @see tagHover
 */

/**
 * @event Occurs when tag is hovered.
 * @name Controls/interface/IInputTag#tagHover
 * @param {Object} event Native event object. Can be used to get target (DOM node of the tag) to show Infobox.
 * @remark The event will never fire unless you specify tagStyle option on the field.
 * @example
 * In this example, when you hover on tag, the Infobox with message "This field is required" will be shown.
 * <pre>
 *    <Controls.input:Text tagStyle="danger" on:tagHover="_tagHoverHandler()"/>
 *    <Controls.Opener.Infobox name="infoboxOpener"/>
 * </pre>
 *
 * <pre>
 *    Control.extend({
 *       ...
 *       _tagHoverHandler(event) {
 *          this._children.infoboxOpener.open({
 *             target: event.target,
 *             text: 'This field is required'
 *          });
 *       }
 *       ...
 *    });
 * </pre>
 * @see tagStyle
 * @see tagClick
 */

export default IInputTag;
