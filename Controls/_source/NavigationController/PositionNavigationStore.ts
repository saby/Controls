import {CursorDirection} from 'Controls/Constants';
import {TNavigationDirection} from 'Controls/_interface/INavigation';
import INavigationStore from './interface/INavigationStore';

interface IPositionHasMore {
    backward: boolean;
    forward: boolean;
}

interface IPositionHasMoreCompatible {
    backward?: boolean;
    forward?: boolean;
    before?: boolean;
    after?: boolean;
}

type TPositionHasMore = IPositionHasMore;

// TODO Общие типы
type TPosition = any;
/**
 * Позиция, от которой нужно начинать скролл
 * Является массивом из любых типов (number, date, string и тд)
 */
type TPositionValue = any[];
type TField = string | string[];
type TFieldValue = string[];

export interface IPositionNavigationStoreOptions {
    field: TField;
    position: TPosition;
    direction: CursorDirection;
    limit: number;
}
export interface IPositionNavigationState {
    field: TField;
    position: TPosition;
    direction: CursorDirection;
    limit: number;
    backwardPosition: TPosition;
    forwardPosition: TPosition;
}
class PositionNavigationStore implements INavigationStore {
    private _field: TFieldValue;
    private _position: TPositionValue;
    private _direction: CursorDirection;
    private _limit: number;

    protected _backwardPosition: TPositionValue = [null];
    protected _forwardPosition: TPositionValue = [null];
    private _more: TPositionHasMore;

    constructor(cfg: IPositionNavigationStoreOptions) {
        if (cfg.field !== undefined) {
            this._field = cfg.field.length ? cfg.field as TFieldValue : [cfg.field] as TFieldValue;
        } else {
            throw new Error('Option field is undefined in PositionNavigation');
        }
        if (cfg.position !== undefined) {
            this._position = cfg.position.length ? cfg.position : [cfg.position];
        } else {
            // Default value of position
            cfg.position = [null];
        }
        if (cfg.direction !== undefined) {
            this._direction = PositionNavigationStore._convertDirection(cfg.direction);
        } else {
            throw new Error('Option direction is undefined in PositionNavigation');
        }
        this._limit = cfg.limit;

        this._more = PositionNavigationStore._getDefaultMoreMeta();
    }

    private static _getDefaultMoreMeta(): IPositionHasMore {
        return {
            backward: false,
            forward: false
        };
    }

    /**
     * Конвертор старых и новых названий направления.
     * TODO Необходимо убрать этот метод, когда своместимость более не понадобится
     * @param position
     */
    private static _convertDirection(position: CursorDirection | 'before' | 'after' | 'both'): CursorDirection {
        const map = {
            before: CursorDirection.backward,
            after: CursorDirection.forward,
            both: CursorDirection.bothways
        };
        return map[position] ? map[position] : position;
    }

    getState(): IPositionNavigationState {
        return {
            field: this._field,
            position: this._position,
            direction: this._direction,
            limit: this._limit,
            backwardPosition: this._backwardPosition,
            forwardPosition: this._forwardPosition
        };
    }

    setForwardPosition(value: TPosition): void {
        this._forwardPosition = value;
    }

    setBackwardPosition(value: TPosition): void {
        this._backwardPosition = value;
    }

    setMetaMore(more: IPositionHasMoreCompatible): void {
        if (more.before) {
            this._more.backward = more.before;
        }
        if (more.backward) {
            this._more.backward = more.backward;
        }
        if (more.after) {
            this._more.forward = more.after;
        }
        if (more.forward) {
            this._more.forward = more.forward;
        }
    }

    getMetaMore(): IPositionHasMore {
        return this._more;
    }

    updateMetaMoreToDirection(direction: 'forward' | 'backward', value: boolean): void {
        this._more[direction] = value;
    }

    destroy(): void {
        this._field = null;
        this._position = null;
        this._direction = null;
        this._limit = null;

        this._backwardPosition = null;
        this._forwardPosition = null;
        this._more = null;
    }
}

export default PositionNavigationStore;
