import BaseControl = require('Core/Control');
import DateRangeModel from "./DateRangeModel";
import proxyModelEvents from 'Controls/Utils/proxyModelEvents';

const Component = BaseControl.extend({

    _rangeModel: null,
    _isMinWidth: null,

    _beforeMount: function (options) {
        this._rangeModel = new DateRangeModel({ dateConstructor: options.dateConstructor });
        proxyModelEvents(this, this._rangeModel, ['startValueChanged', 'endValueChanged', 'rangeChanged']);
        this._updateRangeModel(options);

        // when adding control arrows, set the minimum width of the block,
        // so that the arrows are always fixed and not shifted.
        // https://online.sbis.ru/opendoc.html?guid=ae195d05-0e33-4532-a77a-7bd8c9783ef1
        if (options.prevArrowVisibility && options.prevArrowVisibility) {
            return this._isMinWidth = true;
        }
    },

    _beforeUpdate: function (options) {
        this._updateRangeModel(options);
    },

    _updateRangeModel: function (options) {
        this._rangeModel.update(options);
    },

    _onResult: function (startValue, endValue) {
        this._rangeModel.setRange(startValue, endValue);
        this._children.opener.close();
    },

    openPopup: function () {
        this._children.opener.open(this._getPopupOptions());
    },

    _getPopupOptions: function () {
        return {};
    },

    _rangeChangedHandler: function(event, startValue, endValue) {
        this._rangeModel.setRange(startValue, endValue);
    },

    _beforeUnmount: function () {
        this._rangeModel.destroy();
    }
});

export default Component;
