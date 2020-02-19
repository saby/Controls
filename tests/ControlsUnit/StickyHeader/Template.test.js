define(
   [
      'Controls/scroll',
      'ControlsUnit/resources/TemplateUtil',
      'Controls/_scroll/StickyHeader/_StickyHeader'
   ],
   function(scroll, TemplateUtil, _StickyHeaderLib) {

      'use strict';

      const  _StickyHeader = _StickyHeaderLib.default;

      describe('Controls.StickyHeader.Template', function() {
         var ctrl, template, inst;

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

         describe('StickyHeader', function() {
            beforeEach(function() {
               ctrl = new scroll.StickyHeader({});
               template = TemplateUtil.clearTemplate(ctrl._template);
            });

            it('The browser does not support sticky', function() {
               inst._isStickySupport = false;
               inst._options.content = TemplateUtil.content;

               assert.equal(template(inst), '<div><div>testing the template</div></div>');
            });

            it('The browser does support sticky', function() {
               inst._isStickySupport = true;
               inst._options.content = TemplateUtil.content;

               assert.equal(template(inst),  '<div class="controls-StickyHeader controls-StickyHeader__background controls-StickyHeader_position">' +
                                                '<div class="controls-Scroll__shadow controls-StickyHeader__shadow-top ws-invisible"></div>' +
                                                '<div></div><div></div>' +
                                                '<div class="controls-StickyHeader__observationTargetTop" style="top: -3px;"></div>' +
                                                '<div class="controls-StickyHeader__content">testing the template</div>' +
                                                '<div class="controls-StickyHeader__observationTargetBottom" style="bottom: -3px;"></div>' +
                                                '<div class="controls-Scroll__shadow controls-StickyHeader__shadow-bottom ws-invisible"></div>' +
                                             '</div>');
            });
         });

         describe('_StickyHeader', function() {
            beforeEach(function() {
               ctrl = new _StickyHeader({});
               inst._getStyle = ctrl._getStyle;
               inst._isShadowVisible = ctrl._isShadowVisible;
               inst._getObserverStyle = ctrl._getObserverStyle;
               inst._options.shadowVisibility = 'visible';
               inst._reverseOffsetStyle = ctrl._reverseOffsetStyle;
               inst._getBottomShadowStyle = ctrl._getBottomShadowStyle;
               inst._getNormalizedContainer = ctrl._getNormalizedContainer;
               inst._getComputedStyle = () => { return {}; };
               template = TemplateUtil.clearTemplate(ctrl._template);
            });

            it('On the desktop platform', function() {
               inst._isMobilePlatform = false;
               inst._model.fixedPosition = 'top';

               assert.equal(template(inst),  '<div class="controls-StickyHeader controls-StickyHeader_position" style="top: 0px;z-index: 2;">' +
                                                '<div class="controls-Scroll__shadow controls-StickyHeader__shadow-top ws-invisible"></div>' +
                                                '<div></div>' +
                                                '<div></div>' +
                                                '<div class="controls-StickyHeader__observationTargetTop" style="top: -3px;"></div>' +
                                                '<div class="controls-StickyHeader__observationTargetBottom" style="bottom: -3px;"></div>' +
                                                '<div class="controls-Scroll__shadow controls-StickyHeader__shadow-bottom ws-invisible"></div>' +
                                             '</div>');
            });

            it('On the mobile platform', function() {
               var sandbox = sinon.createSandbox();

               inst._isMobilePlatform = true;
               inst._model.fixedPosition = 'top';
               sandbox.replace(inst, '_getComputedStyle', function() {
                  return { paddingTop: '0px' };
               });
               inst._container = { style: { paddingTop: '' } };

               assert.equal(template(inst),  '<div class="controls-StickyHeader controls-StickyHeader_position" style="top: -1px;padding-top:1px;margin-top: -1px;z-index: 2;">' +
                                                '<div class="controls-Scroll__shadow controls-StickyHeader__shadow-top ws-invisible"></div>' +
                                                '<div></div>' +
                                                '<div></div>' +
                                                '<div class="controls-StickyHeader__observationTargetTop" style="top: -3px;"></div>' +
                                                '<div class="controls-StickyHeader__observationTargetBottom" style="bottom: -3px;"></div>' +
                                                '<div class="controls-Scroll__shadow controls-StickyHeader__shadow-bottom ws-invisible"></div>' +
                                             '</div>');
               sandbox.restore();
            });

            it('Move the header', function() {
               inst._context.stickyHeader.top = 10;

               assert.equal(template(inst),  '<div class="controls-StickyHeader controls-StickyHeader_position" style="top: 10px;">' +
                                                '<div class="controls-Scroll__shadow controls-StickyHeader__shadow-top ws-invisible"></div>' +
                                                '<div></div>' +
                                                '<div></div>' +
                                                '<div class="controls-StickyHeader__observationTargetTop" style="top: -3px;"></div>' +
                                                '<div class="controls-StickyHeader__observationTargetBottom" style="bottom: -3px;"></div>' +
                                                '<div class="controls-Scroll__shadow controls-StickyHeader__shadow-bottom ws-invisible"></div>' +
                                             '</div>');
            });

            it('Move the bottom', function() {
               inst._context.stickyHeader.bottom = 10;
               inst._options.position = 'bottom';

               assert.equal(template(inst),  '<div class="controls-StickyHeader controls-StickyHeader_position" style="bottom: 10px;">' +
                  '<div class="controls-Scroll__shadow controls-StickyHeader__shadow-top ws-invisible"></div>' +
                  '<div></div>' +
                  '<div></div>' +
                  '<div class="controls-StickyHeader__observationTargetTop" style="top: -3px;"></div>' +
                  '<div class="controls-StickyHeader__observationTargetBottom" style="bottom: -3px;"></div>' +
                  '<div class="controls-Scroll__shadow controls-StickyHeader__shadow-bottom ws-invisible"></div>' +
                  '</div>');
            });

            it('Added content', function() {
               inst._options.content = TemplateUtil.content;

               assert.equal(template(inst),  '<div class="controls-StickyHeader controls-StickyHeader_position" style="top: 0px;">' +
                                                '<div class="controls-Scroll__shadow controls-StickyHeader__shadow-top ws-invisible"></div>' +
                                                '<div></div>' +
                                                '<div></div>' +
                                                '<div class="controls-StickyHeader__observationTargetTop" style="top: -3px;"></div>' +
                                                '<div class="controls-StickyHeader__content">testing the template</div>' +
                                                '<div class="controls-StickyHeader__observationTargetBottom" style="bottom: -3px;"></div>' +
                                                '<div class="controls-Scroll__shadow controls-StickyHeader__shadow-bottom ws-invisible"></div>' +
                                             '</div>');
            });

            it('The header is fixed, but there should be no shadow', function() {
               inst._context.stickyHeader.shadowPosition = 'top';
               inst._shadowVisible = true;
               inst._model.fixedPosition = 'top';
               inst._options.fixedZIndex = 1;

               assert.equal(template(inst),  '<div class="controls-StickyHeader controls-StickyHeader_position" style="top: 0px;z-index: 1;">' +
                                                '<div class="controls-Scroll__shadow controls-StickyHeader__shadow-top ws-invisible"></div>' +
                                                '<div></div>' +
                                                '<div></div>' +
                                                '<div class="controls-StickyHeader__observationTargetTop" style="top: -3px;"></div>' +
                                                '<div class="controls-StickyHeader__observationTargetBottom" style="bottom: -3px;"></div>' +
                                                '<div class="controls-Scroll__shadow controls-StickyHeader__shadow-bottom"></div>' +
                                             '</div>');
            });

            it('The header is fixed, the shadow should be', function() {
               inst._context.stickyHeader.shadowPosition = 'bottom';
               inst._shadowVisible = true;
               inst._model.fixedPosition = 'bottom';
               inst._options.fixedZIndex = 2;
               inst._options.position = 'bottom';

               assert.equal(template(inst),  '<div class="controls-StickyHeader controls-StickyHeader_position" style="bottom: 0px;z-index: 2;">' +
                                                '<div class="controls-Scroll__shadow controls-StickyHeader__shadow-top"></div>' +
                                                '<div></div>' +
                                                '<div></div>' +
                                                '<div class="controls-StickyHeader__observationTargetTop" style="top: -3px;"></div>' +
                                                '<div class="controls-StickyHeader__observationTargetBottom" style="bottom: -3px;"></div>' +
                                                '<div class="controls-Scroll__shadow controls-StickyHeader__shadow-bottom ws-invisible"></div>' +
                                             '</div>');
            });
         });
      });
   }
);
