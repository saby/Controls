define([
   'Controls/List/Swipe/HorizontalMeasurer',
   'Core/i18n'
], function(
   HorizontalMeasurer,
   i18n
) {
   describe('Controls.List.Swipe.HorizontalMeasurer', function() {
      it('needIcon', function() {
         assert.isTrue(HorizontalMeasurer.default.needIcon({}, true));
         assert.isFalse(HorizontalMeasurer.default.needIcon({}, false));
         assert.isTrue(
            HorizontalMeasurer.default.needIcon(
               {
                  icon: '123'
               },
               true
            )
         );
         assert.isTrue(
            HorizontalMeasurer.default.needIcon(
               {
                  icon: '123'
               },
               false
            )
         );
      });

      it('needTitle', function() {
         assert.isFalse(HorizontalMeasurer.default.needTitle({}, 'none'));
         assert.isFalse(HorizontalMeasurer.default.needTitle({}, 'right'));
         assert.isFalse(
            HorizontalMeasurer.default.needTitle(
               {
                  title: '123'
               },
               'none'
            )
         );
         assert.isTrue(
            HorizontalMeasurer.default.needTitle(
               {
                  title: '123'
               },
               'right'
            )
         );
         assert.isTrue(
            HorizontalMeasurer.default.needTitle(
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

         it('more than 3 actions, should add menu', function() {
            var result = {
               itemActionsSize: 'm',
               itemActions: {
                  all: actions.concat({
                     id: 4,
                     icon: 'icon-DK'
                  }),
                  showed: actions.slice(0, 3).concat({
                     icon: 'icon-ExpandDown',
                     title: i18n.rk('Ещё'),
                     _isMenu: true,
                     showType: 2
                  })
               },
               paddingSize: 'm'
            };

            assert.deepEqual(
               result,
               HorizontalMeasurer.default.getSwipeConfig(
                  actions.concat({
                     id: 4,
                     icon: 'icon-DK'
                  }),
                  20,
                  'right'
               )
            );
         });

         it('small row without title, itemActionsSize should be m', function() {
            var result = {
               itemActionsSize: 'm',
               itemActions: {
                  all: actions,
                  showed: actions
               },
               paddingSize: 'm'
            };

            assert.deepEqual(
               result,
               HorizontalMeasurer.default.getSwipeConfig(actions, 20, 'none')
            );
         });

         it('big row without title, itemActionsSize should be l', function() {
            var result = {
               itemActionsSize: 'l',
               itemActions: {
                  all: actions,
                  showed: actions
               },
               paddingSize: 'm'
            };

            assert.deepEqual(
               result,
               HorizontalMeasurer.default.getSwipeConfig(actions, 39, 'none')
            );
         });

         it('small row with title, itemActionsSize should be m', function() {
            var result = {
               itemActionsSize: 'm',
               itemActions: {
                  all: actions,
                  showed: actions
               },
               paddingSize: 'm'
            };

            assert.deepEqual(
               result,
               HorizontalMeasurer.default.getSwipeConfig(actions, 20, 'bottom')
            );
         });

         it('big row with title, itemActionsSize should be l', function() {
            var result = {
               itemActionsSize: 'l',
               itemActions: {
                  all: actions,
                  showed: actions
               },
               paddingSize: 'm'
            };

            assert.deepEqual(
               result,
               HorizontalMeasurer.default.getSwipeConfig(actions, 59, 'bottom')
            );
         });
      });
   });
});
