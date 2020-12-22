import {QueryNavigationType} from 'Types/source';
import {default as PositionNavigationStore, IPositionNavigationState} from './PositionNavigationStore';
import {IBasePositionSourceConfig, IBaseSourceConfig, INavigationPositionSourceConfig} from 'Controls/interface';
import {TNavigationDirection, TNavigationPagingMode, CursorDirection, IQueryParams} from 'Controls/interface';
import {RecordSet} from 'Types/collection';
import {Record, Model} from 'Types/entity';
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

const EDGE_FORWARD_POSITION = -1;
const EDGE_BACKWARD_POSITION = -2;

class PositionParamsCalculator implements IParamsCalculator {
    getQueryParams(
        store: PositionNavigationStore,
        config: INavigationPositionSourceConfig,
        direction?: TNavigationDirection,
        paramsCallback?: Function
    ): IQueryParams {
        const addParams: IQueryParams = {};
        addParams.meta = {navigationType: QueryNavigationType.Position};

        const storeParams = store.getState();
        addParams.limit = storeParams.limit;

        const queryField = PositionParamsCalculator._resolveField(storeParams.field);

        let queryPosition;
        switch (direction) {
            case 'forward': queryPosition = storeParams.forwardPosition; break;
            case 'backward': queryPosition = storeParams.backwardPosition; break;
            default: {
                queryPosition = config.position ? config.position : storeParams.position;

                if (!Array.isArray(queryPosition)) {
                    queryPosition = [queryPosition];
                }
            }
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

        if (paramsCallback) {
            paramsCallback({
                position: queryPosition,
                limit: storeParams.limit
            });
        }
        // TODO lastpage

        return addParams;
    }

    updateQueryProperties(
        store: PositionNavigationStore,
        list: RecordSet,
        metaMore: object,
        config: IBasePositionSourceConfig,
        direction?: TNavigationDirection
    ): IPositionNavigationState  {
        const storeParams = store.getState();

        const queryField = PositionParamsCalculator._resolveField(storeParams.field);
        const queryDirection = PositionParamsCalculator._resolveDirection(direction, storeParams.direction);

        if (typeof metaMore === 'boolean') {
            if (queryDirection !== CursorDirection.bothways) {
                store.updateMetaMoreToDirection(queryDirection, metaMore);
            } else {
                Logger.error('NavigationController: Wrong type of \"more\" value. Must be Object');
            }
        } else {
            if (metaMore instanceof Object) {
                if (queryDirection === CursorDirection.bothways) {
                    store.setMetaMore(metaMore);
                } else {
                    Logger.error('NavigationController: Wrong type of \"more\" value. Must be boolean');
                }
            }
        }

        const metaData = list.getMetaData();
        const metaNextPosition = metaData.nextPosition;
        const metaIterative = metaData.iterative;

        store.setIterative(metaIterative);

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
            if ((list as RecordSet).getCount() && !(metaIterative && metaIterative !== storeParams.iterative)) {
                if (queryDirection !== 'forward') {
                    edgeElem = (list as RecordSet).at(0);
                    store.setBackwardPosition(PositionParamsCalculator._resolvePosition(edgeElem, queryField));
                }
                if (queryDirection !== 'backward') {
                    edgeElem = (list as RecordSet).at((list as RecordSet).getCount() - 1);
                    store.setForwardPosition(PositionParamsCalculator._resolvePosition(edgeElem, queryField));
                }
            } else {
                if (queryDirection !== 'forward') {
                    store.setBackwardPosition([null]);
                }

                if (queryDirection !== 'backward') {
                    store.setForwardPosition([null]);
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

    shiftToEdge(
        store: PositionNavigationStore,
        direction: TNavigationDirection,
        shiftMode: TNavigationPagingMode,
        navigationQueryConfig: IBaseSourceConfig
    ): IBaseSourceConfig {
        let position;

        if (direction === 'backward') {
            if (shiftMode === 'edge' || shiftMode === 'end') {
                position = [EDGE_BACKWARD_POSITION];
            }
        } else if (direction === 'forward') {
            position = [EDGE_FORWARD_POSITION];
        }

        return {...navigationQueryConfig, position};
    }

    updateQueryRange(store: PositionNavigationStore, list: RecordSet, firstItem: Model, lastItem: Model): void {
        const metaNextPosition = list.getMetaData().nextPosition;

        if (!metaNextPosition) {
            const storeState = store.getState();
            const queryField = PositionParamsCalculator._resolveField(storeState.field);
            // TODO поправить, как будет вынесено добавление данных из BaseControl
            // https://online.sbis.ru/opendoc.html?guid=228eaa69-00f6-4ab0-83de-1e6c7fa47817
            const isIterative = storeState.iterative;

            if (!isIterative || storeState.backwardPosition[0] !== null) {
                store.setBackwardPosition(
                    PositionParamsCalculator._resolvePosition(firstItem, queryField)
                );
            }
            if (!isIterative || storeState.forwardPosition[0] !== null) {
                store.setForwardPosition(
                    PositionParamsCalculator._resolvePosition(lastItem, queryField)
                );
            }
        }
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
