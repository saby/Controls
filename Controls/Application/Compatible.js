define("Controls/Application/Compatible", ["require", "exports", "tslib", "UI/Base", "wml!Controls/Application/Compatible", "Core/Deferred", "Lib/Control/LayerCompatible/LayerCompatible", "Env/Event", "Env/Env", "wml!Controls/Application/CompatibleScripts"], function (require, exports, tslib_1, Base_1, template, Deferred, Layer, Event_1, Env_1) {
    "use strict";
    return /** @class */ (function (_super) {
        tslib_1.__extends(ViewTemplate, _super);
        function ViewTemplate() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this._template = template;
            return _this;
        }
        ViewTemplate.prototype._beforeMount = function () {
            try {
                /* TODO: set to presentation service */
                process.domain.req.compatible = true;
            }
            catch (e) {
            }
            var rightsInitialized = new Deferred();
            this._forceUpdate = function () {
            };
            if (Env_1.constants.isBrowserPlatform) {
                Env_1.constants.rights = true;
                Layer.load(undefined, true).addCallback(function () {
                    rightsInitialized.callback();
                });
                return rightsInitialized;
            }
        };
        ViewTemplate.prototype._afterMount = function () {
            for (var i in this._children) {
                this._children[i]._forceUpdate = function () {
                };
                this._children[i]._shouldUpdate = function () {
                    return false;
                };
            }
            require(['Lib/StickyHeader/StickyHeaderMediator/StickyHeaderMediator'], function () {
                Event_1.Bus.globalChannel().notify('bootupReady', { error: '' });
            });
        };
        ViewTemplate.prototype._shouldUpdate = function () {
            return false;
        };
        return ViewTemplate;
    }(Base_1.Control));
});
