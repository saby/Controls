/**
 * Библиотека стандартных действий над записями
 * @library
 * @includes IAction Controls/_listActions/interface/IAction
 */

import IAction from './_listActions/interface/IAction';
import IActionOptions from './_listActions/interface/IActionOptions';
import Remove from './_listActions/Remove';
import Move from './_listActions/Move';
import MoveProvider from './_listActions/Move/Provider';

export {
    Move,
    MoveProvider,
    Remove,
    IAction,
    IActionOptions
}
