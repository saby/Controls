define('Controls-demo/Container/standardDemoScroll', [
    'Core/Control',
    'tmpl!Controls-demo/Container/standardDemoScroll',
    'Types/source',
], function(Control, template, source) {
    'use strict';

    var
        VAT = 18,
        COEFFICIENT_OF_PROFIT = 1.25;

    var currentId = 0;

    function _getDemoData() {
        return [
            _generateData('Keyboard SVEN s707', 2, 2540),
            _generateData('Mouse Logitech PS 15', 17, 1050),
            _generateData('Storage device', 11, 750),
            _generateData('The right to use sbis.ru account for one year', 1, 4500),
            _generateData('Software Dr.Web', 100, 1570),
            _generateData('Mouse Logitech PS 15', 100, 1050),
            _generateData('Storage device', 35, 1150),
            _generateData('Keyboard SVEN s707', 2, 2540),
            _generateData('The right to use sbis.ru account for one year', 2, 4500),
            _generateData('Storage device', 11, 750),
            _generateData('Keyboard SVEN s707', 2, 2540),
            _generateData('Mouse Logitech PS 15', 17, 1050),
            _generateData('Keyboard SVEN s707', 2, 2540),
            _generateData('The right to use sbis.ru account for one year', 1, 4500),
            _generateData('Software Dr.Web', 100, 1570)
        ];
    }

    function _generateData(name, amount, costPrice) {
        var
            price = costPrice * COEFFICIENT_OF_PROFIT,
            sum = amount * price;

        return {
            id: currentId++,
            name: name,
            amount: amount,
            costPrice: costPrice,
            price: price,
            VAT: VAT,
            VAT_sum: sum * VAT / 100,
            sum: sum
        };
    }

    var ModuleClass = Control.extend({
        _template: template,
        _menuItems: null,
        _numberItems: 15,
        _demoText: 'Develop the theme of the "Scroll Container" component for Presto and Retail projects.\
            In the repository https://git.sbis.ru/sbis/themes in the corresponding modules it is necessary to determine\
            less-variable for the theme\'s coefficients in accordance with the specification and the auto-documentation\
            for the component (see references in the overarching task).',

        _viewSource: null,
        _gridColumns: null,
        _gridHeader: null,

        _beforeMount: function() {
            var
                menuItems = ['My Tasks', 'Contacts', 'Business', 'Accounting', 'Employees', 'Documents', 'Companies',
                    'Calendar', 'My Page', 'Our Company'],
                viewSource = new source.Memory({
                    data: _getDemoData(),
                    keyProperty: 'id'
                }),
                gridColumns = [{
                    width: '40%',
                    displayProperty: 'name'
                }, {
                    displayProperty: 'amount'
                }, {
                    displayProperty: 'costPrice'
                }, {
                    displayProperty: 'price'
                }, {
                    displayProperty: 'VAT_sum'
                }, {
                    displayProperty: 'VAT'
                }, {
                    displayProperty: 'sum'
                }],
                gridHeader = [{
                    title: 'Name'
                }, {
                    title: 'Amount'
                }, {
                    title: 'Cost price'
                }, {
                    title: 'Price'
                }, {
                    title: 'VAT'
                }, {
                    title: '%'
                }, {
                    title: 'Sum'
                }];

            this._menuItems = menuItems;
            this._viewSource = viewSource;
            this._gridColumns = gridColumns;
            this._gridHeader = gridHeader;
        }
    });

    ModuleClass._styles = ['Controls-demo/Container/standardDemoScroll'];

    return ModuleClass;
});
