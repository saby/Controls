define('Controls-demo/Compatible/Events/Page', [
    'UI/Base',
    'wml!Controls-demo/Compatible/Events/Page',
    'Env/Env',
    'Controls-demo/Compatible/Events/CompatibleParent'
], function (Base, template, env) {
    'use strict';

    var ModuleClass = Base.Control.extend(
        {
            _template: template,
            _beforeMount: function() {
                env.constants.compat = true;
            }
        }
    );
    return ModuleClass;
});
