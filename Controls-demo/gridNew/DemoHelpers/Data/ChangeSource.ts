interface IDataForChangeSource {
    id: number;
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
            id: 1,
            load: 'One',
            title: 'hello'
        }, {
            id: 2,
            load: 'Two',
            title: 'hello'

        }, {
            id: 3,
            load: 'three',
            title: 'hello'

        }, {
            id: 4,
            load: 'Four',
            title: 'hello'

        }, {
            id: 5,
            load: 'Five',
            title: 'hello'

        }, {
            id: 6,
            load: 'Six',
            title: 'hello'

        }, {
            id: 7,
            load: 'Seven',
            title: 'hello'

        }],
    getData2: () => [
        {
            id: 1,
            load: 1,
            title: 'hello'
        }, {
            id: 2,
            load: 2,
            title: 'hello'

        }, {
            id: 3,
            load: 2,
            title: 'hello'

        }, {
            id: 4,
            load: 2,
            title: 'hello'

        }, {
            id: 5,
            load: 2,
            title: 'hello'

        }, {
            id: 6,
            load: 2,
            title: 'hello'

        }, {
            id: 7,
            load: 2,
            title: 'hello'

        }]
};
