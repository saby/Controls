import {Control, TemplateFunction} from 'UI/Base';
import controlTemplate = require('wml!Controls-demo/list_new/Navigation/Cut/CutNavigation');
import 'css!Controls-demo/list_new/Navigation/Cut/CutNavigation';
export default class CutNavigation extends Control {
   protected _template: TemplateFunction = controlTemplate;
}
