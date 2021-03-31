import ScrollState, {IScrollState} from './ScrollState';

export default class ScrollModel extends ScrollState {
    updateState(newState: IScrollState): boolean {
        let isScrollStateUpdated = false;
        Object.keys(newState).forEach((state) => {
            let protectedState;
            if (state.indexOf('_') === -1) {
                protectedState = '_' + state;
            }
            if (this[protectedState] !== newState[state]) {
                this[protectedState] = newState[state];
                isScrollStateUpdated = true;
            }
        });
        if (isScrollStateUpdated) {
            this._updateCalculatedState();
        }
        return isScrollStateUpdated;
    }
}
