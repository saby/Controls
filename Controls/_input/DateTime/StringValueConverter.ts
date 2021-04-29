import {instanceOfModule} from 'Core/core-instance';
import {constants} from 'Env/Env';
import {DateTime} from 'Types/entity';
import {date as DateFormatter} from 'Types/formatter';
import {Range, Base as dateUtils} from 'Controls/dateUtils';
import {getMaskType, DATE_MASK_TYPE, DATE_TIME_MASK_TYPE, TIME_MASK_TYPE} from './Utils';
import {INPUT_MODE} from 'Controls/_input/interface/IInputDisplayValue';

const MASK_MAP: object = {
    YY: 'year',
    YYYY: 'year',
    MM: 'month',
    DD: 'date',
    HH: 'hours',
    mm: 'minutes',
    ss: 'seconds'
};

const RE_NUMBERS: RegExp = /\d/;
const RE_MASK: RegExp = /^(?:(\d{1,2})(?:\.(\d{1,2})(?:\.((?:\d{2})|(?:\d{4})))?)?)?(?: ?(\d{2}):(\d{2})(?::(\d{2})(?:\.(\d{3}))?)?)?$/;

export interface IStringValueConverter {
    mask?: string;
    yearSeparatesCenturies?: DateTime;
    dateConstructor?: DateTime | Date;
    replacer?: string;
}

export default class StringValueConverter {
    _mask: string;
    _replacer: string;
    _replacerRegExp: RegExp;
    _replacerBetweenCharsRegExp: RegExp;
    _dateConstructor: DateTime | Date;
    _yearSeparatesCenturies: DateTime;

    constructor(options: IStringValueConverter = {}) {
        this.update(options);
    }

    /**
     * Updates converter settings.
     * @param options
     */
    update(options: IStringValueConverter): void {
        this._yearSeparatesCenturies = options.yearSeparatesCenturies;
        this._mask = options.mask;
        this._dateConstructor = options.dateConstructor || Date;
        if (this._replacer !== options.replacer) {
            this._replacer = options.replacer;
            this._replacerBetweenCharsRegExp =
                new RegExp('[^' + this._replacer + ']+' + this._replacer + '[^' + this._replacer + ']+');
            this._replacerRegExp = new RegExp(this._replacer, 'g');
        }
    }

    /**
     * Returns the text displayed value
     * @param value
     * @returns {*}
     */
    getStringByValue(value: Date, mask?: string): string {
        let dateString: string = '';
        if (dateUtils.isValidDate(value)) {
            const actualMask: string = this._mask || mask;
            // Если дата имеет тип ДатаВремя, то при передачи на клиент она будет сконвертирована в часовой пояс клиента.
            // На сервере отрендерим дату в том же часовом поясе.
            // По факту тут проврка на DateTime.
            // instanceOfModule(value, 'Types/entity:DateTime') не подходит т.к. Date и Time наследуются от DateTime,
            // и проверка на 'Types/entity:DateTime' возвращает true для всех этих типов.
            if (constants.isServerSide &&
                !(instanceOfModule(value, 'Types/entity:Date') || instanceOfModule(value, 'Types/entity:Time'))) {
                const tzOffset: number = DateTime.getClientTimezoneOffset();
                dateString = DateFormatter(value, actualMask, tzOffset);
            } else {
                dateString = DateFormatter(value, actualMask);
            }
        }
        return dateString;
    }

    /**
     * Get the Date object by the String and the mask.
     * @param str Date in accordance with the mask.
     * @param baseValue The base date. Used to fill parts of the date that are not in the mask.
     * @param autoCompleteType Autocomplete mode.
     * @param inputType
     * @param required
     * @returns {Date} Date object
     */
    getValueByString(str, baseValue, autoCompleteType, inputType, required): DateTime | Date {
        let valueModel;

        if (this._isEmpty(str)) {
            return null;
        }

        valueModel = this._parseString(str);
        if (!valueModel) {
            return new this._dateConstructor('Invalid');
        }
        this._fillFromBaseValue(valueModel, baseValue);

        if (this._isFilled(str) &&
            (this._mask && this._mask.indexOf('YYYY') !== -1 && parseInt(valueModel.year.str, 10) < 1000)) {
            // Zero year and year < 1000 does not exist
            return new this._dateConstructor('Invalid');
        }
        if (autoCompleteType && !this._isValueModelFilled(valueModel) && !(this._isEmpty(str))) {
            this._autocomplete(valueModel, autoCompleteType, inputType, required);
        }

        if (this._isValueModelFilled(valueModel)) {
            return this._createDate(valueModel.year.value, valueModel.month.value, valueModel.date.value,
                valueModel.hours.value, valueModel.minutes.value,
                valueModel.seconds.value, autoCompleteType, this._dateConstructor);
        }

        return new this._dateConstructor('Invalid');
    }

