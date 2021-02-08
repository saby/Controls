import {DataLoader} from 'Controls/dataSource';
import {Memory} from 'Types/source';
import {ok, deepStrictEqual} from 'assert';

function getDataArray(): object[] {
    return [
        {
            id: 0,
            title: 'Sasha'
        },
        {
            id: 1,
            title: 'Sergey'
        },
        {
            id: 2,
            title: 'Dmitry'
        },
        {
            id: 3,
            title: 'Andrey'
        },
        {
            id: 4,
            title: 'Aleksey'
        }
    ];
}

function getSource(): Memory {
    return new Memory({
        data: getDataArray(),
        keyProperty: 'id'
    });
}

function getDataLoaded(): DataLoader {
    return new DataLoader();
}

describe('Controls/dataSource:loadData', () => {

    it('loadData', async() => {
        const loadDataConfig = {
            source: getSource()
        };
        const loadDataResult = await getDataLoaded().load([loadDataConfig]);

        ok(loadDataResult.length === 1);
        ok(loadDataResult[0].data.getCount() === 5);
        deepStrictEqual(loadDataResult[0].data.getRawData(), getDataArray());
    });

    it('loadData with filter', async () => {
        const loadDataConfig = {
            source: getSource(),
            filter: {
                title: 'Sasha'
            }
        };
        const loadDataResult = await getDataLoaded().load([loadDataConfig]);

        ok(loadDataResult.length === 1);
        ok(loadDataResult[0].data.getCount() === 1);
    });

    it('loadData with several configs', async () => {
        const loadDataConfig = {
            source: getSource()
        };
        const loadDataConfigWithFilter = {
            source: getSource(),
            filter: {
                title: 'Sasha'
            }
        };
        const loadDataResult = await getDataLoaded().load([loadDataConfig, loadDataConfigWithFilter]);

        ok(loadDataResult.length === 2);
        ok(loadDataResult[0].data.getCount() === 5);
        ok(loadDataResult[1].data.getCount() === 1);
    });

    it('loadData with filterButtonSource', async () => {
        const loadDataConfigWithFilter = {
            source: getSource(),
            filter: {},
            filterButtonSource: [
                {
                    name: 'title', value: 'Sasha', textValue: 'Sasha'
                }
            ]
        };
        const loadDataResult = await getDataLoaded().load([loadDataConfigWithFilter]);

        ok(loadDataResult.length === 1);
        ok(loadDataResult[0].data.getCount() === 1);
        deepStrictEqual(
            loadDataResult[0].filter,
            {
                title: 'Sasha'
            }
        );
    });

});
