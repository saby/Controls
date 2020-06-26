define(
   [
      'Controls/input',
      'UI/Utils'
   ],
   function(input, {Logger}) {
      describe('InputActualAPI', function() {
         var sandbox;
         beforeEach(() => {
            sandbox = sinon.createSandbox();
            sandbox.stub(Logger, 'error');
         });

         afterEach(() => {
            sandbox.restore();
         });
         it('inlineHeight', function() {
            const inlineHeight = input.ActualAPI.inlineHeight;

            assert.equal(inlineHeight('s', undefined), 's');
            assert.equal(inlineHeight('m', undefined), 'm');
            assert.equal(inlineHeight('l', undefined), 'l');
            assert.equal(inlineHeight('default', undefined), 'default');
            assert.equal(inlineHeight(undefined, 'xs'), 'xs');
            assert.equal(inlineHeight(undefined, 'xs'), 'xs');
            assert.equal(inlineHeight(undefined, 'xs'), 'xs');
            assert.equal(inlineHeight(undefined, 'xs'), 'xs');
         });
         it('fontColorStyle', function() {
            const fontColorStyle = input.ActualAPI.fontColorStyle;

            assert.equal(fontColorStyle('default', undefined), 'default');
            assert.equal(fontColorStyle('primary', undefined), 'primary');
            assert.equal(fontColorStyle('secondary', undefined), 'secondary');
            assert.equal(fontColorStyle(undefined, 'primary'), 'primary');
            assert.equal(fontColorStyle(undefined, 'default'), 'default');
            assert.equal(fontColorStyle(undefined, 'default'), 'default');
         });
         it('fontSize', function() {
            const fontSize = input.ActualAPI.fontSize;

            assert.equal(fontSize('default', undefined), 'm');
            assert.equal(fontSize('primary', undefined), '3xl');
            assert.equal(fontSize('secondary', undefined), '3xl');
            assert.equal(fontSize(undefined, 's'), 's');
            assert.equal(fontSize(undefined, 's'), 's');
            assert.equal(fontSize(undefined, 's'), 's');
         });
         it('validationStatus', function() {
            const validationStatus = input.ActualAPI.validationStatus;

            assert.equal(validationStatus('info', undefined), 'valid');
            assert.equal(validationStatus('invalid', undefined), 'invalid');
            assert.equal(validationStatus('danger', undefined), 'valid');
            assert.equal(validationStatus('success', undefined), 'valid');
            assert.equal(validationStatus('warning', undefined), 'valid');
            assert.equal(validationStatus('primary', undefined), 'valid');
            assert.equal(validationStatus('info', 'invalid'), 'invalid');
            assert.equal(validationStatus('invalid', undefined), 'invalid');
            assert.equal(validationStatus('danger', 'valid'), 'valid');
            assert.equal(validationStatus('success', 'invalid'), 'invalid');
            assert.equal(validationStatus('warning', 'invalid'), 'invalid');
            assert.equal(validationStatus('primary', 'invalid'), 'invalid');
         });
         it('heightLine', function() {
            const heightLine = input.ActualAPI.heightLine;

            assert.equal(heightLine('s', undefined), 's');
            assert.equal(heightLine('m', undefined), 'm');
            assert.equal(heightLine('l', undefined), 'l');
            assert.equal(heightLine('default', undefined), 'm');
            assert.equal(heightLine(undefined, 'xs'), 'xs');
            assert.equal(heightLine(undefined, 'xs'), 'xs');
            assert.equal(heightLine(undefined, 'xs'), 'xs');
            assert.equal(heightLine(undefined, 'xs'), 'xs');
         });
      });
   }
);
