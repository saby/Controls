define('js!SBIS3.SPEC.input.Mask', [
], function() {

   /**
    * Поле ввода строки заранее определенного формата.
    * В поле уже заранее будут введены символы, определяющие формат, и останется ввести только недостающие символы.
    * @class SBIS3.SPEC.input.Mask
    * @extends SBIS3.SPEC.Control
    * @mixes SBIS3.SPEC.input.interface.IInputText
    * @mixes SBIS3.SPEC.input.interface.IValidation
    * @mixes SBIS3.SPEC.input.interface.IInputTag
    * @control
    * @public
    * @category Inputs
    */

   /**
    * @name SBIS3.SPEC.input.Mask#mask
    * @cfg {String} Формат ввода текстового значения.
    * Маска вида: "Lll:xdd", где
    * <ul>
    *    <li>L - заглавная буква (русский/английский алфавит),</li>
    *    <li>l - строчная буква,</li>
    *    <li>d - цифра,</li>
    *    <li>x - буква или цифра,</li>
    *    <li>все остальные символы являются разделителями.</li>
    * </ul>
    * @example
    * <pre>
    *     mask: 'dd ddd dddd/dd'
    * </pre>
    */

});