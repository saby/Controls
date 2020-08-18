define(
   [
      'Controls/scroll',
      'Env/Env',
      'ControlsUnit/resources/TemplateUtil',
      'Controls/_scroll/StickyHeader/Utils',
      'Controls/_scroll/StickyHeader/_StickyHeader'
   ],
   function(scroll, Env, TemplateUtil, StickyHeaderUtils, _StickyHeaderLib) {

      'use strict';

      const _StickyHeader = _StickyHeaderLib.default;

      describe('Controls.StickyHeader.Template', function() {
         var ctrl, template, inst, compat;

         before(function() {
            compat = Env.constants.compat;
            Env.constants.compat = true;
         });

         beforeEach(function() {
            inst = {
               _stickyHeadersHeight: {
                  top: 0,
                  bottom: 0
               },
               _context: {
                  stickyHeader: new scroll._stickyHeaderContext({shadowPosition: ''})
               },
               _options: {
                  fixedZIndex: 2,
                  position: 'top'
               },
               _model: {}
            };
         });

         after(function() {
            Env.constants.compat = compat;
         });

         describe('StickyHeader', function() {
            beforeEach(function() {
               ctrl = new scroll.StickyHeader({});
               ctrl._container = {
                  offsetParent: true
               };
               template = TemplateUtil.clearTemplate(ctrl._template);
            });

            it('The browser does not support sticky', function() {
               inst._isStickySupport = false;
               inst._options.theme = 'default';
               inst._options.content = TemplateUtil.content;

               assert.equal(template(inst), '<div class="controls-background-default_theme-default"><div>testing the template</div></div>');
            });

            it('The browser does support sticky', function() {
               inst._isStickySupport = true;
               inst._options.content = TemplateUtil.content;
               sinon.stub(_StickyHeader.prototype, '_getComputedStyle').returns({ });

               template(inst, function(result) {
                  assert.equal(result, '<div class="controls-StickyHeader controls-background-default_theme-default controls-StickyHeader__background controls-StickyHeader_position">' +
                     '<div class="controls-StickyHeader__observationTargetTop" style="top: -3px;"></div>' +
                     '<div class="controls-StickyHeader__content">testing the template</div>' +
                     '<div class="controls-StickyHeader__observationTargetBottom" style="bottom: -3px;"></div>' +
                     '</div>');
               });
               sinon.restore();
            });
         });

         describe('_StickyHeader', function() {
            beforeEach(function() {
               ctrl = new _StickyHeader({});
               inst._getStyle = ctrl._getStyle;
               inst._isShadowVisible = ctrl._isShadowVisible;
               inst._isShadowVisibleByScrollState = ctrl._isShadowVisibleByScrollState;
               inst._getObserverStyle = ctrl._getObserverStyle;
               inst._options.shadowVisibility = 'visible';
               inst._reverseOffsetStyle = ctrl._reverseOffsetStyle;
               inst._getBottomShadowStyle = ctrl._getBottomShadowStyle;
               inst._getNormalizedContainer = ctrl._getNormalizedContainer;
               inst._getComputedStyle = () => { return {}; };
               inst._scrollState = {};
               template = TemplateUtil.clearTemplate(ctrl._template);
            });

            it('On the desktop platform', function() {
               inst._isMobilePlatform = false;
               inst._model.fixedPosition = 'top';
               inst._options.theme = 'default';
               inst._options.content = function() {return ''};

               assert.equal(template(inst),  '<div class="controls-StickyHeader controls-background-default_theme-default controls-StickyHeader_position" style="top: 0px;z-index: 2;">' +
                  '<div class="controls-StickyHeader__observationTargetTop" style="top: -3px;"></div>' +
                  '<div class="controls-StickyHeader__observationTargetBottom" style="bottom: -3px;"></div>' +
                  '</div>');
            });

            it('On the mobile platform', function() {
               var sandbox = sinon.createSandbox();

               sandbox.stub(StickyHeaderUtils, 'getGapFixSize').returns(1);
               inst._model.fixedPosition = 'top';
               sandbox.replace(inst, '_getComputedStyle', function() {
                  return { paddingTop: '0px' };
               });
               inst._container = { style: { paddingTop: '' } };
               inst._options.theme = 'default';
               inst._options.content = function() {return ''};

               assert.equal(template(inst),  '<div class="controls-StickyHeader controls-background-default_theme-default controls-StickyHeader_position" style="top: -1px;padding-top:1px;margin-top: -1px;z-index: 2;">' +
                  '<div class="controls-StickyHeader__observationTargetTop" style="top: -3px;"></div>' +
                  '<div class="controls-StickyHeader__observationTargetBottom" style="bottom: -3px;"></div>' +
                  '</div>');
               sandbox.restore();
            });

            it('Move the header', function() {
               inst._options.theme = 'default';
               inst._options.content = function() {return ''};

               assert.equal(template(inst),  '<div class="controls-StickyHeader controls-background-default_theme-default controls-StickyHeader_position" style="top: 0px;">' +
                  '<div class="controls-StickyHeader__observationTargetTop" style="top: -3px;"></div>' +
                  '<div class="controls-StickyHeader__observationTargetBottom" style="bottom: -3px;"></div>' +
                  '</div>');
            });

            it('Move the bottom', function() {
               inst._options.position = 'bottom';
               inst._options.theme = 'default';
               inst._options.content = function() {return ''};

               assert.equal(template(inst),  '<div class="controls-StickyHeader controls-background-default_theme-default controls-StickyHeader_position" style="bottom: 0px;">' +
                  '<div class="controls-StickyHeader__observationTargetTop" style="top: -3px;"></div>' +
                  '<div class="controls-StickyHeader__observationTargetBottom" style="bottom: -3px;"></div>' +
                  '</div>');
            });

            it('Added content', function() {
               inst._options.content = TemplateUtil.content;
               inst._options.theme = 'default';

               assert.equal(template(inst),   '<div class="controls-StickyHeader controls-background-default_theme-default controls-StickyHeader_position" style="top: 0px;">' +
                  '<div class="controls-StickyHeader__observationTargetTop" style="top: -3px;"></div>' +
                  '<div class="controls-StickyHeader__content">testing the template</div>' +
                  '<div class="controls-StickyHeader__observationTargetBottom" style="bottom: -3px;"></div>' +
                  '</div>');
            });

            it('The header is fixed, but there should be no shadow', function() {
               inst._scrollState.verticalPosition = 'end';
               inst._isFixed = true;
               inst._model.fixedPosition = 'top';
               inst._options.fixedZIndex = 1;
               inst._options.content = TemplateUtil.content;
               inst._options.theme = 'default';

               assert.equal(template(inst),  '<div class="controls-StickyHeader controls-background-default_theme-default controls-StickyHeader_position" style="top: 0px;z-index: 1;">' +
                  '<div class="controls-StickyHeader__observationTargetTop" style="top: -3px;"></div>' +
                  '<div class="controls-StickyHeader__content">testing the template</div>' +
                  '<div class="controls-StickyHeader__observationTargetBottom" style="bottom: -3px;"></div>' +
                   '<div class="controls-Scroll__shadow controls-StickyHeader__shadow-bottom controls-Scroll__shadow_horizontal"></div>' +
                   '</div>');
            });

            it('The header is fixed, the shadow should be', function() {
               inst._scrollState.verticalPosition = 'start';
               inst._isFixed = true;
               inst._model.fixedPosition = 'bottom';
               inst._options.fixedZIndex = 2;
               inst._options.position = 'bottom';
               inst._options.content = TemplateUtil.content;
               inst._options.theme = 'default';

               assert.equal(template(inst),  '<div class="controls-StickyHeader controls-background-default_theme-default controls-StickyHeader_position" style="bottom: 0px;z-index: 2;">' +
                  '<div class="controls-Scroll__shadow controls-StickyHeader__shadow-top controls-Scroll__shadow_horizontal"></div>' +
                  '<div class="controls-StickyHeader__observationTargetTop" style="top: -3px;"></div>' +
                  '<div class="controls-StickyHeader__content">testing the template</div>' +
                  '<div class="controls-StickyHeader__observationTargetBottom" style="bottom: -3px;"></div>' +
                  '</div>');
            });
         });
      });
   }
);
