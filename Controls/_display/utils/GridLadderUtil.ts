import { isEqual } from 'Types/object';
import isFullGridSupport from './GridSupportUtil';
import { detection } from 'Env/Env';
import { TColumns } from 'Controls/grid';

export interface IStickyColumn {
    index: number;
    property: string;
}

interface IStickyColumnsParams {
    columns: TColumns;
    stickyColumn ?: object;
}

interface IPrepareLadderParams extends IStickyColumnsParams{
    ladderProperties: string[];
    startIndex: number;
    stopIndex: number;
    display: any;
}

export function isSupportLadder(ladderProperties ?: string[]): boolean {
    return !!(ladderProperties && ladderProperties.length);
}

export function shouldAddStickyLadderCell(columns, stickyColumn, draggingData): boolean {
    return !!getStickyColumn({ stickyColumn, columns }) && !draggingData;
}
export function stickyLadderCellsCount(columns, stickyColumn, draggingData): number {
    return detection.isIE || draggingData ? 0 : ( getStickyColumn({ stickyColumn, columns })?.property.length || 0 );
}
export function prepareLadder(params: IPrepareLadderParams): {} {
    var
        fIdx, idx, item, prevItem,
        ladderProperties = params.ladderProperties,
        stickyColumn = getStickyColumn(params),
        supportLadder = isSupportLadder(ladderProperties),
        supportSticky = !!stickyColumn,
        stickyProperties = [],
        ladder = {}, ladderState = {}, stickyLadder = {},
        stickyLadderState = {};

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
        if (params.ladder.ladderLength && isFullGridSupport()) {
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
    if (supportSticky) {
        stickyProperties = stickyColumn.property;
        for (fIdx = 0; fIdx < stickyProperties.length; fIdx++) {
            stickyLadderState[stickyProperties[fIdx]] = {
                ladderLength: 1
            };
        }
    }

    for (idx = params.stopIndex - 1; idx >= params.startIndex; idx--) {
        const dispItem = params.display.at(idx);
        item = dispItem.getContents();
        let prevDispItem = idx - 1 >= params.startIndex ? params.display.at(idx - 1) : null;

        // Если запись редактируетсяя, то она не участвует в рассчете лесенки.
        if (prevDispItem && prevDispItem.isEditing()) {
            prevDispItem = null;
        }
        if (!item || dispItem.isEditing()) {
            continue;
        }
        prevItem = prevDispItem ? prevDispItem.getContents() : null;

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
            for (fIdx = 0; fIdx < stickyProperties.length; fIdx++) {
                stickyLadder[idx][stickyProperties[fIdx]] = {};
                processStickyLadder({
                    itemIndex: idx,
                    value: item.get ? item.get(stickyProperties[fIdx]) : undefined,
                    prevValue: prevItem && prevItem.get ? prevItem.get(stickyProperties[fIdx]) : undefined,
                    state: stickyLadderState[stickyProperties[fIdx]],
                    ladder: stickyLadder[idx][stickyProperties[fIdx]]
                });
            }
        }
    }
    return {
        ladder: ladder,
        stickyLadder: stickyLadder
    };
}

export function getStickyColumn(params: IStickyColumnsParams): IStickyColumn {
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
    if (result && !(result.property instanceof Array)) {
        result.property = [result.property]
    }
    return result;
}
