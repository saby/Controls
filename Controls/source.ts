/**
 * Библиотека, содержащая механизмы, которые подготавливают данные для контролов.
 * @library Controls/source
 * @includes EnumAdapter Controls/_source/Adapter/Enum
 * @includes Range Controls/_source/SourceController
 * @includes SelectedKey Controls/_source/Adapter/SelectedKey
 * @author Крайнов Д.О.
 */

/*
 * source library
 * @library Controls/source
 * @includes EnumAdapter Controls/_source/Adapter/Enum
 * @includes Range Controls/_source/SourceController
 * @includes SelectedKey Controls/_source/Adapter/SelectedKey
 * @author Крайнов Д.О.
 */

import Controller = require('Controls/_source/SourceController');

export {NavigationController} from 'Controls/_source/NavigationController';

export {default as SelectedKey} from './_source/Adapter/SelectedKey';
export {default as EnumAdapter} from './_source/Adapter/Enum';

export {
   Controller
};