    getCurrentDate(baseValue, mask): DateTime | Date {
        baseValue = dateUtils.isValidDate(baseValue) ? baseValue : new Date(1904, 0, 1);
        let
            year = baseValue.getFullYear(),
            month = baseValue.getMonth(),
            date = baseValue.getDate(),
            hours = baseValue.getHours(),
            minutes = baseValue.getMinutes(),
            seconds = baseValue.getSeconds(),
            now = this._getNewDate();
        if (mask.indexOf('YYYY') > -1) {
            year = now.getFullYear();
        } else if (mask.indexOf('YY') > -1) {
            year = now.getFullYear();
        }
        if (mask.indexOf('MM') > -1) {
            month = now.getMonth();
        }
        if (mask.indexOf('DD') > -1 || date > dateUtils.getEndOfMonth(now).getDate()) {
            date = now.getDate();
        }
        if (mask.indexOf('HH') > -1) {
            hours = now.getHours();
        }
        if (mask.indexOf('mm') > -1) {
            minutes = now.getMinutes();
        }
        if (mask.indexOf('ss') > -1) {
            seconds = now.getSeconds();
        }
        return new this._dateConstructor(year, month, date, hours, minutes, seconds);
    }

    private _isFilled(value: string): boolean {
        return value?.indexOf(this._replacer) === -1;
    }

    private _isEmpty(value: string): boolean {
        return !RE_NUMBERS.test(value);
    }

    private _isPartlyFilled(value: string): boolean {
        return value && RE_NUMBERS.test(value) && value.indexOf(this._replacer) > -1;
    }

    private _isValueModelFilled(valueModel): boolean {
        for (const value in valueModel) {
            if (valueModel.hasOwnProperty(value) && valueModel[value].valid === false) {
                return false;
            }
        }
        return true;
    }

    private _getFullYearBy2DigitsYear(valueYear: number): number {
        let
            curYear = (this._getNewDate()).getFullYear(),
            shortCurYear = curYear % 100,
            curCentury = (curYear - shortCurYear);

        // Если год задаётся двумя числами, то считаем что это текущий век
        // если год меньше или равен текущему году + 10, иначе это прошлый век.
        // Если в DateRange в первом поле задана дата и год больше, чем сформированный
        // год по правилу выше, то значит век возьмем текущий. Например, в первом поле
        // указан год 20, а во втором 35, то без этой правки во втором поле будет создан
        // 1935 год.
        const fullYear = valueYear <= shortCurYear + 10 ? curCentury + valueYear : (curCentury - 100) + valueYear;
        if (this._yearSeparatesCenturies && fullYear < this._yearSeparatesCenturies.getFullYear()) {
            return valueYear + 2000;
        }
        return fullYear;
    }

    private _parseString(str: string): object {
        let valueModel = {
            year: {str: null, value: 1904, valid: false},
            month: {str: null, value: 0, valid: false},
            date: {str: null, value: 1, valid: false},
            hours: {str: null, value: 0, valid: false},
            minutes: {str: null, value: 0, valid: false},
            seconds: {str: null, value: 0, valid: false}
        };
        if (this._mask) {
            valueModel = this._updateModelByMask(valueModel, str);
        } else {
            valueModel = this._updateModel(valueModel, str);
        }
        return valueModel;
    }

    private _updateModelByMask(valueModel: object, str: string): object {
        let maskItems = this._mask.split(/[.: /]/g),
            strItems = str.split(/[.: /]/g),
            i, valueObject;

        for (i = 0; i < maskItems.length; i++) {
            valueObject = valueModel[MASK_MAP[maskItems[i]]];
            valueObject.str = strItems[i];
            if (this._isFilled(strItems[i])) {
                valueObject.valid = true;
                valueObject.value = parseInt(strItems[i], 10);
                if (maskItems[i] === 'YY') {
                    valueObject.value = this._getFullYearBy2DigitsYear(valueObject.value);
                } else if (maskItems[i] === 'MM') {
                    valueObject.value -= 1;
                }
            }
        }
        return valueModel;
    }

