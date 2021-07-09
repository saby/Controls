import {EventUtils} from 'UI/Events';
import {default as Base, IBaseInputOptions} from 'Controls/_input/Base';
import * as ViewModel from 'Controls/_input/Mask/ViewModel';
import {descriptor} from 'Types/entity';
import {Logger} from 'UI/Utils';
import 'css!Controls/input';
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
 * * {@link /materials/Controls-demo/app/Controls-demo%2FExample%2FInput демо-пример}
 * * {@link /doc/platform/developmentapl/interface-development/controls/input-elements/input/mask/ руководство разработчика}
 * * {@link https://github.com/saby/wasaby-controls/blob/897d41142ed56c25fcf1009263d06508aec93c32/Controls-default-theme/variables/_input.less переменные тем оформления}
 *
 * @class Controls/_input/Mask
 * @extends Controls/_input/Base
 * @ignoreoptions Controls/input:Base#value
 * @ignoreevents Controls/input:Base#valueChanged Controls/input:Base#inputCompleted
 *
 * @mixes Controls/input:IInputMaskValue
 * @mixes Controls/decorator:IMask
 * @public
 * @author Красильников А.С.
 * @demo Controls-demo/Input/Masks/Index
 */

class Mask extends Base {
    protected _viewModel: ViewModel;
    protected _defaultValue: string = '';
    protected _notifyHandler: Function = EventUtils.tmplNotify;

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

Object.defineProperty(Mask, 'defaultProps', {
   enumerable: true,
   configurable: true,

   get(): object {
      return Mask.getDefaultOptions();
   }
});

export default Mask;
