import tmplNotify = require('Controls/Utils/tmplNotify');
import Base = require('Controls/_input/Base');
import ViewModel = require('Controls/_input/Mask/ViewModel');
import entity = require('Types/entity');

import {Logger} from 'UI/Utils';
import {spaceToLongSpace} from 'Controls/_input/Mask/Space';



      /**
       * Поле ввода значения с заданным форматом.
       * @remark
       * Каждый вводимый символ проходит проверку на соответствие формату {@link mask маски}.
       * Контрол поддерживает возможность показа или скрытия формата маски в незаполненном поле ввода, регулируемую с помощью опции {@link replacer}.
       * Если {@link replacer символ замены} определен, то поле ввода вычисляет свою ширину автоматически по контенту. При этом во всех режимах поддерживается возможность установки ширины поля ввода через CSS.
       * <a href="/materials/demo-ws4-input">Демо-пример</a>.
       *
       * @class Controls/_input/Mask
       * @extends Controls/_input/Base
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
       * <a href="/materials/demo-ws4-input">Демо-пример</a>.
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

      /**
       * @name Controls/_input/Mask#mask
       * @cfg {String} Устанавливает маску в поле ввода.
       * Маска состоит из статических и {@link formatMaskChars динамических символов}.
       * Статический символ - символ для форматирования значения, введенного пользователем. Он всегда будет присутствовать в полностью заполненном поле в независимости от того, что ввел пользователь.
       * Динамический символ - символ заменяющийся на введенные пользователем символы. Например: d - Цифровой символ, l - Буквенный символ в нижнем регистре.
       * Каждый символ, вводимый пользователем, проходит проверку на соответствие формату. Символы, успешно прошедшие проверку, будут добавлены в контрол.
       *
       * Маска может использовать следующие символы:
       * <ol>
       *    <li>d — цифра.</li>
       *    <li>L — прописная буква.</li>
       *    <li>l — строчная буква.</li>
       *    <li>x — буква или цифра.</li>
       * </ol>
       * разделители и логические символы +, *, ?, {n[, m]}.
       * Логические символы могут быть записаны перед символом \\.
       * Логические символы могут применяться к ключам.
       * Формат записи данных схож с регулярными выражениями.
       *
       * @example
       * Маска времени:
       * <pre class="brush:xml">
       *    <Controls.input:Mask mask="dd.dd"/>
       * </pre>
       * Маска даты:
       * <pre class="brush:xml">
       *    <Controls.input:Mask mask="dd.dd.dddd"/>
       * </pre>
       * Маска, в которой сначала вводятся 1-3 цифры, а после них 1-3 буквы.
       * <pre class="brush:xml">
       *    <Controls.input:Mask mask="d\{1,3}l\{1,3}"/>
       * </pre>
       * Маска для ввода бесконечного количества цифр.
       * <pre class="brush:xml">
       *    <Controls.input:Mask mask="d\*"/>
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
       * <pre>
       *    <Controls.input:Mask mask="dd.dd" replacer=" " value="12.34"/>
       *    Если вы удалите всё из поля ввода, поле изменится с '12.34' на '  .  '.
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
       *    <Controls.input:Mask mask="+?d (ddd)ddd-dd-dd" formatMaskChars={{_formatMaskChars}}/>
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
       *    <Controls.input:Mask mask="+?d (ddd)ddd-dd-dd" formatMaskChars={{_formatMaskChars}}/>
       * </pre>
       */

      var
         _private = {
            regExpQuantifiers: /\\({.*?}|.)/,

            validateReplacer: function(replacer, mask) {
               var validation;

               if (replacer && _private.regExpQuantifiers.test(mask)) {
                  validation = false;
                  Logger.error('Mask', 'Used not empty replacer and mask with quantifiers. More on https://wi.sbis.ru/docs/js/Controls/_input/Mask/options/replacer/');
               } else {
                  validation = true;
               }

               return validation;
            },
            calcReplacer: function(replacer, mask) {
               const value = _private.validateReplacer(replacer, mask) ? replacer : '';

                /**
                 * The width of the usual space is less than the width of letters and numbers.
                 * Therefore, the width of the field after entering will increase. Increase the width of the space.
                 */
                return spaceToLongSpace(value);
            }
         },
         Mask = Base.extend({
            _viewModel: null,
             _defaultValue: '',
            _notifyHandler: tmplNotify,

            _maskWrapperCss: null,

            _beforeUpdate: function(newOptions) {
               let oldValue = this._viewModel.value;
               Mask.superclass._beforeUpdate.apply(this, arguments);
               if (newOptions.value !== oldValue) {
                  this._viewModel.setCarriageDefaultPosition(0);
               }
               this._autoWidth = !!newOptions.replacer;
            },

            _getViewModelOptions: function(options) {
               return {
                  value: options.value,
                  mask: options.mask,
                  replacer: _private.calcReplacer(options.replacer, options.mask),
                  formatMaskChars: options.formatMaskChars
               };
            },

            _getViewModelConstructor: function() {
               return ViewModel;
            },

            _initProperties: function(options) {
               Mask.superclass._initProperties.apply(this, arguments);
               this._autoWidth = !!options.replacer;
            },

            _focusInHandler: function() {
               // Set the carriage only if the input field has received focus on the tab key.
               // If the focus was set by a mouse click, the selection has not yet been sett.
               // Getting the focus by clicking the mouse is processed in the _clickHandler.
               if (!this._focusByMouseDown) {
                   this._viewModel.setCarriageDefaultPosition();
               }
               Mask.superclass._focusInHandler.apply(this, arguments);
            },

            _clickHandler: function() {
                if (this._firstClick) {
                    this._viewModel.setCarriageDefaultPosition(this._getField().selectionStart);
                    // We need a more convenient way to control the selection.
                    // https://online.sbis.ru/opendoc.html?guid=d4bdb7cc-c324-4b4b-bda5-db6f8a46bc60
                    // In the base class, the selection in the field is set asynchronously and after a click,
                    // the selection is saved to the model asynchronously. Sometimes the preservation
                    // of the selection will erase the previously established selection in the model.
                    // To prevent this, immediately apply the selection set in the model to the input field.
                    this._getField().setSelectionRange(this._viewModel.selection.start, this._viewModel.selection.end);
                }
                Mask.superclass._clickHandler.apply(this, arguments);
            }
         });

      Mask.getDefaultOptions = function() {
         var defaultOptions = Base.getDefaultOptions();
         defaultOptions.replacer = '';
         defaultOptions.formatMaskChars = {
            'L': '[А-ЯA-ZЁ]',
            'l': '[а-яa-zё]',
            'd': '[0-9]',
            'x': '[А-ЯA-Zа-яa-z0-9ёЁ]'
         };
         defaultOptions.autoWidth = false;
         defaultOptions.spellCheck = false;

         return defaultOptions;
      };

      Mask.getOptionTypes = function getOptionTypes() {
         var optionTypes = Base.getOptionTypes();

         optionTypes.mask = entity.descriptor(String).required();
         return optionTypes;
      };

      Mask._private = _private;

      Mask._theme = Base._theme.concat(['Controls/input']);

      export = Mask;

