import Env = require('Env/Env');
import {getScrollbarWidth} from 'Controls/Utils/getScrollbarWidth'


var _private = {

    styleHideScrollbar: null,

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
    calcStyleHideScrollbar: function (scrollbarWidth) {
        var style;

        if (scrollbarWidth) {
            style = `margin: 0 -${scrollbarWidth}px -${scrollbarWidth}px 0;`;
        } else if (scrollbarWidth === 0) {
            style = '';
        }

        return style;
    }
};

export = {
    _private: _private,

    calcStyleHideScrollbar: function () {
        var scrollbarWidth, styleHideScrollbar;

        if (typeof _private.styleHideScrollbar === 'string') {
            styleHideScrollbar = _private.styleHideScrollbar;
        } else {
            scrollbarWidth = _private.calcScrollbarWidth(Env.detection);
            styleHideScrollbar = _private.calcStyleHideScrollbar(scrollbarWidth);
        }

        /**
         * Do not cache on the server and firefox.
         */
        if (!(typeof window === 'undefined' || Env.detection.firefox)) {
            _private.styleHideScrollbar = styleHideScrollbar;
        }

        return styleHideScrollbar;
    }
};

