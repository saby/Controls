import {IData} from "Controls-demo/treeGridNew/DemoHelpers/Interface";

export const Gadgets = {
    getData(): IData[] {
        return [
            {
                id: 1, title: 'Node', Раздел: null, 'Раздел@': true, Раздел$: null, hasChild: true
            },
            {
                id: 11, title: 'Node', Раздел: 1, 'Раздел@': true, Раздел$: null
            },
            {
                id: 111, title: 'Leaf', Раздел: 11, 'Раздел@': null, Раздел$: null
            },
            {
                id: 12, title: 'Hidden node', Раздел: 1, 'Раздел@': false, Раздел$: true, hasChild: false
            },
            {
                id: 13, title: 'Leaf', Раздел: 1, 'Раздел@': null, Раздел$: null
            },
            {
                id: 2, title: 'Node 2', Раздел: null, 'Раздел@': true, Раздел$: null, hasChild: true
            },
            {
                id: 21, title: 'Leaf 21', Раздел: 2, 'Раздел@': null, Раздел$: null
            },
            {
                id: 3, title: 'Node 3', Раздел: null, 'Раздел@': true, Раздел$: null, hasChild: false
            }
        ];
    },
};
