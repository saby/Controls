import Control = require('Core/Control');
import template = require('wml!Controls-demo/Async/_asyncDemo/InternalOptions');

export default class extends Control {
    protected _template: Function = template;

    protected tmplOption: boolean = true;
    protected internalOption: boolean = true;

    protected changeTemplateOptions(): void {
        this.tmplOption = !this.tmplOption;
    }

    protected changeInternalOptions(): void {
        this.internalOption = !this.internalOption;
    }
}
