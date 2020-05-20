define('Controls-demo/List/Grid/MultiselectPG',
    [
        'Core/Control',
        'Types/source',
        'Controls-demo/List/Grid/resources/DataDemoPG',
        'tmpl!Controls-demo/PropertyGrid/DemoPG',
        'json!Controls-demo/List/Grid/resources/MultiselectPG/cfg',
        'wml!Controls-demo/List/Grid/resources/DemoMoney',
        'wml!Controls-demo/List/Grid/resources/DemoRating',
    ],

    function(Control, source, data, template, config) {
        'use strict';
        var Component = Control.extend({
            _template: template,
            _metaData: null,
            _content: 'Controls/grid:View',
            _dataObject: {},
            _componentOptions: null,

            _beforeMount: function() {

               this._componentOptions = {
                  keyProperty: 'id',
                  name: 'MultiSelectGridPG',
                  markedKey: '4',
                  columns: data.partialColumns,
                  header: data.partialHeader,
                  source: new source.Memory({
                     keyProperty: 'id',
                     data: data.catalog
                  }),
                  displayProperty: 'title',
                  selectedKeys: [],
                  excludedKeys: [],
                  multiSelectVisibility: 'visible'
               };


                this._metaData = config[this._content].properties['ws-config'].options;
            }
        });
        Component._styles = ['Controls-demo/Filter/Button/PanelVDom', 'Controls-demo/Input/resources/VdomInputs', 'Controls-demo/Wrapper/Wrapper'];

        return Component;
    });