    private _updateModel(valueModel: object, str: string): object {
        let map = {
                date: 1,
                month: 2,
                year: 3,
                hours: 4,
                minutes: 5,
                seconds: 6
            },
            strItems, i, valueObject;

        strItems = RE_MASK.exec(str);
        if (!strItems) {
            return;
        }
        for (i in map) {
            valueObject = valueModel[i];
            valueObject.str = strItems[map[i]] || null;
            if (this._isFilled(valueObject.str)) {
                valueObject.valid = true;
                valueObject.value = parseInt(valueObject.str, 10);
                if (i === 'year' && valueObject.value < 100) {
                    valueObject.value = this._getFullYearBy2DigitsYear(valueObject.value);
                } else if (i === 'month') {
                    valueObject.value -= 1;
                }
            }
        }
        return valueModel;
    }

    private _fillFromBaseValue(valueModel, baseValue): void {
        baseValue = dateUtils.isValidDate(baseValue) ? baseValue : new Date(1904, 0, 1);

        if (valueModel.year.str === null) {
            valueModel.year.value = baseValue.getFullYear();
        }
        if (valueModel.month.str === null) {
            valueModel.month.value = baseValue.getMonth();
        }
        if (valueModel.date.str === null && this._mask !== Range.dateMaskConstants.MM_YYYY) {
            // Для контрола с маской MM/YYYY не имеет смысла сохранять дату между вводом дат т.к. это приводит
            // к неожиданным результатам. Например, была программно установлена дата 31.12.2018.
            // меняем месяц на 11. 31.11 несуществует. Можно скорректировать на 30.11.2018. Теперь пользователь
            // вводит 12 в качесте месяца и мы получаем 30.12.2018...
            valueModel.date.value = baseValue.getDate();
        }
        if (valueModel.hours.str === null) {
            valueModel.hours.value = baseValue.getHours();
        }
        if (valueModel.minutes.str === null) {
            valueModel.minutes.value = baseValue.getMinutes();
        }
        if (valueModel.seconds.str === null) {
            valueModel.seconds.value = baseValue.getSeconds();
        }
        for (const value in valueModel) {
            if (valueModel.hasOwnProperty(value) && valueModel[value].str === null) {
                valueModel[value].valid = true;
            }
        }
    }

