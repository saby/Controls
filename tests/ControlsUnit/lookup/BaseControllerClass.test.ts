import {default as BaseControllerClass, ILookupBaseControllerOptions} from 'Controls/_lookup/BaseControllerClass';
import {Memory, SbisService} from 'Types/source';
import {RecordSet, List} from 'Types/collection';
import {Model} from 'Types/entity';
import {deepStrictEqual, ok} from 'assert';
import {stub, spy} from 'sinon';
import {error} from 'Controls/dataSource';
import {Service} from 'Controls/history';

function getData(): object[] {
    return [
        {
            id: 0,
            title: 'Sasha'
        },
        {
            id: 1,
            title: 'Aleksey'
        },
        {
            id: 2,
            title: 'Dmitry'
        }
    ];
}

function getSource(): Memory {
    return new Memory({
        keyProperty: 'id',
        data: getData(),
        filter: (item, where) => {
            let result;

            if (!where.id) {
                result = true;
            } else {
                result = where.id.includes(item.get('id'));
            }

            return result;
        }
    });
}
const source = getSource();

const sourceWithError = getSource();
sourceWithError.query = () => Promise.reject(new Error());

function getRecordSet(): RecordSet {
    return new RecordSet({
        rawData: getData(),
        keyProperty: 'id'
    });
}

function getControllerOptions(): Partial<ILookupBaseControllerOptions> {
    return {
        selectedKeys: [],
        multiSelect: true,
        source,
        keyProperty: 'id',
        displayProperty: 'title'
    };
}

function getLookupControllerWithEmptySelectedKeys(additionalConfig?: object): BaseControllerClass {
    let options = getControllerOptions();
    options = {...options, ...additionalConfig};
    return new BaseControllerClass(options as ILookupBaseControllerOptions);
}

function getLookupControllerWithSelectedKeys(additionalConfig?: object): BaseControllerClass {
    let options = getControllerOptions();
    options.selectedKeys = [0, 1, 2];
    options = {...options, ...additionalConfig};
    return new BaseControllerClass(options as ILookupBaseControllerOptions);
}

function getLookupControllerWithoutSelectedKeys(additionalConfig?: object): BaseControllerClass {
    let options = getControllerOptions();
    delete options.selectedKeys;
    options = {...options, ...additionalConfig};
    return new BaseControllerClass(options as ILookupBaseControllerOptions);
}

class CustomModel extends Model {
    protected _moduleName: string = 'customModel';
    protected _$properties = {
        isCustom: {
            get(): boolean {
                return true;
            }
        }
    };
}

