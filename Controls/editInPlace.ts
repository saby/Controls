/**
 * Библиотека, которая предоставляет редактирование по месту в коллекции.
 * @library
 * @includes Controller Controls/_editInPlace/Controller
 *
 * @public
 * @author Родионов Е.А.
 */

/*
 * Library that provides edit in place for collection
 * @library
 * @includes Controller Controls/_editInPlace/Controller
 *
 * @public
 * @author Родионов Е.А.
 */
/**
 * @ignore
 */
const JS_SELECTORS = {
    NOT_EDITABLE: 'js-controls-ListView__notEditable'
};

export {JS_SELECTORS};
export {
    Controller,
    TAsyncOperationResult,
    IBeforeBeginEditCallbackParams,
    IBeforeEndEditCallbackParams
} from './_editInPlace/Controller';
export {CONSTANTS} from './_editInPlace/Types';
export {InputActivationHelper as InputHelper} from './_editInPlace/InputActivationHelper';
