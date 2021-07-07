/**
 * Библиотека стандартных экшенов.
 * @library
 */

import Container = require('wml!Controls/_actions/WrappedContainer');

export {IAction} from './_actions/IAction';
export {default as BaseAction} from './_actions/BaseAction';
export {default as Remove} from './_actions/MassActions/Remove';
export {default as Move} from './_actions/MassActions/Move';
export {default as MassAction} from './_actions/MassActions/MassAction';

export {
    Container
}
