define(['Controls/buttons', 'UI/Utils'], function(buttons, {Logger}) {
   var btn;
   var actualAPI = buttons.ActualApi;

   describe('Controls.Button', function() {
      var sandbox;
      beforeEach(() => {
         sandbox = sinon.createSandbox();
         sandbox.stub(Logger, 'error');
      });

      afterEach(() => {
         sandbox.restore();
      });
      describe('styleToViewMode', function() {
         it('style linkMain', function() {
            let cfg = actualAPI.styleToViewMode('linkMain');
            assert.equal('link', cfg.viewMode, 'wrong cfg');
            assert.equal('secondary', cfg.style, 'wrong cfg');
         });
         it('style linkMain2', function() {
            let cfg = actualAPI.styleToViewMode('linkMain2');
            assert.equal('link', cfg.viewMode, 'wrong cfg');
            assert.equal('info', cfg.style, 'wrong cfg');
         });
         it('style linkMain3', function() {
            let cfg = actualAPI.styleToViewMode('linkMain3');
            assert.equal('link', cfg.viewMode, 'wrong cfg');
            assert.equal('info', cfg.style, 'wrong cfg');
         });
         it('style linkAdditional', function() {
            let cfg = actualAPI.styleToViewMode('linkAdditional');
            assert.equal('link', cfg.viewMode, 'wrong cfg');
            assert.equal('info', cfg.style, 'wrong cfg');
         });
         it('style linkAdditional2', function() {
            let cfg = actualAPI.styleToViewMode('linkAdditional2');
            assert.equal('link', cfg.viewMode, 'wrong cfg');
            assert.equal('default', cfg.style, 'wrong cfg');
         });
         it('style linkAdditional3', function() {
            let cfg = actualAPI.styleToViewMode('linkAdditional3');
            assert.equal('link', cfg.viewMode, 'wrong cfg');
            assert.equal('danger', cfg.style, 'wrong cfg');
         });
         it('style linkAdditional4', function() {
            let cfg = actualAPI.styleToViewMode('linkAdditional4');
            assert.equal('link', cfg.viewMode, 'wrong cfg');
            assert.equal('success', cfg.style, 'wrong cfg');
         });
         it('style linkAdditional5', function() {
            let cfg = actualAPI.styleToViewMode('linkAdditional5');
            assert.equal('link', cfg.viewMode, 'wrong cfg');
            assert.equal('magic', cfg.style, 'wrong cfg');
         });
         it('style buttonPrimary', function() {
            let cfg = actualAPI.styleToViewMode('buttonPrimary');
            assert.equal('button', cfg.viewMode, 'wrong cfg');
            assert.equal('primary', cfg.style, 'wrong cfg');
         });
         it('style buttonDefault', function() {
            let cfg = actualAPI.styleToViewMode('buttonDefault');
            assert.equal('button', cfg.viewMode, 'wrong cfg');
            assert.equal('secondary', cfg.style, 'wrong cfg');
         });
         it('style buttonAdd', function() {
            let cfg = actualAPI.styleToViewMode('buttonAdd');
            assert.equal('button', cfg.viewMode, 'wrong cfg');
            assert.equal('primary', cfg.style, 'wrong cfg');
         });
         it('style toolButton', function() {
            let cfg = actualAPI.styleToViewMode('toolButton');
            assert.equal('', cfg.viewMode, 'wrong cfg');
            assert.equal('', cfg.style, 'wrong cfg');
         });
      });
      describe('iconStyleTransformation', function() {
         it('attention', function() {
            let cfg = actualAPI.iconStyleTransformation('attention');
            assert.equal('warning', cfg, 'wrong cfg');
         });
         it('done', function() {
            let cfg = actualAPI.iconStyleTransformation('done');
            assert.equal('success', cfg, 'wrong cfg');
         });
         it('error', function() {
            let cfg = actualAPI.iconStyleTransformation('error');
            assert.equal('danger', cfg, 'wrong cfg');
         });
         it('success', function() {
            let cfg = actualAPI.iconStyleTransformation('success');
            assert.equal('success', cfg, 'wrong cfg');
         });
      });
      describe('contrastBackground', function() {
         it('contrastBackground', function() {
            let cfg = actualAPI.contrastBackground({ contrastBackground: true, transparent: true });
            assert.isTrue(cfg, 'wrong cfg');
         });
         it('transparent true', function() {
            let cfg = actualAPI.contrastBackground({ transparent: true });
            assert.isFalse(cfg, 'wrong cfg');
         });
         it('transparent false', function() {
            let cfg = actualAPI.contrastBackground({ transparent: false });
            assert.isTrue(cfg, 'wrong cfg');
         });
         it('all undefined', function() {
            let cfg = actualAPI.contrastBackground({});
            assert.isFalse(cfg, 'wrong cfg');
         });
      });
      describe('buttonStyle', function() {
         it('readonly', function() {
            let cfg = actualAPI.buttonStyle('warning', 'danger', 'secondary', true);
            assert.equal('readonly', cfg, 'wrong cfg');
         });
         it('buttonStyle', function() {
            let cfg = actualAPI.buttonStyle('warning', 'danger', 'secondary');
            assert.equal('secondary', cfg, 'wrong cfg');
         });
         it('style', function() {
            let cfg = actualAPI.buttonStyle('warning', 'danger');
            assert.equal('warning', cfg, 'wrong cfg');
         });
         it('oldStyle', function() {
            let cfg = actualAPI.buttonStyle(undefined, 'danger');
            assert.equal('danger', cfg, 'wrong cfg');
         });
      });
      describe('fontColorStyle', function() {
         it('all undefined', function() {
            let cfg = actualAPI.fontColorStyle();
            assert.equal(undefined, cfg, 'wrong cfg');
         });
         it('fontColorStyle', function() {
            let cfg = actualAPI.fontColorStyle(undefined, undefined, 'primary');
            assert.equal('primary', cfg, 'wrong cfg');
         });
         it('button', function() {
            let cfg = actualAPI.fontColorStyle('warning', 'button');
            assert.equal(undefined, cfg, 'wrong cfg');
         });
         it('link primary', function() {
            let cfg = actualAPI.fontColorStyle('primary', 'link');
            assert.equal('link', cfg, 'wrong cfg');
         });
         it('link success', function() {
            let cfg = actualAPI.fontColorStyle('success', 'link');
            assert.equal('success', cfg, 'wrong cfg');
         });
         it('link danger', function() {
            let cfg = actualAPI.fontColorStyle('danger', 'link');
            assert.equal('danger', cfg, 'wrong cfg');
         });
         it('link warning', function() {
            let cfg = actualAPI.fontColorStyle('warning', 'link');
            assert.equal('warning', cfg, 'wrong cfg');
         });
         it('link info', function() {
            let cfg = actualAPI.fontColorStyle('info', 'link');
            assert.equal('unaccented', cfg, 'wrong cfg');
         });
         it('link secondary', function() {
            let cfg = actualAPI.fontColorStyle('secondary', 'link');
            assert.equal('link', cfg, 'wrong cfg');
         });
         it('link default', function() {
            let cfg = actualAPI.fontColorStyle('default', 'link');
            assert.equal('default', cfg, 'wrong cfg');
         });
         it('link without style', function() {
            let cfg = actualAPI.fontColorStyle(undefined, 'link');
            assert.equal('link', cfg, 'wrong cfg');
         });
      });
      describe('iconSize', function() {
         it('iconSize', function() {
            const cfg = actualAPI.iconSize('s', 'icon-16 icon-Author');
            assert.equal('s', cfg, 'wrong cfg');
         });
         it('icon-16', function() {
            const cfg = actualAPI.iconSize(undefined, 'icon-16 icon-Author');
            assert.equal('s', cfg, 'wrong cfg');
         });
         it('icon-24', function() {
            const cfg = actualAPI.iconSize(undefined, 'icon-24 icon-Author');
            assert.equal('m', cfg, 'wrong cfg');
         });
         it('icon-32', function() {
            const cfg = actualAPI.iconSize(undefined, 'icon-32 icon-Author');
            assert.equal('l', cfg, 'wrong cfg');
         });
         it('icon-small', function() {
            const cfg = actualAPI.iconSize(undefined, 'icon-small icon-Author');
            assert.equal('s', cfg, 'wrong cfg');
         });
         it('icon-medium', function() {
            const cfg = actualAPI.iconSize(undefined, 'icon-medium icon-Author');
            assert.equal('m', cfg, 'wrong cfg');
         });
         it('icon-large', function() {
            const cfg = actualAPI.iconSize(undefined, 'icon-large icon-Author');
            assert.equal('l', cfg, 'wrong cfg');
         });
         it('empty', function() {
            const cfg = actualAPI.iconSize(undefined, 'icon-Author');
            assert.equal('m', cfg, 'wrong cfg');
         });
      });

      describe('iconStyle', function() {
         it('readonly', function() {
            const cfg = actualAPI.iconStyle('success', 'icon-done icon-Author', true, false);
            assert.equal('readonly', cfg, 'wrong cfg');
         });
         it('buttonAdd', function() {
            const cfg = actualAPI.iconStyle('success', 'icon-done icon-Author', false, true);
            assert.equal('default', cfg, 'wrong cfg');
         });
         it('iconStyle success', function() {
            const cfg = actualAPI.iconStyle('success', 'icon-done icon-Author', false, false);
            assert.equal('success', cfg, 'wrong cfg');
         });
         it('iconStyle done', function() {
            const cfg = actualAPI.iconStyle('done', 'icon-done icon-Author', false, false);
            assert.equal('success', cfg, 'wrong cfg');
         });
         it('icon-done', function() {
            const cfg = actualAPI.iconStyle(undefined, 'icon-done icon-Author', false, false);
            assert.equal('success', cfg, 'wrong cfg');
         });
      });

      describe('fontSize', function() {
         it('fontSize', function() {
            let cfg = actualAPI.fontSize({ fontSize: 'm', size: 'l', viewMode: 'button' });
            assert.equal('m', cfg, 'wrong cfg');
         });
         it('button l', function() {
            let cfg = actualAPI.fontSize({ size: 'l', viewMode: 'button' });
            assert.equal('xl', cfg, 'wrong cfg');
         });
         it('button not l', function() {
            let cfg = actualAPI.fontSize({ size: 's', viewMode: 'button' });
            assert.equal('m', cfg, 'wrong cfg');
         });
         it('link s', function() {
            let cfg = actualAPI.fontSize({ size: 's', viewMode: 'link' });
            assert.equal('xs', cfg, 'wrong cfg');
         });
         it('link l', function() {
            let cfg = actualAPI.fontSize({ size: 'l', viewMode: 'link' });
            assert.equal('l', cfg, 'wrong cfg');
         });
         it('link xl', function() {
            let cfg = actualAPI.fontSize({ size: 'xl', viewMode: 'link' });
            assert.equal('3xl', cfg, 'wrong cfg');
         });
         it('link other', function() {
            let cfg = actualAPI.fontSize({ size: '4xl', viewMode: 'link' });
            assert.equal('m', cfg, 'wrong cfg');
         });
         it('toolbutton l', function() {
            let cfg = actualAPI.fontSize({ size: 'l', viewMode: 'toolButton' });
            assert.equal('m', cfg, 'wrong cfg');
         });
         it('size undefined', function() {
            let cfg = actualAPI.fontSize({ viewMode: 'toolButton' });
            assert.equal('m', cfg, 'wrong cfg');
         });
      });

      describe('viewMode', function() {
         it('button', function() {
            let cfg = actualAPI.viewMode('button', 'link');
            assert.equal('button', cfg.viewMode, 'wrong cfg');
         });
         it('transparentQuickButton', function() {
            let cfg = actualAPI.viewMode('transparentQuickButton');
            assert.equal('toolButton', cfg.viewMode, 'wrong cfg');
            assert.equal(false, cfg.contrast, 'wrong cfg');
         });
         it('QuickButton', function() {
            let cfg = actualAPI.viewMode('quickButton');
            assert.equal('toolButton', cfg.viewMode, 'wrong cfg');
            assert.equal(true, cfg.contrast, 'wrong cfg');
         });
      });

      describe('height', function() {
         it('height option', function() {
            let cfg = actualAPI.actualHeight('l', 'xl');
            assert.equal('xl', cfg, 'wrong cfg');
         });
         it('link', function() {
            let cfg = actualAPI.actualHeight('l', undefined, 'link');
            assert.equal(undefined, cfg, 'wrong cfg');
         });
         it('button s', function() {
            let cfg = actualAPI.actualHeight('s', undefined, 'button');
            assert.equal('default', cfg, 'wrong cfg');
         });
         it('button m', function() {
            let cfg = actualAPI.actualHeight('m', undefined, 'button');
            assert.equal('m', cfg, 'wrong cfg');
         });
         it('button l', function() {
            let cfg = actualAPI.actualHeight('l', undefined, 'button');
            assert.equal('2xl', cfg, 'wrong cfg');
         });
         it('button default', function() {
            let cfg = actualAPI.actualHeight('default', undefined, 'button');
            assert.equal('default', cfg, 'wrong cfg');
         });
         it('toolButton s', function() {
            let cfg = actualAPI.actualHeight('s', undefined, 'toolButton');
            assert.equal('default', cfg, 'wrong cfg');
         });
         it('toolButton m', function() {
            let cfg = actualAPI.actualHeight('m', undefined, 'toolButton');
            assert.equal('l', cfg, 'wrong cfg');
         });
         it('toolButton l', function() {
            let cfg = actualAPI.actualHeight('l', undefined, 'toolButton');
            assert.equal('xl', cfg, 'wrong cfg');
         });
         it('toolButton default', function() {
            let cfg = actualAPI.actualHeight('default', undefined, 'toolButton');
            assert.equal('l', cfg, 'wrong cfg');
         });
      });

      describe('constructor() and _beforeUpdate()', function() {
         var inst;

         beforeEach(function() {
            inst = {};
         });

         it('constructor', function() {
            buttons.Button.prototype._beforeMount.call(inst, {
               style: 'primary'
            });
            assert.equal(inst._buttonStyle, 'primary');
         });

         it('_beforeUpdate', function() {
            buttons.Button.prototype._beforeMount.call(inst, {
               style: 'primary'
            });
            assert.equal(inst._buttonStyle, 'primary');
         });
      });
      describe('click', function() {
         var customEvent = {}, eventBublle = true;

         function initButton() {
            customEvent.stopPropagation = function() {
               eventBublle = false;
            };
            btn = new buttons.Button({
               style: 'buttonDefault'
            });
         }

         it('click to enabled button', function() {
            initButton();
            var opt = {
               readOnly: false
            };
            btn.saveOptions(opt);
            btn._clickHandler(customEvent);
            assert(eventBublle);
         });

         it('click to disabled button', function() {
            initButton();
            var opt = {
               readOnly: true
            };
            btn.saveOptions(opt);
            btn._clickHandler(customEvent);
            assert(!eventBublle);
         });
      });
   });
});
