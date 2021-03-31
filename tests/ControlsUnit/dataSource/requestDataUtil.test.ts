import {requestDataUtil} from 'Controls/dataSource';
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
};

function getSource(): Memory {
    return new Memory({
        data: getDataArray(),
        keyProperty: 'id'
    });
}

describe('Controls/dataSource:requestDataUtil', () => {

    it('requestDataUtil', async() => {
        const loadDataConfig = {
            source: getSource()
        };
        const loadDataResult = await requestDataUtil(loadDataConfig);

        ok(loadDataResult.data.getCount() === 5);
        deepStrictEqual(loadDataResult.data.getRawData(), getDataArray());
    });

    it('requestDataUtil with filter', async () => {
        const loadDataConfig = {
            source: getSource(),
            filter: {
                title: 'Sasha'
            }
        };
        const loadDataResult = await requestDataUtil(loadDataConfig);
        ok(loadDataResult.data.getCount() === 1);
    });

    it('requestDataUtil with filterButtonSource', async () => {
        const loadDataConfigWithFilter = {
            source: getSource(),
            filter: {},
            filterButtonSource: [
                {
                    name: 'title', value: 'Sasha', textValue: 'Sasha'
                }
            ]
        };
        const loadDataResult = await requestDataUtil(loadDataConfigWithFilter);

        ok(loadDataResult.data.getCount() === 1);
        deepStrictEqual(
            loadDataResult.filter,
            {
                title: 'Sasha'
            }
        );
    });

});
