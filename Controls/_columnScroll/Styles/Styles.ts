import {Control, TemplateFunction} from 'UI/Base';
import * as template from 'wml!Controls/_columnScroll/Styles/Styles';

export default class Styles extends Control {
    private _template: TemplateFunction = template;

    getContainers(): {
        staticStyles: HTMLStyleElement;
        transformStyles: HTMLStyleElement;
        shadowsStyles: HTMLStyleElement;
    } {
        return {
            staticStyles: this._children.staticStyles,
            transformStyles: this._children.transformStyles,
            shadowsStyles: this._children.shadowsStyles
        };
    }
}
