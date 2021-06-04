import {isValidDate} from 'Controls/validate';
import {Date, DateTime, Time} from 'Types/entity';
import {assert} from 'chai';

describe('Controls.Validators.IsValidDate', () => {
    [{
        value: null,
        resp: true
    }, {
        value: new Date(2019, 0, 1),
        resp: true
    }, {
        value: new Date('Invalid'),
        resp: 'Дата заполнена некорректно'
    }, {
        value: new Time('Invalid'),
        resp: 'Время заполнено некорректно'
    }, {
        value: new DateTime('Invalid'),
        resp: 'Дата или время заполнены некорректно'
    }, {
        value: new Date(1300, 0, 1),
        resp: 'Дата заполнена некорректно'
    }, {
        value: new Date(3100, 0),
        resp: 'Дата заполнена некорректно'
    }
    ].forEach((test) => {
        it(`should return ${test.resp} for ${test.value}`, () => {
            assert.equal(isValidDate({
                value: test.value
            }), test.resp);
        });
    });
});
