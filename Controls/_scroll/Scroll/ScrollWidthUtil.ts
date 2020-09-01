import Env = require('Env/Env');
import {getScrollbarWidth} from 'Controls/sizeUtils';


var _private = {

    styleHideScrollbar: {
        vertical: null,
        verticalHorizontal: null
    },

    /**
     * Расчет ширины нативного скролла.
     * @param detection
     * @return {number}
     */
    calcScrollbarWidth: function() {
        return getScrollbarWidth(Env.detection);
    },

    /**
     * Расчет css стиля для скрытия нативного скролла.
     * @param scrollbarWidth
     * @param detection
     * @param compatibility
     * @return {string}
     */
    calcStyleHideScrollbar: function (scrollbarWidth, scrollMode) {
        var style;

        if (scrollbarWidth) {
            style =  `margin: 0 -${scrollbarWidth}px -${scrollMode === 'vertical' ? 0 : scrollbarWidth}px 0;`;
        } else if (scrollbarWidth === 0) {
            style = '';
        }

        return style;
    }
};

export = {
    _private: _private,

    calcStyleHideScrollbar: function (scrollMode) {
        var scrollbarWidth, styleHideScrollbar;

        if (typeof _private.styleHideScrollbar[scrollMode] === 'string') {
            styleHideScrollbar = _private.styleHideScrollbar[scrollMode];
        } else {
            scrollbarWidth = _private.calcScrollbarWidth(Env.detection);
            styleHideScrollbar = _private.calcStyleHideScrollbar(scrollbarWidth, scrollMode);
        }

        /**
         * Do not cache on the server and firefox.
         */
        if (!(typeof window === 'undefined' || Env.detection.firefox)) {
            _private.styleHideScrollbar[scrollMode] = styleHideScrollbar;
        }

        return styleHideScrollbar;
    }
};

