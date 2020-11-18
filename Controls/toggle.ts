/**
 * Библиотека контролов, которые позволяют организовать выбор из одного или нескольких значений.
 * @library Controls/toggle
 * @public
 * @author Крайнов Д.О.
 */

/*
 * toggle library
 * @library Controls/toggle
 * @public
 * @author Крайнов Д.О.
 */

export {default as Button} from './_toggle/Button';
export {default as Switch} from './_toggle/Switch';
export {default as DoubleSwitch} from './_toggle/DoubleSwitch';
export {default as CheckboxGroup} from './_toggle/CheckboxGroup';
export {default as Checkbox} from './_toggle/Checkbox';
export {default as CheckboxMarker} from './_toggle/Checkbox/resources/CheckboxMarker';
export {default as Separator} from './_toggle/Separator';
export {default as ICheckable} from './_toggle/interface/ICheckable';
export {default as BigSeparator} from './_toggle/BigSeparator';
export {IToggleGroupOptions, IToggleGroup} from './_toggle/interface/IToggleGroup';
export {default as RadioGroup} from './_toggle/RadioGroup';
export {default as ButtonGroup} from './_toggle/ButtonGroup';

import ItemTemplate = require('wml!Controls/_toggle/RadioGroup/resources/ItemTemplate');
import CheckboxItemTemplate = require('wml!Controls/_toggle/CheckboxGroup/resources/ItemTemplate');
import switchCircleTemplate = require('wml!Controls/_toggle/resources/SwitchCircle/SwitchCircle');

export {
    ItemTemplate,
    CheckboxItemTemplate,
    switchCircleTemplate
};
