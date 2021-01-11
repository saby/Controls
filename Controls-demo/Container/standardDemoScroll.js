define('Controls-demo/Container/standardDemoScroll', [
    'UI/Base',
    'tmpl!Controls-demo/Container/standardDemoScroll',
], function(Base, template) {
    'use strict';

    var ModuleClass = Base.Control.extend({
        _template: template,
        _menuItems: null,
        _numberItems: 15,
        _demoText: 'Develop the theme of the "Scroll Container" component for Presto and Retail projects.\
            In the repository https://git.sbis.ru/sbis/themes in the corresponding modules it is necessary to determine\
            less-variable for the theme\'s coefficients in accordance with the specification and the auto-documentation\
            for the component (see references in the overarching task).',

        _beforeMount: function() {
            var
                menuItems = ['My Tasks', 'Contacts', 'Business', 'Accounting', 'Employees', 'Documents', 'Companies',
                    'Calendar', 'My Page', 'Our Company'];

            this._menuItems = menuItems;
        }
    });

    ModuleClass._styles = ['Controls-demo/Container/standardDemoScroll'];

    return ModuleClass;
});
