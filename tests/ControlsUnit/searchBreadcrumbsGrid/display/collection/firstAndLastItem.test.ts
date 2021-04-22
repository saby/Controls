import { assert } from 'chai';
import { RecordSet } from "Types/collection";
import { SearchGridCollection } from "Controls/searchBreadcrumbsGrid";

interface IData {
    id: number;
    pid?: number;
    node?: boolean;
    title?: string;
}

function getRecordSet(items: IData[]): RecordSet<IData> {
    return new RecordSet({ items, keyProperty: 'id' });
}

function getCollection(collection: RecordSet<IData>, options: object = {}): SearchGridCollection {
    return new SearchGridCollection({
        collection,
        ...options,
        root: null,
        keyProperty: 'id',
        parentProperty: 'parent',
        nodeProperty: 'node',
        columns: [{
            displayProperty: 'title',
            width: '300px',
            template: 'wml!template1'
        }, {
            displayProperty: 'taxBase',
            width: '200px',
            template: 'wml!template1'
        }]
    });
}

describe('Controls/searchBreadcrumbsGrid/display/collection/firstAndLastItem', () => {

    // 6. Поиск. Есть хлебные крошки
    describe('has breadcrumbs', () => {
        const data: IData[] = [{
            id: 1,
            pid: 0,
            node: true,
            title: 'A'
        }, {
            id: 10,
            pid: 1,
            node: null,
            title: 'AA'
        }, {
            id: 2,
            pid: 0,
            node: true,
            title: 'B'
        }, {
            id: 20,
            pid: 2,
            node: null,
            title: 'BB'
        }];
        it('getLastItem', () => {
            const collection = getCollection(getRecordSet(data));
            assert.equal(collection.getLastItem(), collection.at(2).getContents());
        });

        it('getFirstItem', () => {
            const collection = getCollection(getRecordSet(data));
            assert.equal(collection.getFirstItem(), collection.at(0).getContents());
        });
    });

    // 7. Поиск. Есть searchSeparator
    describe('searchSeparator', () => {
        const data: IData[] = [{
            id: 1,
            pid: 0,
            node: true,
            title: 'A'
        }, {
            id: 10,
            pid: 1,
            node: null,
            title: 'AA'
        }, {
            id: 2,
            pid: 0,
            node: null,
            title: 'C'
        }];

        it('getLastItem', () => {
            const collection = getCollection(getRecordSet(data));
            assert.equal(collection.getLastItem(), collection.at(3).getContents());
        });

        it('getFirstItem', () => {
            const collection = getCollection(getRecordSet(data));
            assert.equal(collection.getFirstItem(), collection.at(0).getContents());
        });
    });
});
