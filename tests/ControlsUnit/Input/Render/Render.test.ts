import {assert} from 'chai';
import {createSandbox} from 'sinon';
import {SyntheticEvent} from 'Vdom/Vdom';
import {Render, IRenderOptions} from 'Controls/input';

describe('Controls.input:Render', () => {
   let inst: Render;
   const defaultOptions: Partial<IRenderOptions> = Render.getDefaultOptions();
   beforeEach(() => {
      inst = new Render(defaultOptions);
   });
   describe('_beforeMount', () => {
      describe('Check _border state', () => {
         it('visible', () => {
            inst._beforeMount({
               ...defaultOptions,
               borderVisibility: 'visible'
            } as IRenderOptions);

            assert.deepEqual(inst._border, {
               top: true,
               right: true,
               bottom: true,
               left: true
            });
         });
         it('partial', () => {
            inst._beforeMount({
               ...defaultOptions,
               borderVisibility: 'partial',
               multiline: false
            } as IRenderOptions);

            assert.deepEqual(inst._border, {
               top: false,
               right: false,
               bottom: true,
               left: false
            });
         });
         it('partial and multiline', () => {
            inst._beforeMount({
               ...defaultOptions,
               borderVisibility: 'partial',
               multiline: true
            } as IRenderOptions);

            assert.deepEqual(inst._border, {
               top: true,
               right: false,
               bottom: true,
               left: false
            });
         });
         it('hidden', () => {
            inst._beforeMount({
               ...defaultOptions,
               borderVisibility: 'hidden'
            } as IRenderOptions);

            assert.deepEqual(inst._border, {
               top: false,
               right: false,
               bottom: false,
               left: false
            });
         });
      });
      describe('Check _state and _statePrefix state', () => {
         it('readonly', () => {
            inst._beforeMount({
               ...defaultOptions,
               readOnly: true
            } as IRenderOptions);

            assert.equal(inst._state, 'readonly');
            assert.equal(inst._statePrefix, '');
         });
         it('readonly and state', () => {
            inst._beforeMount({
               ...defaultOptions,
               readOnly: true,
               state: 'test'
            } as IRenderOptions);

            assert.equal(inst._state, 'test-readonly');
            assert.equal(inst._statePrefix, '_test');
         });
         it('readonly and multiline', () => {
            inst._beforeMount({
               ...defaultOptions,
               readOnly: true,
               multiline: true
            } as IRenderOptions);

            assert.equal(inst._state, 'readonly-multiline');
            assert.equal(inst._statePrefix, '');
         });
         it('readonly and multiline and state', () => {
            inst._beforeMount({
               ...defaultOptions,
               readOnly: true,
               multiline: true,
               state: 'test'
            } as IRenderOptions);

            assert.equal(inst._state, 'test-readonly-multiline');
            assert.equal(inst._statePrefix, '_test');
         });
         it('borderStyle and validationStatus = valid', () => {
            inst._beforeMount({
               ...defaultOptions,
               validationStatus: 'valid',
               borderStyle: 'success'
            } as IRenderOptions);

            assert.equal(inst._state, 'success');
            assert.equal(inst._statePrefix, '');
         });
         it('borderStyle and validationStatus = valid and state', () => {
            inst._beforeMount({
               ...defaultOptions,
               validationStatus: 'valid',
               borderStyle: 'success',
               state: 'test'
            } as IRenderOptions);

            assert.equal(inst._state, 'test-success');
            assert.equal(inst._statePrefix, '_test');
         });
         it('validationStatus = invalid', () => {
            inst._beforeMount({
               ...defaultOptions,
               validationStatus: 'invalid'
            } as IRenderOptions);

            assert.equal(inst._state, 'invalid');
            assert.equal(inst._statePrefix, '');
         });
         it('validationStatus = invalid and state', () => {
            inst._beforeMount({
               ...defaultOptions,
               validationStatus: 'invalid',
               state: 'test'
            } as IRenderOptions);

            assert.equal(inst._state, 'test-invalid');
            assert.equal(inst._statePrefix, '_test');
         });
         it('validationStatus = invalid and contentActive', () => {
            const options: IRenderOptions = {
               ...defaultOptions,
               validationStatus: 'invalid'
            } as IRenderOptions;
            inst._beforeMount(options);
            inst._options = options;
            const event = new SyntheticEvent<FocusEvent>({} as FocusEvent);
            const sandbox = createSandbox();
            sandbox.replace(Render, 'notSupportFocusWithin', () => true);
            inst._setContentActive(event, true);

            assert.equal(inst._state, 'invalid-active');
            assert.equal(inst._statePrefix, '');

            sandbox.restore();
         });
         it('validationStatus = invalid and contentActive and state', () => {
            const options: IRenderOptions = {
               ...defaultOptions,
               validationStatus: 'invalid',
               state: 'test'
            } as IRenderOptions;
            inst._beforeMount(options);
            inst._options = options;
            const event = new SyntheticEvent<FocusEvent>({} as FocusEvent);
            const sandbox = createSandbox();
            sandbox.replace(Render, 'notSupportFocusWithin', () => true);
            inst._setContentActive(event, true);

            assert.equal(inst._state, 'test-invalid-active');
            assert.equal(inst._statePrefix, '_test');

            sandbox.restore();
         });
      });
   });
});
