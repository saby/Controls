define('Controls-demo/List/Grid/GroupPG',
    [
        'UI/Base',
        'Types/source',
        'Controls-demo/List/Grid/resources/DataDemoPG',
        'tmpl!Controls-demo/PropertyGrid/DemoPG',
        'json!Controls-demo/List/Grid/resources/GroupPG/cfg',
        'Controls/grid',
        'wml!Controls-demo/List/Grid/resources/GroupPG/rightGroupTemplate',
        'wml!Controls-demo/List/Grid/resources/GroupPG/withoutGroupExpander',
        'wml!Controls-demo/List/Grid/resources/DemoMoney',
        'wml!Controls-demo/List/Grid/resources/DemoRating',
        'wml!Controls-demo/List/Grid/resources/DemoItem'
    ],

    function(Base, source, data, template, config) {
        'use strict';
        var Component = Base.Control.extend({
            _template: template,
            _content: 'Controls/grid:View',

            _beforeMount: function() {

                this._dataObject = {
                    groupingKeyCallback: {
                        value: 'by genre',
                        items: [
                            { id: 1, title: 'by genre', template: this._groupByGenre },
                            { id: 2, title: 'by year', template: this._groupByYear }
                        ]
                    },
                    groupTemplate: {
                        value: 'default',
                        items: [
                            {id: 1, title: 'default', template: 'Controls/grid:GroupTemplate'},
                            {id: 2, title: 'with right template', template: 'wml!Controls-demo/List/Grid/resources/GroupPG/rightGroupTemplate'},
                            {id: 3, title: 'without expander', template: 'wml!Controls-demo/List/Grid/resources/GroupPG/withoutGroupExpander'},
                        ]
                    }
                };

                this._componentOptions = {
                    name: 'GroupGridPG',
                    keyProperty: 'id',
                    source: new source.Memory({
                        keyProperty: 'id',
                        data: data.catalog
                    }),
                    collapsedGroups: '',
                    columns: data.partialColumns,
                    displayProperty: 'title',
                    groupingKeyCallback: this._groupByGenre,
                    dataLoadCallback: this._dataLoadCallback,
                    groupTemplate: 'Controls/grid:GroupTemplate'
                };
                this._metaData = config[this._content].properties['ws-config'].options;
            },

            _groupByGenre: function(item) {
                return item.get('genre');
            },

            _groupByYear: function(item) {
                return item.get('year');
            },

            _dataLoadCallback: function(items) {
                var averageGenreRaits = {};

                // Average films rating in genre and year
                items.getRawData().forEach(function(item) {
                    if (typeof this[item.genre] !== "undefined") {
                        this[item.genre] = (this[item.genre] + item.rating) / 2;
                    } else {
                        this[item.genre] = item.rating;
                    }
                    if (typeof this[item.year] !== "undefined") {
                        this[item.year] = (this[item.year] + item.rating) / 2;
                    } else {
                        this[item.year] = item.rating;
                    }
                }, averageGenreRaits);

                items.setMetaData({
                    groupResults: averageGenreRaits
                });
            },

        });
        return Component;
    });
