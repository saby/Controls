import Control = require('Core/Control');
import template = require('wml!Controls-demo/Async/_asyncDemo/LoadFail');

export default class extends Control {
    protected _template: Function = template;
}
