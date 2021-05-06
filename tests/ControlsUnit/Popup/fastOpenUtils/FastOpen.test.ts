import {assert} from 'chai';
import {CalmTimer} from 'Controls/popup';

describe('Controls/Popup/fastOpenUtils/FastOpen', () => {

    describe('CalmTimer', () => {
        it('CalmTimer: resetTimeOut', () => {
            const calmTimer = new CalmTimer();
            calmTimer._openId = 300;
            calmTimer._closeId = 500;
            assert.equal(calmTimer._closeId, 500);
            assert.equal(calmTimer._openId, 300);
            calmTimer.resetTimeOut();
            assert.equal(calmTimer._closeId, null);
            assert.equal(calmTimer._openId, null);
        });
    });
});
