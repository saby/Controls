/**
 * Библиотека контролов, которые позволяют организовать {@link https://wi.sbis.ru/doc/platform/developmentapl/interface-development/forms-and-validation/validation/ валидацию} данных на форме.
 * @library Controls/validate
 * @includes Controller Controls/_validate/Controller
 * @includes ControllerClass Controls/_validate/ControllerClass
 * @includes Container Controls/_validate/Container
 * @includes InputContainer Controls/_validate/InputContainer
 * @includes Highlighter Controls/validate:Highlighter
 * @includes isEmail Controls/_validate/Validators/IsEmail
 * @includes isRequired Controls/_validate/Validators/IsRequired
 * @includes isValidDate Controls/_validate/Validators/IsValidDate
 * @includes IsValidDateRange Controls/_validate/Validators/IsValidDateRange
 * @includes DateRangeContainer Controls/_validate/DateRange
 * @includes SelectionContainer Controls/_validate/SelectionContainer
 * @includes IValidateResult Controls/_validate/interfaces/IValidateResult
 * @public
 * @author Красильников А.С.
 */

import isEmail = require('Controls/_validate/Validators/IsEmail');
import isRequired = require('Controls/_validate/Validators/IsRequired');
import isValidDate = require('Controls/_validate/Validators/IsValidDate');
import isValidDateRange from 'Controls/_validate/Validators/IsValidDateRange';
import Highlighter = require('wml!Controls/_validate/Highlighter');

export {default as Controller} from 'Controls/_validate/Controller';
export {default as ControllerClass} from 'Controls/_validate/ControllerClass';
export {default as Container} from 'Controls/_validate/Container';
export {default as InputContainer} from 'Controls/_validate/InputContainer';
export {default as DateRangeContainer} from 'Controls/_validate/DateRange';
export {default as SelectionContainer} from 'Controls/_validate/SelectionContainer';
export {default as IValidateResult} from 'Controls/_validate/interfaces/IValidateResult';

export {
    isEmail,
    isRequired,
    isValidDate,
    isValidDateRange,
    Highlighter
}
