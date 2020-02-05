define('ControlsUnit/Async/TestControlSync', [
    'UI/Base',
    'wml!ControlsUnit/Async/TestControlSync'
],
function (UiBase, template) {
    return {
        default: UiBase.Control.extend({
            _template: template
        })
    };
});
