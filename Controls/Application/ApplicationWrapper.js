define("Controls/Application/ApplicationWrapper", ["require", "exports", "tslib", "UI/Base", "wml!Controls/Application/ApplicationWrapper", "Env/Env", "css!Controls/application"], function (require, exports, tslib_1, Base_1, template, Env_1) {
    "use strict";
    return /** @class */ (function (_super) {
        tslib_1.__extends(ApplicationWrapper, _super);
        function ApplicationWrapper() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this._template = template;
            return _this;
        }
        ApplicationWrapper.prototype._beforeMount = function () {
            this.headJson = [
                ['link',
                    {
                        rel: 'stylesheet',
                        type: 'text/css',
                        href: '/materials/resources/SBIS3.CONTROLS/themes/online/online.css'
                    }
                ]
            ];
            if (Env_1.constants.isBrowserPlatform) {
                this._version = ApplicationWrapper._calculateVersion(window.location.search);
            }
        };
        ApplicationWrapper._calculateVersion = function (search) {
            var matchVersion = search.match(/(^\?|&)x_version=(.*)/);
            return matchVersion && matchVersion[2];
        };
        return ApplicationWrapper;
    }(Base_1.Control));
});
