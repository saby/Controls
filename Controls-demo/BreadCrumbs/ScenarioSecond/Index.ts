import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import controlTemplate = require('wml!Controls-demo/BreadCrumbs/ScenarioSecond/ScenarioSecond');
import firstColumnTemplate = require('wml!Controls-demo/BreadCrumbs/Scenarios/First/columnTemplate');
import secondColumnTemplate = require('wml!Controls-demo/BreadCrumbs/Scenarios/Second/columnTemplate');
import secondHeaderTemplate = require('wml!Controls-demo/BreadCrumbs/Scenarios/Second/headerTemplate');

import fifthResultTemplate = require('wml!Controls-demo/BreadCrumbs/Scenarios/Fifth/resultTemplate');
import fifthColumnTemplate = require('wml!Controls-demo/BreadCrumbs/Scenarios/Fifth/columnTemplate');

import * as MemorySourceFilter from 'Controls-demo/Utils/MemorySourceFilter';
import {HierarchicalMemory} from 'Types/source';
import {constants} from 'Env/Env';
import {Memory} from 'Types/source';
import {Model} from 'Types/entity';

class ScenarioSecond extends Control<IControlOptions> {
    protected _template: TemplateFunction = controlTemplate;
    protected _root4: number = 11;
    protected _root5: number = 11;
    protected _firstColumnTemplate: TemplateFunction = firstColumnTemplate; //
    protected _secondColumnTemplate: TemplateFunction = secondColumnTemplate;
    protected _secondHeaderTemplate: TemplateFunction = secondHeaderTemplate;
    protected _fifthResultTemplate: TemplateFunction = fifthResultTemplate;
    protected _fifthColumnTemplate: TemplateFunction = fifthColumnTemplate;
    protected _columns;
    protected _columns1;
    protected _columns4;
    protected _viewSource1;
    protected _viewSource4;
    protected _viewSource8;
    protected _header4;
    protected _header5;
    protected _toolbarSource7: Memory;
    protected _breadCrumbs6;
    protected _breadCrumbs7;
    protected _breadCrumbs8;
    protected _filter8;

