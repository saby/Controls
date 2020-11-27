import {ICrud, Memory, PrefetchProxy} from 'Types/source';
import {deepStrictEqual} from "assert";

import {DataLoader} from 'Controls/_dataSource/error';

describe('Controls/_dataSource/_error/DataLoader', () => {
    let memory: Memory;

    describe('load', () => {
        const getResult = async (sourcesProp, timeout = 0) => {
            const {sources, errors} = await DataLoader.load(sourcesProp, timeout);
            if (errors.length > 0) {
                const {status} = errors[0];
                return status;
            }
            const {source}: { source: ICrud | PrefetchProxy } = sources[0];
            if (source instanceof PrefetchProxy) {
                const {query} = source.getData();
                return query.getRawData();
            }
            return false;
        };

        const data = [
            {key: 1, title: 'Ярославль'},
            {key: 2, title: 'Москва'},
            {key: 3, title: 'Санкт-Петербург'}
        ];
        memory = new Memory({
            data: [...data],
            keyProperty: 'id'
        });

        // Минимальный набор параметров
        // Только обязательные поля
        const defaultSourcesProp = [
            {
                source: memory
            }
        ];
        it(
            'defaultSourcesProp',
            async () => {
                const wrapper = await getResult(defaultSourcesProp, 2000);
                return deepStrictEqual(wrapper, data, 'Wrong response defaultSourcesProp data');
            }
        );

        //  Ошибка 504 в ответе
        it(
            'wrongResponse',
            async () => {
                const wrapper = await getResult(defaultSourcesProp);
                return deepStrictEqual(wrapper, 504, 'This is not the wrong response');
            }
        );

        // smokes test много вопросов по этому тесту, возможно он даже и не нужен.
        // const dataCheckSmokes = [
        //     {key: 1, title: 'Ярославль'}
        // ];
        // const filterButtonSource = [{
        //     name: 'filterButtonSource',
        //     value: 'filterButtonSource',
        //     textValue: 'filterButtonSource'
        // }];
        // const fastFilterSource = [{value: '1'}];
        // const navigation = [{
        //     source: 'position',
        //     view: 'pages',
        //     sourceConfig: 'firstFilterButton'
        //     // viewConfig: 'id' TODO вопрос в том, надо ли реализовывать так глубоко?
        // }];
        // const historyId = 'historyId';
        // const groupHistoryId = 'groupHistoryId';
        // const filter = 'Ярославль';
        // const sorting = '1';
        // const historyItems = filterButtonSource;
        // const propStorageId = 'filterButtonSource';
        // // const filterHistoryLoader = 'filterButtonSource';
        // const allSourcesProp = [
        //     {
        //         source: memory,
        //         filterButtonSource,
        //         fastFilterSource,
        //         navigation,
        //         historyId,
        //         groupHistoryId,
        // TODO Record<string, unknown>, не очень понятно, по ключу или другому параметру должен фильтровать
        //         filter,
        //         // sorting,
        //         historyItems,
        //         // propStorageId
        //         // filterHistoryLoader TODO тоже под вопросом...
        //     }
        // ];
        // it(
        //     'allSourcesProp',
        //     async () => {
        //         const wrapper = await getResult(allSourcesProp, 2000);
        //         return deepStrictEqual(wrapper, 504, 'This is not the wrong response');
        //     }
        // );
    });
});
