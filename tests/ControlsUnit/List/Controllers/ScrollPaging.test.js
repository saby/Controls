define("ControlsUnit/List/Controllers/ScrollPaging.test", ["require", "exports", "chai", "Controls/_list/Controllers/ScrollPaging"], function (require, exports, chai, ScrollPaging) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    describe('Controls.Controllers.ScrollPaging', function () {
        describe('constructor', function () {
            it('top position', function () {
                var result;
                var spInstance = new ScrollPaging.default({
                    scrollParams: {
                        scrollTop: 0,
                        scrollHeight: 150,
                        clientHeight: 50
                    },
                    pagingCfgTrigger: function (cfg) {
                        result = cfg;
                    }
                });
                chai.assert.equal('top', spInstance._curState, 'Wrong curState after ctor');
                chai.assert.deepEqual({
                    arrowState: {
                        begin: "readonly",
                        end: "hidden",
                        next: "visible",
                        prev: "readonly"
                    }
                }, result, 'Wrong pagingCfg after ctor');
            });
            it('middle position', function () {
                var result;
                var spInstance = new ScrollPaging.default({
                    scrollParams: {
                        scrollTop: 50,
                        scrollHeight: 150,
                        clientHeight: 50
                    },
                    pagingCfgTrigger: function (cfg) {
                        result = cfg;
                    }
                });
                chai.assert.equal('middle', spInstance._curState, 'Wrong curState after ctor');
                chai.assert.deepEqual({
                    arrowState: {
                        begin: "visible",
                        end: "hidden",
                        next: "visible",
                        prev: "visible"
                    }
                }, result, 'Wrong pagingCfg after ctor');
            });
            it('top position', function () {
                var result;
                var spInstance = new ScrollPaging.default({
                    scrollParams: {
                        scrollTop: 100,
                        scrollHeight: 150,
                        clientHeight: 50
                    },
                    pagingCfgTrigger: function (cfg) {
                        result = cfg;
                    }
                });
                chai.assert.equal('bottom', spInstance._curState, 'Wrong curState after ctor');
                chai.assert.deepEqual({
                    arrowState: {
                        begin: "visible",
                        end: "hidden",
                        next: "readonly",
                        prev: "visible"
                    }
                }, result, 'Wrong pagingCfg after ctor');
            });
        });
        describe('updateScrollParams', function () {
            var result;
            var spInstance = new ScrollPaging.default({
                scrollParams: {
                    scrollTop: 150,
                    scrollHeight: 250,
                    clientHeight: 50
                },
                pagingCfgTrigger: function (cfg) {
                    result = cfg;
                }
            });
            it('make big window and reach bottom', function () {
                spInstance.updateScrollParams({
                    scrollTop: 150,
                    scrollHeight: 250,
                    clientHeight: 100
                });
                chai.assert.equal('bottom', spInstance._curState, 'Wrong curState after updateScrollParams');
                chai.assert.deepEqual({
                    arrowState: {
                        begin: "visible",
                        end: "hidden",
                        next: "readonly",
                        prev: "visible"
                    }
                }, result, 'Wrong pagingCfg after scroll');
            });
        });
        describe('numbers', () => {
            var result;
            var spInstance = new ScrollPaging.default({
                pagingMode: 'numbers',
                loadedElementsCount: 10,
                totalElementsCount: 100,
                scrollParams: {
                    scrollTop: 0,
                    scrollHeight: 250,
                    clientHeight: 50
                },
                pagingCfgTrigger: function (cfg) {
                    result = cfg;
                }
            });
            it('initPagingData', () => {
                chai.assert.deepEqual(spInstance._pagingData, {totalHeight: 2500, pagesCount: 50, averageElementHeight: 25});
            });
            it('getItemsCountOnPage', () => {
                chai.assert.deepEqual(spInstance.getItemsCountOnPage(), 2);
            });
            it('getNeededItemsCountForPage', () => {
                chai.assert.deepEqual(spInstance.getNeededItemsCountForPage(1), 2);
                chai.assert.deepEqual(spInstance.getNeededItemsCountForPage(2), 4);
                spInstance.shiftToEdge('down', {up: true});
                chai.assert.deepEqual(spInstance.getNeededItemsCountForPage(50), 2);
                chai.assert.deepEqual(spInstance.getNeededItemsCountForPage(49), 4);
            });
            it('getScrollTopByPage numbersState = up', () => {
                spInstance.shiftToEdge('up', {down: true});
                spInstance.updateScrollParams({
                    scrollTop: 0,
                    scrollHeight: 250,
                    clientHeight: 50
                }, { up: false, down: true });
                chai.assert.equal(spInstance.getScrollTopByPage(1), 0, 'wrong scrollTop for page 1');
                chai.assert.equal(spInstance.getScrollTopByPage(2), 50, 'wrong scrollTop for page 2');
                chai.assert.equal(spInstance.getScrollTopByPage(3), 100, 'wrong scrollTop for page 3');
            });
            it('getScrollTopByPage numbersState = down', () => {
                spInstance.shiftToEdge('down', {up: true});
                spInstance.updateScrollParams({
                    scrollTop: 50,
                    scrollHeight: 250,
                    clientHeight: 50
                }, { up: true, down: false });
                chai.assert.equal(spInstance.getScrollTopByPage(50), 200, 'wrong scrollTop for page 10');
                chai.assert.equal(spInstance.getScrollTopByPage(49), 150, 'wrong scrollTop for page 9');
                chai.assert.equal(spInstance.getScrollTopByPage(48), 100, 'wrong scrollTop for page 8');
            });
            describe('getPagingCfg', () => {
                it('top', () => {
                   spInstance.shiftToEdge('up', {});
                   spInstance.updateScrollParams({
                       scrollTop: 0,
                       scrollHeight: 250,
                       clientHeight: 50
                   }, { up: false, down: true });
                   chai.assert(result.selectedPage, 1, 'wrong selected page at the top');
                });

                it('2 page', () => {
                    spInstance.shiftToEdge('up', {});
                    spInstance.updateScrollParams({
                        scrollTop: 50,
                        scrollHeight: 250,
                        clientHeight: 50
                    }, { up: false, down: true });
                    chai.assert(result.selectedPage, 2, 'wrong selected page at the 2 page');
                });

                it('last page from top', () => {
                    spInstance.shiftToEdge('up', {});
                    spInstance.updateScrollParams({
                        scrollTop: 200,
                        scrollHeight: 250,
                        clientHeight: 50
                    }, { up: false, down: false });
                    chai.assert(result.selectedPage, 50, 'wrong selected page at the last page');
                    spInstance.updateScrollParams({
                        scrollTop: 150,
                        scrollHeight: 250,
                        clientHeight: 50
                    }, { up: false, down: false });
                    chai.assert(result.selectedPage, 49, 'wrong selected page at the last page');
                });

                it('last page from bottom', () => {
                    spInstance.shiftToEdge('down', {});
                    spInstance.updateScrollParams({
                        scrollTop: 200,
                        scrollHeight: 250,
                        clientHeight: 50
                    }, { up: true, down: false });
                    chai.assert(result.selectedPage, 50, 'wrong selected page at the last page');
                });

                it('prev page from bottom', () => {
                    spInstance.shiftToEdge('down', {});
                    spInstance.updateScrollParams({
                        scrollTop: 150,
                        scrollHeight: 250,
                        clientHeight: 50
                    }, { up: true, down: false });
                    chai.assert(result.selectedPage, 49, 'wrong selected page at the last page');
                });

                it('first page from bottom', () => {
                    spInstance.shiftToEdge('down', {});
                    spInstance.updateScrollParams({
                        scrollTop: 0,
                        scrollHeight: 250,
                        clientHeight: 50
                    }, { up: false, down: false });
                    chai.assert(result.selectedPage, 1, 'wrong selected page at the first page');
                });
            });
        });
    });
});
