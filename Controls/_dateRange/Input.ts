import {detection} from 'Env/Env';
import Control = require('Core/Control');
import coreMerge = require('Core/core-merge');
import proxyModelEvents from 'Controls/Utils/proxyModelEvents';
import DateRangeModel from './DateRangeModel';
import {StringValueConverter} from 'Controls/input';
import {IDateTimeMask} from 'Controls/input';
import tmplNotify = require('Controls/Utils/tmplNotify');
import template = require('wml!Controls/_dateRange/Input/Input');
import getOptions from 'Controls/Utils/datePopupUtils';

/**
 * Поле ввода периода дат.
 * <a href="/materials/demo-ws4-input-daterange">Демо-пример</a>.
 * @class Controls/_dateRange/Input
 * @extends Core/Control
 * @mixes Controls/_input/interface/IBase
 * @mixes Controls/_dateRange/interfaces/IInput
 * @mixes Controls/_dateRange/interfaces/IRangeInputTag
 * @mixes Controls/interface/IDateMask
 *
 * @css @width_DateRange-dash Width of dash between input fields.
 * @css @spacing_DateRange-between-dash-date Spacing between dash and input fields.
 * @css @thickness_DateRange-dash Thickness of dash between input fields.
 * @css @color_DateRange-dash Color of dash between input fields.
 * @css @spacing_DateRange-between-input-button Spacing between input field and button.
 * @css @size_DateRange-icon Size of calendar icon.
 * @css @font-family_DateRange Font-family of calendar icon.
 *
 * @control
 * @public
 * @demo Controls-demo/Input/Date/RangePG
 * @category Input
 * @author Красильников А.С.
 */

/*
 * Control for entering date range.
 * <a href="/materials/demo-ws4-input-daterange">Demo examples.</a>.
 * @class Controls/_dateRange/Input
 * @extends Core/Control
 * @mixes Controls/_input/interface/IBase
 * @mixes Controls/_dateRange/interfaces/IInput
 * @mixes Controls/_dateRange/interfaces/IRangeInputTag
 * @mixes Controls/interface/IDateMask
 *
 * @css @width_DateRange-dash Width of dash between input fields.
 * @css @spacing_DateRange-between-dash-date Spacing between dash and input fields.
 * @css @thickness_DateRange-dash Thickness of dash between input fields.
 * @css @color_DateRange-dash Color of dash between input fields.
 * @css @spacing_DateRange-between-input-button Spacing between input field and button.
 * @css @size_DateRange-icon Size of calendar icon.
 * @css @font-family_DateRange Font-family of calendar icon.
 *
 * @control
 * @public
 * @demo Controls-demo/Input/Date/RangePG
 * @category Input
 * @author Красильников А.С.
 */

var Component = Control.extend([], {
    _template: template,
    _proxyEvent: tmplNotify,

    _rangeModel: null,

    _beforeMount: function (options) {
        this._rangeModel = new DateRangeModel({ dateConstructor: this._options.dateConstructor });
        this._rangeModel.update(options);
        proxyModelEvents(
            this, this._rangeModel,
            ['startValueChanged', 'endValueChanged', 'rangeChanged', 'valueChanged']
        );
    },

    _beforeUpdate: function (options) {
        this._rangeModel.update(options);
    },

    _beforeUnmount: function () {
        this._rangeModel.destroy();
    },

    _openDialog: function (event) {
        var cfg = {
            ...getOptions.getCommonOptions(this),
            target: this._container,
            template: 'Controls/datePopup',
            className: 'controls-PeriodDialog__picker',
            templateOptions: {
               ...getOptions.getTemplateOptions(this),
               selectionType: this._options.selectionType,
               quantum: this._options.quantum,
               headerType: 'input',
               closeButtonEnabled: true,
               rangeselect: true,
               range: this._options.range
            }
        };
        this._children.opener.open(cfg);
    },

    _onResultWS3: function (event, startValue, endValue) {
        this._onResult(startValue, endValue);
    },

    _onResult: function (startValue, endValue) {
        this._rangeModel.setRange(startValue, endValue);
        this._children.opener.close();
        this._notifyInputCompleted();
    },

    // ВНИМАНИЕ!!! Переделать по готовности задачи по доработке InputRender - https://online.sbis.ru/opendoc.html?guid=d4bdb7cc-c324-4b4b-bda5-db6f8a46bc60

    _keyUpHandler: function (event) {
        // Move the focus only if the digit was pressed. Without this check, we see a bug in the following scenario.
        // The cursor is in a different input field. Click tab. By pressing the focus goes to this input field.
        // Release tab. Switches the focus in the field at the end of the period.
        const key = parseInt(event.nativeEvent.key, 10);
        if (!isNaN(key)) {
            this._focusChanger();
        }
    },

    _focusChanger: function() {
         var datetimeStart = this._children.startValueField._container.querySelector('input');
         var datetimeEnd = this._children.endValueField._container.querySelector('input');
         if (datetimeStart.selectionStart === this._options.mask.length) {
            this._children.endValueField.activate();
            datetimeEnd.setSelectionRange(0, 0);
         }
    },

    _notifyInputCompleted: function() {
        const converter = new StringValueConverter({
               mask: this._options.mask,
               replacer: this._options.replacer,
               dateConstructor: this._options.dateConstructor
            });
        this._notify('inputCompleted', [
            this._rangeModel.startValue,
            this._rangeModel.endValue,
            converter.getStringByValue(this._rangeModel.startValue),
            converter.getStringByValue(this._rangeModel.endValue)
        ]);
    }

});

Component.getDefaultOptions = function () {
    return IDateTimeMask.getDefaultOptions();
};

Component.getOptionTypes = function () {
    return coreMerge({}, IDateTimeMask.getOptionTypes());
};
Component._theme = ['Controls/dateRange', 'Controls/Classes'];
export default Component;
