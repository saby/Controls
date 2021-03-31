import {assert} from 'chai';
import * as sinon from 'sinon'
import {default as ScrollPaging} from 'Controls/_list/Controllers/ScrollPaging';

describe('Controls/Controllers/ScrollPaging', () => {
    describe('constructor', () => {
        it('scroll at top position', () => {
            const cfg = {
                scrollParams: {
                    scrollTop: 0,
                    scrollHeight: 150,
                    clientHeight: 50
                },
                pagingCfgTrigger: (_) => void 0
            };
            const stub = sinon.stub(cfg, 'pagingCfgTrigger');
            const spInstance = new ScrollPaging(cfg);
            assert.equal('top', spInstance._curState, 'initial state must be \'top\'');
            sinon.assert.calledWith(stub, {
                arrowState: {
                    begin: 'readonly',
                    end: 'hidden',
                    next: 'visible',
                    prev: 'readonly'
                }
            });
        });
        it('scroll at middle position', () => {
            const cfg = {
                scrollParams: {
                    scrollTop: 50,
                    scrollHeight: 150,
                    clientHeight: 50
                },
                pagingCfgTrigger: (_) => void 0
            };
            const stub = sinon.stub(cfg, 'pagingCfgTrigger');
            const spInstance = new ScrollPaging(cfg);
            assert.equal('middle', spInstance._curState, 'initial state must be \'middle\'');
            sinon.assert.calledWith(stub, {
                arrowState: {
                    begin: 'visible',
                    end: 'hidden',
                    next: 'visible',
                    prev: 'visible'
                }
            });
        });
        it('scroll at bottom position', () => {
            const cfg = {
                scrollParams: {
                    scrollTop: 100,
                    scrollHeight: 150,
                    clientHeight: 50
                },
                pagingCfgTrigger: (_) => void 0
            };
            const stub = sinon.stub(cfg, 'pagingCfgTrigger');
            const spInstance = new ScrollPaging(cfg);
            assert.equal('bottom', spInstance._curState, 'initial state must be \'bottom\'');
            sinon.assert.calledWith(stub, {
                arrowState: {
                    begin: 'visible',
                    end: 'hidden',
                    next: 'readonly',
                    prev: 'visible'
                }
            });
        });
    });
    describe('updateScrollParams', () => {
        const cfg = {
            scrollParams: {
                scrollTop: 150,
                scrollHeight: 250,
                clientHeight: 50
            },
            pagingCfgTrigger: (_) => void 0
        };
        const spInstance = new ScrollPaging(cfg);

        it('make big window and reach bottom', () => {
            const stub = sinon.stub(cfg, 'pagingCfgTrigger');
            spInstance.updateScrollParams({
                scrollTop: 150,
                scrollHeight: 250,
                clientHeight: 100
            });
            assert.equal('bottom', spInstance._curState, 'curState must be \'bottom\' after updating scrollParams');
            sinon.assert.calledWith(stub, {
                arrowState: {
                    begin: 'visible',
                    end: 'hidden',
                    next: 'readonly',
                    prev: 'visible'
                }
            });
        });
    });
    describe('pagingMode numbers', () => {
        describe('other methods', () => {
            let spInstance;
            beforeEach(() => {
                spInstance = new ScrollPaging({
                    pagingMode: 'numbers',
                    loadedElementsCount: 10,
                    totalElementsCount: 100,
                    scrollParams: {
                        scrollTop: 0,
                        scrollHeight: 250,
                        clientHeight: 50
                    },
                    pagingCfgTrigger: (_) => void 0
                });
            });
            it('initPagingData', () => {
                assert.deepEqual(spInstance._pagingData,
                        {totalHeight: 2500, pagesCount: 50, averageElementHeight: 25},
                        'wrong calculated paging data');
            });
            it('getItemsCountOnPage', () => {
                assert.deepEqual(spInstance.getItemsCountOnPage(), 2, 'one page contains 2 items');
            });
            it('getNeededItemsCountForPage', () => {
                assert.deepEqual(spInstance.getNeededItemsCountForPage(1), 2, 'need 2 items to display 1 page');
                assert.deepEqual(spInstance.getNeededItemsCountForPage(2), 4, 'need 4 items to display 2 page');
                spInstance.shiftToEdge('down', {up: true});
                assert.deepEqual(spInstance.getNeededItemsCountForPage(50), 2, 'need 2 items from bottom to display 50 page');
                assert.deepEqual(spInstance.getNeededItemsCountForPage(49), 4, 'need 4 items from bottom to display 49 page');
            });
            it('getScrollTopByPage numbersState = up', () => {
                spInstance.shiftToEdge('up', {down: true});
                const scrollParams = {
                    scrollTop: 0,
                    scrollHeight: 250,
                    clientHeight: 50
                };
                spInstance.updateScrollParams(scrollParams, { up: false, down: true });
                assert.equal(spInstance.getScrollTopByPage(1, scrollParams), 0, 'wrong scrollTop for page 1');
                assert.equal(spInstance.getScrollTopByPage(2, scrollParams), 50, 'wrong scrollTop for page 2');
                assert.equal(spInstance.getScrollTopByPage(3, scrollParams), 100, 'wrong scrollTop for page 3');
            });
            it('getScrollTopByPage numbersState = down', () => {
                spInstance.shiftToEdge('down', {up: true});
                const scrollParams = {
                    scrollTop: 50,
                    scrollHeight: 250,
                    clientHeight: 50
                };
                spInstance.updateScrollParams(scrollParams, { up: true, down: false });
                assert.equal(spInstance.getScrollTopByPage(50, scrollParams), 200, 'wrong scrollTop for page 10');
                assert.equal(spInstance.getScrollTopByPage(49, scrollParams), 150, 'wrong scrollTop for page 9');
                assert.equal(spInstance.getScrollTopByPage(48, scrollParams), 100, 'wrong scrollTop for page 8');
            });
        });
        describe('changing selectedPage', () => {
            let spInstance;
            let selectedPage;
            beforeEach(() => {
                spInstance = new ScrollPaging({
                    pagingMode: 'numbers',
                    loadedElementsCount: 10,
                    totalElementsCount: 100,
                    scrollParams: {
                        scrollTop: 0,
                        scrollHeight: 250,
                        clientHeight: 50
                    },
                    pagingCfgTrigger: (cfg) => {
                        selectedPage = cfg.selectedPage;
                    }
                });
            });
            it('changing page from top position', () => {
                spInstance.shiftToEdge('up', {});
                spInstance.updateScrollParams({
                    scrollTop: 0,
                    scrollHeight: 250,
                    clientHeight: 50
                }, { up: false, down: true });
                assert.equal(selectedPage, 1, 'wrong selectedPage at the top');
                spInstance.updateScrollParams({
                    scrollTop: 50,
                    scrollHeight: 250,
                    clientHeight: 50
                }, { up: false, down: true });
                assert.equal(selectedPage, 2, 'wrong selectedPage at the 2 page');
                spInstance.updateScrollParams({
                    scrollTop: 200,
                    scrollHeight: 250,
                    clientHeight: 50
                }, { up: false, down: false });
                assert.equal(selectedPage, 50, 'wrong selectedPage after scrolling to bottom');
            });

            it('Changing page from bottom position', () => {
                spInstance.shiftToEdge('down', { up: true, down: false });
                spInstance.updateScrollParams({
                    scrollTop: 200,
                    scrollHeight: 250,
                    clientHeight: 50
                }, { up: true, down: false });
                assert.equal(selectedPage, 50, 'wrong selectedPage after scrolling to bottom');
                spInstance.updateScrollParams({
                    scrollTop: 150,
                    scrollHeight: 250,
                    clientHeight: 50
                }, { up: true, down: false });
                assert.equal(selectedPage, 49, 'wrong selectedPage on prev page from bottom');
                spInstance.updateScrollParams({
                    scrollTop: 0,
                    scrollHeight: 250,
                    clientHeight: 50
                }, { up: false, down: false });
                assert.equal(selectedPage, 1, 'wrong selectedPage after scrolling to top');
            });
        });
    });
});
