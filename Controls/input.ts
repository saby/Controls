/**
 * Библиотека контролов, которые служат для ввода значений различного типа. Примеры типов: строка, число, дата, телефон и т.д.
 * @library Controls/input
 * @includes Base Controls/_input/Base
 * @includes Area Controls/_input/Area
 * @includes Number Controls/_input/Number
 * @includes Text Controls/_input/Text
 * @includes Label Controls/_input/Label
 * @includes Mask Controls/_input/Mask
 * @includes Phone Controls/_input/Phone
 * @includes Password Controls/_input/Password
 * @includes DateBase Controls/_input/DateTime
 * @includes Date Controls/_input/Date/Picker
 * @includes DateTimeModel Controls/_input/DateTime/Model
 * @includes TimeInterval Controls/_input/TimeInterval
 * @includes Money Controls/_input/Money
 * @includes AdapterMask Controls/_input/Adapter/Mask
 * @includes INewLineKey Controls/_input/interface/INewLineKey
 * @includes IText Controls/_input/interface/IText
 * @includes INumberLength Controls/_input/interface/INumberLength
 * @includes IBase Controls/_input/interface/IBase
 * @includes ITag Controls/_input/interface/ITag
 * @includes IValue Controls/_input/interface/IValue
 * @includes IDateTimeMask Controls/_input/interface/IDateTimeMask
 * @includes InputCallback Controls/input/InputCallback
 * @includes IFieldData Controls/_input/interface/IFieldData
 * @includes ICallbackData Controls/_input/interface/ICallbackData
 *
 * @public
 * @author Крайнов Д.О.
 */

/*
 * List library
 * @library Controls/input
 * @includes Base Controls/_input/Base
 * @includes Area Controls/_input/Area
 * @includes Number Controls/_input/Number
 * @includes Text Controls/_input/Text
 * @includes Label Controls/_input/Label
 * @includes Mask Controls/_input/Mask
 * @includes Phone Controls/_input/Phone
 * @includes Password Controls/_input/Password
 * @includes DateBase Controls/_input/DateTime
 * @includes Date Controls/_input/Date/Picker
 * @includes DateTimeModel Controls/_input/DateTime/Model
 * @includes TimeInterval Controls/_input/TimeInterval
 * @includes Money Controls/_input/Money
 * @includes INewLineKey Controls/_input/interface/INewLineKey
 * @includes IText Controls/_input/interface/IText
 * @includes IBase Controls/_input/interface/IBase
 * @includes ITag Controls/_input/interface/ITag
 * @includes IValue Controls/_input/interface/IValue
 * @includes IDateTimeMask Controls/_input/interface/IDateTimeMask
 * @includes IFieldData Controls/_input/interface/IFieldData
 * @includes ICallbackData Controls/_input/interface/ICallbackData
 *
 * @public
 * @author Крайнов Д.О.
 */

import Base = require('Controls/_input/Base');
import Area = require('Controls/_input/Area');
import Number = require('Controls/_input/Number');
import Text = require('Controls/_input/Text');
import {default as Label} from 'Controls/_input/Label';
import Mask = require('Controls/_input/Mask');
import Phone = require('Controls/_input/Phone');
import Password = require('Controls/_input/Password');
import DateBase = require('Controls/_input/DateTime');
import Date = require('Controls/_input/Date/Picker');
import {default as Render} from 'Controls/_input/Render';
import TimeInterval from 'Controls/_input/TimeInterval';
import Money from 'Controls/_input/Money';
import IDateTimeMask from 'Controls/_input/interface/IDateTimeMask'
import * as ActualAPI from 'Controls/_input/ActualAPI';

import BaseViewModel = require('Controls/_input/Base/ViewModel');
import TextViewModel = require('Controls/_input/Text/ViewModel');
import MaskFormatBuilder = require('Controls/_input/Mask/FormatBuilder');
import MaskInputProcessor = require('Controls/_input/Mask/InputProcessor');
import MaskFormatter = require('Controls/_input/Mask/Formatter');
import PhoneMaskBuilder = require('Controls/_input/Phone/MaskBuilder');
import StringValueConverter = require('Controls/_input/DateTime/StringValueConverter');

import hoursFormat from  'Controls/_input/InputCallback/hoursFormat';
import lengthConstraint from 'Controls/_input/InputCallback/lengthConstraint';

import INewLineKey from 'Controls/_input/interface/INewLineKey';
import * as MaskFormatterValue from 'Controls/_input/Mask/FormatterValue';
export {default as IText, ITextOptions} from 'Controls/_input/interface/IText';
export {default as IMask, IMaskOptions, IFormatMaskChars, getDefaultMaskOptions} from 'Controls/_input/interface/IMask';
export {default as IBase, IBaseOptions, TextAlign, AutoComplete} from 'Controls/_input/interface/IBase';
export {default as ITag, ITagOptions, TagStyle} from 'Controls/_input/interface/ITag';
export {default as INumberLength, INumberLengthOptions} from 'Controls/_input/interface/INumberLength';
export {default as IValue, IValueOptions, ICallback, ICallbackData, IFieldData} from 'Controls/_input/interface/IValue';
export {default as MobileFocusController} from 'Controls/_input/Base/MobileFocusController';
export {default as AdapterMask} from 'Controls/_input/Adapter/Mask';

/**
 * ПРИВАТНЫЕ МОДУЛИ.
 * ЭКСПОРТИРУЮТСЯ ДЛЯ UNIT-ТЕСТИРОВАНИЯ.
 * НЕ ИСПОЛЬЗОВАТЬ НА ПРИКЛАДНОЙ СТРОНЕ!!!
 */
export {FixBugs as __FixBugs} from 'Controls/_input/FixBugs';
export {InsertFromDrop as __InsertFromDrop} from 'Controls/_input/FixBugs/InsertFromDrop';
export {MinusProcessing as __MinusProcessing} from 'Controls/_input/FixBugs/MinusProcessing';
export {CarriagePositionWhenFocus as __CarriagePositionWhenFocus} from 'Controls/_input/FixBugs/CarriagePositionWhenFocus';

/**
 * Объект с набором методов для опции {@link Controls/_input/interface/IValue#inputCallback}
 * @class Controls/input/InputCallback
 * @public
 * @mixes Controls/_input/InputCallback/hoursFormat
 * @mixes Controls/_input/InputCallback/lengthConstraint
 */
const InputCallback = {
    hoursFormat,
    lengthConstraint
};

export {
    Base,
    Area,
    Number,
    Text,
    Label,
    Mask,
    Phone,
    Password,
    DateBase,
    Date,
    Render,
    TimeInterval,
    Money,
    BaseViewModel,
    TextViewModel,
    MaskFormatBuilder,
    MaskInputProcessor,
    MaskFormatterValue,
    StringValueConverter,
    InputCallback,
    INewLineKey,
    ActualAPI,
    MaskFormatter,
    PhoneMaskBuilder,
    IDateTimeMask
};
