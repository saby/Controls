import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import template = require('wml!Controls-demo/FormController/EditInPlace/FormControllerTemplate');
import {Memory} from 'Types/source';
import * as GridData from 'Controls-demo/List/Grid/GridData';

class FormController extends Control<IControlOptions> {
    protected _template: TemplateFunction = template;

    _beforeMount(options) {
        const cellTemplates = ['wml!Controls-demo/List/EditInPlace/FirstScenario/Column',
            'wml!Controls-demo/List/Grid/DemoGroupTemplate',
            'wml!Controls-demo/List/EditInPlace/FirstScenario/Header',
            'wml!Controls-demo/List/EditInPlace/FirstScenario/HeaderButton',
            'wml!Controls-demo/List/EditInPlace/SecondScenario/Results',
            'wml!Controls-demo/List/EditInPlace/SecondScenario/FirstColumn',
            'wml!Controls-demo/List/EditInPlace/SecondScenario/SecondColumn',
            'wml!Controls-demo/List/EditInPlace/SecondScenario/Column',
            'wml!Controls-demo/List/EditInPlace/FourthScenario/Column',
            'wml!Controls-demo/List/EditInPlace/FifthScenario/Column',
            'wml!Controls-demo/List/EditInPlace/FifthScenario/SecondColumn',
            'wml!Controls-demo/List/EditInPlace/FifthScenario/Results'];

        this._gridColumns2 = [
            {
                displayProperty: 'title',
                width: '380px',
                template: 'wml!Controls-demo/List/EditInPlace/SecondScenario/FirstColumn',
                resultTemplate: 'wml!Controls-demo/List/EditInPlace/SecondScenario/Results'
            },
            {
                displayProperty: 'category',
                width: '280px',
                template: 'wml!Controls-demo/List/EditInPlace/SecondScenario/SecondColumn',
                resultTemplate: 'wml!Controls-demo/List/EditInPlace/SecondScenario/Results'
            },
            {
                displayProperty: 'NDS',
                width: '70px',
                align: 'right',
                template: 'wml!Controls-demo/List/EditInPlace/SecondScenario/Column',
                resultTemplate: 'wml!Controls-demo/List/EditInPlace/SecondScenario/Results',
                result: 1223.14
            },
            {
                displayProperty: 'percentage',
                width: '70px',
                align: 'right',
                template: 'wml!Controls-demo/List/EditInPlace/SecondScenario/Column',
                resultTemplate: 'wml!Controls-demo/List/EditInPlace/SecondScenario/Results'
            },
            {
                displayProperty: 'amount',
                width: '100px',
                align: 'right',
                template: 'wml!Controls-demo/List/EditInPlace/FirstScenario/Column',
                resultTemplate: 'wml!Controls-demo/List/EditInPlace/SecondScenario/Results',
                result: 10500
            }
        ];
        const secondExampleLookupSource = new Memory({
            keyProperty: 'id',
            data: [
                {
                    id: 0,
                    title: 'Транспортные услуги сторонние',
                    categoryNumber: '26',
                    category: 'Общественные расходы',
                    subdivision: '',
                    subdivision2: ''
                },
                {
                    id: 1,
                    title: 'Канцелярия',
                    categoryNumber: '26',
                    category: 'Общественные расходы',
                    subdivision: 'Администрация',
                    subdivision2: ''
                },
                {
                    id: 2,
                    title: 'Канцелярия',
                    categoryNumber: '26',
                    category: 'Общественные расходы',
                    subdivision: 'Администрация',
                    subdivision2: ''
                },
                {
                    id: 3,
                    title: 'Банковское обслуживание',
                    categoryNumber: '91-02',
                    category: 'Прочие расходы',
                    subdivision: 'Администрация',
                    subdivision2: 'Прочие доходы'
                }
            ]
        });
        const srcData2 = [
            {
                id: 0,
                title: 'Транспортные услуги сторонние',
                comment: 'Грузовые линии',
                category: '26 Общественные расходы',
                subdivision: '',
                subdivision2: '',
                NDS: 458.14,
                percentage: 18,
                amount: 3200,
                source: secondExampleLookupSource,
                selectedKeys: [0]
            }, {
                id: 1,
                title: 'Канцелярия',
                comment: 'Бумага офисная А4 180г',
                category: '26 Общественные расходы',
                subdivision: 'Администрация',
                subdivision2: '',
                NDS: 500.11,
                percentage: 18,
                amount: 4800,
                source: secondExampleLookupSource,
                selectedKeys: [1]
            }, {
                id: 2,
                title: 'Канцелярия',
                comment: 'Коробка для бумаг/картон',
                category: '26 Общественные расходы',
                subdivision: 'Администрация',
                subdivision2: '',
                NDS: 221.11,
                percentage: 18,
                amount: 1200,
                source: secondExampleLookupSource,
                selectedKeys: [2]
            }, {
                id: 3,
                title: 'Банковское обслуживание',
                comment: 'август 2015',
                category: '91-02 Прочие расходы',
                subdivision: 'Администрация',
                subdivision2: 'Прочие доходы',
                NDS: 289.55,
                percentage: 18,
                amount: 2500,
                source: secondExampleLookupSource,
                selectedKeys: [3]
            }
        ];
        this._viewSource2 = new Memory({
            keyProperty: 'id',
            data: srcData2
        });
        this._record = options.record;
        if (!options.source) {
            this._dataSource = new Memory({
                keyProperty: 'id',
                data: GridData.catalog.slice(0, 11)
            });
        } else {
            this._dataSource = options.source;
        }

        return new Promise((resolve) => {
            require(cellTemplates, resolve, resolve);
        });
    }

    _dataLoadCallback(items) {
        items.setMetaData({
            groupResults: {
                nonexclusive: 7000,
                works: 1400,
                goods: 93500
            }
        });
    }

    _beforeUpdate(opt) {
        if (opt.record !== this._options.record) {
            this._record = opt.record;
        }
    }

    _update() {
        return this._children.formControllerInst.update();
    }

    _delete() {
        return this._children.formControllerInst.delete();
    }

    _readSuccessedHandler(event, record) {
        this._record = record;
    }

    _createSuccessedHandler(event, record) {
        this._record = record;
    }
    _updateSuccessedHandler(event, record) {
        this._record = record;
    }
    _errorHandler(event, error) {
        let cfg = {
            message: event.type,
            details: error.message,
            style: 'error',
            type: 'ok'
        };
        // this._children.popupOpener.open(cfg);
    }
}
export default FormController;
