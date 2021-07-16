import {GridLayoutUtil} from 'Controls/display';
import {assert} from 'chai';

describe('Controls/grid_clean/_display/utils/GridLayoutUtil', () => {
    describe('.isValidWidthValue()', () => {
        describe('invalid cases', () => {
            [
                '0fr', 'fr', '1fl', '1f', '01fr', '-1fr', '!2fr', '10fr!',
                '-1px', '-0px', 'px', '010px', '10pn', '10ph',
                '%', '01%', '-1%', '!2%', '10%!',
                'Auto', 'auTo',
                'fit-content',
                'min-max(10px, 20px)',
                'minmax()',
                'minmax(,)',
                'minmax(10px,)',
                'minmax(, 10px)',
                'minmax(10px)',
                'minmax(10px, 0fr)',
                'minmax(10px, minmax(20px, 30px))'
            ].forEach((width) => {
                it(`${width} is invalid`, () => {
                    assert.isFalse(GridLayoutUtil.isValidWidthValue(width));
                });
            });
        });
        describe('valid cases', () => {
            [
                '1fr', '123fr',
                '0px', '10px', '100px',
                '0%', '1%', '100%',
                'auto', 'min-content', 'max-content',
                'minmax(min-content, auto)'
            ].forEach((width) => {
                it(`${width} is valid`, () => {
                    assert.isTrue(GridLayoutUtil.isValidWidthValue(width));
                });
            });
        });
    });
});

