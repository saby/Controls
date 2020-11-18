/**
 * Библиотека контролов, позволяющих выводить подсказку при вводе текста.
 * @library Controls/suggest
 * @public
 * @author Крайнов Д.О.
 */

/*
 * suggest library
 * @library Controls/suggest
 * @public
 * @author Крайнов Д.О.
 */

import Input = require('Controls/_suggest/Input');
import {default as _InputController} from 'Controls/_suggest/_InputController';
import SearchInput from 'Controls/_suggest/Input/Search/Suggest';

export {default as Selector} from './_suggest/Selector';
export {default as ISuggest} from './_suggest/ISuggest';

export {
   Input,
   _InputController,
   SearchInput,
   InputRender
};
