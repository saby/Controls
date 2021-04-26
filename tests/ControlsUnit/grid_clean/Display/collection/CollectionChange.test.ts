import {GridCollection, GridResultsRow} from "Controls/grid";
import {RecordSet} from 'Types/collection';
import {assert} from 'chai';
import * as sinon from 'sinon';
import {Model} from 'Types/entity';

describe('Controls/_display/collection/CollectionChange', () => {
    let sandbox: sinon.SinonSandbox;

    beforeEach(() => {
        sandbox = sinon.createSandbox();
    });

    afterEach(() => {
        sandbox.restore();
    });

    describe('Update results row (create / delete)', () => {

        it('[has no results] -> [has results]. Should initialize results.', () => {
            const recordSet = new RecordSet({rawData: []});
            const collection = new GridCollection({
                keyProperty: 'id',
                columns: [],
                collection: recordSet,
                resultsPosition: 'top'
            });

            assert.isUndefined(collection.getResults());
            recordSet.append(new RecordSet({rawData: [{id: 1}, {id: 2}, {id: 3}], keyProperty: 'id'}));

            assert.instanceOf(collection.getResults(), GridResultsRow);
        });

        it('[has results] -> [has no results]. Should destroy results.', () => {
            const recordSet = new RecordSet({rawData: [{id: 1}, {id: 2}, {id: 3}], keyProperty: 'id'});
            const collection = new GridCollection({
                keyProperty: 'id',
                columns: [],
                collection: recordSet,
                resultsPosition: 'top'
            });

            assert.instanceOf(collection.getResults(), GridResultsRow);
            recordSet.clear();
            assert.isNull(collection.getResults());
        });
    });

    describe('Reset header model on collection change', () => {

        describe('headerVisibility === \'hasdata\'', () => {
            // Поверяем что при очистке данных коллекции модель заголовка сбрасывается
            it('Should reset header model to null on clear collection', () => {
                const recordSet = new RecordSet({rawData: [{id: 1}, {id: 2}], keyProperty: 'id'});
                // Создадим коллекцию с данными и видимостью заголовка, зависящую от наличия данных
                const collection = new GridCollection({
                    keyProperty: 'id',
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
                const collection = new GridCollection({
                    keyProperty: 'id',
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
                const recordSet = new RecordSet({rawData: [{id: 1}, {id: 2}], keyProperty: 'id'});
                // Создадим коллекцию с данными и всегда видимым заголовком
                const collection = new GridCollection({
                    keyProperty: 'id',
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
                const collection = new GridCollection({
                    keyProperty: 'id',
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
