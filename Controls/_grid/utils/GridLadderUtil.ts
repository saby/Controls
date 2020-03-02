import {isEqual} from 'Types/object';
import {detection} from 'Env/Env';

interface IStickyColumnsParams {
    columns: [];
    stickyColumn ?: object;
}

interface IPrepareLadderParams extends IStickyColumnsParams{
    ladderProperties: string[];
    startIndex: number;
    stopIndex: number;
    display: any;
}

export function isSupportLadder(ladderProperties ?: []): boolean {
    return !!(ladderProperties && ladderProperties.length);
}

export function shouldAddStickyLadderCell(columns, stickyColumn, draggingData): boolean {
    return !!getStickyColumn({ stickyColumn, columns }) && !draggingData;
}

export function prepareLadder(params: IPrepareLadderParams): {} {
    var
        fIdx, idx, item, prevItem,
        ladderProperties = params.ladderProperties,
        stickyColumn = getStickyColumn(params),
        supportLadder = isSupportLadder(ladderProperties),
        supportSticky = !!stickyColumn,
        ladder = {}, ladderState = {}, stickyLadder = {},
        stickyLadderState = {
            ladderLength: 1
        };

    if (!supportLadder && !stickyColumn) {
        return {};
    }

    function processLadder(params) {
        var
            value = params.value,
            prevValue = params.prevValue,
            state = params.state;

        // isEqual works with any types
        if (isEqual(value, prevValue)) {
            state.ladderLength++;
        } else {
            params.ladder.ladderLength = state.ladderLength;
            state.ladderLength = 1;
        }
    }

    function processStickyLadder(params) {
        processLadder(params);
        if (params.ladder.ladderLength && !detection.isNotFullGridSupport) {
            params.ladder.headingStyle = 'grid-row: span ' + params.ladder.ladderLength;
        }
    }

    if (supportLadder) {
        for (fIdx = 0; fIdx < ladderProperties.length; fIdx++) {
            ladderState[ladderProperties[fIdx]] = {
                ladderLength: 1
            };
        }
    }

    for (idx = params.stopIndex - 1; idx >= params.startIndex; idx--) {
        item = params.display.at(idx).getContents();
        prevItem = idx - 1 >= params.startIndex ? params.display.at(idx - 1).getContents() : null;

        if (supportLadder) {
            ladder[idx] = {};
            for (fIdx = 0; fIdx < ladderProperties.length; fIdx++) {
                ladder[idx][ladderProperties[fIdx]] = {};
                processLadder({
                    itemIndex: idx,
                    value: item.get ? item.get(ladderProperties[fIdx]) : undefined,
                    prevValue: prevItem && prevItem.get ? prevItem.get(ladderProperties[fIdx]) : undefined,
                    state: ladderState[ladderProperties[fIdx]],
                    ladder: ladder[idx][ladderProperties[fIdx]]
                });
            }
        }

        if (supportSticky) {
            stickyLadder[idx] = {};
            processStickyLadder({
                itemIndex: idx,
                value: item.get(stickyColumn.property),
                prevValue: prevItem ? prevItem.get(stickyColumn.property) : undefined,
                state: stickyLadderState,
                ladder: stickyLadder[idx]
            });
        }
    }
    return {
        ladder: ladder,
        stickyLadder: stickyLadder
    };
}

export function getStickyColumn(params: IStickyColumnsParams): object {
    let result;
    if (params.stickyColumn) {
        result = {
            index: params.stickyColumn.index,
            property: params.stickyColumn.property
        };
    } else if (params.columns) {
        for (var idx = 0; idx < params.columns.length; idx++) {
            if (params.columns[idx].stickyProperty) {
                result = {
                    index: idx,
                    property: params.columns[idx].stickyProperty
                };
                break;
            }
        }
    }
    return result;
}
