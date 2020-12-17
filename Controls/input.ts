/**
 * Библиотека контролов, которые служат для ввода значений различного типа. Примеры типов: строка, число, дата, телефон и т.д.
 * @library Controls/input
 * @includes DateTimeModel Controls/_input/DateTime/Model
 * @includes AdapterMask Controls/_input/Adapter/Mask
 * @includes ISelection Controls/_input/interface/ISelection
 * @public
 * @author Крайнов Д.О.
 */

// TODO: Устаревшая модель, вместо неё нужно использовать NewBaseViewModel.
import BaseViewModel = require('Controls/_input/Base/ViewModel');
export {default as TextViewModel, IViewModelOptions as ITextViewModelOptions} from 'Controls/_input/Text/ViewModel';
import MaskInputProcessor = require('Controls/_input/Mask/InputProcessor');
import StringValueConverter = require('Controls/_input/DateTime/StringValueConverter');

// Controls
export {default as Base} from 'Controls/_input/Base';
export {default as Text} from 'Controls/_input/Text';
export {default as Number} from 'Controls/_input/Number';
export {default as Mask} from 'Controls/_input/Mask';
export {default as Phone} from 'Controls/_input/Phone';
export {default as Password} from 'Controls/_input/Password';
export {default as Label} from 'Controls/_input/Label';
export {default as DateBase} from 'Controls/_input/DateTime';
export {default as TimeInterval} from 'Controls/_input/TimeInterval';
export {default as Money} from 'Controls/_input/Money';
export {default as Area} from './_input/Area';
export {default as Date} from 'Controls/_input/Date/Picker';
export {default as Render, IRenderOptions} from 'Controls/_input/Render';
export {default as Field} from './_input/resources/Field';

// Interface
export {IAreaOptions} from './_input/interface/IArea';
import IDateTimeMask from 'Controls/_input/interface/IDateTimeMask';
export {THorizontalPadding, IPadding, IPaddingOptions, getDefaultPaddingOptions, getOptionPaddingTypes} from './_input/interface/IPadding';
export {IText, ITextOptions} from 'Controls/_input/interface/IText';
export {INewLineKey, INewLineKeyOptions} from 'Controls/_input/interface/INewLineKey';
export {IBase, IBaseOptions, TextAlign, AutoComplete} from 'Controls/_input/interface/IBase';
export {ITag, ITagOptions, TagStyle} from 'Controls/_input/interface/ITag';
export {INumberLength, INumberLengthOptions} from 'Controls/_input/interface/INumberLength';
export {IValue, IValueOptions, ICallback, ICallbackData, IFieldData} from 'Controls/_input/interface/IValue';
export {IBorderVisibility, IBorderVisibilityOptions, TBorderVisibility,
    getDefaultBorderVisibilityOptions, getOptionBorderVisibilityTypes} from './_input/interface/IBorderVisibility';

// Helpers
import * as ActualAPI from 'Controls/_input/ActualAPI';
import * as __Util from 'Controls/_input/resources/Util';
import * as MaskFormatterValue from 'Controls/_input/Mask/FormatterValue';
import hoursFormat from 'Controls/_input/InputCallback/hoursFormat';
import lengthConstraint from 'Controls/_input/InputCallback/lengthConstraint';
export {default as MobileFocusController} from 'Controls/_input/resources/MobileFocusController';
export {default as NewBaseViewModel} from './_input/BaseViewModel';
export {default as AdapterMask} from 'Controls/_input/Adapter/Mask';
export {default as isMaskFormatValid} from 'Controls/_input/Mask/isFormatValid';
export * from './_input/ActualAPI';
export * from './_input/resources/Types';

/**
 * ПРИВАТНЫЕ МОДУЛИ.
 * ЭКСПОРТИРУЮТСЯ ДЛЯ UNIT-ТЕСТИРОВАНИЯ.
 * НЕ ИСПОЛЬЗОВАТЬ НА ПРИКЛАДНОЙ СТОРОНЕ!!!
 */
export {FixBugs as __FixBugs} from 'Controls/_input/FixBugs';
export {ValueInField as __ValueInField} from 'Controls/_input/FixBugs/ValueInField';
export {InsertFromDrop as __InsertFromDrop} from 'Controls/_input/FixBugs/InsertFromDrop';
export {MinusProcessing as __MinusProcessing} from 'Controls/_input/FixBugs/MinusProcessing';
export {CarriagePositionWhenFocus as __CarriagePositionWhenFocus} from 'Controls/_input/FixBugs/CarriagePositionWhenFocus';
export {default as __ChangeEventController} from 'Controls/_input/resources/Field/ChangeEventController';
export {__Util};

/**
 * Объект с набором методов для опции {@link Controls/_input/interface/IValue#inputCallback}
 * @class Controls/input/InputCallback
 * @public
 * @author Красильников А.С.
 * @mixes Controls/_input/InputCallback/hoursFormat
 * @mixes Controls/_input/InputCallback/lengthConstraint
 */
const InputCallback = {
    hoursFormat,
    lengthConstraint
};

export {
    IDateTimeMask,
    BaseViewModel,
    MaskInputProcessor,
    MaskFormatterValue,
    StringValueConverter,
    InputCallback,
    ActualAPI
};
