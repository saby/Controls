import {Control, TemplateFunction} from 'UI/Base';
import template = require('wml!Controls-demo/Tabs/Buttons/Buttons');

export default class TabButtonsDemo extends Control {
    protected _template: TemplateFunction = template;

    static _styles: string[] = ['Controls-demo/Tabs/Buttons/Buttons'];
}
