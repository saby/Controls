/**
 * Created by kraynovdo on 15.02.2018.
 */
import {Control} from 'UI/Base';
import template = require('wml!Controls/_list/BaseControl/Scroll/Emitter/Emitter');

var ScrollEmitter = Control.extend({
    _template: template,

    startRegister: function (triggers) {
        this._notify('register', ['listScroll', this, this.handleScroll, triggers], {bubbling: true});
    },

    _beforeUnmount: function () {
        this._notify('unregister', ['listScroll', this], {bubbling: true});
    },
    handleScroll: function () {
        this._notify('emitListScroll', Array.prototype.slice.call(arguments));
    }
});

ScrollEmitter.getOptionTypes = function () {
    return {};
};

export = ScrollEmitter;
