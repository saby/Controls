import { assert } from 'chai';
import * as rk from 'i18n!ControlsUnit';

import { IItemAction } from 'Controls/_itemActions/interface/IItemActions';
import { horizontalMeasurer } from 'Controls/_itemActions/measurers/HorizontalMeasurer';

describe('Controls/_itemActions/measurers/HorizontalMeasurer', () => {
    it('needIcon', () => {
        assert.isFalse(horizontalMeasurer.needIcon({}, 'none', true));
        assert.isFalse(horizontalMeasurer.needIcon({}, 'none', false));
        assert.isFalse(horizontalMeasurer.needIcon({}, 'right', false));
        assert.isTrue(horizontalMeasurer.needIcon({}, 'right', true));
        assert.isTrue(
            horizontalMeasurer.needIcon(
                {
                    icon: '123'
                },
                'none',
                true
            )
        );
        assert.isTrue(
            horizontalMeasurer.needIcon(
                {
                    icon: '123'
                },
                'none',
                false
            )
        );
    });

    it('needTitle', () => {
        assert.isFalse(
            horizontalMeasurer.needTitle(
                {
                    icon: 'icon-Message'
                },
                'none'
            )
        );
        assert.isFalse(
            horizontalMeasurer.needTitle(
                {
                    icon: 'icon-Message'
                },
                'right'
            )
        );
        assert.isTrue(horizontalMeasurer.needTitle({}, 'none'));
        assert.isTrue(horizontalMeasurer.needTitle({}, 'right'));
        assert.isTrue(
            horizontalMeasurer.needTitle(
                {
                    title: '123'
                },
                'none'
            )
        );
        assert.isTrue(
            horizontalMeasurer.needTitle(
                {
                    title: '123'
                },
                'right'
            )
        );
        assert.isTrue(
            horizontalMeasurer.needTitle(
                {
                    title: '123'
                },
                'bottom'
            )
        );
    });

    describe('getSwipeConfig', () => {
        const actions: IItemAction[] = [
            {
                id: 1,
                icon: 'icon-PhoneNull'
            },
            {
                id: 2,
                icon: 'icon-Erase'
            },
            {
                id: 3,
                icon: 'icon-EmptyMessage'
            }
        ];

        it('more than 3 actions, should add menu', () => {
            const result = {
                itemActionsSize: 'm',
                itemActions: {
                    all: actions.concat({
                        id: 4,
                        icon: 'icon-DK'
                    }),
                    showed: actions.slice(0, 3).concat({
                        id: null,
                        icon: 'icon-SwipeMenu',
                        title: rk('Ещё'),
                        _isMenu: true,
                        showType: 2
                    })
                },
                paddingSize: 'm'
            };

            assert.deepInclude(
                horizontalMeasurer.getSwipeConfig(
                    actions.concat({
                        id: 4,
                        icon: 'icon-DK'
                    }),
                    20,
                    'right'
                ),
                result
            );
        });

        it('small row without title, itemActionsSize should be m', () => {
            const result = {
                itemActionsSize: 'm',
                itemActions: {
                    all: actions,
                    showed: actions
                },
                paddingSize: 'm'
            };

            assert.deepInclude(
                horizontalMeasurer.getSwipeConfig(actions, 20, 'none'),
                result
            );
        });

        it('big row without title, itemActionsSize should be l', () => {
            const result = {
                itemActionsSize: 'l',
                itemActions: {
                    all: actions,
                    showed: actions
                },
                paddingSize: 'm'
            };

            assert.deepInclude(
                horizontalMeasurer.getSwipeConfig(actions, 39, 'none'),
                result
            );
        });

        it('small row with title, itemActionsSize should be m', () => {
            const result = {
                itemActionsSize: 'm',
                itemActions: {
                    all: actions,
                    showed: actions
                },
                paddingSize: 'm'
            };

            assert.deepInclude(
                horizontalMeasurer.getSwipeConfig(actions, 20, 'bottom'),
                result
            );
        });

        it('big row with title, itemActionsSize should be l', () => {
            const result = {
                itemActionsSize: 'l',
                itemActions: {
                    all: actions,
                    showed: actions
                },
                paddingSize: 'm'
            };

            assert.deepInclude(
                horizontalMeasurer.getSwipeConfig(actions, 59, 'bottom'),
                result
            );
        });

        it('main actions', () => {
            const otherActions: IItemAction[] = [
                {
                    id: 1,
                    showType: 2,
                    icon: 'icon-PhoneNull'
                },
                {
                    id: 5,
                    icon: 'icon-PhoneNull',
                    parent: 1
                },
                {
                    id: 2,
                    showType: 2,
                    icon: 'icon-Erase'
                },
                {
                    id: 3,
                    showType: 0,
                    icon: 'icon-EmptyMessage'
                },
                {
                    id: 4,
                    showType: 2,
                    icon: 'icon-Profile'
                }];
            const result: IItemAction[] = [
                {
                    id: 1,
                    showType: 2,
                    icon: 'icon-PhoneNull'
                },
                {
                    id: 2,
                    showType: 2,
                    icon: 'icon-Erase'
                },
                {
                    id: 4,
                    showType: 2,
                    icon: 'icon-Profile'
                },
                {
                    id: null,
                    icon: 'icon-SwipeMenu',
                    title: rk('Ещё'),
                    _isMenu: true,
                    showType: 2
                }
            ];
            assert.deepEqual(
                result,
                horizontalMeasurer.getSwipeConfig(otherActions, 59, 'none').itemActions.showed
            );
        });
    });
});
