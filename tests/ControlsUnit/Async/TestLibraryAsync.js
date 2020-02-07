define(['tslib', 'UI/Base', 'wml!ControlsUnit/Async/TestControlAsync'], function (tslib, Base, template) {
    var ExportControl = /** @class */ (function (_super) {
        tslib.__extends(ExportControl, _super);
        function ExportControl() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this._template = template;
            return _this;
        }
        return ExportControl
    })(Base.Control)

    return {
        exportFunction: function(echo) { return echo; },
        exportSyncFunction: function(echo) { return echo; },
        ExportControl: ExportControl
    };
});