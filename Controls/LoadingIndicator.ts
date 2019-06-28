import Control = require('Core/Control');
import tmpl = require('wml!Controls/_LoadingIndicator/LoadingIndicator');
import randomId = require('Core/helpers/Number/randomId');
import collection = require('Types/collection');
import Env = require('Env/Env');
import 'css!theme?Controls/_LoadingIndicator/LoadingIndicator';

/**
 * @name Controls/Container/LoadingIndicator#isGlobal
 * @cfg {Boolean} show indicator covering whole page (global) or covering just own content
 * @variant true It means position: fixed of indicator's container
 * @variant false It means position: absolute of indicator's container
 * @default true
 */
/**
 * @name Controls/Container/LoadingIndicator#message
 * @cfg {String} message of indicator
 * @default '' (empty string)
 */
/**
 * @name Controls/Container/LoadingIndicator#scroll
 * @cfg {String} add gradient of indicator's background
 * @variant '' (empty string) no gradient
 * @variant 'left' gradient from left to right (increase of fullness)
 * @variant 'right' gradient from right to left
 * @variant 'top' gradient from top to bottom
 * @variant 'bottom' gradient from bottom to top
 * @default '' (empty string)
 */
/**
 * @name Controls/Container/LoadingIndicator#small
 * @cfg {String} size of some styles of indicator (tuning of margin, background, border, width, height styles)
 * @variant '' (empty string) standard size of indicator
 * @variant 'small' make indicator smaller
 * @default '' (empty string)
 */
/**
 * @name Controls/Container/LoadingIndicator#overlay
 * @cfg {String} setting of indicator's overlay
 * @variant 'default' invisible background, indicator blocks clicks
 * @variant 'dark' dark background, indicator blocks clicks
 * @variant 'none' invisible background, indicator don't blocks clicks
 * @default 'default'
 */
/**
 * @name Controls/Container/LoadingIndicator#mods
 * @cfg {Array.<String>|String} It can be using for custom tuning of indicator.
 * mods contains words what will be adding as "controls-loading-indicator_mod-[mod]" style in indicator's container
 * @variant [] no mods
 * @variant ['gray'] gray color of gradient. it's using with scroll property
 * @default []
 */
/**
 * @name Controls/Container/LoadingIndicator#delay
 * @cfg {Number} timeout before indicator will be visible
 * @default 2000
 */

/**
 * Container for content that can show loading indicator.
 * It can be local using for covering it's own content or global using for covering whole page.
 * @remark
 * LoadingIndicator is waiting 2 events: showIndicator and hideIndicator.
 *
 * showIndicator is using for request of indicator showing. It may be some requests.
 * Requests compose stack where last handled request is using by LoadingIndicator for indicator showing.
 * Indicator becomes invisible when stack will be empty.
 * showIndicator has 2 arguments: [config, waitPromise].
 * config is object having properties:
 *    -  id (String) - defines the unique id of showing request (By default use autogenerated id),
 *    -  isGlobal (Boolean) - global or not (If not setted, by default use value of similar control option)
 *    -  message (String) - message of indicator (If not setted, by default use value of similar control option)
 *    -  scroll (String) - add gradient of indicator's background (If not setted, by default use value of similar control option)
 *    -  small (String) - size of indicator (If not setted, by default use value of similar control option)
 *    -  overlay (String) - setting of indicator's overlay (If not setted, by default use value of similar control option)
 *    -  mods (Array.<String>|String) - It can be using for custom tuning of indicator (If not setted, by default use value of similar control option)
 *    -  delay (Number) - timeout before indicator will be visible (If not setted, by default use value of similar control option)
 * waitPromise (Promise) - when this promise will be resolved, indicator hides (not necessary property)
 * showIndicator returns id value using as argument of hideIndicator.
 *
 * hideIndicator is using for remove request of indicator showing.
 * hideIndicator has 1 argument: [id].
 * id is Number type property. It needs for remove concrete request from stack of requests.
 *
 *
 * @css size_LoadingIndicator-l Size of Loading Indicator when option size is set to default.
 * @css size_LoadingIndicator-s Size of Loading Indicator when option size is set to small.
 *
 * @css @spacing_LoadingIndicator-between-content-border-l Spacing between content and border when option size is set to default.
 * @css @spacing_LoadingIndicator-between-content-border-s Spacing between content and border when option size is set to small.
 *
 * @css @border-radius_LoadingIndicator Border radius when option size is set to default.
 *
 * @css @font-size_LoadingIndicator Font-size of message.
 * @css @line-height_LoadingIndicator Line-height of message.
 * @css @color_LoadingIndicator-text Color of message.
 *
 * @css @color_LoadingIndicator-overlay-default Color of overlay when option overlay is set to default.
 * @css @color_LoadingIndicator-overlay-dark Color of overlay when option overlay is set to dark.
 *
 * @css @background-url_LoadingIndicator-l Background-url when option size is set to default.
 * @css @background-url_LoadingIndicator-s Background-url when options size is set to small.
 * @css @background-color_LoadingIndicator Background color of Loading Indicator.
 *
 * @class Controls/Container/LoadingIndicator
 * @extends Core/Control
 * @control
 * @author Красильников А.С.
 * @public
 * @category Container
 * @demo Controls-demo/LoadingIndicator/LoadingIndicatorPG
 */

