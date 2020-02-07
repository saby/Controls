define('ControlsUnit/Async/TestControlAsync', [
    'UI/Base',
    'wml!ControlsUnit/Async/TestControlAsync'
],
function (UiBase, template) {
    return {
        default: UiBase.Control.extend({
            _template: template
        })
    };
});
