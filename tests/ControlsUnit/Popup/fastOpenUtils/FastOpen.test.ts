import {assert} from 'chai';
import {CalmTimer} from 'Controls/popup';

describe('Controls/Popup/fastOpenUtils/FastOpen', () => {

    describe('CalmTimer', () => {
        it('CalmTimer: resetTimeOut', () => {
            const calmTimer = new CalmTimer();
            calmTimer._openId = 300;
            assert.equal(calmTimer._openId, 300);
            calmTimer.stop();
            assert.equal(calmTimer._openId, null);
        });
    });
});