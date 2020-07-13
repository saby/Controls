import {mixin} from 'Types/util';
import {IVersionable, VersionableMixin} from 'Types/entity';
import {POSITION} from './Type';
import {SHADOW_VISIBILITY, IShadowsOptions} from './Interface/IShadows';
import {canScrollByState, SCROLL_POSITION, SCROLL_DIRECTION} from '../Utils/Scroll';
import {IScrollState} from '../Utils/ScrollState';

const SHADOW_ENABLE_MAP = {
    hidden: false,
    visible: true,
    auto: true
};

const enum SHADOW_TYPE {
    BEFORE = 'before',
    AFTER = 'after'
}

const upperDirection = {
    vertical: 'Vertical',
    horizontal: 'Horizontal'
}

export default class ShadowModel extends mixin<VersionableMixin>(VersionableMixin) implements IVersionable {
    readonly '[Types/_entity/VersionableMixin]': true;

    private _options: IShadowsOptions;
    private _position: POSITION;
    private _direction: SCROLL_DIRECTION;
    private _type: SHADOW_TYPE;
    private _isEnabled: boolean = true;
    private _isVisible: boolean = false;

    private _visibilityByInnerComponents: SHADOW_VISIBILITY = SHADOW_VISIBILITY.AUTO;

    constructor(position: POSITION, options: IShadowsOptions) {
        super(options);
        this._position = position;
        if (position === POSITION.TOP || position === POSITION.BOTTOM) {
            this._direction = SCROLL_DIRECTION.VERTICAL;
        } else if (position === POSITION.LEFT || position === POSITION.RIGHT) {
            this._direction = SCROLL_DIRECTION.HORIZONTAL;
        }
        if (position === POSITION.TOP || position === POSITION.LEFT) {
            this._type = SHADOW_TYPE.BEFORE;
        } else if (position === POSITION.BOTTOM || position === POSITION.RIGHT) {
            this._type = SHADOW_TYPE.AFTER;
        }
        this._options = options;
    }

    get isEnabled() {
        return this._isEnabled;
    }

    get isVisible() {
        if (this._visibilityByInnerComponents !== SHADOW_VISIBILITY.AUTO) {
            return SHADOW_ENABLE_MAP[this._visibilityByInnerComponents];
        }

        const visibility = this._options[`${this._position}ShadowVisibility`];
        if (visibility !== SHADOW_VISIBILITY.AUTO) {
            return SHADOW_ENABLE_MAP[visibility];
        }

        return this._isVisible;
    }

    updateOptions(options: IShadowsOptions): void {
        this._options = options;
    }

    updateScrollState(scrollState: IScrollState): void {
        const position: SCROLL_POSITION = scrollState[`${this._direction}Position`];

        const isEnabled: boolean = this._getShadowEnable(this._canScrollByScrollState(scrollState));
        if (isEnabled !== this._isEnabled) {
            this._isEnabled = isEnabled;
            this._nextVersion();
        }

        const isVisible: boolean = isEnabled && ((this._type === SHADOW_TYPE.BEFORE && position !== SCROLL_POSITION.START) ||
            (this._type === SHADOW_TYPE.AFTER && position !== SCROLL_POSITION.END));

        if (isVisible !== this._isVisible) {
            this._isVisible = isVisible;
            this._nextVersion();
        }


    }

    private _canScrollByScrollState(state: IScrollState): boolean {
        return state[`can${upperDirection[this._direction]}Scroll`]
    }

    private _getShadowEnable(canScroll: boolean): boolean {
        return this._options[`${this._position}ShadowVisibility`] === SHADOW_VISIBILITY.VISIBLE ||
            (this._isShadowEnable() && canScroll)
    }

    /**
     * Возвращает включено ли отображение тени.
     * Если отключено, то не рендерим контейнер тени и не рассчитываем его состояние.
     * @param options Опции компонента.
     * @param position Позиция тени.
     */
    private _isShadowEnable(): boolean {
        return SHADOW_ENABLE_MAP[this._options[`${this._position}ShadowVisibility`]];
    }
}
