define(['Controls/_list/Swipe/VerticalMeasurer', 'i18n!ControlsUnit'], function(
   VerticalMeasurer,
   rk
) {
   describe('Controls.List.Swipe.VerticalMeasurer', function() {
      it('needIcon', function() {
         assert.isFalse(VerticalMeasurer.default.needIcon({}, 'bottom'));
         assert.isFalse(VerticalMeasurer.default.needIcon({}, 'none'));
         assert.isFalse(VerticalMeasurer.default.needIcon({}, 'right'));
         assert.isFalse(VerticalMeasurer.default.needIcon({}, 'bottom', true));
         assert.isFalse(VerticalMeasurer.default.needIcon({}, 'none', true));
         assert.isTrue(VerticalMeasurer.default.needIcon({}, 'right', true));
         assert.isTrue(
            VerticalMeasurer.default.needIcon(
               {
                  icon: '123'
               },
               'bottom'
            )
         );
         assert.isTrue(
            VerticalMeasurer.default.needIcon(
               {
                  icon: '123'
               },
               'right'
            )
         );
         assert.isTrue(
            VerticalMeasurer.default.needIcon(
               {
                  icon: '123'
               },
               'none'
            )
         );
         assert.isTrue(
            VerticalMeasurer.default.needIcon(
               {
                  icon: '123'
               },
               'bottom',
               true
            )
         );
         assert.isTrue(
            VerticalMeasurer.default.needIcon(
               {
                  icon: '123'
               },
               'right',
               true
            )
         );
         assert.isTrue(
            VerticalMeasurer.default.needIcon(
               {
                  icon: '123'
               },
               'none',
               true
            )
         );
      });

      it('needTitle', function() {
         assert.isFalse(
            VerticalMeasurer.default.needTitle(
               {
                  icon: 'icon-Message'
               },
               'none'
            )
         );
         assert.isFalse(
            VerticalMeasurer.default.needTitle(
               {
                  icon: 'icon-Message'
               },
               'right'
            )
         );
         assert.isTrue(VerticalMeasurer.default.needTitle({}, 'none'));
         assert.isTrue(VerticalMeasurer.default.needTitle({}, 'right'));
         assert.isTrue(
            VerticalMeasurer.default.needTitle(
               {
                  title: '123'
               },
               'none'
            )
         );
         assert.isTrue(
            VerticalMeasurer.default.needTitle(
               {
                  title: '123'
               },
               'right'
            )
         );
         assert.isTrue(
            VerticalMeasurer.default.needTitle(
               {
                  title: '123'
               },
               'bottom'
            )
         );
      });

      describe('getSwipeConfig', function() {
         var actions = [
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

         describe('without title', function() {
            it('small row, only menu should be drawn', function() {
               var result = {
                  itemActionsSize: 'm',
                  itemActions: {
                     all: actions,
                     showed: [
                        {
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

               assert.deepEqual(
                  result,
                  VerticalMeasurer.default.getSwipeConfig(actions, 20, 'none')
               );
            });

            it('average row, all actions should be drawn, itemActionsSize should be m', function() {
               var result = {
                  itemActionsSize: 'm',
                  itemActions: {
                     all: actions,
                     showed: actions
                  },
                  paddingSize: 'm',
                  twoColumns: false
               };

               assert.deepEqual(
                  result,
                  VerticalMeasurer.default.getSwipeConfig(actions, 97, 'none')
               );
            });

            it('big row, all actions should be drawn, itemActionsSize should be l', function() {
               var result = {
                  itemActionsSize: 'l',
                  itemActions: {
                     all: actions,
                     showed: actions
                  },
                  paddingSize: 'm',
                  twoColumns: false
               };

               assert.deepEqual(
                  result,
                  VerticalMeasurer.default.getSwipeConfig(actions, 150, 'none')
               );
            });
         });

         describe('title on the right', function() {
            it('small row, only menu should be drawn', function() {
               var result = {
                  itemActionsSize: 'm',
                  itemActions: {
                     all: actions,
                     showed: [
                        {
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

               assert.deepEqual(
                  result,
                  VerticalMeasurer.default.getSwipeConfig(actions, 20, 'right')
               );
            });

            it('average row, all actions should be drawn, itemActionsSize should be m', function() {
               var result = {
                  itemActionsSize: 'm',
                  itemActions: {
                     all: actions,
                     showed: actions
                  },
                  paddingSize: 'l',
                  twoColumns: false
               };

               assert.deepEqual(
                  result,
                  VerticalMeasurer.default.getSwipeConfig(actions, 120, 'right')
               );
            });

            it('big row, all actions should be drawn, itemActionsSize should be l', function() {
               var result = {
                  itemActionsSize: 'l',
                  itemActions: {
                     all: actions,
                     showed: actions
                  },
                  paddingSize: 'l',
                  twoColumns: false
               };

               assert.deepEqual(
                  result,
                  VerticalMeasurer.default.getSwipeConfig(actions, 150, 'right')
               );
            });
         });

         describe('title on the bottom', function() {
            it('two columns', function() {
               var fourActions = [
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
               var result = {
                  itemActionsSize: 'm',
                  itemActions: {
                     all: fourActions,
                     showed: fourActions
                  },
                  paddingSize: 's',
                  twoColumns: true
               };
               assert.deepEqual(
                  result,
                  VerticalMeasurer.default.getSwipeConfig(fourActions, 93, 'bottom')
               );

            });
            it('two columns with more button', function() {
               var fiveActions = [
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
                  },

               ];
               var result = {
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
               assert.deepEqual(
                  result,
                  VerticalMeasurer.default.getSwipeConfig(fiveActions, 93, 'bottom')
               );

            });
            it('menuButtonVisibility = visible', function() {
               var fourActions = [
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
               var result = {
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
               assert.deepEqual(
                   result,
                   VerticalMeasurer.default.getSwipeConfig(fourActions, 250, 'bottom', 'visible')
               );

            });
            it('small row, only menu should be drawn', function() {
               var result = {
                  itemActionsSize: 'm',
                  itemActions: {
                     all: actions,
                     showed: [
                        {
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

               assert.deepEqual(
                  result,
                  VerticalMeasurer.default.getSwipeConfig(actions, 20, 'bottom')
               );
            });

            it('average row, all actions should be drawn, itemActionsSize should be s', function() {
               var result = {
                  itemActionsSize: 'm',
                  itemActions: {
                     all: actions,
                     showed: actions
                  },
                  paddingSize: 's',
                  twoColumns: false
               };

               assert.deepEqual(
                  result,
                  VerticalMeasurer.default.getSwipeConfig(
                     actions,
                     170,
                     'bottom'
                  )
               );
            });

            it('big row, all actions should be drawn, itemActionsSize should be l', function() {
               var result = {
                  itemActionsSize: 'l',
                  itemActions: {
                     all: actions,
                     showed: actions
                  },
                  paddingSize: 'l',
                  twoColumns: false
               };

               assert.deepEqual(
                  result,
                  VerticalMeasurer.default.getSwipeConfig(
                     actions,
                     200,
                     'bottom'
                  )
               );
            });

            it('main actions', function() {
               let otherActions = [
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
               let result = [
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
                     icon: 'icon-SwipeMenu',
                     title: rk('Ещё'),
                     _isMenu: true,
                     showType: 2
                  }];
               assert.deepEqual(
                  result,
                  VerticalMeasurer.default.getSwipeConfig(otherActions, 130, 'none').itemActions.showed
               );
            });
         });
      });
   });
});
