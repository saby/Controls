import {Button, IButtonOptions} from 'Controls/dropdown';
import {Memory} from 'Types/source';
import {assert} from 'chai';

describe('Controls/Dropdown/Button', () => {
    describe('openMenu', () => {
        const baseControlCfg: IButtonOptions = {
            source: new Memory({
                keyProperty: 'id',
                data: [
                    {
                        id: 1,
                        title: 'title'
                    }
                ]
            })
        };

        let dropdownButton: Button;
        let isSelectElement = false;

        beforeEach(() => {
            dropdownButton = new Button(baseControlCfg);
            dropdownButton._notify = (name) => {
                if (['onMenuItemActivate', 'menuItemActivate'].indexOf(name) !== -1) {
                    isSelectElement = true;
                }
            };
            isSelectElement = false;
        });

        afterEach(() => {
            dropdownButton = undefined;
        });

        it('Open menu with 1 element', async () => {
            await dropdownButton._beforeMount(baseControlCfg);
            await dropdownButton.openMenu();
            assert.isTrue(isSelectElement);
        });

        it('Open menu with elements', async () => {
            baseControlCfg.source = new Memory({
                keyProperty: 'id',
                data: [
                    {
                        id: 1,
                        title: 'title'
                    },
                    {
                        id: 2,
                        title: 'title'
                    },
                    {
                        id: 3,
                        title: 'title'
                    }
                ]
            });
            await dropdownButton._beforeMount(baseControlCfg);
            await dropdownButton.openMenu();
            assert.isFalse(isSelectElement);
        });
    });
});
