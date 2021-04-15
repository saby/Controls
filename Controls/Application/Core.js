define("Controls/Application/Core", ["require", "exports", "tslib", "UI/Base", "UI/State", "wml!Controls/Application/Core", "Application/Env", "UI/theme/controller", "Controls/Application/HeadData"], function (require, exports, tslib_1, Base_1, State_1, template, Env_1, controller_1, HeadData) {
    "use strict";
    return /** @class */ (function (_super) {
        tslib_1.__extends(Core, _super);
        function Core(cfg) {
            var _this = _super.call(this, cfg) || this;
            _this._template = template;
            _this.coreTheme = '';
            try {
                /* TODO: set to presentation service */
                process.domain.req.compatible = false;
            }
            catch (e) {
            }
            var headData = new HeadData([], true);
            // Временно положим это в HeadData, потом это переедет в константы реквеста
            // Если запуск страницы начинается с Controls/Application/Core, значит мы находимся в новом окружении
            headData.isNewEnvironment = true;
            Env_1.setStore('HeadData', headData);
            State_1.AppData.initAppData(cfg);
            _this.ctxData = new State_1.AppData.getAppData();
            // Put Application/Core instance into the current request where
            // other modules can get it from
            Env_1.setStore('CoreInstance', { instance: _this });
            return _this;
        }
        Core.prototype._beforeMount = function (cfg) {
            this._application = cfg.application;
        };
        Core.prototype._beforeUpdate = function (cfg) {
            if (this._applicationForChange) {
                this._application = this._applicationForChange;
                this._applicationForChange = null;
            }
            else {
                this._application = cfg.application;
            }
        };
        Core.prototype.setTheme = function (ev, theme) {
            this.coreTheme = theme;
            controller_1.getThemeController().setTheme(theme).catch(function (e) {
                require(['UI/Utils'], function (Utils) {
                    Utils.Logger.error(e.message);
                });
            });
        };
        Core.prototype.changeApplicationHandler = function (e, app) {
            var _a;
            var result;
            if (this._application !== app) {
                this._applicationForChange = app;
                var headData = Env_1.getStore('HeadData');
                (_a = headData) === null || _a === void 0 ? void 0 : _a.resetRenderDeferred();
                this._forceUpdate();
                result = true;
            }
            else {
                result = false;
            }
            return result;
        };
        return Core;
    }(Base_1.Control));
});
