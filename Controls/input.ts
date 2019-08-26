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
 * @includes Time Controls/_input/Time/Picker
 * @includes DateTimeModel Controls/_input/DateTime/Model
 * @includes TimeInterval Controls/_input/TimeInterval
 * @includes Money Controls/_input/Money
 * @includes Render Controls/_input/Render
 * @includes INewLineKey Controls/_input/interface/INewLineKey
 * @includes IValidationStatus Controls/_input/interface/IValidationStatus
 *
 * @includes INewLineKey Controls/_input/interface/INewLineKey
 *
 * @public
 * @author Крайнов Д.О.
 */

/*
 * List library
 * @library Controls/input
 * @includes Base Controls/_input/Baseы
 * @includes Area Controls/_input/Area
 * @includes Number Controls/_input/Number
 * @includes Text Controls/_input/Text
 * @includes Label Controls/_input/Label
 * @includes Mask Controls/_input/Mask
 * @includes Phone Controls/_input/Phone
 * @includes Password Controls/_input/Password
 * @includes DateBase Controls/_input/DateTime
 * @includes Date Controls/_input/Date/Picker
 * @includes Time Controls/_input/Time/Picker
 * @includes DateTimeModel Controls/_input/DateTime/Model
 * @includes TimeInterval Controls/_input/TimeInterval
 * @includes Money Controls/_input/Money
 * @includes Render Controls/_input/Render
 * @includes INewLineKey Controls/_input/interface/INewLineKey
 * @includes IValidationStatus Controls/_input/interface/IValidationStatus
 * @includes INewLineKey Controls/_input/interface/INewLineKey
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
import * as ActualAPI from 'Controls/_input/ActualAPI';

import BaseViewModel = require('Controls/_input/Base/ViewModel');
import TextViewModel = require('Controls/_input/Text/ViewModel');
import MaskFormatBuilder = require('Controls/_input/Mask/FormatBuilder');
import MaskInputProcessor = require('Controls/_input/Mask/InputProcessor');
import StringValueConverter = require('Controls/_input/DateTime/StringValueConverter');

import lengthConstraint from 'Controls/_input/InputCallback/lengthConstraint';

import INewLineKey from 'Controls/_input/interface/INewLineKey';
import IValidationStatus from 'Controls/_input/interface/IValidationStatus';

const InputCallback = {
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
    StringValueConverter,
    InputCallback,
    INewLineKey,
    IValidationStatus,
    Render,
    ActualAPI
};
