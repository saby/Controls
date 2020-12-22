define(
    [
        'Controls/scroll'
    ],
    function (scroll) {
        'use strict';
        let hasScrollbar = scroll.hasScrollbar;
        describe('Controls/scroll:hasScrollbar', function () {
            describe('hasScrollbar', function () {
                it('hasScrollbar width', function () {
                    let element = {
                        clientWidth: 477,
                        scrollWidth: 477
                    };
                    let result = hasScrollbar(element, 'x');
                    assert.isFalse(result);
                });
                it('hasScrollbar height', function () {
                    let element = {
                        clientHeight: 478,
                        scrollHeight: 480
                    };
                    let result = hasScrollbar(element, 'y');
                    assert.isTrue(result);
                });
                it('hasScrollbar', function () {
                    let element = {
                        clientHeight: 478,
                        scrollHeight: 480,
                        clientWidth: 300,
                        scrollWidth: 0
                    };
                    let result = hasScrollbar(element);
                    assert.isTrue(result);
                });
                it('hasScrollbar vertical', function () {
                    let element = {
                        clientHeight: 478,
                        scrollHeight: 480
                    };
                    let result = hasScrollbar.vertical(element);
                    assert.isTrue(result);
                });
                it('hasScrollbar horizontal', function () {
                    let element = {
                        clientWidth: 476,
                        scrollWidth: 470
                    };
                    let result = hasScrollbar.horizontal(element);
                    assert.isFalse(result);
                });
            });
        });
    }
);
