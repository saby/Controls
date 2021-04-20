import { TreeGridCollection } from 'Controls/treeGrid';
import { assert } from 'chai';
import { RecordSet } from 'Types/collection';
import { Model } from 'Types/entity';

const RAW_DATA = [
    { key: 1, parent: null, type: true },
    { key: 2, parent: 1, type: true },
    { key: 3, parent: 2, type: null }
];

describe('Controls/treeGrid_clean/Display/TreeCollection', () => {
    it('Restore expandedItems after reset collection', () => {
        const recordSet = new RecordSet({
            rawData: [ { key: 1, parent: null, type: true } ],
            keyProperty: 'key'
        });

        const treeGridCollection = new TreeGridCollection({
            collection: recordSet,
            keyProperty: 'key',
            parentProperty: 'parent',
            nodeProperty: 'type',
            root: null,
            columns: [{}],
            expandedItems: [1]
        });

        recordSet.merge(new RecordSet({
            rawData: RAW_DATA,
            keyProperty: 'key'
        }));
        assert.strictEqual(treeGridCollection.getCount(), 3);
    });

    it('Init footer in constructor', () => {
        const recordSet = new RecordSet({
            rawData: [ { key: 1, parent: null, type: true } ],
            keyProperty: 'key'
        });

        // В опциях переданы только колонки для футера -> футер должен проинициализироваться
        let collection = new TreeGridCollection({
            collection: recordSet,
            keyProperty: 'key',
            parentProperty: 'parent',
            nodeProperty: 'type',
            root: null,
            columns: [{}],
            footer: []
        });
        assert.isTrue(!!collection.getFooter());

        // В опциях передан только шаблон для футера -> футер должен проинициализироваться
        const footerTemplate = 'my custom footer template';
        collection = new TreeGridCollection({
            collection: recordSet,
            keyProperty: 'key',
            parentProperty: 'parent',
            nodeProperty: 'type',
            root: null,
            columns: [{}],
            footerTemplate
        });
        assert.isTrue(!!collection.getFooter());
        assert.isTrue(footerTemplate === collection.getFooter().getColumns()[0].getTemplate());
    });

    describe('Reset header model on collection change', () => {

        describe('headerVisibility === \'hasdata\'', () => {
            // Поверяем что при очистке данных коллекции модель заголовка сбрасывается
            it('Should reset header model to null on clear collection', () => {
                const recordSet = new RecordSet({rawData: [{}, {}]});
                // Создадим коллекцию с данными и видимостью заголовка, зависящую от наличия данных
                const collection = new TreeGridCollection({
                    keyProperty: 'id',
                    nodeProperty: 'type',
                    parentProperty: 'parent',
                    columns: [],
                    header: [{}, {}],
                    headerVisibility: 'hasdata',
                    collection: recordSet
                });

                // 1. Проверим что заголовок создался
                assert.isTrue(!!collection.getHeader());
                // 2. Очистим данные
                recordSet.clear();
                // 3. Модель заголовка должна сброситься т.к. данных в RecordSet не стало
                assert.isNull(collection.getHeader(), 'Header model should reset to null');
            });

            // Поверяем что при заполнении коллекции модель заголовка создается
            it('Should create header model on fill collection', () => {
                const recordSet = new RecordSet({rawData: []});
                // Создадим коллекцию без данных и видимостью заголовка, зависящую от наличия данных
                const collection = new TreeGridCollection({
                    keyProperty: 'id',
                    nodeProperty: 'type',
                    parentProperty: 'parent',
                    columns: [],
                    header: [{}, {}],
                    headerVisibility: 'hasdata',
                    collection: recordSet
                });

                // 1. Проверим что заголовка нет
                assert.isFalse(!!collection.getHeader());
                // 2. Присвоим в RecordSet новые данные
                recordSet.assign([new Model({keyProperty: 'id', rawData: {}})]);
                // 3. Модель заголовка должна быть, т.к. появились данные
                assert.isTrue(!!collection.getHeader(), 'Header model should exist');
            });
        });

        describe('headerVisibility === \'visible\'', () => {
            // Поверяем что при очистке данных коллекции модель заголовка не пересоздается
            it('Should not recreate header model on clear collection', () => {
                const recordSet = new RecordSet({rawData: [{}, {}]});
                // Создадим коллекцию с данными и всегда видимым заголовком
                const collection = new TreeGridCollection({
                    keyProperty: 'id',
                    nodeProperty: 'type',
                    parentProperty: 'parent',
                    columns: [],
                    header: [{}, {}],
                    headerVisibility: 'visible',
                    collection: recordSet
                });

                // Запомним изначальный инстанс модели заголовка и проверим что он есть
                const firstHeaderModel = collection.getHeader();
                assert.isTrue(!!firstHeaderModel, 'Header model should exist');

                // Очистим данные
                recordSet.clear();

                // Проверяем что после изменения коллекции модель заголовка осталась той же
                const secondHeaderModel = collection.getHeader();
                assert.isTrue(!!secondHeaderModel, 'Header model should exist');
                assert.isTrue(firstHeaderModel === secondHeaderModel, 'Should be the same header model instance');
            });

            // Поверяем что при заполнении коллекции модель заголовка не пересоздается
            it('Should recreate header model on fill collection', () => {
                const recordSet = new RecordSet({rawData: []});
                // Создадим коллекцию без данных и всегда видимым заголовком
                const collection = new TreeGridCollection({
                    keyProperty: 'id',
                    nodeProperty: 'type',
                    parentProperty: 'parent',
                    columns: [],
                    header: [{}, {}],
                    headerVisibility: 'visible',
                    collection: recordSet
                });

                // Запомним изначальный инстанс модели заголовка и проверим что он есть
                const firstHeaderModel = collection.getHeader();
                assert.isTrue(!!firstHeaderModel, 'Header model should exist');

                // Добавим данные в RecordSet
                recordSet.assign([new Model({keyProperty: 'id', rawData: {}})]);

                // Проверяем что после изменения коллекции модель заголовка осталась той же
                const secondHeaderModel = collection.getHeader();
                assert.isTrue(!!secondHeaderModel, 'Header model should exist');
                assert.isTrue(firstHeaderModel === secondHeaderModel, 'Should be the same header model instance');
            });
        });

    });
});
