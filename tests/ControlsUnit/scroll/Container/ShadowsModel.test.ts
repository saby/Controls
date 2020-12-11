import ShadowsModel from 'Controls/_scroll/Container/ShadowsModel';
import {
    getDefaultOptions as getShadowsDefaultOptions,
    SHADOW_VISIBILITY
} from 'Controls/_scroll/Container/Interface/IShadows';
import {SCROLL_MODE} from 'Controls/_scroll/Container/Type';

describe('Controls/scroll:Container ShadowsModel', () => {
    const positions = ['top', 'bottom'];

    describe('constructor', () => {
        [{
            scrollMode: SCROLL_MODE.VERTICAL,
            positions: ['top', 'bottom']
        }, {
            scrollMode: SCROLL_MODE.VERTICAL_HORIZONTAL,
            positions: ['top', 'bottom', 'left', 'right']
        }].forEach((test) => {
            it(`should init shadow models. ${test.scrollMode}`, () => {
                const component = new ShadowsModel({
                    ...getShadowsDefaultOptions(),
                    scrollMode: test.scrollMode
                });
                assert.hasAllKeys(component._models, test.positions);
                for (let position of test.positions) {
                    assert.isFalse(component._models[position].isEnabled);
                    assert.isFalse(component._models[position].isVisible);
                }
            });
        })
    });

    describe('updateScrollState', () => {
        [{
            title: 'should show shadows if shadow visibility is auto and scroll position is middle',
            options: {},
            args: {
                verticalPosition: 'middle',
                canVerticalScroll: true
            },
            isEnabled: true,
            isVisible: true
        }, {
            title: 'should not show shadows if shadow visibility is hidden',
            options: {
                topShadowVisibility: SHADOW_VISIBILITY.HIDDEN,
                bottomShadowVisibility: SHADOW_VISIBILITY.HIDDEN,
            },
            args: {
                verticalPosition: 'middle',
                canVerticalScroll: true
            },
            isEnabled: false,
            isVisible: false
        }, {
            title: 'should not show shadows if can not scroll',
            options: {},
            args: {
                verticalPosition: 'start',
                canVerticalScroll: false
            },
            isEnabled: false,
            isVisible: false
        }, {
            title: 'should show bottom shadow',
            options: {},
            args: {
                verticalPosition: 'start',
                canVerticalScroll: true
            },
            isEnabled: true,
            isTopVisible: false,
            isBottomVisible: true,
        }, {
            title: 'should show top shadow',
            options: {},
            args: {
                verticalPosition: 'end',
                canVerticalScroll: true
            },
            isEnabled: true,
            isTopVisible: true,
            isBottomVisible: false,
        }].forEach((test) => {
            it(test.title, () => {
                const component = new ShadowsModel({
                    ...getShadowsDefaultOptions(),
                    scrollMode: 'vertical',
                    ...test.options
                });
                component.updateScrollState(test.args);
                if ('isEnabled' in test) {
                    for (let position of positions) {
                        assert.strictEqual(component._models[position].isEnabled, test.isEnabled, `isEnabled, ${position}`);
                    }
                }
                if ('isVisible' in test) {
                    for (let position of positions) {
                        assert.strictEqual(component._models[position].isVisible, test.isVisible, `isVisible, ${position}`);
                    }
                }
                if ('isTopVisible' in test) {
                    assert.strictEqual(component._models.top.isVisible, test.isTopVisible, 'isVisible, top');
                }
                if ('isBottomVisible' in test) {
                    assert.strictEqual(component._models.bottom.isVisible, test.isBottomVisible, 'isVisible, bottom');
                }
            });
        });
    });

    describe('setStickyFixed', () => {
        [{
            topFixed: true,
            bottomFixed: true,
            shouldCallNextVersion: true
        }, {
            topFixed: true,
            bottomFixed: false,
            shouldCallNextVersion: true
        }, {
            topFixed: false,
            bottomFixed: true,
            shouldCallNextVersion: true
        }, {
            topFixed: false,
            bottomFixed: false,
            shouldCallNextVersion: false
        }, {
            topFixed: true,
            bottomFixed: true,
            needUpdate: false,
            shouldCallNextVersion: false
        }, {
            topFixed: true,
            bottomFixed: true,
            topVisibilityByInnerComponents: SHADOW_VISIBILITY.VISIBLE,
            needUpdate: false,
            shouldCallNextVersion: true
        }].forEach((test, index) => {
            it(`should ${!test.shouldCallNextVersion ? 'not' : ''} call next version ${index}`, () => {
                const component = new ShadowsModel({
                    ...getShadowsDefaultOptions(),
                    scrollMode: 'vertical'
                });

                component._models.top._isEnabled = true;
                component._models.bottom._isEnabled = true;

                sinon.stub(component, '_nextVersion');

                if (test.topVisibilityByInnerComponents) {
                     component._models.top._visibilityByInnerComponents = test.topVisibilityByInnerComponents;
                }

                component.setStickyFixed(test.topFixed, test.bottomFixed, test.needUpdate);
                if (test.shouldCallNextVersion) {
                    sinon.assert.called(component._nextVersion);
                } else {
                    sinon.assert.notCalled(component._nextVersion);
                }

                sinon.restore();
            });
        });
    });

    describe('updateVisibilityByInnerComponents', () => {
        it('should change version if shadow visibility is changed.', () => {
            const shadows = new ShadowsModel({
                ...getShadowsDefaultOptions(),
                scrollMode: SCROLL_MODE.VERTICAL
            });
            const version = shadows.getVersion();
            shadows.updateVisibilityByInnerComponents({
                top: SHADOW_VISIBILITY.VISIBLE,
                bottom: SHADOW_VISIBILITY.VISIBLE
            });
            assert.notStrictEqual(shadows.getVersion(), version);
        });
        it('should\' change "isEnabled" if there are fixed headers.', () => {
            const shadows = new ShadowsModel({
                ...getShadowsDefaultOptions(),
                scrollMode: SCROLL_MODE.VERTICAL
            });
            shadows.setStickyFixed(true, true);
            const version = shadows.getVersion();
            shadows.updateVisibilityByInnerComponents({
                top: SHADOW_VISIBILITY.VISIBLE,
                bottom: SHADOW_VISIBILITY.VISIBLE
            });
            assert.isFalse(shadows.top.isEnabled);
            assert.isFalse(shadows.bottom.isEnabled);
            assert.strictEqual(shadows.getVersion(), version);
        });
    });
});
