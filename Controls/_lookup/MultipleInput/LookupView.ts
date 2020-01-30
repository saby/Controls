import BaseLookupView = require('Controls/_lookup/BaseLookupView');
import getWidthUtil = require('Controls/Utils/getWidth');
import showSelectorTemplate = require('wml!Controls/_lookup/BaseLookupView/resources/showSelectorTemplate');
import inputRender = require('wml!Controls/_lookup/MultipleInput/resources/inputRender');


const
    OUTER_INDENT_INPUT = 0,
    SHOW_SELECTOR_WIDTH = 0,
    LIST_OF_DEPENDENT_OPTIONS = ['items', 'displayProperty', 'readOnly', 'placeholder', 'isInputVisible'];

const _private = {
    initializeConstants: function (theme) {
        if (!SHOW_SELECTOR_WIDTH) {
            // The template runs in isolation from the application, so the theme will not be inherited from Application.
            SHOW_SELECTOR_WIDTH = getWidthUtil.getWidth(showSelectorTemplate({theme: theme}));
            OUTER_INDENT_INPUT = getWidthUtil.getWidth(inputRender());
        }
    },

    getAvailableWidthCollection: function (self, options) {
        var
            placeholderWidth,
            availableWidthCollection = self._getFieldWrapperWidth();

        if (!options.readOnly) {
            availableWidthCollection -= SHOW_SELECTOR_WIDTH;
        }

        if (self._isInputVisible(options)) {
            placeholderWidth = _private.getPlaceholderWidth(options.placeholder);
            availableWidthCollection -= placeholderWidth + OUTER_INDENT_INPUT;
        }

        return availableWidthCollection;
    },

    getPlaceholderWidth: function(placeholder) {
        if (placeholder) {
            if (placeholder.isDataArray) {
                placeholder = placeholder.reduce(function(currentPlaceholder, template) {
                    return currentPlaceholder + template.func();
                }, '');
            } else if (placeholder.func instanceof Function) {
                placeholder = placeholder.func();
            }
        }

        return placeholder ? getWidthUtil.getWidth(placeholder) : 0;
    }
};

var LookupMultiSelectorView = BaseLookupView.extend({
    _beforeMount: function () {
        LookupMultiSelectorView.superclass._beforeMount.apply(this, arguments);
        this._listOfDependentOptions = LIST_OF_DEPENDENT_OPTIONS;
    },

    _afterMount: function () {
        _private.initializeConstants(this._options.theme);
        LookupMultiSelectorView.superclass._afterMount.apply(this, arguments);
    },

    _calculatingSizes: function (options) {
        this._maxVisibleItems = options.items.getCount();
        this._availableWidthCollection = _private.getAvailableWidthCollection(this, options);
    },

    _isInputVisible: function (options) {
        return (!options.readOnly || this._inputValue) && options.items.getCount() < options.maxVisibleItems;
    },

    _isNeedCalculatingSizes: function(options) {
        return !options.readOnly && !this._isEmpty(options);
    }
});

LookupMultiSelectorView._theme = ['Controls/lookup'];
LookupMultiSelectorView.getDefaultOptions = function() {
    return {
        showClearButton: false
    };
};

LookupMultiSelectorView._private = _private;
export = LookupMultiSelectorView;
