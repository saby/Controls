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
            const tests = [{
               options: {
                  viewMode: 'selector',
                  fontColorStyle: 'link',
                  theme: 'default'
               },
               styleClass: ' controls-text-link_theme-default controls-fontsize-l_theme-default controls-DateLinkView__style-clickable_theme-default controls-DateLinkView__style-hover_theme-default',
               valueEnabledClass: true
            }, {
               options: {
                  viewMode: 'selector',
                  fontColorStyle: 'label',
                  theme: 'default'
               },
               styleClass: ' controls-text-label_theme-default controls-fontsize-l_theme-default controls-DateLinkView__style-clickable_theme-default',
               valueEnabledClass: true
            }, {
               options: {
                  viewMode: 'selector',
                  fontColorStyle: 'link',
                  fontSize: 'xl',
                  clickable: false,
                  theme: 'default'
               },
               styleClass: ' controls-text-link_theme-default controls-fontsize-xl_theme-default controls-DateLinkView__style-hover_theme-default'
            }, {
               options: {
                  viewMode: 'selector',
                  fontColorStyle: 'label',
                  clickable: false,
                  theme: 'default'
               },
               styleClass: ' controls-text-label_theme-default controls-fontsize-l_theme-default'
            }, {
               options: {
                  viewMode: 'selector',
                  fontColorStyle: 'link',
                  readOnly: true,
                  theme: 'default'
               },
               styleClass: ' controls-text-link_theme-default controls-fontsize-l_theme-default'
            }, {
               options: {
                  viewMode: 'selector',
                  fontColorStyle: 'label',
                  readOnly: true,
                  theme: 'default'
               },
               styleClass: ' controls-text-label_theme-default controls-fontsize-l_theme-default'
            }, {
               options: {
                  viewMode: 'link',
                  fontColorStyle: 'link',
                  theme: 'default'
               },
               styleClass: ' controls-text-link_theme-default controls-fontsize-m_theme-default controls-DateLinkView__style-clickable_theme-default',
               valueEnabledClass: true
            }, {
               options: {
                  viewMode: 'link',
                  fontColorStyle: 'unaccented',
                  theme: 'default'
               },
               styleClass: ' controls-text-unaccented_theme-default controls-fontsize-m_theme-default controls-DateLinkView__style-clickable_theme-default',
               valueEnabledClass: true
            }, {
               options: {
                  viewMode: 'label',
                  fontColorStyle: '',
                  theme: 'default'
               },
               styleClass: null,
               valueEnabledClass: true
            }];

            tests.forEach(function(test, testNumber) {
               it(`should initialize correct styles ${testNumber}.`, function() {
                  const component = calendarTestUtils.createComponent(
                     dateRange.LinkView,
                     test.options
                  );
                  assert.equal(component._styleClass, test.styleClass);
                  assert.equal(component._valueEnabledClass, test.valueEnabledClass ? 'controls-DateLinkView__value-clickable' : '');
               });
            });

            tests.forEach(function(test, testNumber) {
               it(`should update correct styles ${testNumber}.`, function() {
                  const
                     component = calendarTestUtils.createComponent(dateRange.LinkView, {}),
                     options = calendarTestUtils.prepareOptions(dateRange.LinkView, test.options);
                  component._beforeUpdate(options);
                  assert.equal(component._styleClass, test.styleClass);
                  assert.equal(component._valueEnabledClass, test.valueEnabledClass ? 'controls-DateLinkView__value-clickable' : '');
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
         it('should generate "linkClick" event', function() {
            const sandbox = sinon.sandbox.create(),
               component = calendarTestUtils.createComponent(dateRange.LinkView, config);

            sandbox.stub(component, '_notify');
            component._onClick();

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
               component._onClick();

               sinon.assert.notCalled(component._notify);
               sandbox.restore();
            });
         });
      });
      describe('_clearDate', function() {
         it('should clear startValue and endValue', function() {
            const sandbox = sinon.sandbox.create(),
               component = calendarTestUtils.createComponent(dateRange.LinkView, config);

            sandbox.stub(component, '_notify');
            component._clearDate();

            assert.strictEqual(component._rangeModel.startValue, null);
            assert.strictEqual(component._rangeModel.endValue, null);
            assert.equal(component._caption, 'Не указан');
            sinon.assert.callCount(component._notify, 3);
            sandbox.restore();
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
