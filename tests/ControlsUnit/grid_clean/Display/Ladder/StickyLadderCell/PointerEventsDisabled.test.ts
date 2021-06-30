import { Model } from 'Types/entity';
import { GridStickyLadderCell, GridDataRow } from 'Controls/grid';
import { CssClassesAssert as cAssert } from 'ControlsUnit/CustomAsserts';

const column = { displayProperty: 'col1', stickyProperty: 'ladder' };

describe('Controls/grid/Display/Ladder/StickyLadderCell/PointerEventsDisabled', () => {

    describe('initialize from DataRow', () => {
        const rawData = { key: 1, col1: 'c1-1', col2: 'с2-1', col3: 'с3-1' };
        const columns = [column];
        const ladder = {
            ladder: {
                ladder: {
                    ladderLength: 1
                }
            },
            stickyLadder: {
                ladder: {
                    ladderLength: 1,
                    headingStyle: 'grid-row: 1 / 1'
                }
            }
        };
        let model: Model;

        function getGridDataRow(options?: object): GridDataRow<any> {
            return new GridDataRow({
                owner: {
                    hasMultiSelectColumn: () => false,
                    hasColumnScroll: () => false,
                    getGridColumnsConfig: () => columns,
                    isFullGridSupport: () => true,
                    hasItemActionsSeparatedCell: () => false
                } as any,
                contents: model,
                columns,
                ...options
            });
        }

        beforeEach(() => {
            model = new Model({
                rawData,
                keyProperty: 'key'
            });
        });

        afterEach(() => {
            model = undefined;
        });

        it('initialize with getStickyContentClasses', () => {
            const row = getGridDataRow({
                itemActionsPosition: 'outside'
            });
            row.updateLadder(ladder.ladder, ladder.stickyLadder);
            cAssert.include(row.getColumns()[0].getStickyContentClasses(), 'controls-Grid__ladder-cell__withoutPointerEvents');
        });
        it('initialize without getStickyContentClasses', () => {
            const row = getGridDataRow();
            row.updateLadder(ladder.ladder, ladder.stickyLadder);
            cAssert.notInclude(row.getColumns()[0].getStickyContentClasses(), 'controls-Grid__ladder-cell__withoutPointerEvents');
        });
    });

    describe('contentClasses', () => {
        function getStickyLadderCell(options?: object): GridStickyLadderCell<any, any> {
            return new GridStickyLadderCell({
                owner: {
                    getHoverBackgroundStyle: () => 'default',
                    getTopPadding: () => 'default',
                    getBottomPadding: () => 'default',
                    getLeftPadding: () => 'default',
                    getRightPadding: () => 'default',
                    getStickyLadder: () => ({ first: { ladderLength: 1 } }),
                    getStickyLadderProperties: () => ['first'],
                    hasHeader: () => false,
                    getResultsPosition: () => '',
                    hasStickyGroup: () => false,
                    getColumnIndex: () => 0,
                    getColumnsCount: () => 0,
                    hasMultiSelectColumn: () => false,
                    hasItemActionsSeparatedCell: () => false,
                    getEditingConfig: () => undefined,
                    isDragged: () => false,
                    getMultiSelectVisibility: () => 'hidden',
                    isAnimatedForSelection: () => false
                } as any,
                column,
                wrapperStyle: '',
                stickyProperty: 'stickyProperty',
                stickyHeaderZIndex: 4,
                ...options
            });
        }

        it('getStickyContentClasses, -isPointerEventsDisabled', () => {
            const cell = getStickyLadderCell();
            cAssert.notInclude(cell.getStickyContentClasses(''), 'controls-Grid__ladder-cell__withoutPointerEvents');
        });

        it('getStickyContentClasses, +isPointerEventsDisabled', () => {
            const cell = getStickyLadderCell({
                isPointerEventsDisabled: true
            });
            cAssert.include(cell.getStickyContentClasses(''), 'controls-Grid__ladder-cell__withoutPointerEvents');
        });

        it('getOriginalContentClasses, -isPointerEventsDisabled', () => {
            const cell = getStickyLadderCell();
            cAssert.notInclude(cell.getOriginalContentClasses(''), 'controls-Grid__ladder-cell__withoutPointerEvents');
        });

        it('getOriginalContentClasses, +isPointerEventsDisabled', () => {
            const cell = getStickyLadderCell({
                isPointerEventsDisabled: true
            });
            cAssert.include(cell.getOriginalContentClasses(''), 'controls-Grid__ladder-cell__withoutPointerEvents');
        });
    });
});
