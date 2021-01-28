/**
 * Created by kraynovdo on 15.02.2018.
 */
import {Control} from 'UI/Base';
import template = require('wml!Controls/_list/BaseControl/Scroll/Emitter/Emitter');

export default class ScrollEmitter extends Control {
    _template: template;

    startRegister(): void {
        this._notify('register', ['scrollStateChanged', this, this.handleScroll], {bubbling: true});
    }
    _beforeUnmount(): void  {
        this._notify('unregister', ['scrollStateChanged', this], {bubbling: true});
    }
    handleScroll(): void  {
        this._notify('emitScrollStateChanged', Array.prototype.slice.call(arguments));
    }
    static getOptionTypes(): {}  {
        return {};
    }
}
