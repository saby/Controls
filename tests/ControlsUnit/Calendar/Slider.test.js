define([
   'Controls/_calendar/MonthSlider/Slider',
   'Controls/dateUtils',
   'ControlsUnit/Calendar/Utils'
], function(
   Slider,
   DateUtil,
   calendarTestUtils
) {
   Slider = Slider.default;

   describe('Controls/Calendar/MonthSlider/Slider', function() {

      let defaultOptions = {
         data: 0,
         animation: Slider.ANIMATIONS.slideLeft
      };

      it('should create correct model when component initialized', function() {
         let component = calendarTestUtils.createComponent(Slider, defaultOptions);
         assert.strictEqual(component._currentItem, 0);
         assert.strictEqual(component._items.length, 2);
         assert.strictEqual(component._items[0].data, defaultOptions.data);
      });

      describe('_beforeUpdate', function() {
         it('should update inAnimation and outAnimation when animation is set', function() {
            let component = calendarTestUtils.createComponent(Slider, defaultOptions);

            component._beforeUpdate({animation: Slider.ANIMATIONS.slideLeft});
            assert.strictEqual(component._inAnimation, Slider.ANIMATIONS.slideLeft);
            assert.strictEqual(component._outAnimation, Slider.ANIMATIONS.slideLeft);
         });

         it('should update inAnimation and outAnimation when it is set', function() {
            let component = calendarTestUtils.createComponent(Slider, defaultOptions);

            component._beforeUpdate({inAnimation: Slider.ANIMATIONS.slideLeft, outAnimation: Slider.ANIMATIONS.slideRight});
            assert.strictEqual(component._inAnimation, Slider.ANIMATIONS.slideLeft);
            assert.strictEqual(component._outAnimation, Slider.ANIMATIONS.slideRight);
         });

         it('should switch items when data is changed', function() {
            let component = calendarTestUtils.createComponent(Slider, defaultOptions),
               newData = 2;

            component._beforeUpdate({data: newData, animation: Slider.ANIMATIONS.slideLeft});
            assert.strictEqual(component._currentItem, 1);
            assert.strictEqual(component._items[0].data, defaultOptions.data);
            assert.strictEqual(component._items[1].data, newData);
            assert.strictEqual(component._animationState, 1);
         });

         it('should set prepared animation classes when data is changed, after that it should set animation classes when _afterUpdate is called', function() {
            let component = calendarTestUtils.createComponent(Slider, defaultOptions),
               newData = 2;

            component._beforeUpdate({
               data: newData,
               inAnimation: Slider.ANIMATIONS.slideLeft,
               outAnimation: Slider.ANIMATIONS.slideRight,
            });
            assert.strictEqual(component._items[0].transitionClasses, 'controls-MonthSlider-Slider__slideLeftRight-center');
            assert.strictEqual(component._items[1].transitionClasses, 'controls-MonthSlider-Slider__slideLeftRight-right');

            component._afterUpdate();
            assert.strictEqual(component._items[0].transitionClasses, 'controls-MonthSlider-Slider__slideLeftRight-animate controls-MonthSlider-Slider__slideLeftRight-right');
            assert.strictEqual(component._items[1].transitionClasses, 'controls-MonthSlider-Slider__slideLeftRight-animate controls-MonthSlider-Slider__slideLeftRight-center');
         });

      });
   });
});
