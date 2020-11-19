import {Input} from 'Controls/lookup';
import {ok, deepStrictEqual} from 'assert';
import {createSandbox} from 'sinon';
import {RecordSet} from 'Types/collection';
import {Stack} from 'Controls/popup';
import {Memory} from 'Types/source';

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
            return where.id && where.id.indexOf(item.get('id')) !== -1;
        }
    });
}

function getLookupOptions(): object {
    return {
        source: getSource(),
        keyProperty: 'id',
        selectedKeys: []
    };
}

function getLookup({closeSuggestCallback}) {
    const lookupControl = new Input();
    lookupControl._lookupController = {
        getItems: () => new RecordSet()
    };
    lookupControl.closeSuggest = () => {
        closeSuggestCallback();
    };
    return lookupControl;
}

describe('lookup', () => {
    it('showSelector', () => {
        let isSuggestClosed = false;
        let isSelectorOpened = false;
        let isCalculated = false;
        const sandBox = createSandbox();
        sandBox.replace(Stack, 'openPopup', () => {
            isSelectorOpened = true;
            return Promise.resolve('123');
        });

        const lookup = getLookup({
            closeSuggestCallback: () => {
                isSuggestClosed = true;
            }
        });
        sandBox.replace(lookup, '_getFieldWrapperWidth', () => {
            isCalculated = true;
        });
        lookup.showSelector({
            template: 'testTemplate'
        });
        ok(isCalculated);
        ok(isSelectorOpened);
        ok(isSuggestClosed);
        sandBox.restore();
    });

    describe('_beforeMount', () => {

        it('selectedKeys is empty (selectedKeys: [])', () => {
            const options = getLookupOptions();
            const lookup = new Input(options);

            ok(lookup._beforeMount(options) === undefined);
        });

        it('selectedKeys is not empty (selectedKeys: [0, 1])', async () => {
            const options = getLookupOptions();
            options.selectedKeys = [0, 1];
            const lookup = new Input(options);
            await lookup._beforeMount(options);

            ok(lookup._lookupController.getItems().getCount() === 2);
        });

    });
});
