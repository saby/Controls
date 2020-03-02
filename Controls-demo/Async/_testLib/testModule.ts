import Control = require('Core/Control');
import template = require('wml!Controls-demo/Async/_testLib/testModule');

class testModule extends Control {
    protected _template: Function = template;
}

export default testModule;
