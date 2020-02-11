import 'Core/polyfill/PromiseAPIDeferred';

import {assert} from 'chai';
import {NavigationController} from 'Controls/source';
import {INavigationOptionValue} from 'Controls/interface';
import {RecordSet} from 'Types/collection';
import {Remote, Query, DataSet, Memory} from 'Types/source';
import {Record} from 'Types/entity';
import {TNavigationDirection, TNavigationSource, TNavigationView} from 'Controls/_interface/INavigation';
import {IOptions} from 'Types/_source/Local';

export const fakeNavigationControllerNavigation = (source: TNavigationSource, view: TNavigationView, direction: TNavigationDirection, hasMore: boolean): INavigationOptionValue => {
    return {
        source,
        view,
        viewConfig: {
            pagingMode: 'direct'
        },
        sourceConfig: {
            limit: 10,
            position: 2,
            direction,
            field: 'key',
            pageSize: 3,
            page: 0,
            hasMore
        }
    };
};

export const dataFaker = (query?: Query): Array<{[p: string]: string | number}> => {
    return [
        {key: 1, buyerId: 1, date: '2016-06-01 12:12:45', amount: 96},
        {key: 2, buyerId: 2, date: '2016-06-02 09:01:12', amount: 174},
        {key: 3, buyerId: 1, date: '2016-06-03 10:24:28', amount: 475},
        {key: 4, buyerId: 1, date: '2016-06-02 14:12:45', amount: 96},
        {key: 5, buyerId: 2, date: '2016-06-02 16:01:12', amount: 174},
        {key: 6, buyerId: 1, date: '2016-06-04 13:24:28', amount: 475},
        {key: 7, buyerId: 1, date: '2016-06-05 14:12:45', amount: 96},
        {key: 8, buyerId: 2, date: '2016-06-05 16:01:12', amount: 174},
        {key: 9, buyerId: 1, date: '2016-06-06 17:24:28', amount: 475}
    ];
};

class DataSetFaker {
    private readonly _query: Query;

    constructor(query: Query) {
        this._query = query;
    }

    query(): DataSet {
        return new DataSet({
            rawData: {
                orders: dataFaker(this._query),
                buyers: [
                    {id: 1, email: 'tony@stark-industries.com', phone: '555-111-222'},
                    {id: 2, email: 'steve-rogers@avengers.us', phone: '555-222-333'}
                ],
                total: {
                    dateFrom: '2016-06-01 00:00:00',
                    dateTo: '2016-07-01 00:00:00',
                    amount: 745,
                    deals: 9,
                    completed: 6,
                    paid: 6,
                    awaited: 3,
                    rejected: 0
                },
                executeDate: '2016-06-27 11:34:57'
            },
            itemsProperty: 'orders',
            keyProperty: 'key'
        });
    }
    static instance = (query?: Query): DataSetFaker => {
        return new DataSetFaker(query);
    }
}

class NavigationControllerSourceFaker extends Remote {
    constructor(options?: IOptions) {
        super(options);
    }

    create(meta?: object): Promise<Record> {
        return undefined;
    }

    destroy(keys: number | string | number[] | string[], meta?: object): Promise<null> {
        return undefined;
    }

    query(query?: Query): Promise<DataSet> {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve(DataSetFaker.instance(query).query());
            }, 2000);
        });
    }

    read(key: number | string, meta?: object): Promise<Record> {
        return undefined;
    }

    update(data: Record | RecordSet, meta?: object): Promise<null> {
        return undefined;
    }

    static instance(options?: IOptions): NavigationControllerSourceFaker {
        return new NavigationControllerSourceFaker(options);
    }
}

/**
 * @see also tests/ControlsUnit/Controllers/SourceController.test.js
 */
describe('Controls/_source/NavigationController', () => {
    const keyProperty: string = 'id';

    describe('load', () => {
        it('Should load data + PagePaginatorController', () => {
            const source = NavigationControllerSourceFaker.instance();
            const controller = new NavigationController({
                source,
                keyProperty,
                navigation: fakeNavigationControllerNavigation('page', 'pages', 'after', false)
            });
            return controller.load()
                .then((recordSet) => {
                    const expectedSet: RecordSet = DataSetFaker.instance().query().getAll();
                    assert.equal(recordSet.at(0).get('key'), expectedSet.at(0).get('key'));
                    assert.equal(recordSet.at(1).get('key'), expectedSet.at(1).get('key'));
                });
        });
        it('Should load data + PositionPaginatorController', () => {
            const source = NavigationControllerSourceFaker.instance();
            const controller = new NavigationController({
                source,
                keyProperty,
                navigation: fakeNavigationControllerNavigation('position', 'infinity', 'after', false)
            });
            return controller.load()
                .then((recordSet) => {
                    const expectedSet: RecordSet = DataSetFaker.instance().query().getAll();
                    assert.equal(recordSet.at(0).get('key'), expectedSet.at(0).get('key'));
                    assert.equal(recordSet.at(1).get('key'), expectedSet.at(1).get('key'));
                });
        });
        it('Should work with Types/source:Memory', () => {
            const data = dataFaker();
            const source = new Memory({
                keyProperty: 'key',
                data
            });
            const controller = new NavigationController({
                source,
                keyProperty: 'key',
                navigation: fakeNavigationControllerNavigation('page', 'pages', 'after', false)
            });
            return controller.load()
                .then((recordSet) => {
                    assert.equal(recordSet.at(0).get('key'), data[0].key);
                    assert.equal(recordSet.at(1).get('key'), data[1].key);
                });
        });

        it('Should correctly merge query params', () => {
            // Организуем новый сурс
            const source = new Memory({
                keyProperty: 'key',
                data: dataFaker()
            });



            // инициализируем контроллер
            const controller = new NavigationController({
                source,
                keyProperty: 'key',
                navigation: fakeNavigationControllerNavigation('position', 'infinity', 'both', true)
            });
            const recordSet: RecordSet = DataSetFaker.instance().query().getAll();
            recordSet.setMetaData({more: { after: true, before: false }, nextPosition: {before: [1], after: [7]}});
            controller.calculateState(recordSet);
            return controller.load()
                .then((recordSet) => {});
        });
    });
});
