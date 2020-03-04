import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/Filter_new/resources/Panel';
import 'Controls-demo/Filter_new/resources/Editors/HierarchyLookup';
import 'wml!Controls-demo/Filter_new/resources/Editors/Dropdown';
import 'wml!Controls-demo/Filter_new/resources/Editors/DateRange';
import 'wml!Controls-demo/Filter_new/resources/Editors/Link';
import 'Controls-demo/Filter_new/resources/Editors/Additional/Select';
import 'Controls-demo/Filter_new/resources/Editors/Lookup';
import 'wml!Controls-demo/Filter_new/resources/Editors/Additional/Link';
import 'Controls-demo/Filter_new/resources/Editors/Additional/Dropdown';

export default class extends Control {
    _template: TemplateFunction = Template;
}
