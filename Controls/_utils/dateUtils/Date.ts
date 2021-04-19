/**
 * Утилиты для работы с датами.
 * @class Controls/_utils/dateUtils/Date
 * @public
 * @author Миронов А.Ю.
 */

/**
 * На БЛ, минимальное значение для года - 1400.
 */
const MIN_YEAR_VALUE = 1400;

/**
 * Checks if the date is correct.
 * @param {Date} date
 * @returns {Boolean}
 */
export function isValidDate(date: Date): boolean {
    // If date is Invalid Date, "instanceof Date" will return true, so check getTime
    return date instanceof Date && !isNaN(date.getTime()) && (date.getFullYear() >= MIN_YEAR_VALUE);
}

/**
 * Checks if the dates are the same.
 * @param {Date} date1 first date.
 * @param {Date} date2 second date.
 * @returns {boolean} If the dates are the equal, then returns true, otherwise false.
 */
export function isDatesEqual(date1: Date, date2: Date): boolean {
    return date1 === date2 ||
        (date1 instanceof Date && date2 instanceof Date &&
            (date1.getTime() === date2.getTime() || (isNaN(date1.getTime()) && isNaN(date2.getTime()))));
}

/**
 * Checks whether the same year in years.
 * @param {Date} date1 first date.
 * @param {Date} date2 second date.
 * @returns {boolean} If the dates are the equal, then returns true, otherwise false.
 */
export function isYearsEqual(date1: Date, date2: Date): boolean {
    return date1 === date2 ||
        (isValidDate(date1) && isValidDate(date2) && date1.getYear() === date2.getYear());
}

/**
 * Checks whether the same years and months in dates.
 * @param {Date} date1 first date.
 * @param {Date} date2 second date.
 * @returns {boolean} If the dates are the equal, then returns true, otherwise false.
 */
export function isMonthsEqual(date1: Date, date2: Date): boolean {
    return date1 === date2 ||
        (isValidDate(date1) && isValidDate(date2) &&
            date1.getYear() === date2.getYear() && date1.getMonth() === date2.getMonth());
}

/**
 * Returns the date corresponding to the beginning of the week by the specified date.
 * @param {Date} date
 * @return {Date}
 */
export function getStartOfWeek(date: Date): Date {
    const rDate = new date.constructor(date);
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1);
    rDate.setDate(diff);
    return rDate;
}

/**
 * Returns the date corresponding to the end of the week by the specified date
 * @param {Date} date
 * @return {Date}
 */
export function getEndOfWeek(date: Date): Date {
    const rDate = new date.constructor(date);
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? 0 : 7);
    rDate.setDate(diff);
    return rDate;
}

/**
 * Returns true if the transmitted date is the beginning of the month.
 * @param {Date} date
 * @return {Boolean}
 */
export function isStartOfMonth(date: Date): boolean {
    return this.isValidDate(date) && date.getDate() === 1;
}

/**
 * Returns true if the transmitted date is the end of the month
 * @param {Date} date
 * @return {Boolean}
 */
export function isEndOfMonth(date: Date): boolean {
    if (!this.isValidDate(date)) {
        return false;
    }
    const d = new Date(date);
    d.setDate(d.getDate() + 1);
    return this.isStartOfMonth(d);
}

/**
 * Returns the date corresponding to the beginning of the month by the date sent.
 * @param {Date} date
 * @return {Date}
 */
export function getStartOfMonth(date: Date): Date {
    const d: Date = date || new Date();
    return new d.constructor(d.getFullYear(), d.getMonth(), 1);
}

/**
 * Returns the date corresponding to the end of the month by the specified date.
 * @param {Date} date
 * @return {Date}
 */
export function getEndOfMonth(date: Date): Date {
    return new date.constructor(date.getFullYear(), date.getMonth() + 1, 0);
}

/**
 * Returns the number of days in a month.
 * @param {Date} date
 * @return {Number}
 */
export function getDaysInMonth(date: Date): number {
    return this.getEndOfMonth(date).getDate();
}

/**
 * Returns true if the transmitted number is the beginning of the quarter.
 * @param {Date} date
 * @return {Boolean}
 */
export function isStartOfQuarter(date: Date): boolean {
    return this.isValidDate(date) && this.isStartOfMonth(date) && date.getMonth() % 3 === 0;
}

/**
 * Returns true if the transmitted number is the end of the quarter
 * @param {Date} date
 * @return {Boolean}
 */
export function isEndOfQuarter(date: Date): boolean {
    if (!this.isValidDate(date)) {
        return false;
    }
    const d = new Date(date);
    d.setDate(d.getDate() + 1);
    return this.isStartOfQuarter(d);
}

/**
 * Returns the date corresponding to the beginning of the quarter by the specified date.
 * @param {Date} date
 * @return {Date}
 */
export function getStartOfQuarter(date: Date): Date {
    return new date.constructor(date.getFullYear(), (Math.floor(date.getMonth() / 3)) * 3, 1);
}