    private _autocomplete(valueModel, autocompleteType = 'default', inputType = 'default', required:boolean = false): void {
        let now = this._getNewDate(),
            maskType = getMaskType(this._mask),
            item, itemValue, isZeroAtBeginning;

        let getDate = function (autocompliteDefaultDate) {
            autocompliteDefaultDate = autocompliteDefaultDate || now.getDate();
            if (autocompleteType === 'start') {
                return 1;
            } else if (autocompleteType === 'end') {
                return dateUtils.getEndOfMonth(new Date(valueModel.year.value, valueModel.month.value)).getDate();
            } else {
                return autocompliteDefaultDate;
            }
        };

        let setValue = function (obj, value) {
            if (!obj.valid) {
                obj.value = value;
                obj.valid = true;
            }
        };

        // Autocomplete the year with the mask YYYY, if the year is entered, but not completely
        // https://online.sbis.ru/opendoc.html?guid=6384f217-208a-4ca6-a175-b2c8d0ee2f0e
        if (this._mask.indexOf('YYYY') !== -1 && !valueModel.year.valid && !this._isEmpty(valueModel.year.str)) {

            // If there is a Replacer between the numbers, then the year is incorrect
            if (this._replacerBetweenCharsRegExp.test(valueModel.year.str)) {
                return;
            }

            // Two-digit years auto-complete if there are no zeros at the beginning
            itemValue = parseInt(valueModel.year.str.replace(this._replacerRegExp, ' '), 10);
            isZeroAtBeginning = valueModel.year.str.split(itemValue)[0].indexOf('0') === -1;
            if (!isNaN(itemValue) && itemValue < 100 && isZeroAtBeginning) {
                setValue(valueModel.year, this._getFullYearBy2DigitsYear(itemValue));
            } else {
                return;
            }
        }

        for (item in valueModel) {
            if (valueModel.hasOwnProperty(item)) {
                if (!valueModel[item].valid) {
                    itemValue = valueModel[item].str;
                    if (getMaskType(item) === TIME_MASK_TYPE && this._isPartlyFilled(itemValue)) {
                        itemValue = itemValue.replace(this._replacerRegExp, '0');
                    }
                    itemValue = parseInt(itemValue, 10);
                    if (!isNaN(itemValue)) {
                        setValue(valueModel[item], itemValue);
                        if (item === 'month') {
                            valueModel[item].value -= 1;
                        }
                    }
                }
            }
        }

        // Автокомплитим только если пользователь частично заполнил поле, либо не заполнил, но поле обязательно
        // для заполнения. Не автокомплитим поля в периодах
        // if (isEmpty && (!required || autocompleteType === 'start' || autocompleteType === 'end')) {
        //    return null;
        // }

        if (maskType === DATE_MASK_TYPE || maskType === DATE_TIME_MASK_TYPE) {
            if (required && !valueModel.year.valid && valueModel.month.valid && valueModel.date.valid) {
                setValue(valueModel.year, now.getFullYear());
                setValue(valueModel.month, now.getMonth());
                setValue(valueModel.date, now.getDate());
            } else if (valueModel.year.valid) {
                if (valueModel.year.value === now.getFullYear()) {
                    if (valueModel.month.valid) {
                        if (valueModel.month.value === now.getMonth()) {
                            // Заполнен текущий год и месяц
                            setValue(valueModel.date, getDate());
                        } else {
                            setValue(valueModel.date, getDate(1));
                        }
                    } else {
                        // Current year is filled
                        if (inputType !== INPUT_MODE.partial ||
                                (!valueModel.month.valid && valueModel.date.valid) ||
                                (valueModel.month.valid && !valueModel.date.valid)) {
                            setValue(valueModel.month, now.getMonth());
                            setValue(valueModel.date, getDate());
                        }
                    }
                } else {
                    // A year is different from the current one
                    if (inputType !== INPUT_MODE.partial || !valueModel.date.valid) {
                        if (autocompleteType === 'end') {
                            setValue(valueModel.month, 11);
                        } else {
                            setValue(valueModel.month, 0);
                        }
                    }
                    if (inputType !== INPUT_MODE.partial || !valueModel.month.valid) {
                        if (autocompleteType === 'end') {
                            setValue(valueModel.date, 31);
                        } else {
                            setValue(valueModel.date, 1);
                        }
                    }
                }
            } else if (valueModel.date.valid) {
                setValue(valueModel.month, now.getMonth());
                setValue(valueModel.year, now.getFullYear());
            }
        } else if (maskType === TIME_MASK_TYPE) {
            if (valueModel.hours.valid) {
                setValue(valueModel.minutes, 0);
                setValue(valueModel.seconds, 0);
            }
            if (valueModel.minutes.valid) {
                setValue(valueModel.seconds, 0);
            }
        }
    }

    private _getNewDate(): Date {
        return new Date();
    }

    /**
     * Creates a date. Unlike the Date constructor, if the year is <100, it does not convert it to 19xx.
     * @param year
     * @param month
     * @param date
     * @param hours
     * @param minutes
     * @param seconds
     * @param autoCorrect If true, then corrects the date if the wrong values of its elements are passed,
     * otherwise it returns null. If a date greater than the maximum date in the current month is transmitted,
     * the maximum date will be set.
     * @returns {Date}
     * @private
     */
    private _createDate(year, month, date, hours, minutes, seconds, autoCorrect, dateConstructor): DateTime | Date {
        let endDateOfMonth;

        if (autoCorrect) {
            endDateOfMonth = dateUtils.getEndOfMonth(new dateConstructor(year, month, 1)).getDate();
            if (date > endDateOfMonth) {
                date = endDateOfMonth;
            }
            if (hours >= 24) {
                hours = 23;
            }
            if (minutes >= 60) {
                minutes = 59;
            }
            if (seconds >= 60) {
                seconds = 59;
            }
        }

        if (!this._isValidDate(year, month, date, hours, minutes, seconds)) {
            return new dateConstructor('Invalid');
        }

        return new dateConstructor(year, month, date, hours, minutes, seconds);
    }

    private _isValidDate(year, month, date, hours, minutes, seconds): boolean {
        let lastMonthDay = dateUtils.getEndOfMonth(new Date(year, month)).getDate();
        return seconds < 60 && minutes < 60 && hours < 24 && month < 12 && month >= 0 &&
            date <= lastMonthDay && date > 0;
    }
}
