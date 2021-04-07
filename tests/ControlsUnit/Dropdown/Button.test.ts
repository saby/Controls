import {Button, IButtonOptions} from 'Controls/dropdown';
import {Memory} from 'Types/source';
import {RecordSet} from 'Types/collection';
import {SyntheticEvent} from 'Vdom/Vdom';
import {assert} from 'chai';

describe('menuPopupTrigger', () => {
    const baseControlCfg: IButtonOptions = {
        menuPopupTrigger: 'hover',
        source: new Memory({
            keyProperty: 'id',
            data: new RecordSet({
                rawData: [
                    {
                        id: 1,
                        title: 'title'
                    }
                ]
            })
        })
    };
    const event: SyntheticEvent<MouseEvent> = {
        nativeEvent: {}
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
    it('_handleMouseDown', () => {
        dropdownButton._handleMouseDown(event);
        assert.isTrue(isSelectElement);
    });
    it('_handleMouseEnter', () => {
        dropdownButton._handleMouseEnter(event);
        assert.isFalse(isSelectElement);
    });
});
