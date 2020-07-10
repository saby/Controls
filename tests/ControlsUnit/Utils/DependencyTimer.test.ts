import {DependencyTimer} from 'Controls/Utils/FastOpen';
import * as sinon from 'sinon';
import {assert} from 'chai';

describe('Controls/Utils/DependencyTimer', (): void => {
    const now = new Date().getTime();

    it('callback should called', (): void => {
        const clock = sinon.useFakeTimers({
            now: now,
            toFake: ['setTimeout']
        });
        const callbackFunction = sinon.stub();
        const dependencyTimer = new DependencyTimer();

        dependencyTimer.start(callbackFunction);
        clock.tick(100);
        assert.isTrue(callbackFunction.calledOnce);

        clock.restore();
    });

    it('timer should stop', (): void => {
        const clock = sinon.useFakeTimers({
            now: now,
            toFake: ['setTimeout', 'clearTimeout']
        });
        const callbackFunction = sinon.stub();
        const dependencyTimer = new DependencyTimer();

        dependencyTimer.start(callbackFunction);
        clock.tick(79);
        dependencyTimer.stop();
        clock.tick(10);
        assert.isFalse(callbackFunction.called);

        clock.restore();
    });
});