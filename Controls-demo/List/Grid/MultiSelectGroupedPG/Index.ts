import {Control, TemplateFunction, IControlOptions} from 'UI/Base';
import {Memory} from 'Types/source';
import {RecordSet} from 'Types/collection';
import {Record} from 'Types/entity';

import * as dataDemoPG from 'Controls-demo/List/Grid/resources/DataDemoPG';

import * as cfg from 'json!Controls-demo/List/Grid/MultiSelectGroupedPG/property-grid-cfg';

import * as template from 'wml!Controls-demo/List/Grid/MultiSelectGroupedPG/MultiSelectGroupedPG';


export default class MultiSelectGroupedPG extends Control<IControlOptions> {
    _template: TemplateFunction = template;
    _metaData: null;
    _content: string = 'Controls/grid:View';
    _dataObject: {};
    _componentOptions: {
        collapsedGroups: [];
        keyProperty: string;
        name: string;
        markedKey: string;
        columns: {
            displayProperty: string;
            width: string;
            textOverflow: string;
            align: string;
            template: string;
        };
        header: {
            title: string;
            width: string;
            align: string;
        };
        source: Memory,
        displayProperty: string;
        selectedKeys: [],
        excludedKeys: [],
        groupingKeyCallback: (item: Record) => string;
        dataLoadCallback: (items: RecordSet) => void;
        groupTemplate: string;
        multiSelectVisibility: string;
    };

    protected _beforeMount(options?: IControlOptions, contexts?: object, receivedState?: void): Promise<void> | void {

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
            keyProperty: 'id',
            name: 'MultiSelectGroupedGridPG',
            collapsedGroups: [],
            markedKey: '4',
            columns: dataDemoPG.partialColumns,
            header: dataDemoPG.partialHeader,
            source: new Memory({
                keyProperty: 'id',
                data: dataDemoPG.catalog
            }),
            displayProperty: 'title',
            selectedKeys: [],
            excludedKeys: [],
            groupingKeyCallback: this._groupByGenre,
            dataLoadCallback: this._dataLoadCallback,
            groupTemplate: 'Controls/grid:GroupTemplate',
            multiSelectVisibility: 'hidden'
        };
        this._metaData = cfg[this._content].properties['ws-config'].options;
    }

    protected _groupByGenre(item: Record): string {
        return item.get('genre');
    }

    protected _groupByYear(item: Record): string {
        return item.get('year');
    }

    protected _dataLoadCallback(items: RecordSet): void {
        const rates = {};

        // Average films rating in genre and year
        items.getRawData().forEach((item) => {
            if (rates[item.genre] !== undefined) {
                rates[item.genre] = (rates[item.genre] + item.rating) / 2;
            } else {
                rates[item.genre] = item.rating;
            }
            if (rates[item.year] !== undefined) {
                rates[item.year] = (rates[item.year] + item.rating) / 2;
            } else {
                rates[item.year] = item.rating;
            }
        });

        items.setMetaData({
            groupResults: rates
        });
    }

    static _styles: string[] = ['Controls-demo/Filter/Button/PanelVDom', 'Controls-demo/Input/resources/VdomInputs', 'Controls-demo/Wrapper/Wrapper'];
}
