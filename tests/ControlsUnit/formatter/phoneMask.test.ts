import {assert} from 'chai';
import {phoneMask} from 'Controls/decorator';

describe('Controls/formatter:phoneMask', () => {
    it('dd-dd', () => {
        const expectedMask = 'dd-dd';

        assert.equal(phoneMask('1'), expectedMask);
        assert.equal(phoneMask('12'), expectedMask);
        assert.equal(phoneMask('123'), expectedMask);
        assert.equal(phoneMask('1234'), expectedMask);
    });
    it('d-dd-dd', () => {
        const expectedMask = 'd-dd-dd';

        assert.equal(phoneMask('12345'), expectedMask);
    });
    it('dd-dd-dd', () => {
        const expectedMask = 'dd-dd-dd';

        assert.equal(phoneMask('123456'), expectedMask);
    });
    it('ddd-dd-dd', () => {
        const expectedMask = 'ddd-dd-dd';

        assert.equal(phoneMask('1234567'), expectedMask);
    });
    it('(ddd)-ddd-dd-dd', () => {
        const expectedMask = '(ddd)-ddd-dd-dd';

        assert.equal(phoneMask('12345678'), expectedMask);
        assert.equal(phoneMask('123456789'), expectedMask);
        assert.equal(phoneMask('1234567890'), expectedMask);
    });
    it('Russian phone', () => {
        assert.equal(phoneMask('89159721161'), '+\\?d (ddd) ddd-dd-dd');
        assert.equal(phoneMask('83012721161'), '+\\?d (dddd) dd-dd-dd');
        assert.equal(phoneMask('83013021161'), '+\\?d (ddddd) d-dd-dd');
    });
    it('International phone', () => {
        assert.equal(phoneMask('+3900125125'), '+dd ddd ddd dd dd');
        assert.equal(phoneMask('+38001251255'), '+ddd ddd ddd dd dd');
    });
});
