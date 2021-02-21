import { isEqual } from 'Types/object';
import isFullGridSupport from './GridSupportUtil';
import { TColumns } from 'Controls/grid';

export interface IStickyColumn {
    index: number;
    property: string;
}

export interface ILadderObject {
    ladder: Array<TLadderElement<ILadderConfig>>;
    stickyLadder: Array<TLadderElement<IStickyLadderConfig>>;
}

export type TLadderElement<T extends ILadderConfig> = Record<string, T>;

export interface ILadderConfig {
    ladderLength: number;
}

export interface IStickyLadderConfig extends ILadderConfig {
    headingStyle: string;
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

    task1181099336?: boolean;
}

export function isSupportLadder(ladderProperties ?: string[]): boolean {
    return !!(ladderProperties && ladderProperties.length);
}

export function shouldAddStickyLadderCell(columns, stickyColumn, draggingData): boolean {
    return !!getStickyColumn({ stickyColumn, columns }) && !draggingData;
}
export function stickyLadderCellsCount(columns, stickyColumn, draggingData): number {
    return !isFullGridSupport() || draggingData ? 0 : ( getStickyColumn({ stickyColumn, columns })?.property.length || 0 );
}
export function prepareLadder(params: IPrepareLadderParams): ILadderObject {
    var
        fIdx, idx, item, prevItem,
        ladderProperties = params.ladderProperties,
        stickyColumn = getStickyColumn(params),
        supportLadder = isSupportLadder(ladderProperties),
        supportSticky = !!stickyColumn,
        stickyProperties = [],
        ladder = {}, ladderState = {}, stickyLadder = {},
        stickyLadderState = {};

    const nodeProperty = params.task1181099336 && params.display.getNodeProperty();

    if (!supportLadder && !stickyColumn) {
        return {};
    }

    function processLadder(params) {
        const value = params.value;
        const prevValue = params.prevValue;
        const state = params.state;
        const hasMainLadder = !!(params.mainLadder?.ladderLength);

        // isEqual works with any types
        if (isEqual(value, prevValue) && !hasMainLadder) {
            state.ladderLength++;
            if (params.hasNodeFooter) {
                state.ladderLength++;
            }
        } else {
            if (params.hasNodeFooter) {
                state.ladderLength++;
            }
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
                    ladder: ladder[idx][ladderProperties[fIdx]],
                    mainLadder: ladder[idx][ladderProperties[fIdx - 1]],
                    hasNodeFooter: params.task1181099336 && item.get && item.get(nodeProperty)
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
                    ladder: stickyLadder[idx][stickyProperties[fIdx]],
                    mainLadder: stickyLadder[idx][stickyProperties[fIdx - 1]],
                    hasNodeFooter: params.task1181099336 && item.get && item.get(nodeProperty)
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
