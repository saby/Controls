/**
 * Библиотека, которая предоставляет редактирование по месту в коллекции
 * @library Controls/editInPlace
 * @includes Controller Controls/_editInPlace/Controller
 *
 * @public
 * @author Родионов Е.А.
 */

/*
 * Library that provides edit in place for collection
 * @library Controls/editInPlace
 * @includes Controller Controls/_editInPlace/Controller
 * @public
 * @author Родионов Е.А.
 */

export {default as EditInPlace, JS_SELECTORS} from './_editInPlace/EditInPlace';
export {Controller} from './_editInPlace/Controller';
export {CONSTANTS} from './_editInPlace/Types';
export {InputActivationHelper as InputHelper} from './_editInPlace/InputActivationHelper';
