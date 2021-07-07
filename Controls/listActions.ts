/**
 * Библиотека стандартных действий над записями
 * @library
 * @includes IAction Controls/_listActions/interface/IAction
 */

export {default as IAction, default as ICommand} from './_listActions/interface/IAction';
export {default as IActionOptions, default as ICommandOptions} from './_listActions/interface/IActionOptions';
export {default as Remove} from './_listActions/Remove';
export {default as RemoveProvider} from './_listActions/Remove/Provider';
export {default as RemoveProviderWithConfirm} from './_listActions/Remove/ProviderWithConfirm';
export {default as Move, IMoveActionOptions} from './_listActions/Move';
export {default as MoveProviderWithDialog} from './_listActions/Move/ProviderWithDialog';
export {default as MoveProvider} from './_listActions/Move/Provider';
export {default as MoveProviderDirection} from './_listActions/Move/ProviderDirection';
