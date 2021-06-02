interface IDataForChangeSource {
    key: number;
    load: string | number;
    title: string;
}

interface IChangeSource {
    getData1: () => IDataForChangeSource[];
    getData2: () => IDataForChangeSource[];
}

export const ChangeSourceData: IChangeSource = {
    getData1: () => [
        {
            key: 1,
            load: 'One',
            title: 'hello'
        }, {
            key: 2,
            load: 'Two',
            title: 'hello'

        }, {
            key: 3,
            load: 'three',
            title: 'hello'

        }, {
            key: 4,
            load: 'Four',
            title: 'hello'

        }, {
            key: 5,
            load: 'Five',
            title: 'hello'

        }, {
            key: 6,
            load: 'Six',
            title: 'hello'

        }, {
            key: 7,
            load: 'Seven',
            title: 'hello'

        }],
    getData2: () => [
        {
            key: 1,
            load: 1,
            title: 'hello'
        }, {
            key: 2,
            load: 2,
            title: 'hello'

        }, {
            key: 3,
            load: 2,
            title: 'hello'

        }, {
            key: 4,
            load: 2,
            title: 'hello'

        }, {
            key: 5,
            load: 2,
            title: 'hello'

        }, {
            key: 6,
            load: 2,
            title: 'hello'

        }, {
            key: 7,
            load: 2,
            title: 'hello'

        }]
};
