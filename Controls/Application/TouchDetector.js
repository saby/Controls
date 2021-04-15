define("Controls/Application/TouchDetector", ["require", "exports", "tslib", "UI/Base", "wml!Controls/Application/TouchDetector/TouchDetector", "Env/Touch", "Controls/context"], function (require, exports, tslib_1, Base_1, template, Touch_1, context_1) {
    "use strict";
    return /** @class */ (function (_super) {
        tslib_1.__extends(TouchDetector, _super);
        function TouchDetector() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this._template = template;
            return _this;
        }
        TouchDetector.prototype._beforeMount = function () {
            this._touchDetector = Touch_1.TouchDetect.getInstance();
            this._touchObjectContext = new context_1.TouchContextField.create();
        };
        TouchDetector.prototype.isTouch = function () {
            return this._touchDetector.isTouch();
        };
        TouchDetector.prototype.getClass = function () {
            return this._touchDetector.getClass();
        };
        // Объявляем функцию, которая возвращает поля Контекста и их значения.
        // Имя функции фиксировано.
        TouchDetector.prototype._getChildContext = function () {
            // Возвращает объект.
            return {
                isTouch: this._touchObjectContext
            };
        };
        return TouchDetector;
    }(Base_1.Control));
});
