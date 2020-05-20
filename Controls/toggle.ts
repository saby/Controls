/**
 * Библиотека контролов, которые позволяют организовать выбор из одного или нескольких значений.
 * @library Controls/toggle
 * @includes Button Controls/_toggle/Button
 * @includes Switch Controls/_toggle/Switch
 * @includes DoubleSwitch Controls/_toggle/DoubleSwitch
 * @includes RadioGroup Controls/_toggle/RadioGroup
 * @includes Checkbox Controls/_toggle/Checkbox
 * @includes CheckboxMarker Controls/_toggle/Checkbox/resources/CheckboxMarker
 * @includes CheckboxGroup Controls/_toggle/CheckboxGroup
 * @includes Separator Controls/_toggle/Separator
 * @includes BigSeparator Controls/_toggle/BigSeparator
 * @includes CheckboxItemTemplate Controls/_toggle/CheckboxGroup/resources/ItemTemplate
 * @includes ICheckable Controls/_toggle/interface/ICheckable
 * @includes IToggleGroup Controls/_toggle/interface/IToggleGroup
 * @includes switchCircleTemplate Controls/_toggle/resources/SwitchCircle/SwitchCircle
 * @public
 * @author Крайнов Д.О.
 */

/*
 * toggle library
 * @library Controls/toggle
 * @includes Button Controls/_toggle/Button
 * @includes Switch Controls/_toggle/Switch
 * @includes DoubleSwitch Controls/_toggle/DoubleSwitch
 * @includes RadioGroup Controls/_toggle/RadioGroup
 * @includes Checkbox Controls/_toggle/Checkbox
 * @includes CheckboxMarker Controls/_toggle/Checkbox/resources/CheckboxMarker
 * @includes CheckboxGroup Controls/_toggle/CheckboxGroup
 * @includes Separator Controls/_toggle/Separator
 * @includes BigSeparator Controls/_toggle/BigSeparator
 * @includes ICheckable Controls/_toggle/interface/ICheckable
 * @includes IToggleGroup Controls/_toggle/interface/IToggleGroup
 * @includes switchCircleTemplate Controls/_toggle/resources/SwitchCircle/SwitchCircle
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
export {default as BigSeparator} from './_toggle/BigSeparator';
export {IToggleGroupOptions, IToggleGroup} from './_toggle/interface/IToggleGroup';
export {default as RadioGroup} from './_toggle/RadioGroup';

import ItemTemplate = require('wml!Controls/_toggle/RadioGroup/resources/ItemTemplate');
import CheckboxItemTemplate = require('wml!Controls/_toggle/CheckboxGroup/resources/ItemTemplate');
import switchCircleTemplate = require('wml!Controls/_toggle/resources/SwitchCircle/SwitchCircle');

export {
    ItemTemplate,
    CheckboxItemTemplate,
    switchCircleTemplate
};
