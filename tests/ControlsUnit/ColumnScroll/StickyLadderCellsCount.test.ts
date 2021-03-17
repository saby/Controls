import {assert} from 'chai';
import {ColumnScrollController} from 'Controls/columnScroll';

describe('Controls/ColumnScroll/StickyLadderCellsCount', () => {
    let columnScroll: ColumnScrollController;
    let fixedColumnsSelector;

    const mockContainers = {
        scrollContainer: {} as undefined as HTMLElement,
        contentContainer: {
            getBoundingClientRect: () => ({
                left: 0
            }),
            querySelector: (selector: string) => {
                fixedColumnsSelector = selector;
                return {
                    getBoundingClientRect: () => ({
                        left: 0
                    })
                } as undefined as HTMLElement;
            }
        } as undefined as HTMLElement,
        stylesContainer: {} as undefined as HTMLStyleElement
    };

    beforeEach(() => {
        fixedColumnsSelector = null;
    });

    it('should return correct fixed columns with ladder', () => {
        columnScroll = new ColumnScrollController({
            hasMultiSelect: false,
            stickyColumnsCount: 2,
            stickyLadderCellsCount: 1
        });
        columnScroll.setContainers(mockContainers);
        columnScroll.setStickyColumnsCount(2);
        assert.equal(fixedColumnsSelector, '.controls-Grid_columnScroll__fixed:nth-child(3)');
    });

    it('should return correct fixed columns without ladder', () => {
        columnScroll = new ColumnScrollController({
            hasMultiSelect: false,
            stickyColumnsCount: 2
        });
        columnScroll.setContainers(mockContainers);
        columnScroll.setStickyColumnsCount(2);
        assert.equal(fixedColumnsSelector, '.controls-Grid_columnScroll__fixed:nth-child(2)');
    });
});
