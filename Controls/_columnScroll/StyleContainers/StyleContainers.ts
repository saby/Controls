import {Control, TemplateFunction} from 'UI/Base';
import * as template from 'wml!Controls/_columnScroll/StyleContainers/StyleContainers';

export interface IContainers {
    staticStyles: HTMLStyleElement;
    transformStyles: HTMLStyleElement;
    shadowsStyles: HTMLStyleElement;
    dragScrollStyles: HTMLStyleElement;
}

export default class StyleContainers extends Control {
    private _template: TemplateFunction = template;
    private _children: IContainers;

    getContainers(): IContainers {
        return {
            staticStyles: this._children.staticStyles,
            transformStyles: this._children.transformStyles,
            shadowsStyles: this._children.shadowsStyles,
            dragScrollStyles: this._children.dragScrollStyles
        };
    }
}