    protected _beforeMount(): void {
        this._columns = [{
            template: this._firstColumnTemplate,
            width: 'auto'
        }];
        this._columns1 = [{
            displayProperty: 'title'
        }, {
            displayProperty: 'price',
            align: 'right',
            template: this._secondColumnTemplate
        }, {
            displayProperty: 'remainder',
            align: 'right',
            template: this._secondColumnTemplate
        }, {
            displayProperty: 'free',
            align: 'right',
            template: this._secondColumnTemplate
        }, {
            displayProperty: 'costPrice',
            align: 'right',
            template: this._secondColumnTemplate
        }, {
            displayProperty: 'amountOfBalance',
            align: 'right',
            template: this._secondColumnTemplate
        }];
        this._viewSource1 = new HierarchicalMemory({
            keyProperty: 'id',
            parentProperty: 'parent',
            data: [{
                id: 1,
                'parent': null,
                'parent@': true,
                title: 'Оборудование'
            }, {
                id: 2,
                'parent': 1,
                'parent@': true,
                title: '05. Торговое оборудование '
            }, {
                id: 3,
                'parent': 2,
                'parent@': true,
                title: 'Кассовые аппараты'
            }, {
                id: 4,
                'parent': 3,
                'parent@': true,
                title: 'Контрольно кассовые машины'
            }, {
                id: 5,
                'parent': 4,
                'parent@': true,
                title: 'Онлайн кассы'
            }, {
                id: 6,
                'parent': 5,
                'parent@': true,
                title: '02. Онлайн-кассы в соответствии с 54-ФЗ '
            }, {
                id: 7,
                'parent': 6,
                'parent@': true,
                title: '10. Комплекты модернизации'
            }, {
                id: 8,
                'parent': 7,
                'parent@': true,
                title: 'Под заказ'
            }, {
                id: 9,
                'parent': 8,
                'parent@': true,
                title: 'С фискальным накопителем '
            }, {
                id: 10,
                'parent': 9,
                'parent@': true,
                title: '01. Фискальные регистраторы Viki Print'
            }, {
                id: 11,
                'parent': 10,
                'parent@': true,
                title: 'С фискальным накопителем на 36 мес.'
            }, {
                id: 12,
                'parent': 11,
                'parent@': null,
                title: 'Фискальный регистратор Viki Print 57 Plus Ф',
                price: 28490,
                remainder: 43,
                free: 40,
                costPrice: 15795,
                amountOfBalance: 28490
            }]
        });
        this._header4 = [{
            title: ''
        }, {
            title: 'Сотрудник должен',
            align: 'right'
        }, {
            title: 'Сотруднику должны',
            align: 'right'
        }, {
            title: 'Срок',
            align: 'right'
        }, {
            title: 'Дата',
            align: 'right'
        }];
        this._columns4 = [{
            displayProperty: 'department',
            template: this._firstColumnTemplate,
            resultTemplate: this._fifthResultTemplate
        }, {
            displayProperty: 'employeeOwes',
            align: 'right',
            template: this._fifthColumnTemplate,
            resultTemplate: this._fifthResultTemplate,
            result: 2862396.00
        }, {
            displayProperty: 'orgOwes',
            align: 'right',
            template:  this._fifthColumnTemplate,
            resultTemplate:  this._fifthResultTemplate,
            result: 4203146.00
        }, {
            displayProperty: 'termInDays',
            align: 'right',
            resultTemplate: this._fifthResultTemplate
        }, {
            displayProperty: 'date',
            align: 'right',
            resultTemplate: this._fifthResultTemplate
        }];
        this._viewSource4 = new HierarchicalMemory({
            keyProperty: 'id',
            parentProperty: 'parent',
            data: [{
                id: 1,
                parent: null,
                'parent@': true,
                department: 'Управление региональной сети',
                employeeOwes: 1452964.00,
                orgOwes: 2651962.00,
                termInDays: 932,
                date: '21.03.16'
            }, {
                id: 11,
                parent: 1,
                'parent@': true,
                department: 'Отдел администрирования',
                employeeOwes: 102964.00,
                orgOwes: 951962.00,
                termInDays: 32,
                date: '21.03.16'
            }, {
                id: 111,
                parent: 11,
                'parent@': null,
                name: 'Белоконь Дарья',
                phone: 6377,
                position: 'Руководитель группы',
                photo: constants.resourceRoot + 'Controls-demo/BreadCrumbs/Scenarios/images/Belokon.png',
                employeeOwes: 2964.00,
                orgOwes: 1962.00,
                termInDays: 28,
                date: '21.03.16'
            }]
        });
        this._breadCrumbs6 = [
            new Model({
                keyProperty: 'id',
                rawData: {
                    id: 1,
                    title: 'Солнце-море-пляж'
                }
            }), new Model({
                keyProperty: 'id',
                rawData: {
                    id: 2,
                    title: 'Сардиния'
                }
            })];
        this._toolbarSource7 = new Memory({
            keyProperty: 'id',
            data: [
                {
                    id: '1',
                    icon: 'icon-Print',
                    title: 'Распечатать',
                    '@parent': false,
                    parent: null,
                    viewMode: 'iconToolbar'
                },
                {
                    id: '2',
                    icon: 'icon-RelatedDocumentsDown',
                    title: 'Связанные документы',
                    '@parent': false,
                    parent: null,
                    viewMode: 'iconToolbar'
                },
                {
                    id: '3',
                    icon: 'icon-Question2',
                    title: 'Задать вопрос',
                    '@parent': false,
                    parent: null,
                    viewMode: 'iconToolbar'
                }
            ]
        });

        this._viewSource8 = new HierarchicalMemory({
            keyProperty: 'id',
            parentProperty: 'parent',
            filter: MemorySourceFilter(),
            data: [{
                id: 1,
                department: 'Продвижение СБИС',
                parent: null,
                '@parent': true
            }, {
                id: 2,
                department: 'Филиальная сеть',
                parent: 1,
                '@parent': true
            }, {
                id: 3,
                department: 'Работа с партнёрами',
                parent: 1,
                '@parent': true
            }, {
                id: 4,
                name: 'Новикова Елена',
                photo: constants.resourceRoot + 'Controls-demo/BreadCrumbs/Scenarios/images/NovikovaE.png',
                position: 'Менеджер по работе с партнёрами',
                phone: '5136',
                parent: 3,
                '@parent': null
            }, {
                id: 5,
                department: '2-й дивизион',
                parent: 2,
                '@parent': true
            }, {
                id: 6,
                department: '4-й дивизион',
                parent: 2,
                '@parent': true
            }, {
                id: 7,
                department: '7700 Тензор - Москва (Андропова)',
                parent: 5,
                '@parent': true
            }, {
                id: 8,
                department: 'Инженеры',
                parent: 7,
                '@parent': true
            }, {
                id: 9,
                name: 'Новиков Дмитрий',
                photo: constants.resourceRoot + 'Controls-demo/BreadCrumbs/Scenarios/images/Novikov2.png',
                position: 'Инженер-программист (ЭО)',
                phone: '4357',
                parent: 8,
                '@parent': null
            }, {
                id: 10,
                department: '7002 Тензор - Томск',
                parent: 6,
                '@parent': true
            }, {
                id: 11,
                department: 'Менеджеры',
                parent: 10,
                '@parent': true
            }, {
                id: 12,
                name: 'Новикова Яна',
                photo: constants.resourceRoot + 'Controls-demo/BreadCrumbs/Scenarios/images/NovikovaY.png',
                position: 'Менеджер по продажам',
                phone: '7435',
                parent: 11,
                '@parent': null
            }]
        });
        this._filter8 = {};
        this._header5 = [{
            title: 'Название'
        }, {
            title: 'Цена',
            align: 'right',
            template: this._secondHeaderTemplate
        }, {
            title: 'Остаток',
            align: 'right',
            template: this._secondHeaderTemplate
        }, {
            title: 'Свободно',
            align: 'right',
            template: this._secondHeaderTemplate
        }, {
            title: 'Себестоимость',
            align: 'right',
            template: this._secondHeaderTemplate
        }, {
            title: 'Сумма остатка',
            align: 'right',
            template: this._secondHeaderTemplate
        }];
        this._breadCrumbs7 = [
            new Model({
                keyProperty: 'id',
                rawData: {
                    id: 1,
                    title: 'Папка 1'
                }
            }), new Model({
                keyProperty: 'id',
                rawData: {
                    id: 2,
                    title: 'Папка с длинным названием 2'
                }
            }), new Model({
                keyProperty: 'id',
                rawData: {
                    id: 3,
                    title: 'Папка с длинным названием 3'
                }
            }), new Model({
                keyProperty: 'id',
                rawData: {
                    id: 4,
                    title: 'Папка с длинным названием 4'
                }
            }), new Model({
                keyProperty: 'id',
                rawData: {
                    id: 5,
                    title: 'Папка с длинным названием 5'
                }
            })];
        this._breadCrumbs8 = [
            new Model({
                keyProperty: 'id',
                rawData: {
                    id: 1,
                    title: 'Папка с длинным названием 1'
                }
            }), new Model({
                keyProperty: 'id',
                rawData: {
                    id: 2,
                    title: 'Папка с длинным названием 2'
                }
            })];
    }


    static _theme: string[] = ['Controls/Classes'];

    static _styles: string[] = ['Controls-demo/Controls-demo', 'Controls-demo/BreadCrumbs/Scenarios/Scenarios'];
}
export default ScenarioSecond;
