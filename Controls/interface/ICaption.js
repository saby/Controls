define('Controls/interface/ICaption', [
], function() {

   /**
    * Button caption interface.
    *
    * @interface Controls/interface/ICaption
    * @public
    */

   /**
    * @name Controls/interface/ICaption#caption
    * @cfg {String} Component caption text.
    * @default Undefined
    * @remark You can submit the markup to the caption.
    * @example
    * Control has caption 'Dialog'.
    * <pre>
    *    <ControlsDirectory.Control caption=”Dialog”/>
    * </pre>
    * Control has markup caption.
    * <pre>
    *    <ControlsDirectory.Control caption=”captionTemplate”/>
    * </pre>
    * captionTemplate
    * <pre>
    *    <span class='customDialog'>
    *       Dialog
    *    </span>
    * </pre>
    */

});
