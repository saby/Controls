import Control = require('Core/Control');
import template = require('wml!Controls-demo/Async/_testLibAsync/testModule');

export default class TestModule extends Control {
    protected _template: Function = template;
}
