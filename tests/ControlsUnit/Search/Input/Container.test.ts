import {assert} from 'chai';
import {InputContainer, SearchResolver} from 'Controls/search';
import * as sinon from 'sinon';

describe('Controls/_search/Input/Container', () => {

   const sandbox = sinon.createSandbox();

   afterEach(() => sandbox.restore());

   it('_beforeUpdate', () => {
      const cont = new InputContainer({});
      cont.saveOptions({});
      cont._value = '';

      cont._beforeUpdate({inputSearchValue: 'test'});
      assert.equal(cont._value, 'test');
   });

   it('_notifySearch', () => {
      const cont = new InputContainer({});
      const stub = sandbox.stub(cont, '_notify');

      cont._notifySearch('test');
      assert.isTrue(stub.withArgs('search', ['test']).calledOnce);
   });

   it('_searchClick', () => {
      const cont = new InputContainer({});
      cont._value = 'test';
      const stub = sandbox.stub(cont, '_notify');
      cont._searchClick(null);

      assert.isTrue(stub.withArgs('search', ['test']).calledOnce);
      stub.reset();

      cont._value = '';
      cont._searchClick(null);
      assert.isTrue(stub.notCalled);
   });

   it('_keyDown', () => {
      const cont = new InputContainer({});
      let propagationStopped = false;
      const event = {
         stopPropagation: () => {
            propagationStopped = true;
         },
         nativeEvent: {
            which: 13 // enter
         }
      };

      cont._keyDown(event);
      assert.isTrue(propagationStopped);
   });

   describe('_valueChanged', () => {
      const cont = new InputContainer({});
      let called = false;
      cont._searchResolverController = {resolve: (value) => {
         called = true;
      }};

      it('new value not equally old value', () => {
         cont._value = '';
         cont._valueChanged(null, 'newValue');

         assert.equal(cont._value, 'newValue');
         assert.isTrue(called);
      });

      it('new value equally old value', () => {
         called = false;
         cont._valueChanged(null, 'newValue');

         assert.isFalse(called);
      });
   });

   describe('_beforeUnmount', () => {
      let cont;
      beforeEach(() => {
         cont = new InputContainer({});
      });

      it('should clear the timer on searchResolverController', () => {
         cont._searchResolverController = {
            clearTimer: sandbox.stub()
         };

         cont._beforeUnmount();

         sinon.assert.calledOnce(cont._searchResolverController.clearTimer);
      });

      it('should not throw when the _searchResolverController doesn\'t exist', () => {
         assert.doesNotThrow(() => {
            cont._beforeUnmount();
         });
      });
   });
});
