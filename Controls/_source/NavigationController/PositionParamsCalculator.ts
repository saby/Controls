import {IAdditionalQueryParams, Direction} from 'Controls/_interface/IAdditionalQueryParams';
import {QueryNavigationType} from 'Types/source';
import {default as PositionNavigationStore, IPositionNavigationState} from './PositionNavigationStore';
import {IBasePositionSourceConfig, INavigationPositionSourceConfig} from 'Controls/interface';
import {TNavigationDirection} from 'Controls/_interface/INavigation';
import {RecordSet} from 'Types/collection';
import {CursorDirection} from 'Controls/Constants';
import {Logger} from 'UI/Utils';
import IParamsCalculator from './interface/IParamsCalculator';

// TODO Общие типы
type TPosition = any;
/**
 * Позиция, от которой нужно начинать скролл
 * Является массивом из любых типов (number, date, string и тд)
 */
type TPositionValue = any[];
type TField = string | string[];
type TFieldValue = string[];

class PositionParamsCalculator implements IParamsCalculator {
    getQueryParams(
        store: PositionNavigationStore,
        config: INavigationPositionSourceConfig,
        direction?: TNavigationDirection
    ): IAdditionalQueryParams {
        const addParams: IAdditionalQueryParams = {};
        addParams.meta = {navigationType: QueryNavigationType.Position};

        const storeParams = store.getState();
        addParams.limit = storeParams.limit;

        const queryField = PositionParamsCalculator._resolveField(storeParams.field);

        let queryPosition;
        switch (direction) {
            case 'forward': queryPosition = storeParams.forwardPosition; break;
            case 'backward': queryPosition = storeParams.backwardPosition; break;
            default: queryPosition = config.position ? config.position : storeParams.position;
        }

        const queryDirection = PositionParamsCalculator._resolveDirection(direction, storeParams.direction);
        let sign;
        switch (queryDirection) {
            case CursorDirection.forward:
                sign = '>=';
                break;
            case CursorDirection.backward:
                sign = '<=';
                break;
            case CursorDirection.bothways:
                sign = '~';
                break;
        }

        const additionalFilter = {};
        for (let i = 0; i < queryField.length; i++) {
            additionalFilter[queryField[i] + sign] = queryPosition[i];
        }
        addParams.filter = additionalFilter;
        // TODO callback
        // TODO lastpage

        return addParams;
    }

    updateQueryProperties(
        store: PositionNavigationStore,
        list: RecordSet,
        config: IBasePositionSourceConfig,
        direction?: TNavigationDirection
    ): IPositionNavigationState  {
        const moreValue = list.getMetaData().more;
        const storeParams = store.getState();

        const queryField = PositionParamsCalculator._resolveField(storeParams.field);
        const queryDirection = PositionParamsCalculator._resolveDirection(direction, storeParams.direction);

        if (typeof moreValue === 'boolean') {
            if (queryDirection !== CursorDirection.bothways) {
                store.updateMetaMoreToDirection(queryDirection, moreValue);
            } else {
                Logger.error('NavigationController: Wrong type of \"more\" value. Must be Object');
            }
        } else {
            if (moreValue instanceof Object) {
                if (queryDirection === CursorDirection.bothways) {
                    store.setMetaMore(moreValue);
                } else {
                    Logger.error('NavigationController: Wrong type of \"more\" value. Must be boolean');
                }
            }
        }

        const metaNextPosition = list.getMetaData().nextPosition;

        if (metaNextPosition) {
            if (metaNextPosition instanceof Array) {
                if (queryDirection !== CursorDirection.bothways) {
                    if (queryDirection === CursorDirection.forward) {
                        store.setForwardPosition(metaNextPosition);
                    } else if (queryDirection === CursorDirection.backward) {
                        store.setBackwardPosition(metaNextPosition);
                    }
                } else {
                    Logger.error('NavigationController: Wrong type of \"nextPosition\" value. Must be object');
                }
            } else {
                if (queryDirection === CursorDirection.bothways) {
                    if (metaNextPosition.before && metaNextPosition.before instanceof Array
                        && metaNextPosition.after && metaNextPosition.after instanceof Array) {
                        store.setBackwardPosition(metaNextPosition.before);
                        store.setForwardPosition(metaNextPosition.after);
                    } else if (metaNextPosition.backward && metaNextPosition.backward instanceof Array
                        && metaNextPosition.forward && metaNextPosition.forward instanceof Array) {
                        store.setBackwardPosition(metaNextPosition.backward);
                        store.setForwardPosition(metaNextPosition.forward);
                    } else {
                        Logger.error('QueryParamsController/Position: ' +
                            'Wrong type of \"nextPosition\" value. Must be Object width `before` and `after` properties.' +
                            'Each properties must be Arrays');
                    }
                } else {
                    Logger.error('QueryParamsController/Position: Wrong type of \"nextPosition\" value. Must be Array');
                }
            }

        } else {
            let edgeElem;
            if ((list as RecordSet).getCount()) {
                if (queryDirection !== 'forward') {
                    edgeElem = (list as RecordSet).at(0);
                    store.setBackwardPosition(PositionParamsCalculator._resolvePosition(edgeElem, queryField));
                }
                if (queryDirection !== 'backward') {
                    edgeElem = (list as RecordSet).at((list as RecordSet).getCount() - 1);
                    store.setForwardPosition(PositionParamsCalculator._resolvePosition(edgeElem, queryField));
                }
            }
        }
        return store.getState();
    }

    hasMoreData(store: PositionNavigationStore, direction: TNavigationDirection): boolean {
        let result: boolean;
        const more = store.getMetaMore();

        // moreResult === undefined, when navigation for passed rootKey is not defined
        if (more === undefined) {
            result = false;
        } else {
            return more[direction];
        }

        return result;
    }

    destroy(): void {
        return;
    }

    private static _resolveDirection(
        loadDirection: TNavigationDirection,
        optDirection: CursorDirection
    ): CursorDirection {
        let navDirection: CursorDirection;
        if (loadDirection === 'forward') {
            navDirection = CursorDirection.forward;
        } else if (loadDirection === 'backward') {
            navDirection = CursorDirection.backward;
        } else {
            navDirection = optDirection;
        }
        return navDirection;
    }

    private static _resolveField(optField: TField): TFieldValue {
        return (optField instanceof Array) ? optField : [optField];
    }

    private static _resolvePosition(item: Record, field: TFieldValue): TPositionValue {
        const navPosition: TPositionValue = [];
        for (let i = 0; i < field.length; i++) {
            navPosition.push(item.get(field[i]));
        }
        return navPosition;
    }

}

export default PositionParamsCalculator;
