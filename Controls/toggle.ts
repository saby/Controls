/**
 * Библиотека контролов, которые позволяют организовать выбор из одного или нескольких значений.
 * @library
 * @includes Button Controls/_toggle/Button
 * @includes Switch Controls/_toggle/Switch
 * @includes DoubleSwitch Controls/_toggle/DoubleSwitch
 * @includes RadioGroup Controls/_toggle/RadioGroup
 * @includes ButtonGroup Controls/_toggle/ButtonGroup
 * @includes Checkbox Controls/_toggle/Checkbox
 * @includes CheckboxMarker Controls/_toggle/CheckboxMarker
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
 * @library
 * @includes Button Controls/_toggle/Button
 * @includes Switch Controls/_toggle/Switch
 * @includes DoubleSwitch Controls/_toggle/DoubleSwitch
 * @includes RadioGroup Controls/_toggle/RadioGroup
 * @includes ButtonGroup Controls/_toggle/ButtonGroup
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
export {default as ButtonGroup} from './_toggle/ButtonGroup';
export {default as ButtonGroupBase} from './_toggle/ButtonGroupBase';
export {default as Tumbler} from './_toggle/Tumbler';
export {default as Chips} from './_toggle/Chips';

import ItemTemplate = require('wml!Controls/_toggle/RadioGroup/resources/ItemTemplate');
import CheckboxItemTemplate = require('wml!Controls/_toggle/CheckboxGroup/resources/ItemTemplate');
import switchCircleTemplate = require('wml!Controls/_toggle/RadioGroup/resources/RadioCircle/RadioCircle');
import * as tumblerItemTemplate from 'wml!Controls/_toggle/Tumbler/itemTemplate';
import * as tumblerItemCounterTemplate from 'wml!Controls/_toggle/Tumbler/itemCounterTemplate';
import * as chipsItemTemplate from 'wml!Controls/_toggle/ButtonGroup/itemTemplate';
import * as chipsItemCounterTemplate from 'wml!Controls/_toggle/ButtonGroup/itemCounterTemplate';

export {
    ItemTemplate,
    CheckboxItemTemplate,
    switchCircleTemplate,
    tumblerItemTemplate,
    tumblerItemCounterTemplate,
    chipsItemTemplate,
    chipsItemCounterTemplate
};
