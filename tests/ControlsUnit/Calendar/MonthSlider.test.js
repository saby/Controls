define([
   'Controls/_calendar/MonthSlider',
   'Controls/_calendar/MonthSlider/Slider',
   'ControlsUnit/Calendar/Utils',
   'Types/entity'
], function(
   MonthSlider,
   Slider,
   calendarTestUtils,
   formatter
) {

   MonthSlider = MonthSlider.default;
   Slider = Slider.default;

   describe('Controls/Calendar/MonthSlider', function() {

      let defaultOptions = {
         month: new Date(2018, 0, 1)
      };

      it('should create correct model when component initialized', function() {
         let component = calendarTestUtils.createComponent(MonthSlider, defaultOptions);
         assert.strictEqual(component._month, defaultOptions.month);
      });

      describe('_setMonth', function() {
         it('should update model when new month is set', function() {
            let component = calendarTestUtils.createComponent(MonthSlider, defaultOptions),
               newMonth = new Date(defaultOptions.month);
            component._setMonth(newMonth, true, formatter.Date);
            assert.strictEqual(component._month, defaultOptions.month);
         });

         it('should not update model if new date is equal the old one', function() {
            let component = calendarTestUtils.createComponent(MonthSlider, defaultOptions),
               newMonth = new Date();
            component._setMonth(newMonth, true, formatter.Date);
            assert.strictEqual(component._month, newMonth);
         });

         it('should set "slideLeft" animation if month has increased', function() {
            let component = calendarTestUtils.createComponent(MonthSlider, defaultOptions);
            component._setMonth(new Date(defaultOptions.month.getFullYear(), defaultOptions.month.getMonth() + 1), true, formatter.Date);
            assert.strictEqual(component._animation, Slider.ANIMATIONS.slideLeft);
         });

         it('should set "slideRight" animation if month has decreased', function() {
            let component = calendarTestUtils.createComponent(MonthSlider, defaultOptions);
            component._setMonth(new Date(defaultOptions.month.getFullYear(), defaultOptions.month.getMonth() - 1), true, formatter.Date);
            assert.strictEqual(component._animation, Slider.ANIMATIONS.slideRight);
         });
         it('shouldn\'t throw error in _setCurrentMonth', function() {
            let component = calendarTestUtils.createComponent(MonthSlider, defaultOptions),
               options = {
                  dateConstructor: formatter.Date,
                  month: new Date()
               };
            component._beforeMount(options);
            component._setCurrentMonth();
            assert.equal(component._month.getMonth(), options.month.getMonth());
         });
         it('shouldn\'t throw error in _slideMonth', function() {
            const MAX_MONTH_NUMBER = 11;
            let component = calendarTestUtils.createComponent(MonthSlider, defaultOptions),
               event = 'event',
               options = {
                  dateConstructor: formatter.Date,
                  month: new Date()
               };
            component._beforeMount(options);
            component._slideMonth(event, -1);
             assert.equal(component._month.getMonth(), options.month.getMonth() > 0 ? options.month.getMonth() - 1 : MAX_MONTH_NUMBER);
         });
         it('shouldn\'t throw error in _beforeMount', function() {
            let component = calendarTestUtils.createComponent(MonthSlider, defaultOptions),
               options = {
                  dateConstructor: formatter.Date,
                  month: new Date()
               };
            component._beforeMount(options);
            assert.strictEqual(component._month, options.month);
         });
         it('shouldn\'t throw error in _beforeUpdate', function() {
            let component = calendarTestUtils.createComponent(MonthSlider, defaultOptions),
               options = {
                  dateConstructor: formatter.Date,
                  month: new Date()
               };
            component._beforeUpdate(options);
            assert.strictEqual(component._month, options.month);
         });
      });
   });
});
