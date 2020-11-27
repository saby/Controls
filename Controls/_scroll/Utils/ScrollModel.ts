import ScrollState, {IScrollState} from './ScrollState';
import {canScrollByState, getScrollPositionTypeByState, SCROLL_DIRECTION} from 'Controls/_scroll/Utils/Scroll';

export default class ScrollModel extends ScrollState {
    updateState(newState: IScrollState): boolean {
        let isScrollStateUpdated = false;
        Object.keys(newState).forEach((key) => {
            if (this[key] !== newState[key]) {
                this[key] = newState[key];
                isScrollStateUpdated = true;
            }
        });
        if (isScrollStateUpdated) {
            this._updateCalculatedState();
        }
        return isScrollStateUpdated;
    }

    private _updateCalculatedState(): void {
        this._canVerticalScroll = canScrollByState(this, SCROLL_DIRECTION.VERTICAL);
        this._canHorizontalScroll = canScrollByState(this, SCROLL_DIRECTION.HORIZONTAL);
        this._verticalPosition = getScrollPositionTypeByState(this, SCROLL_DIRECTION.VERTICAL);
        this._horizontalPosition = getScrollPositionTypeByState(this, SCROLL_DIRECTION.HORIZONTAL);
        this._viewPortRect = this._content.getBoundingClientRect();
    }
}
