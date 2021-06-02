import {getScrollbarWidth} from '../Utils/getScrollbarWidth';
import {constants, detection} from 'Env/Env';

var _private = {

    styleHideScrollbar: {
        vertical: null,
        horizontal: null,
        verticalHorizontal: null
    },

    /**
     * Расчет ширины нативного скролла.
     * @param detection
     * @return {number}
     */
    calcScrollbarWidth: function() {
        return getScrollbarWidth(detection);
    },

    /**
     * Расчет css стиля для скрытия нативного скролла.
     * @param scrollbarWidth
     * @param detection
     * @param compatibility
     * @return {string}
     */
    calcStyleHideScrollbar: function (scrollbarWidth, scrollOrientation) {
        var style;

        if (scrollbarWidth) {
            const scrollOrientationValue = scrollOrientation.toLowerCase();
            if (scrollOrientationValue.indexOf('vertical') !== -1) {
                style =  `margin-right: -${scrollbarWidth}px;`;
            }
            if (scrollOrientationValue.indexOf('horizontal') !== -1) {
                style += `margin-bottom: -${scrollbarWidth}px;`;
            }
        } else if (scrollbarWidth === 0) {
            style = '';
        }

        return style;
    }
};

export = {
    _private: _private,

    calcStyleHideScrollbar: function (scrollOrientation) {
        var scrollbarWidth, styleHideScrollbar;

        if (typeof _private.styleHideScrollbar[scrollOrientation] === 'string') {
            styleHideScrollbar = _private.styleHideScrollbar[scrollOrientation];
        } else {
            scrollbarWidth = _private.calcScrollbarWidth(detection);
            styleHideScrollbar = _private.calcStyleHideScrollbar(scrollbarWidth, scrollOrientation);
        }

        /**
         * Do not cache on the server and firefox.
         */
        if (!(!constants.isBrowserPlatform || detection.firefox)) {
            _private.styleHideScrollbar[scrollOrientation] = styleHideScrollbar;
        }

        return styleHideScrollbar;
    }
};

