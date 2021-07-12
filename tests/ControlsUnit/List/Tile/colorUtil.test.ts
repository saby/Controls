import {rgbaToString, toRgb} from 'Controls/Utils/colorUtil';
import {assert} from 'chai';

describe('toRgb(), rgbaToString()', () => {
    const cases = [
        {input: '#fff',  output: 'rgba(255,255,255,1)'},
        {input: '#FFF',  output: 'rgba(255,255,255,1)'},
        {input: '#ffffff',  output: 'rgba(255,255,255,1)'},
        {input: '#ffff', output: 'rgba(255,255,255,1)'},
        {input: '#fff0', output: 'rgba(255,255,255,0)'},
        {input: '#ffffffff',  output: 'rgba(255,255,255,1)'},
        {input: '#ffffff00',  output: 'rgba(255,255,255,0)'},
        {input: '#8880', output: 'rgba(136,136,136,0)'},
        {input: '#88888833', output: 'rgba(136,136,136,0.2)'},
        {input: 'rgb(136,136,136)', output: 'rgba(136,136,136,1)'},
        {input: 'rgba(136, 136 ,136, 0.2)', output: 'rgba(136,136,136,0.2)'}
    ];

    cases.forEach(({input, output}, index) => {
        it(`case ${index}`, () => {
            assert.equal(rgbaToString(toRgb(input)), output, `Wrong parse color ${input}`);
        });
    });
});
