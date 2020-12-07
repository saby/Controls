import {tmplNotify} from 'Controls/eventUtils';
import {default as Base, IBaseInputOptions} from 'Controls/_input/Base';
import * as ViewModel from 'Controls/_input/Mask/ViewModel';
import {descriptor} from 'Types/entity';
import {Logger} from 'UI/Utils';
import {spaceToLongSpace} from 'Controls/_input/Mask/Space';

// TODO: https://online.sbis.ru/doc/f654ff87-5fa9-4c80-a16e-fee7f1d89d0f

const regExpQuantifiers: RegExp = /\\({.*?}|.)/;

/**
 * Поле ввода значения с заданным форматом.
 *
 * @remark
 * Каждый вводимый символ проходит проверку на соответствие формату {@link mask маски}.
 * Контрол поддерживает возможность показа или скрытия формата маски в незаполненном поле ввода, регулируемую с помощью опции {@link replacer}.
 * Если {@link replacer символ замены} определен, то поле ввода вычисляет свою ширину автоматически по контенту. При этом во всех режимах поддерживается возможность установки ширины поля ввода через CSS.
 *
 * Полезные ссылки:
 * * <a href="/materials/Controls-demo/app/Controls-demo%2FExample%2FInput">демо-пример</a>
 * * <a href="/doc/platform/developmentapl/interface-development/controls/input/mask/">руководство разработчика</a>
 * * <a href="https://github.com/saby/wasaby-controls/blob/rc-20.4000/Controls-default-theme/aliases/_input.less">переменные тем оформления</a>
 *
 * @class Controls/_input/Mask
 * @extends Controls/_input/Base
 * @ignoreOptions Controls/_input/Base#value
 * @ignoreEvents Controls/_input/Base#valueChanged Controls/_input/Base#inputCompleted
 *
 * @mixes Controls/interface/IInputMaskValue
 * @public
 * @author Красильников А.С.
 * @demo Controls-demo/Input/Masks/Index
 */

/*
 * A component for entering text in a {@link mask specific format}.
 * Characters that are not yet entered in the field can be replaced by another {@link replacer character}.
 * If the input character does not fit the format, then character won't be added.
 * <a href="/materials/Controls-demo/app/Controls-demo%2FExample%2FInput">Демо-пример</a>.
 * @remark
 * If the {@link replacer} is not empty and container with width: auto, then the width is determined based on the content.
 *
 * @class Controls/_input/Mask
 * @extends Controls/_input/Base
 *
 * @mixes Controls/interface/IInputMaskValue
 * @public
 * @author Красильников А.С.
 * @demo Controls-demo/Input/Masks/Index
 */
class Mask extends Base {
    protected _viewModel: ViewModel;
    protected _defaultValue: string = '';
    protected _notifyHandler: Function = tmplNotify;
    protected _controlName: string = 'Mask';

    protected _beforeUpdate(newOptions): void {
        const oldValue: string = this._viewModel.value;
        super._beforeUpdate.apply(this, arguments);
        if (newOptions.hasOwnProperty('value') && newOptions.value !== oldValue) {
            this._viewModel.setCarriageDefaultPosition(0);
        }
        this._autoWidth = !!newOptions.replacer;
    }

    protected _getViewModelOptions(options): object {
        return {
            value: options.value,
            mask: options.mask,
            replacer: Mask._calcReplacer(options.replacer, options.mask),
            formatMaskChars: options.formatMaskChars
        };
    }
    protected _getViewModelConstructor(): ViewModel {
        return ViewModel;
    }
    protected _initProperties(options): void {
        super._initProperties.apply(this, arguments);
        this._autoWidth = !!options.replacer;
    }
    protected _focusInHandler(): void {
        // Set the carriage only if the input field has received focus on the tab key.
        // If the focus was set by a mouse click, the selection has not yet been sett.
        // Getting the focus by clicking the mouse is processed in the _clickHandler.
        if (!this._focusByMouseDown) {
            this._viewModel.setCarriageDefaultPosition();
        }
        super._focusInHandler.apply(this, arguments);
    }
    protected _clickHandler(): void {
        if (this._firstClick) {
            this._viewModel.setCarriageDefaultPosition(this._getField().getFieldData('selectionStart'));
            // We need a more convenient way to control the selection.
            // https://online.sbis.ru/opendoc.html?guid=d4bdb7cc-c324-4b4b-bda5-db6f8a46bc60
            // In the base class, the selection in the field is set asynchronously and after a click,
            // the selection is saved to the model asynchronously. Sometimes the preservation
            // of the selection will erase the previously established selection in the model.
            // To prevent this, immediately apply the selection set in the model to the input field.
            this._updateSelection(this._viewModel.selection);
        }
        super._clickHandler();
    }
    static _theme: string[] = Base._theme.concat(['Controls/input']);

