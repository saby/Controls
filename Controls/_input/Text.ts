import {BaseText, IBaseTextInputOptions} from 'Controls/_input/BaseText';
import {IBaseFieldTemplate} from 'Controls/_input/interface/IBase';

interface ITextInputOptions extends IBaseTextInputOptions, IBaseFieldTemplate {}

/**
 * Однострочное поле ввода текста.
 * @remark
 * Полезные ссылки:
 * * {@link /materials/Controls-demo/app/Controls-demo%2FExample%2FInput демо-пример}
 * * {@link /doc/platform/developmentapl/interface-development/controls/input/text/ руководство разработчика}
 * * {@link https://github.com/saby/wasaby-controls/blob/897d41142ed56c25fcf1009263d06508aec93c32/Controls-default-theme/variables/_input.less переменные тем оформления}
 *
 * @class Controls/_input/Text
 * @extends Controls/input:Base
 *
 * @mixes Controls/input:IText
 * @mixes Controls/interface:IInputPlaceholder
 *
 * @public
 * @demo Controls-demo/Input/Text/Base/Index
 *
 * @author Красильников А.С.
 */
class Text extends BaseText<ITextInputOptions> {
}

Object.defineProperty(Text, 'defaultProps', {
   enumerable: true,
   configurable: true,

   get(): object {
      return Text.getDefaultOptions();
   }
});

export default Text;
