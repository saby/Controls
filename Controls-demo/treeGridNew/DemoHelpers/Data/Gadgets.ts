import {IData} from "Controls-demo/treeGridNew/DemoHelpers/Interface";

export const Gadgets = {
    getData(): IData[] {
        return [
            {
                key: 1, title: 'Node', Раздел: null, 'Раздел@': true, Раздел$: null, hasChild: true
            },
            {
                key: 11, title: 'Node', Раздел: 1, 'Раздел@': true, Раздел$: null
            },
            {
                key: 111, title: 'Leaf', Раздел: 11, 'Раздел@': null, Раздел$: null
            },
            {
                key: 12, title: 'Hidden node', Раздел: 1, 'Раздел@': false, Раздел$: true, hasChild: false
            },
            {
                key: 13, title: 'Leaf', Раздел: 1, 'Раздел@': null, Раздел$: null
            },
            {
                key: 2, title: 'Node 2', Раздел: null, 'Раздел@': true, Раздел$: null, hasChild: true
            },
            {
                key: 21, title: 'Leaf 21', Раздел: 2, 'Раздел@': null, Раздел$: null
            },
            {
                key: 3, title: 'Node 3', Раздел: null, 'Раздел@': true, Раздел$: null, hasChild: false
            }
        ];
    },
};
