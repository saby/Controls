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
 *
 * @public
 * @author Родионов Е.А.
 */

const JS_SELECTORS = {
    NOT_EDITABLE: 'js-controls-ListView__notEditable'
};

export {JS_SELECTORS};
export {Controller} from './_editInPlace/Controller';
export {CONSTANTS} from './_editInPlace/Types';
export {InputActivationHelper as InputHelper} from './_editInPlace/InputActivationHelper';
