import Control = require('Core/Control');
import template = require('wml!Controls-demo/Async/_asyncDemo/InternalOptionsTmpl');

export default class extends Control {
    protected _template: Function = template;

    protected _beforeUpdate(options: object): void {
        const i = 3;
    }
}
