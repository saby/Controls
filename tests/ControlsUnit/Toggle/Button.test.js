define(['Controls/toggle', 'UI/Vdom'], function(toggle, Vdom) {
   'use strict';
   var Btn, changeValue;
   describe('Controls/_toggle/Button', function() {
      beforeEach(function() {
         Btn = new toggle.Button({
            style: 'linkMain'
         });

         // subscribe на vdom компонентах не работает, поэтому мы тут переопределяем _notify
         // (дефолтный метод для vdom компонент который стреляет событием).
         // он будет вызван вместо того что стрельнет событием, тем самым мы проверяем что отправили
         // событие и оно полетит с корректными параметрами.
         Btn._notify = function(event, eventChangeValue) {
            if (event === 'valueChanged') {
               changeValue = eventChangeValue[0];
            }
         };
      });

      afterEach(function() {
         Vdom.Synchronizer.unMountControlFromDOM(Btn, {});
         Btn = undefined;
      });

      it('click to ON state', function() {
         var opt = {
            value: false
         };
         Btn.saveOptions(opt);
         Btn._clickHandler();
         assert.isTrue(changeValue, 'switch to on state failed');
      });

      it('click to OFF state', function() {
         var opt = {
            value: true
         };
         Btn.saveOptions(opt);
         Btn._clickHandler();
         assert.isFalse(changeValue, 'switch to off state failed');
      });

      it('value true two icons and two captions', function() {
         var opt = {
            buttonStyle: 'secondary',
            viewMode: 'toolButton',
            value: true,
            iconSize: 'l',
            iconStyle: 'primary',
            icons: ['icon-testOne', 'icon-testTwo'],
            captions: ['testOne', 'testTwo']
         };
         Btn._beforeUpdate(opt);
         assert.isTrue(Btn._caption === 'testOne', 'caption changed uncorrect');
         assert.isTrue(Btn._icon === 'icon-testOne', 'icon changed uncorrect');
         assert.isTrue(Btn._iconSize === 'l', 'icon changed uncorrect');
         assert.isTrue(Btn._iconStyle === 'primary', 'icon changed uncorrect');
      });

      it('value false two icons and two captions', function() {
         var opt = {
            buttonStyle: 'secondary',
            viewMode: 'toolButton',
            value: false,
            iconSize: 'l',
            iconStyle: 'primary',
            icons: ['icon-testOne', 'icon-testTwo'],
            captions: ['testOne', 'testTwo']
         };
         Btn._beforeUpdate(opt);
         assert.isTrue(Btn._caption === 'testTwo', 'caption changed uncorrect');
         assert.isTrue(Btn._icon === 'icon-testTwo', 'icon changed uncorrect');
         assert.isTrue(Btn._iconSize === 'l', 'icon changed uncorrect');
         assert.isTrue(Btn._iconStyle === 'primary', 'icon changed uncorrect');
      });

      it('iconHover', function() {
         var opt = {
            viewMode: 'toolButton'
         };
         Btn._beforeUpdate(opt);
         assert.isTrue(Btn._hoverIcon, 'hover icon mode uncorrect');

         opt = {
            viewMode: 'pushButton'
         };
         Btn._beforeUpdate(opt);
         assert.isTrue(Btn._hoverIcon, 'hover icon mode uncorrect');

         opt = {
            viewMode: 'toolButton',
            value: true
         };
         Btn._beforeUpdate(opt);
         assert.isFalse(Btn._hoverIcon, 'hover icon mode uncorrect');

         opt = {
            viewMode: 'pushButton',
            value: true
         };
         Btn._beforeUpdate(opt);
         assert.isFalse(Btn._hoverIcon, 'hover icon mode uncorrect');

         opt = {
            viewMode: 'link',
            value: true
         };
         Btn._beforeUpdate(opt);
         assert.isTrue(Btn._hoverIcon, 'hover icon mode uncorrect');
      });
   });
});
