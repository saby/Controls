/**
 * Библиотека контролов, которые служат для ввода значений различного типа. Примеры типов: строка, число, дата, телефон и т.д.
 * @library Controls/input
 * @public
 * @author Крайнов Д.О.
 */

/*
 * List library
 * @library Controls/input
 * @public
 * @author Крайнов Д.О.
 */

import Base = require('Controls/_input/Base');
import Number = require('Controls/_input/Number');
import Text = require('Controls/_input/Text');
import {default as Label} from 'Controls/_input/Label';
import Mask = require('Controls/_input/Mask');
import Phone = require('Controls/_input/Phone');
import Password = require('Controls/_input/Password');
import DateBase = require('Controls/_input/DateTime');
import Date = require('Controls/_input/Date/Picker');
export {default as Render, IRenderOptions} from 'Controls/_input/Render';
import TimeInterval from 'Controls/_input/TimeInterval';
import Money from 'Controls/_input/Money';
import IDateTimeMask from 'Controls/_input/interface/IDateTimeMask';
import * as ActualAPI from 'Controls/_input/ActualAPI';
import * as __Util from 'Controls/_input/resources/Util';

// TODO: Устаревшая модель, вместо неё нужно использовать NewBaseViewModel.
import BaseViewModel = require('Controls/_input/Base/ViewModel');
export {default as TextViewModel, IViewModelOptions as ITextViewModelOptions} from 'Controls/_input/Text/ViewModel';
import MaskInputProcessor = require('Controls/_input/Mask/InputProcessor');
import StringValueConverter = require('Controls/_input/DateTime/StringValueConverter');

import hoursFormat from  'Controls/_input/InputCallback/hoursFormat';
import lengthConstraint from 'Controls/_input/InputCallback/lengthConstraint';

import * as MaskFormatterValue from 'Controls/_input/Mask/FormatterValue';
import {THorizontalPadding} from "./_input/interface/IPadding";
export {IText, ITextOptions} from 'Controls/_input/interface/IText';
export {INewLineKey, INewLineKeyOptions} from 'Controls/_input/interface/INewLineKey';
export {IBase, IBaseOptions, TextAlign, AutoComplete} from 'Controls/_input/interface/IBase';
export {ITag, ITagOptions, TagStyle} from 'Controls/_input/interface/ITag';
export {INumberLength, INumberLengthOptions} from 'Controls/_input/interface/INumberLength';
export {IValue, IValueOptions, ICallback, ICallbackData, IFieldData} from 'Controls/_input/interface/IValue';
export {default as MobileFocusController} from 'Controls/_input/resources/MobileFocusController';
export {default as AdapterMask} from 'Controls/_input/Adapter/Mask';
export {default as isMaskFormatValid} from 'Controls/_input/Mask/isFormatValid';
export {IBorderVisibility, IBorderVisibilityOptions, TBorderVisibility, getDefaultBorderVisibilityOptions, getOptionBorderVisibilityTypes} from './_input/interface/IBorderVisibility';
export {IPadding, IPaddingOptions, THorizontalPadding, getDefaultPaddingOptions, getOptionPaddingTypes} from './_input/interface/IPadding';
export * from './_input/ActualAPI';
export * from './_input/resources/Types';
export {default as Field} from './_input/resources/Field';
export {default as NewBaseViewModel} from './_input/BaseViewModel';

export {default as Area} from './_input/Area';
export {IAreaOptions} from './_input/interface/IArea';
export {default as DateTimeModel} from './_input/DateTime/Model';
export {default as ISelection} from './_input/interface/ISelection';

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
    Base,
    Number,
    Text,
    Label,
    Mask,
    Phone,
    Password,
    DateBase,
    Date,
    TimeInterval,
    Money,
    BaseViewModel,
    MaskInputProcessor,
    MaskFormatterValue,
    StringValueConverter,
    InputCallback,
    ActualAPI,
    IDateTimeMask
};
