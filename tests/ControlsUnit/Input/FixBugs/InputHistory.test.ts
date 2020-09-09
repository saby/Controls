import {assert} from 'chai';
import {__InputHistory} from 'Controls/input';

describe('Controls/input:InputHistory', () => {
    let inst: __InputHistory;
    const text = {
        value: 'test',
        carriagePosition: 4
    };
    const text1 = {
        value: 'test',
        carriagePosition: 5
    };
    const text2 = {
        value: 'test2',
        carriagePosition: 5
    };
    beforeEach(() => {
        inst = new __InputHistory(text);
    });
    describe('back', () => {
        beforeEach(() => {
            inst.add(text1);
            inst.add(text2);
        });
        it('To back once', () => {
            const actual = inst.back();
            assert.deepEqual(actual, text1);
        });
        it('To back twice', () => {
            inst.back();
            const actual = inst.back();
            assert.deepEqual(actual, text);
        });
    });
    describe('forward', () => {
        beforeEach(() => {
            inst.add(text1);
            inst.add(text2);
            inst.back();
            inst.back();
        });
        it('To back once', () => {
            const actual = inst.forward();
            assert.deepEqual(actual, text1);
        });
        it('To back twice', () => {
            inst.forward();
            const actual = inst.forward();
            assert.deepEqual(actual, text2);
        });
    });
});