    private static _validateReplacer(replacer, mask): boolean {
        if (replacer && regExpQuantifiers.test(mask)) {
            Logger.error('Mask', 'Used not empty replacer and mask with quantifiers. More on https://wi.sbis.ru/docs/js/Controls/_input/Mask/options/replacer/');
            return false;
        }
        return true;
    }
    private static _calcReplacer(replacer, mask): string {
        const value = Mask._validateReplacer(replacer, mask) ? replacer : '';

        /**
         * The width of the usual space is less than the width of letters and numbers.
         * Therefore, the width of the field after entering will increase. Increase the width of the space.
         */
        return spaceToLongSpace(value);
    }

    static getDefaultOptions() {
        const defaultOptions = Base.getDefaultOptions();
        defaultOptions.replacer = '';
        defaultOptions.formatMaskChars = {
            L: '[А-ЯA-ZЁ]',
            l: '[а-яa-zё]',
            d: '[0-9]',
            x: '[А-ЯA-Zа-яa-z0-9ёЁ]'
        };
        defaultOptions.autoWidth = false;
        defaultOptions.spellCheck = false;

        return defaultOptions;
    }

    static getOptionTypes() {
        const optionTypes = Base.getOptionTypes();

        optionTypes.mask = descriptor(String).required();
        return optionTypes;
    }
}

/**
 * @name Controls/_input/Mask#mask
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
 * <pre class="brush:xml">
 * <Controls.input:Mask mask="dd.dd"/>
 * </pre>
 * Маска даты:
 * <pre class="brush:xml">
 * <Controls.input:Mask mask="dd.dd.dddd"/>
 * </pre>
 * Маска, в которой сначала вводятся 1-3 цифры, а после них 1-3 буквы.
 * <pre class="brush:xml">
 * <Controls.input:Mask mask="d\{1,3}l\{1,3}"/>
 * </pre>
 * Маска для ввода бесконечного количества цифр.
 * <pre class="brush:xml">
 * <Controls.input:Mask mask="d\*"/>
 * </pre>
 *
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

/**
 * @name Controls/_input/Mask#replacer
 * @cfg {String} Символ, который будет отображаться, если ничего не введено.
 * @default undefined
 *
 * @remark Если в маске используются логические символы, replacer установить невозможно.
 * Видимость формата маски регулируется значением опции.
 * Если значение не пустое, то формат виден и поле ввода вычисляет свою ширину автоматически по контенту, иначе формат скрыт.
 * Также поддерживается возможность установки ширины поля ввода через CSS.
 * @example
 * <pre class="brush: html">
 * <Controls.input:Mask mask="dd.dd" replacer=" " value="12.34"/>
 * Если вы удалите всё из поля ввода, поле изменится с '12.34' на '  .  '.
 * </pre>
 */

/*
 * @name Controls/_input/Mask#replacer
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

/**
 * @name Controls/_input/Mask#formatMaskChars
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
 * </pre>
 * <pre class="brush: html">
 * <!-- WML -->
 * <Controls.input:Mask mask="+\?d (ddd) ddd-dd-dd" formatMaskChars="{{ _formatMaskChars }}"/>
 * </pre>
 */

/*
 * @name Controls/_input/Mask#formatMaskChars
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
export default Mask;
