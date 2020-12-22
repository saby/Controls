export interface IFormatMaskChars {
    [maskChar: string]: string;
}

export interface IMaskOptions {
    /**
     * @name Controls/_decorator/resources/IMask#mask
     * @cfg {String} Устанавливает маску в поле ввода.
     * @remark
     * Маска состоит из статических и {@link formatMaskChars динамических символов}.
     * Статический символ - символ для форматирования значения, введенного пользователем. Он всегда будет присутствовать в полностью заполненном поле в независимости от того, что ввел пользователь.
     * Динамический символ - символ заменяющийся на введенные пользователем символы. Например: d - Цифровой символ, l - Буквенный символ в нижнем регистре.
     * Каждый символ, вводимый пользователем, проходит проверку на соответствие формату. Символы, успешно прошедшие проверку, будут добавлены в контрол.
     *
     * Маска может использовать следующие символы:
     *
     * * d — цифра.
     * * L — прописная буква.
     * * l — строчная буква.
     * * x — буква или цифра.
     *
     * разделители и логические символы +, *, ?, {n[, m]}.
     * Логические символы могут быть записаны перед символом \\.
     * Логические символы могут применяться к ключам.
     * Формат записи данных схож с регулярными выражениями.
     *
     * @example
     * Маска времени:
     * <pre class="brush: html">
     * <Controls.input:Mask mask="dd.dd"/>
     * </pre>
     * Маска даты:
     * <pre class="brush: html">
     * <Controls.input:Mask mask="dd.dd.dddd"/>
     * </pre>
     * Маска, в которой сначала вводятся 1-3 цифры, а после них 1-3 буквы.
     * <pre class="brush: html">
     * <Controls.input:Mask mask="d\{1,3}l\{1,3}"/>
     * </pre>
     * Маска для ввода бесконечного количества цифр.
     * <pre class="brush: html">
     * <Controls.input:Mask mask="d\*"/>
     * </pre>
     * @see formatMaskChars
     */

    /*
    * @name Controls/_input/Mask#mask
    * @cfg {String} Input mask.
    *
    * Mask can use the following keys:
    * <ol>
    *    <li>d — digit.</li>
    *    <li>L — uppercase letter.</li>
    *    <li>l — lowercase letter.</li>
    *    <li>x — letter or digit.</li>
    * </ol>
    * delimeters and quantifiers +, *, ?, {n[, m]}.
    * Quantifiers should be preceded with \\.
    * Quantifiers should be applied to keys.
    * Format is similar to regular expressions.
    *
    * @example
    * The input mask time:
    * <pre class="brush:xml">
    *    <Controls.input:Mask mask="dd.dd"/>
    * </pre>
    * The input mask date:
    * <pre class="brush:xml">
    *    <Controls.input:Mask mask="dd.dd.dddd"/>
    * </pre>
    * The input mask from 1-3 digits followed by 1-3 letters.
    * <pre class="brush:xml">
    *    <Controls.input:Mask mask="d\{1,3}l\{1,3}"/>
    * </pre>
    * The input mask infinity number of digits:
    * <pre class="brush:xml">
    *    <Controls.input:Mask mask="d\*"/>
    * </pre>
    *
    * @see formatMaskChars
    */
    mask: string;
    /**
     * @name Controls/_decorator/resources/IMask#replacer
     * @cfg {String} Символ, который будет отображаться, если ничего не введено.
     * @default undefined
     * @remark
     * Если в маске используются логические символы, replacer установить невозможно.
     * Видимость формата маски регулируется значением опции.
     * Если значение не пустое, то формат виден и поле ввода вычисляет свою ширину автоматически по контенту, иначе формат скрыт.
     * Также поддерживается возможность установки ширины поля ввода через CSS.
     * @example
     * Если вы удалите всё из поля ввода, поле изменится с '12.34' на '  .  '.
     * <pre class="brush: html">
     * <Controls.input:Mask mask="dd.dd" replacer=" " value="12.34"/>
     * </pre>
     */

    /*
    * @name Controls/_decorator/resources/IMask#replacer
    * @cfg {String} Symbol that will be shown when character is not entered.
    *
    * @remark If quantifiers are used in the mask, the replacer cannot be set.
    * Correct operation is not supported.
    *
    * @example
    * <pre>
    *    <Controls.input:Mask mask="dd.dd" replacer=" " value="12.34"/>
    *    If you erase everything from input, the field will change from '12.34' to '  .  '.
    * </pre>
    */
    replacer: string;
    /**
     * @name Controls/_decorator/resources/IMask#formatMaskChars
     * @cfg {Object} Объект, где ключи — символы маски, а значения — регулярные выражения, которые будут использоваться для фильтрации вводимых символов для соответствующих ключей.
     *
     * @example
     * <pre class="brush: js">
     * // JavaScript
     * _beforeMount: function() {
     *    var formatMaskChars = {
     *       '+': '[+]',
     *       d': '[0-9]'
     *    }
     *
     *    this._formatMaskChars = formatMaskChars;
     * }
     * </pre>
     * <pre class="brush: html">
     * <!-- WML -->
     * <Controls.input:Mask mask="+\?d (ddd) ddd-dd-dd" formatMaskChars="{{ _formatMaskChars }}"/>
     * </pre>
     */

    /*
    * @name Controls/_decorator/resources/IMask#formatMaskChars
    * @cfg {Object} Object, where keys are mask characters, and values are regular expressions that will be used to filter input characters for corresponding keys.
    *
    * @example
    * js:
    * <pre>
    *    _beforeMount: function() {
    *       var formatMaskChars = {
    *          '+': '[+]',
    *          'd': '[0-9]'
    *       }
    *
    *       this._formatMaskChars = formatMaskChars;
    * </pre>
    * wml:
    * <pre>
    *    <Controls.input:Mask mask="+\?d (ddd) ddd-dd-dd" formatMaskChars="{{ _formatMaskChars }}"/>
    * </pre>
    */
    formatMaskChars: IFormatMaskChars;
}

export function getDefaultMaskOptions(): Partial<IMaskOptions> {
    return {
        replacer: '',
        formatMaskChars: {
            L: '[А-ЯA-ZЁ]',
            l: '[а-яa-zё]',
            d: '[0-9]',
            x: '[А-ЯA-Zа-яa-z0-9ёЁ]'
        }
    };
}
/**
 * Интерфейс для контролов, которые обеспечивают работу со значением с разделителями.
 * @interface Controls/_decorator/resources/IMask
 * @public
 * @author Красильников А.С.
 */
export default interface IMask {
    readonly '[Controls/_input/interface/IMask]': boolean;
}
