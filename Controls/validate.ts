/**
 * Библиотека контролов, которые позволяют организовать {@link https://wi.sbis.ru/doc/platform/developmentapl/interface-development/forms-and-validation/validation/ валидацию} данных на форме.
 * @library Controls/validate
 * @includes Controller Controls/_validate/Controller
 * @includes Container Controls/_validate/Container
 * @includes InputContainer Controls/_validate/InputContainer
 * @includes isEmail Controls/_validate/Validators/IsEmail
 * @includes isRequired Controls/_validate/Validators/IsRequired
 * @includes isValidDate Controls/_validate/Validators/IsValidDate
 * @includes IsValidDateRange Controls/_validate/Validators/IsValidDateRange
 * @includes DateRangeContainer Controls/_validate/DateRange
 * @includes SelectionContainer Controls/_validate/SelectionContainer
 * @public
 * @author Красильников А.С.
 */
/*
 * validate library
 * @library Controls/validate
 * @includes Controller Controls/_validate/Controller
 * @includes Container Controls/_validate/Container
 * @includes InputContainer Controls/_validate/Input
 * @includes isEmail Controls/_validate/Validators/IsEmail
 * @includes isRequired Controls/_validate/Validators/IsRequired
 * @includes isValidDate Controls/_validate/Validators/IsValidDate
 * @includes IsValidDateRange Controls/_validate/Validators/IsValidDateRange
 * @includes DateRangeContainer Controls/_validate/DateRange
 * @includes SelectionContainer Controls/_validate/SelectionContainer
 * @public
 * @author Красильников А.С.
 */

import isEmail = require('Controls/_validate/Validators/IsEmail');
import isRequired = require('Controls/_validate/Validators/IsRequired');
import isValidDate = require('Controls/_validate/Validators/IsValidDate');
import isValidDateRange from 'Controls/_validate/Validators/IsValidDateRange';
import Highlighter = require('wml!Controls/_validate/Highlighter');

export {default as Controller} from 'Controls/_validate/Controller';
export {default as Container} from 'Controls/_validate/Container';
export {default as InputContainer} from 'Controls/_validate/InputContainer';
export {default as DateRangeContainer} from 'Controls/_validate/DateRange';
export {default as SelectionContainer} from 'Controls/_validate/SelectionContainer';

export {
    isEmail,
    isRequired,
    isValidDate,
    isValidDateRange,
    Highlighter
}
