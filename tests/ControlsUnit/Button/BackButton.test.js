define(['Controls/heading', 'UI/Utils'], function(heading, {Logger}) {
   var separator;
   describe('Controls/_heading/BackButton', function() {
      var sandbox;
      beforeEach(() => {
         sandbox = sinon.createSandbox();
         sandbox.stub(Logger, 'error');
      });

      afterEach(() => {
         sandbox.restore();
      });
      it('_beforeMount', function() {
         var backB = new heading.Back(),
            opt = {
               style: ''
            },
            styles = [
               {
                  optionStyle: 'test',
               },
               {
                  optionStyle: 'default',
               }
            ];
         styles.forEach(function(setOfStyle) {
            opt.style = setOfStyle.optionStyle;
            backB._beforeMount(opt);
            assert.equal(backB._fontColorStyle, 'primary', 'uncorrect style in _beforeMount');
            assert.equal(backB._iconStyle, 'secondary', 'uncorrect style in _beforeMount');
         });
         backB.destroy();
      });
      it('_beforeUpdate', function() {
         var backB = new heading.Back(),
            opt = {
               style: ''
            },
            styles = [
               {
                  optionStyle: 'test',
               },
               {
                  optionStyle: 'default',
               }
            ];
         styles.forEach(function(setOfStyle) {
            opt.style = setOfStyle.optionStyle;
            backB._beforeUpdate(opt);
            assert.equal(backB._fontColorStyle, 'primary', 'uncorrect style in _beforeMount');
            assert.equal(backB._iconStyle, 'secondary', 'uncorrect style in _beforeMount');
         });
         backB.destroy();
      });
      it ('_setFontState', function () {
         const backC = new heading.Back();
         const styles1 = {
            style: 'primary'
         };
         backC._setFontState(styles1);
         assert.equal(backC._fontColorStyle, 'primary');
         assert.equal(backC._iconStyle, 'secondary');

         const styles2 = {
            style: 'secondary',
         };
         backC._setFontState(styles2);
         assert.equal(backC._fontColorStyle, 'secondary');
         assert.equal(backC._iconStyle, 'primary');

         const styles3 = {
            style: 'blablabla'
         };
         backC._setFontState(styles3);
         assert.equal(backC._fontColorStyle, 'primary', 'uncorrect style');
         assert.equal(backC._iconStyle, 'secondary');

         const styles4 = {
            fontColorStyle: 'secondary',
            iconStyle: 'primary',
         };
         backC._setFontState(styles4);
         assert.equal(backC._fontColorStyle, 'secondary');
         assert.equal(backC._iconStyle, 'primary');

      });
      it ('_setSizeState', function () {
         const backD = new heading.Back();
         const styles1 = {
            size: 'l'
         };
         backD._setSizeState(styles1);
         assert.equal(backD._fontSize, '4xl');
         assert.equal(backD._iconSize, 'l');

         const styles2 = {
            iconSize: 'l',
            fontSize: 'l'
         };
         backD._setSizeState(styles2);
         assert.equal(backD._fontSize, 'l');
         assert.equal(backD._iconSize, 'l');

         const styles3 = {
            iconSize: 's',
         };
         backD._setSizeState(styles3);
         assert.equal(backD._fontSize, '3xl');
         assert.equal(backD._iconSize, 's');

      });
   });
});
