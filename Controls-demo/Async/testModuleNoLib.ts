import Control = require('Core/Control');
import template = require('wml!Controls-demo/Async/testModuleNoLib');

class testModule extends Control {
    protected _template: Function = template;
}

export = testModule;
