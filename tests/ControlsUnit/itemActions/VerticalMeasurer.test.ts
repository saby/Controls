import { assert } from 'chai';
import * as rk from 'i18n!ControlsUnit';

import { verticalMeasurer } from 'Controls/_itemActions/measurers/VerticalMeasurer';
import { IItemAction } from 'Controls/_itemActions/interface/IItemActions';

describe('Controls/_itemActions/measurers/VerticalMeasurer', () => {
    it('needIcon', () => {
        assert.isFalse(verticalMeasurer.needIcon({}, 'bottom'));
        assert.isFalse(verticalMeasurer.needIcon({}, 'none'));
        assert.isFalse(verticalMeasurer.needIcon({}, 'right'));
        assert.isFalse(verticalMeasurer.needIcon({}, 'bottom', true));
        assert.isFalse(verticalMeasurer.needIcon({}, 'none', true));
        assert.isTrue(verticalMeasurer.needIcon({}, 'right', true));
        assert.isTrue(
            verticalMeasurer.needIcon(
                {
                    icon: '123'
                },
                'bottom'
            )
        );
        assert.isTrue(
            verticalMeasurer.needIcon(
                {
                    icon: '123'
                },
                'right'
            )
        );
        assert.isTrue(
            verticalMeasurer.needIcon(
                {
                    icon: '123'
                },
                'none'
            )
        );
        assert.isTrue(
            verticalMeasurer.needIcon(
                {
                    icon: '123'
                },
                'bottom',
                true
            )
        );
        assert.isTrue(
            verticalMeasurer.needIcon(
                {
                    icon: '123'
                },
                'right',
                true
            )
        );
        assert.isTrue(
            verticalMeasurer.needIcon(
                {
                    icon: '123'
                },
                'none',
                true
            )
        );
    });

    it('needTitle', () => {
        assert.isFalse(
            verticalMeasurer.needTitle(
                {
                    icon: 'icon-Message'
                },
                'none'
            )
        );
        assert.isFalse(
            verticalMeasurer.needTitle(
                {
                    icon: 'icon-Message'
                },
                'right'
            )
        );
        assert.isTrue(verticalMeasurer.needTitle({}, 'none'));
        assert.isTrue(verticalMeasurer.needTitle({}, 'right'));
        assert.isTrue(
            verticalMeasurer.needTitle(
                {
                    title: '123'
                },
                'none'
            )
        );
        assert.isTrue(
            verticalMeasurer.needTitle(
                {
                    title: '123'
                },
                'right'
            )
        );
        assert.isTrue(
            verticalMeasurer.needTitle(
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

        describe('without title', () => {
            it('small row, only menu should be drawn', () => {
                var result = {
                    itemActionsSize: 'm',
                    itemActions: {
                        all: actions,
                        showed: [
                            {
                                id: null,
                                icon: 'icon-SwipeMenu',
                                title: rk('Ещё'),
                                _isMenu: true,
                                showType: 2
                            }
                        ]
                    },
                    paddingSize: 'm',
                    twoColumns: false
                };

                assert.deepOwnInclude(
                    verticalMeasurer.getSwipeConfig(actions, 20, 'none'),
                    result
                );
            });

            it('average row, all actions should be drawn, itemActionsSize should be m', () => {
                const result = {
                    itemActionsSize: 'm',
                    itemActions: {
                        all: actions,
                        showed: actions
                    },
                    paddingSize: 'm',
                    twoColumns: false
                };

                assert.deepOwnInclude(
                    verticalMeasurer.getSwipeConfig(actions, 97, 'none'),
                    result
                );
            });

            it('big row, all actions should be drawn, itemActionsSize should be l', () => {
                const result = {
                    itemActionsSize: 'l',
                    itemActions: {
                        all: actions,
                        showed: actions
                    },
                    paddingSize: 'm',
                    twoColumns: false
                };

                assert.deepOwnInclude(
                    verticalMeasurer.getSwipeConfig(actions, 150, 'none'),
                    result
                );
            });
        });

        describe('title on the right', () => {
            it('small row, only menu should be drawn', () => {
                const result = {
                    itemActionsSize: 'm',
                    itemActions: {
                        all: actions,
                        showed: [
                            {
                                id: null,
                                icon: 'icon-SwipeMenu',
                                title: rk('Ещё'),
                                _isMenu: true,
                                showType: 2
                            }
                        ]
                    },
                    paddingSize: 'l',
                    twoColumns: false
                };

                assert.deepOwnInclude(
                    verticalMeasurer.getSwipeConfig(actions, 20, 'right'),
                    result
                );
            });

            it('average row, all actions should be drawn, itemActionsSize should be m', () => {
                const result = {
                    itemActionsSize: 'm',
                    itemActions: {
                        all: actions,
                        showed: actions
                    },
                    paddingSize: 'l',
                    twoColumns: false
                };

                assert.deepOwnInclude(
                    verticalMeasurer.getSwipeConfig(actions, 120, 'right'),
                    result
                );
            });

            it('big row, all actions should be drawn, itemActionsSize should be l', () => {
                const result = {
                    itemActionsSize: 'l',
                    itemActions: {
                        all: actions,
                        showed: actions
                    },
                    paddingSize: 'l',
                    twoColumns: false
                };

                assert.deepOwnInclude(
                    verticalMeasurer.getSwipeConfig(actions, 150, 'right'),
                    result
                );
            });
        });

        describe('title on the bottom', () => {
            it('two columns', () => {
                const fourActions: IItemAction[] = [
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
                    },
                    {
                        id: 4,
                        icon: 'icon-EmptyMessage'
                    }
                ];
                const result = {
                    itemActionsSize: 'm',
                    itemActions: {
                        all: fourActions,
                        showed: fourActions
                    },
                    paddingSize: 's',
                    twoColumns: true
                };
                assert.deepOwnInclude(
                    verticalMeasurer.getSwipeConfig(fourActions, 93, 'bottom'),
                    result
                );

            });
            it('two columns with more button', () => {
                const fiveActions: IItemAction[] = [
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
                    },
                    {
                        id: 4,
                        icon: 'icon-EmptyMessage'
                    },
                    {
                        id: 5,
                        icon: 'icon-EmptyMessage'
                    }
                ];
                const result = {
                    itemActionsSize: 'm',
                    itemActions: {
                        all: fiveActions,
                        showed: [
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
                            },
                            {
                                id: null,
                                icon: 'icon-SwipeMenu',
                                title: rk('Ещё'),
                                _isMenu: true,
                                showType: 2
                            }
                        ]
                    },
                    paddingSize: 's',
                    twoColumns: true
                };
                assert.deepOwnInclude(
                    verticalMeasurer.getSwipeConfig(fiveActions, 93, 'bottom'),
                    result
                );

            });
            it('menuButtonVisibility = visible', () => {
                const fourActions = [
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
                    },
                    {
                        id: 4,
                        icon: 'icon-EmptyMessage'
                    }
                ];
                const result = {
                    itemActionsSize: 'm',
                    itemActions: {
                        all: fourActions,
                        showed: [
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
                            },
                            {
                                id: null,
                                icon: 'icon-SwipeMenu',
                                title: rk('Ещё'),
                                _isMenu: true,
                                showType: 2
                            }
                        ]
                    },
                    paddingSize: 's',
                    twoColumns: false
                };
                assert.deepOwnInclude(
                    verticalMeasurer.getSwipeConfig(fourActions, 250, 'bottom', 'visible'),
                    result
                );

            });
            it('small row, only menu should be drawn', () => {
                const result = {
                    itemActionsSize: 'm',
                    itemActions: {
                        all: actions,
                        showed: [
                            {
                                id: null,
                                icon: 'icon-SwipeMenu',
                                title: rk('Ещё'),
                                _isMenu: true,
                                showType: 2
                            }
                        ]
                    },
                    paddingSize: 's',
                    twoColumns: false
                };

                assert.deepOwnInclude(
                    verticalMeasurer.getSwipeConfig(actions, 20, 'bottom'),
                    result
                );
            });

            it('average row, all actions should be drawn, itemActionsSize should be s', () => {
                const result = {
                    itemActionsSize: 'm',
                    itemActions: {
                        all: actions,
                        showed: actions
                    },
                    paddingSize: 's',
                    twoColumns: false
                };

                assert.deepOwnInclude(
                    verticalMeasurer.getSwipeConfig(
                        actions,
                        170,
                        'bottom'
                    ),
                    result
                );
            });

            it('big row, all actions should be drawn, itemActionsSize should be l', () => {
                const result = {
                    itemActionsSize: 'l',
                    itemActions: {
                        all: actions,
                        showed: actions
                    },
                    paddingSize: 'l',
                    twoColumns: false
                };

                assert.deepOwnInclude(
                    verticalMeasurer.getSwipeConfig(
                        actions,
                        200,
                        'bottom'
                    ),
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
                        id: 2,
                        showType: 2,
                        icon: 'icon-Erase'
                    },
                    {
                        id: 6,
                        icon: 'icon-PhoneNull',
                        parent: 1
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
                    },
                    {
                        id: 5,
                        showType: 0,
                        icon: 'icon-DK'
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
                    }];
                assert.deepEqual(
                    verticalMeasurer.getSwipeConfig(otherActions, 130, 'none').itemActions.showed,
                    result
                );
            });
        });
    });
});
