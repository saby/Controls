define("ControlsUnit/List/Controllers/ScrollPaging.test", ["require", "exports", "chai", "Controls/_list/Controllers/ScrollPaging"], function (require, exports, chai_1, ScrollPaging_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    describe('Controls.Controllers.ScrollPaging', function () {
        describe('constructor', function () {
            it('top position', function () {
                var result;
                var spInstance = new ScrollPaging_1.default({
                    scrollParams: {
                        scrollTop: 0,
                        scrollHeight: 150,
                        clientHeight: 50
                    },
                    pagingCfgTrigger: function (cfg) {
                        result = cfg;
                    }
                });
                chai_1.assert.equal('top', spInstance._curState, 'Wrong curState after ctor');
                chai_1.assert.deepEqual({
                    arrowState: {
                        begin: "readonly",
                        end: "visible",
                        next: "visible",
                        prev: "readonly"
                    }
                }, result, 'Wrong pagingCfg after ctor');
            });
            it('middle position', function () {
                var result;
                var spInstance = new ScrollPaging_1.default({
                    scrollParams: {
                        scrollTop: 50,
                        scrollHeight: 150,
                        clientHeight: 50
                    },
                    pagingCfgTrigger: function (cfg) {
                        result = cfg;
                    }
                });
                chai_1.assert.equal('middle', spInstance._curState, 'Wrong curState after ctor');
                chai_1.assert.deepEqual({
                    arrowState: {
                        begin: "visible",
                        end: "visible",
                        next: "visible",
                        prev: "visible"
                    }
                }, result, 'Wrong pagingCfg after ctor');
            });
            it('top position', function () {
                var result;
                var spInstance = new ScrollPaging_1.default({
                    scrollParams: {
                        scrollTop: 100,
                        scrollHeight: 150,
                        clientHeight: 50
                    },
                    pagingCfgTrigger: function (cfg) {
                        result = cfg;
                    }
                });
                chai_1.assert.equal('bottom', spInstance._curState, 'Wrong curState after ctor');
                chai_1.assert.deepEqual({
                    arrowState: {
                        begin: "visible",
                        end: "readonly",
                        next: "readonly",
                        prev: "visible"
                    }
                }, result, 'Wrong pagingCfg after ctor');
            });
        });
        describe('updateScrollParams', function () {
            var result;
            var spInstance = new ScrollPaging_1.default({
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
                chai_1.assert.equal('bottom', spInstance._curState, 'Wrong curState after updateScrollParams');
                chai_1.assert.deepEqual({
                    arrowState: {
                        begin: "visible",
                        end: "readonly",
                        next: "readonly",
                        prev: "visible"
                    }
                }, result, 'Wrong pagingCfg after scroll');
            });
        });
    });
});
