import Control = require('Core/Control');
import * as template from 'wml!Controls-demo/List/Swipe/Scenarios';
import 'css!Controls-demo/List/Swipe/Scenarios';

class Scenarios extends Control {
   private _template: Function = template;
}

export = Scenarios;
