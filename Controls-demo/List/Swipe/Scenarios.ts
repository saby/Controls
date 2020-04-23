import Control = require('Core/Control');
import * as template from 'wml!Controls-demo/List/Swipe/Scenarios';

class Scenarios extends Control {
   protected _template: Function = template;
   static _styles: string[] = ['Controls-demo/List/Swipe/Scenarios'];
}

export = Scenarios;
