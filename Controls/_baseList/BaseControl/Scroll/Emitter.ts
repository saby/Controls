/**
 * Created by kraynovdo on 15.02.2018.
 */
import {Control} from 'UI/Base';
import template = require('wml!Controls/_baseList/BaseControl/Scroll/Emitter/Emitter');

const ScrollEmitter = Control.extend({
    _template: template,

    startRegister(triggers: any[]): void {
        this._notify('register', ['listScroll', this, this.handleScroll, triggers], {bubbling: true});
    },

    _beforeUnmount(): void {
        this._notify('unregister', ['listScroll', this], {bubbling: true});
    },

    handleScroll(): void {
        this._notify('emitListScroll', Array.prototype.slice.call(arguments));
    }
});

ScrollEmitter.getOptionTypes = () => ({});

export = ScrollEmitter;
