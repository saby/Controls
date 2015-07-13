define('js!SBIS3.TestButtonOnline',
    [
        'js!SBIS3.CORE.CompoundControl',
        'html!SBIS3.TestButtonOnline',
        'css!SBIS3.TestButtonOnline',
        'js!SBIS3.CORE.Button',
        'js!SBIS3.CONTROLS.Button',
        'js!SBIS3.CONTROLS.MenuButton'
    ], function (CompoundControl, dotTplFn) {

        var moduleClass = CompoundControl.extend({

            _dotTplFn: dotTplFn,

            $protected: {
                _options: {}
            },

            $constructor: function () {
            },

            init: function () {
                moduleClass.superclass.init.call(this);
            }
        });

        moduleClass.webPage = {
            outFileName: "regression_button_online",
            htmlTemplate: "/intest/pageTemplates/onlineTemplate.html"
        };

        return moduleClass;
    });