describe('Controls/_lookup/BaseControllerClass', () => {

    describe('loadItems', () => {
        it('simple loadItems', () => {
            const controller = getLookupControllerWithSelectedKeys();

            return new Promise((resolve) => {
                controller.loadItems().then((items) => {
                    controller.setItems(items);
                    const resultItemsCount = 3;
                    deepStrictEqual(controller.getItems().getCount(), resultItemsCount);
                    resolve();
                });
            });
        });

        it('source returns error', () => {
            const controller = getLookupControllerWithSelectedKeys({
                source: sourceWithError
            });

            return new Promise((resolve) => {
                const errorStub = stub(error, 'process');
                controller.loadItems().then((result) => {
                    ok(errorStub.calledOnce);
                    ok(result instanceof List);
                    errorStub.restore();
                    resolve();
                });
            });
        });
    });

    describe('update', () => {
        it('source is changed while loading', async () => {
            const controller = getLookupControllerWithSelectedKeys();
            controller.loadItems();
            const spyCancelLoading = spy(controller._sourceController, 'cancelLoading');

            const options = getControllerOptions();
            options.source = getSource();
            await controller.update(options);
            ok(spyCancelLoading.calledOnce);
            spyCancelLoading.restore();
        });

        it('keys not changed after removeItem', async () => {
            const options = getControllerOptions();
            const controller = getLookupControllerWithSelectedKeys();

            options.selectedKeys = [0, 1, 2];
            const item = new Model({
                rawData: getData()[0],
                keyProperty: 'id'
            });

            controller.setItems(getRecordSet());
            controller.removeItem(item);
            ok(controller.update(options));
            const items = await controller.loadItems();
            ok(items.getCount() === 3);
        });

        it('update without keys in options', async () => {
            const controller = getLookupControllerWithoutSelectedKeys();

            controller.setItems(getRecordSet());
            deepStrictEqual(controller.getSelectedKeys(), [0, 1, 2]);

            const options = getControllerOptions();
            delete options.selectedKeys;
            controller.update(options as ILookupBaseControllerOptions);
            deepStrictEqual(controller.getSelectedKeys(), [0, 1, 2]);
        });

        it('update selectedKeys', async () => {
            const controller = getLookupControllerWithSelectedKeys();
            let items;

            let newOptions = getControllerOptions();
            newOptions.selectedKeys = [0, 1];
            items = await controller.update(newOptions as ILookupBaseControllerOptions);
            ok(items.getCount() === 2);
            deepStrictEqual(controller.getSelectedKeys(), [0, 1]);

            newOptions = getControllerOptions();
            newOptions.selectedKeys = [0, 1, 2];
            items = await controller.update(newOptions as ILookupBaseControllerOptions);
            ok(items.getCount() === 3);
            deepStrictEqual(controller.getSelectedKeys(), [0, 1, 2]);

            newOptions = getControllerOptions();
            newOptions.selectedKeys = [];
            items = await controller.update(newOptions as ILookupBaseControllerOptions);
            deepStrictEqual(controller.getSelectedKeys(), []);
        });

        it('update source', async () => {
            const controller = getLookupControllerWithSelectedKeys();
            controller.setItems(await controller.loadItems());

            const newOptions = getControllerOptions();
            // same keys
            newOptions.selectedKeys = [0, 1, 2];
            newOptions.source = getSource();
            ok(controller.update(newOptions as ILookupBaseControllerOptions) instanceof Promise);
        });

        it('items and selectedKeys updated', async () => {
            const controller = getLookupControllerWithEmptySelectedKeys();
            const newOptions = getControllerOptions();

            newOptions.selectedKeys = [0, 1, 2];
            newOptions.items = new RecordSet({rawData: getData()});

            ok(controller.update(newOptions as ILookupBaseControllerOptions) === true);
        });
    });

    it('setItems', () => {
        const controller = getLookupControllerWithEmptySelectedKeys();
        controller.setItems(getRecordSet());
        deepStrictEqual(controller.getSelectedKeys(), [0, 1, 2]);
    });

    it('getItems', () => {
        const resultItemsCount = 3;
        const controller = getLookupControllerWithEmptySelectedKeys();
        controller.setItems(getRecordSet());
        deepStrictEqual(controller.getItems().getCount(), resultItemsCount);
    });

    it('addItem', () => {
        const controller = getLookupControllerWithEmptySelectedKeys();
        const item = new Model({
            rawData: getData()[0],
            keyProperty: 'id'
        });
        controller.addItem(item);

        deepStrictEqual(controller.getItems().getCount(), 1);
        deepStrictEqual(controller.getItems().at(0).get('title'), 'Sasha');
    });

    it('addItem source model is preparing', () => {
        const controller = getLookupControllerWithEmptySelectedKeys({
            source: new SbisService({
                model: CustomModel
            })
        });
        const item = new Model({
            rawData: getData()[0],
            keyProperty: 'id'
        });
        controller.addItem(item);

        ok(controller.getItems().at(0) instanceof CustomModel);
    });

    describe('removeItem', () => {
        it('simple removeItem', () => {
            const controller = getLookupControllerWithSelectedKeys();
            const item = new Model({
                rawData: getData()[0],
                keyProperty: 'id'
            });

            controller.setItems(getRecordSet());
            controller.removeItem(item);
            deepStrictEqual(controller.getSelectedKeys(), [1, 2]);
            deepStrictEqual(controller.getItems().getCount(), 2);
        });

        it('update after removeItem', async () => {
            let options = getControllerOptions();
            options.selectedKeys = [1];
            const controller = new BaseControllerClass(options as ILookupBaseControllerOptions);
            controller.setItems(await controller.loadItems());

            deepStrictEqual(controller.getSelectedKeys(), [1]);
            deepStrictEqual(controller.getItems().getCount(), 1);

            options = {...options};
            options.selectedKeys = [];
            controller.removeItem(new Model({
                rawData: getData()[1],
                keyProperty: 'id'
            }));

            ok(!controller.update(options as ILookupBaseControllerOptions));
        });
    });

    it('getSelectedKeys', () => {
        const controller = getLookupControllerWithEmptySelectedKeys();
        controller.setItems(getRecordSet());
        deepStrictEqual(controller.getSelectedKeys(), [0, 1, 2]);
    });

    it('getTextValue', () => {
        const controller = getLookupControllerWithSelectedKeys();

        return new Promise((resolve) => {
            controller.loadItems().then((items) => {
                controller.setItems(items);
                deepStrictEqual(controller.getTextValue(), 'Sasha, Aleksey, Dmitry');
                resolve();
            });
        });
    });

    it('setItemsAndSaveToHistory', async () => {
        const controller = getLookupControllerWithEmptySelectedKeys({
            historyId: 'TEST_HISTORY_ID'
        });
        const historyService = await controller.setItemsAndSaveToHistory(getRecordSet());

        ok(historyService instanceof Service);
        deepStrictEqual(controller.getSelectedKeys(), [0, 1, 2]);
    });
});
