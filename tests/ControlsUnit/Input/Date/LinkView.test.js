define([
   'Controls/dateRange',
   'ControlsUnit/Calendar/Utils'
], function(
   dateRange,
   calendarTestUtils
) {
   'use strict';

   const config = {
      startValue: new Date(2018, 0, 1),
      endValue: new Date(2018, 1, 0),
      dateConstructor: Date,
      fontColorStyle: 'link'
   };

   describe('Controls/dateRange:LinkView', function() {
      describe('Initialisation', function() {
         it('should create correct model', function() {
            const component = calendarTestUtils.createComponent(dateRange.LinkView, config);

            assert.strictEqual(component._caption, "Январь'18");
            assert.equal(component._rangeModel.startValue, config.startValue);
            assert.equal(component._rangeModel.endValue, config.endValue);
         });

         describe('Styles', function() {
            [{
               options: {
                  viewMode: 'selector'
               },
               styleClass: ' controls-DateLinkView__style-clickable controls-DateLinkView__style-hover',
               valueEnabledClass: true
            }, {
               options: {
                  viewMode: 'selector',
                  fontColorStyle: 'label'
               },
               styleClass: ' controls-DateLinkView__style-clickable',
               valueEnabledClass: true
            }, {
               options: {
                  viewMode: 'selector',
                  clickable: false
               },
               styleClass: ' controls-DateLinkView__style-hover'
            }, {
               options: {
                  viewMode: 'link'
               },
               styleClass: ' controls-DateLinkView__style-clickable',
               valueEnabledClass: true
            }, {
               options: {
                  viewMode: 'link',
                  fontColorStyle: 'unaccented'
               },
               styleClass: ' controls-DateLinkView__style-clickable',
               valueEnabledClass: true
            }, {
               options: {
                  viewMode: 'label'
               },
               styleClass: null,
               valueEnabledClass: true
            }].forEach(function(test, testNumber) {
               it(`should initialize correct styles ${testNumber}.`, function() {
                  const component = calendarTestUtils.createComponent(
                     dateRange.LinkView,
                     test.options
                  );
                  assert.equal(component._styleClass, test.styleClass);
               });
            });

            [{
               options: {
                  viewMode: 'selector',
                  clickable: false
               },
               newOptions: {
                  viewMode: 'link'
               },
               valueEnabledClass: true,
               styleClass: ' controls-DateLinkView__style-clickable'
            }, {
               options: {
                  viewMode: 'link',
                  clickable: true
               },
               newOptions: {
                  viewMode: 'selector'
               },
               valueEnabledClass: true,
               styleClass: ' controls-DateLinkView__style-clickable controls-DateLinkView__style-hover'
            }, {
               options: {
                  viewMode: 'selector',
                  clickable: false
               },
               newOptions: {
                  viewMode: 'selector',
                  clickable: false
               },
               styleClass: ' controls-DateLinkView__style-hover'
            }, {
               options: {
                  viewMode: 'selector',
                  clickable: false,
                  valueEnabledClass: false
               },
               newOptions: {
                  viewMode: 'selector',
                  clickable: false,
                  valueEnabledClass: true
               },
               styleClass: ' controls-DateLinkView__style-hover'
            }, {
               options: {
                  viewMode: 'selector',
                  clickable: false,
                  valueEnabledClass: false
               },
               newOptions: {
                  viewMode: 'selector',
                  clickable: false,
                  valueEnabledClass: true
               },
               styleClass: ' controls-DateLinkView__style-hover'
            }, {
               options: {
                  viewMode: 'selector',
                  clickable: false
               },
               newOptions: {
                  viewMode: 'label',
                  clickable: false
               },
               styleClass: null
            }].forEach(function(test, testNumber) {
               it(`should update correct styles ${testNumber}.`, function() {
                  const
                     component = calendarTestUtils.createComponent(dateRange.LinkView, test.options),
                     options = calendarTestUtils.prepareOptions(dateRange.LinkView, test.newOptions);
                  component._beforeUpdate(options);
                  assert.equal(component._styleClass, test.styleClass);
               });
            });
         });

      });

      describe('_clearButtonVisible', function() {
         [{
            fontColorStyle: 'link',
            clearButtonVisible: true,
            startValue: true,
            endValue: true,
            result: true
         }, {
            fontColorStyle: 'link',
            clearButtonVisible: true,
            startValue: false,
            endValue: true,
            result: true
         }, {
            fontColorStyle: 'link',
            clearButtonVisible: true,
            startValue: true,
            endValue: false,
            result: true
         }, {
            fontColorStyle: 'link',
            clearButtonVisible: true,
            startValue: false,
            endValue: false,
            result: false
         }, {
            fontColorStyle: 'link',
            clearButtonVisible: false,
            startValue: true,
            endValue: true,
            result: false
         }].forEach(function(test, testNumber) {
            it(`should update correct _clearButtonVisible ${testNumber}.`, function () {
               const component = calendarTestUtils.createComponent(dateRange.LinkView, {});
               component._beforeUpdate({
                  clearButtonVisible: test.clearButtonVisible,
                  startValue: test.startValue,
                  endValue: test.endValue,
                  fontColorStyle: test.fontColorStyle,
                  captionFormatter: function() {}
               });
               assert.strictEqual(component._clearButtonVisible, test.result);
            });
         });
      });

      describe('shiftBack', function() {
         it('should update model', function() {
            const sandbox = sinon.sandbox.create(),
               component = calendarTestUtils.createComponent(dateRange.LinkView, config),
               startValue = new Date(2017, 11, 1),
               endValue = new Date(2018, 0, 0);

            sandbox.stub(component, '_notify');
            component.shiftBack();

            assert.equal(component._rangeModel.startValue.getTime(), startValue.getTime());
            assert.equal(component._rangeModel.endValue.getTime(), endValue.getTime());

            sinon.assert.calledWith(component._notify, 'startValueChanged', [startValue]);
            sinon.assert.calledWith(component._notify, 'endValueChanged', [endValue]);

            assert.strictEqual(component._caption, "Декабрь'17");
            sandbox.restore();
         });
      });

      describe('shiftForward', function() {
         it('should update model', function() {
            const sandbox = sinon.sandbox.create(),
               component = calendarTestUtils.createComponent(dateRange.LinkView, config),
               startValue = new Date(2018, 1, 1),
               endValue = new Date(2018, 2, 0);

            sandbox.stub(component, '_notify');
            component.shiftForward();

            assert.equal(component._rangeModel.startValue.getTime(), startValue.getTime());
            assert.equal(component._rangeModel.endValue.getTime(), endValue.getTime());

            sinon.assert.calledWith(component._notify, 'startValueChanged', [startValue]);
            sinon.assert.calledWith(component._notify, 'endValueChanged', [endValue]);

            assert.strictEqual(component._caption, "Февраль'18");
            sandbox.restore();
         });
      });

      describe('_onClick', function() {
         const event = {
            nativeEvent: {
               button: 0
            }
         };
         it('should generate "linkClick" event', function() {
            const sandbox = sinon.sandbox.create(),
               component = calendarTestUtils.createComponent(dateRange.LinkView, config);

            sandbox.stub(component, '_notify');
            component._onClick(event);

            sinon.assert.calledWith(component._notify, 'linkClick');
            sandbox.restore();
         });

         [{
            title: 'control disabled',
            options: { readOnly: true }
         }, {
            title: 'clickable option is false',
            options: { clickable: false }
         }].forEach(function(test) {
            it(`should not generate "linkClick" event if ${test.title}`, function() {
               const sandbox = sinon.sandbox.create(),
                  component = calendarTestUtils.createComponent(dateRange.LinkView, test.options);

               sandbox.stub(component, '_notify');
               component._onClick(event);

               sinon.assert.notCalled(component._notify);
               sandbox.restore();
            });
         });
      });
      describe('_beforeUpdate', function() {
         it('should update caption', function() {
            const component = calendarTestUtils.createComponent(dateRange.LinkView, config),
               caption = component._caption,
               testCaptionFormatter = function () {
                  return 'test';
               };
            component._beforeUpdate({...config, captionFormatter: testCaptionFormatter});
            assert.notEqual(component._caption, caption);
         });
      });
   });
});