/**
 * Returns the date corresponding to the end of the quarter by the specified date.
 * @param {Date} date
 * @return {Date}
 */
export function getEndOfQuarter(date: Date): Date {
    return new date.constructor(date.getFullYear(), (Math.floor(date.getMonth() / 3) + 1) * 3, 0);
}

/**
 * Returns true if the transmitted number is the beginning of the half-year.
 * @param {Date} date
 * @return {Boolean}
 */
export function isStartOfHalfyear(date: Date): boolean {
    return this.isValidDate(date) && this.getStartOfMonth(date) && date.getMonth() % 6 === 0;
}

/**
 * Returns true if the number sent is the end of half-year.
 * @param {Date} date
 * @return {Boolean}
 */
export function isEndOfHalfyear(date: Date): boolean {
    if (!this.isValidDate(date)) {
        return false;
    }
    const d = new Date(date);
    d.setDate(d.getDate() + 1);
    return this.isStartOfHalfyear(d);
}

/**
 * Returns the date corresponding to the beginning of the half-year by the specified date.
 * @param {Date} date
 * @return {Date}
 */
export function getStartOfHalfyear(date: Date): Date {
    return new date.constructor(date.getFullYear(), (Math.floor(date.getMonth() / 6)) * 6, 1);
}

/**
 * Returns the date corresponding to the end of the half-year by the specified date.
 * @param {Date} date
 * @return {Date}
 */
export function getEndOfHalfyear(date: Date): Date {
    return new date.constructor(date.getFullYear(), (Math.floor(date.getMonth() / 6) + 1) * 6, 0);
}

/**
 * Returns true if the transmitted number is the beginning of the year.
 * @param {Date} date
 * @return {Boolean}
 */
export function isStartOfYear(date: Date): boolean {
    return this.isValidDate(date) && date.getDate() === 1 && date.getMonth() === 0;
}

/**
 * Returns true if the transmitted number is the end of the year.
 * @param {Date} date
 * @return {Boolean}
 */
export function isEndOfYear(date: Date): boolean {
    if (!this.isValidDate(date)) {
        return false;
    }
    const d = new Date(date);
    d.setDate(d.getDate() + 1);
    return this.isStartOfYear(d);
}

/**
 * Returns the date corresponding to the beginning of the year by the specified date.
 * @param {Date} date
 * @return {Date}
 */
export function getStartOfYear(date: Date): Date {
    return new date.constructor(date.getFullYear(), 0, 1);
}

/**
 * Returns the date corresponding to the beginning of the year by the specified date.
 * @param {Date} date
 * @return {Date}
 */
export function getEndOfYear(date: Date): Date {
    return new date.constructor(date.getFullYear(), 12, 0);
}

/**
 * Returns the month in normal form (with date 1 and zero time).
 * @param month {Date} Date on the basis of which a new Date will be created with updated day and time.
 * @returns {Date} Date with zeroed day and time
 */
export function normalizeMonth(month: Date): Date {
    if (!(month instanceof Date)) {
        return null;
    }
    return new month.constructor(month.getFullYear(), month.getMonth(), 1);
}

/**
 * Returns the date in normal form (with zero time).
 * @param date {Date} Date on the basis of which a new Date will be created with updated time.
 * @returns {Date} Date with zeroed time
 */
export function normalizeDate(date: Date): Date {
    if (date === null) {
        return null;
    }
    if (date) {
        return new date.constructor(date.getFullYear(), date.getMonth(), date.getDate());
    }
}

export function getDaysByRange(date1: Date, date2: Date): number {
    const oneDay = 24 * 60 * 60 * 1000;
    return Math.round(Math.abs((date1.getTime() - date2.getTime()) / (oneDay)));
}

export function isRangesOverlaps(startDate1: Date|number, endDate1: Date|number,
                                 startDate2: Date|number, endDate2: Date|number): boolean {
    // Если значение null, то будем присваивать максимальную или минимальную дату.
    startDate1 = startDate1 !== null ? startDate1 : new Date(9999, 0);
    endDate1 = endDate1 !== null ? endDate1 : new Date(9999, 0);
    startDate2 = startDate2 !== null ? startDate2 : new Date(1400, 0);
    endDate2 = endDate2 !== null ? endDate2 : new Date(1400, 0);
    if (!startDate1 || !endDate1 || !startDate2 || !endDate2) {
        return false;
    }

    startDate1 = startDate1 instanceof Date ? startDate1.getTime() : startDate1;
    endDate1 = endDate1 instanceof Date ? endDate1.getTime() : endDate1;
    startDate2 = startDate2 instanceof Date ? startDate2.getTime() : startDate2;
    endDate2 = endDate2 instanceof Date ? endDate2.getTime() : endDate2;

    return Math.max(startDate1, startDate2) <= Math.min(endDate1, endDate2);
}