const module = Control.extend(/** @lends Controls/Container/LoadingIndicator.prototype */{
    _template: tmpl,
    _isOverlayVisible: false,
    _isMessageVisible: false,
    _isPreloading: false,
    _prevLoading: null,
    _stack: null,
    _isLoadingSaved: null,
    _delay: 2000,

    isGlobal: true,
    message: '',
    scroll: '',
    small: '',
    overlay: 'default',
    mods: null,

    _beforeMount(cfg) {
        this.mods = [];
        this._stack = new collection.List();
        this._updateProperties(cfg);
    },
    _afterMount(cfg) {
        const self = this;
        if (cfg.mainIndicator) {
            requirejs(['Controls/popup'], function(popup) {
                popup.Controller.setIndicator(self);
            });
        }
    },
    _beforeUpdate(cfg) {
        this._updateProperties(cfg);
    },
    _updateProperties(cfg) {
        if (cfg.isGlobal !== undefined) {
            this.isGlobal = cfg.isGlobal;
        }
        if (cfg.message !== undefined) {
            this.message = cfg.message;
        }
        if (cfg.scroll !== undefined) {
            this.scroll = cfg.scroll;
        }
        if (cfg.small !== undefined) {
            this.small = cfg.small;
        }
        if (cfg.overlay !== undefined) {
            this.overlay = cfg.overlay;
        }
        if (cfg.mods !== undefined) {
            // todo сделать mods строкой всегда, или вообще удалить опцию
            if (Array.isArray(cfg.mods)) {
                this.mods = cfg.mods;
            } else if (typeof cfg.mods === 'string') {
                this.mods = [cfg.mods];
            }
        }
        this.delay = cfg.delay !== undefined ? cfg.delay : this._delay;
    },

    _showHandler(event, config, waitPromise) {
        event.stopPropagation();
        return this._show(config, waitPromise);
    },

    _hideHandler(event, id) {
        event.stopPropagation();
        return this._hide(id);
    },

    /**
     * show indicator (bypassing requests of indicator showing stack)
     */
    show(config, waitPromise) {
        if (!config) {
            return this._toggleIndicator(true, {});
        }
        return this._show(config, waitPromise);
    },

    _show(config, waitPromise) {
        let isUpdate = false;
        if (this._isOpened(config)) {
            isUpdate = true;
            this._removeItem(config.id);
        }
        config = this._prepareConfig(config, waitPromise);
        this._stack.add(config);
        this._toggleIndicator(true, config, isUpdate);

        return config.id;
    },

    /**
     * hide indicator (bypassing requests of indicator showing stack)
     */
    hide(id) {
        if (!id) {

            // Used public api. In this case, hide the indicator immediately.
            this._clearStack();
            this._toggleIndicator(false, {});
        } else {
            this._hide(id);
        }
    },

    _hide(id) {
        this._removeItem(id);
        if (this._stack.getCount()) {
            this._toggleIndicator(true, this._stack.at(this._stack.getCount() - 1), true);
        } else {
            this._toggleIndicator(false);
        }
    },

    _clearStack() {
        this._stack.clear();
    },

    _isOpened(config) {
        // config is not required parameter. If config object is empty we should always create new Indicator due to absence of ID field in config
        if (!config) {
            return false;
        }
        const index = this._getItemIndex(config.id);
        if (index < 0) {
            delete config.id;
        }
        return !!config.id;
    },

    _waitPromiseHandler(config) {
        if (this._isOpened(config)) {
            this._hide(config.id);
        }
    },

    _prepareConfig(config, waitPromise) {
        if (typeof config !== 'object') {
            config = {
                message: config
            };
        }
        if (!config.hasOwnProperty('overlay')) {
            config.overlay = 'default';
        }
        if (!config.hasOwnProperty('id')) {
            config.id = randomId();
        }
        if (!config.hasOwnProperty('delay')) {
            config.delay = this.delay;
        }

        if (!config.waitPromise && waitPromise) {
            config.waitPromise = waitPromise;
            config.waitPromise.then(this._waitPromiseHandler.bind(this, config));
            config.waitPromise.catch(this._waitPromiseHandler.bind(this, config));
        }
        return config;
    },

    _removeItem(id) {
        const index = this._getItemIndex(id);
        if (index > -1) {
            this._stack.removeAt(index);
        }
    },

    _getItemIndex(id) {
        return this._stack.getIndexByValue('id', id);
    },

    _getDelay(config) {
        return typeof config.delay === 'number' ? config.delay : this.delay;
    },

    _getOverlay(overlay: string): string {
        // if overlay is visible, but message don't visible, then overlay must be transparent.
        if (this._isOverlayVisible && !this._isMessageVisible) {
            return 'default';
        }
        return  overlay;
    },

    _toggleIndicator(visible, config, force) {
        clearTimeout(this.delayTimeout);
        if (visible) {
            this._toggleOverlay(true, config);
            if (force) {
                this._toggleIndicatorVisible(true, config);
            } else {
                // if we have indicator in stack, then don't hide overlay
                this._toggleIndicatorVisible(this._stack.getCount() !== 1, config);
                this.delayTimeout = setTimeout(() => {
                    this._toggleIndicatorVisible(true, config);
                    this._forceUpdate();
                }, this._getDelay(config));
            }
        } else {
            // if we dont't have indicator in stack, then hide overlay
            if (this._stack.getCount() === 0) {
                this._toggleIndicatorVisible(false);
                this._toggleOverlay(false, {});
            }
        }
        this._forceUpdate();
    },
    _toggleOverlay(toggle: boolean, config): void {
        this._isOverlayVisible = toggle && config.overlay !== 'none';
    },

    _toggleIndicatorVisible(toggle: boolean, config?: object): void {
        if (toggle) {
            this._isMessageVisible = true;
            this._isOverlayVisible = true;
            this._updateProperties(config);
        } else {
            this._isMessageVisible = false;
        }
    }
});

export = module;

