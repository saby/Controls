define([
   'Controls/validate',
   'Core/Deferred',
   'ControlsUnit/resources/ProxyCall',
], function(validateMod, Deferred, ProxyCall) {
   'use strict';

   function getValidator(validateResult, readOnly) {
      let validator = {
         _validateCall: false,
         _activateCall: false,
         _validationResult: false,
         _isValidCall: false,
         _options: {
            readOnly: readOnly
         },
         validate: () => {
            validator._validateCall = true;
            return (new Deferred()).callback(validateResult);
         },
         activate: () => {
            validator._activateCall = true;
         },
         setValidationResult: (result) => {
            validator._validationResult = result;
         },
         isValid: () => {
            validator._isValidCall = true; return !validator._validationResult;
         }
      };

      return validator;
   }

   describe('Validate/Controller', () => {
      var stubP;
      var calls = [];
      var validCtrl = new validateMod.Container();
      validCtrl._notify = ProxyCall.apply(validCtrl._notify, 'notify', calls, true);
      beforeEach(function() {
         stubP = sinon.stub(validCtrl._private, 'callInfoBox').callsFake(() => undefined);
      });
      afterEach(function() {
         stubP.restore();
      });
      it('valueChangedNotify', () => {
         validCtrl._valueChangedHandler(null, 'test');
         assert.deepEqual(calls, [{
            name: 'notify',
            arguments: ['valueChanged', ['test']]
         }]);
      });
      it('closeInfoBox', () => {
         validCtrl._isOpened = false;
         validCtrl._validationResult = 'error';
         validCtrl._private.openInfoBox(validCtrl);
         validCtrl._mouseInfoboxHandler({type: 'mouseenter'});
         assert.deepEqual(validCtrl._isOpened, true);
         validCtrl._mouseInfoboxHandler({type: 'close'});
         assert.deepEqual(validCtrl._isOpened, false);
         validCtrl.destroy();
      });
      it('cleanValid', () => {
         var validCtrl = new validateMod.Container();
         validCtrl._valueChangedHandler(null, 'test');
         assert.deepEqual(validCtrl._validationResult, undefined);
         validCtrl._validationResult = 'Error';
         validCtrl._valueChangedHandler(null, 'test');
         assert.deepEqual(validCtrl._validationResult, 'Error');
         validCtrl.destroy();
      });
      it('setValidResult', () => {
         var validCtrl = new validateMod.Container();
         var validConfig = {
            hideInfoBox: true,
         };
         validCtrl._isOpened = false;
         validCtrl.setValidationResult('Error 404');
         assert.deepEqual(validCtrl._isOpened, true);
         validCtrl._isOpened = false;
         validCtrl.setValidationResult('Error 404', validConfig);
         assert.deepEqual(validCtrl._isOpened, false);
         validCtrl.destroy();
      });
   });
   describe('Validate/FormController', () => {
      it('add/remove validator', () => {
         let FC = new validateMod.Controller();
         let validator1 = getValidator();
         let validator2 = getValidator();

         FC.onValidateCreated({}, validator1);
         FC.onValidateCreated({}, validator2);

         assert.equal(FC._validates.length, 2);

         FC.onValidateDestroyed({}, validator1);
         FC.onValidateDestroyed({}, validator2);

         assert.equal(FC._validates.length, 0);

         FC.destroy();
      });

      it('isValid', () => {
         let FC = new validateMod.Controller();
         let validator1 = getValidator();
         let validator2 = getValidator();
         FC.onValidateCreated({}, validator1);
         FC.onValidateCreated({}, validator2);

         let isValid = FC.isValid();
         assert.equal(validator1._isValidCall, true);
         assert.equal(validator2._isValidCall, true);
         assert.equal(isValid, true);

         let validator3 = getValidator();
         validator3.setValidationResult('Error');
         FC.onValidateCreated({}, validator3);
         isValid = FC.isValid();
         assert.equal(validator3._isValidCall, true);
         assert.equal(isValid, false);

         FC.destroy();
      });
      it('activateFirstValidField', (done) => {
         let FC = new validateMod.Controller();
         let validator1 = getValidator();
         let validator2 = getValidator(null, true);
         let validator3 = getValidator('Error');
         let validator4 = getValidator('Error');

         FC._validates.push(validator1, validator2, validator3, validator4);
         FC.submit().then(() => {
            assert.equal(validator3._activateCall, true);
            FC.destroy();
            done();
         });

      });

      it('setValidationResult', () => {
         let FC = new validateMod.Controller();
         let validator1 = getValidator();
         let validator2 = getValidator();
         FC.onValidateCreated({}, validator1);
         FC.onValidateCreated({}, validator2);

         FC.setValidationResult();
         assert.equal(validator1._validationResult, null);
         assert.equal(validator2._validationResult, null);

         FC.destroy();
      });

      it('submit', (done) => {
         let FC = new validateMod.Controller();
         let validator1 = getValidator(true);
         let validator2 = getValidator(false);
         FC.onValidateCreated({}, validator1);
         FC.onValidateCreated({}, validator2);

         FC.submit().then((result) => {
            assert.equal(validator1._validateCall, true, 'is validate1 call');
            assert.equal(validator2._validateCall, true, 'is validate2 call');

            assert.equal(result[0], false, 'validate1 result');
            assert.equal(result[1], true, 'validate2 result');

            assert.equal(validator1._activateCall, true, 'is validate1 activate');
            assert.equal(validator2._activateCall, false, 'is validate2 activate');
            done();
         }).catch((error) => {
            done(error);
         });
         FC.destroy();
      });
   });
});
