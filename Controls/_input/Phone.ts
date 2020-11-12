import Base = require('Controls/_input/Base');
import ViewModel = require('Controls/_input/Phone/ViewModel');

      var _private = {
         isMoveCarriage: function(self) {
            var model = self._viewModel;
            var hasSelection = model.selection.start !== model.selection.end;

            /**
             * If the focus is not obtained with a mouse click, the user did not select anything and
             * you do not need to select a value and the mask is not completely filled,
             * then you need to move the cursor to the end.
             */
            return !self._focusByMouseDown && !hasSelection && !model.isFilled() && !self._options.selectOnClick;
         }
      };
      /**
       * Поле ввода телефона.
       * @remark
       * В зависимости от введенных символов формат номера телефона изменяется.
       * Если вы хотите, чтобы поле телефона не меняло формат, используйте {@link Controls/_input/Mask маску}. Например, поле для ввода мобильного телефона или дома.
       *
       * Полезные ссылки:
       * * <a href="/doc/platform/developmentapl/interface-development/controls/input/phone/">руководство разработчика</a>
       * * <a href="https://github.com/saby/wasaby-controls/blob/rc-20.4000/Controls-default-theme/aliases/_input.less">переменные тем оформления</a>
       * * <a href="http://axure.tensor.ru/standarts/v7/%D0%BF%D0%BE%D0%BB%D0%B5_%D0%B2%D0%B2%D0%BE%D0%B4%D0%B0__%D0%B2%D0%B5%D1%80%D1%81%D0%B8%D1%8F_03_.html">стандарт</a>
       *
       * @class Controls/_input/Phone
       * @extends Controls/_input/Base
       *
       * @public
       * @demo Controls-demo/Input/Phone/Index
       *
       * @author Красильников А.С.
       */

      /*
       * A component for entering a phone number. Depending on the characters you enter, the phone number format changes.
       * This behavior is described in the {@link http://axure.tensor.ru/standarts/v7/%D0%BF%D0%BE%D0%BB%D0%B5_%D0%B2%D0%B2%D0%BE%D0%B4%D0%B0__%D0%B2%D0%B5%D1%80%D1%81%D0%B8%D1%8F_03_.html standard}.
       * @remark
       * If you want the phone field without changing the format, you should use the
       * {@link Controls/_input/Mask mask) control. For example, a field to enter a mobile phone or home.
       *
       * @class Controls/_input/Phone
       * @extends Controls/_input/Base
       *
       * @public
       * @demo Controls-demo/Input/Phone/Index
       *
       * @author Красильников А.С.
       */
      var Phone = Base.extend({
          _defaultValue: '',
          _inputMode: 'tel',
         _getViewModelConstructor: function() {
            return ViewModel;
         },

         _focusInHandler: function() {
            if (_private.isMoveCarriage(this)) {
               this._viewModel.moveCarriageToEnd();
            }
            Phone.superclass._focusInHandler.apply(this, arguments);
         }
      });

      Phone.getDefaultOptions = function() {
         var defaultOptions = Base.getDefaultOptions();

         return defaultOptions;
      };

      export = Phone;
