import Store from 'Controls/Store';
import {assert} from 'chai';

describe('Controls/Store', () => {
   it('without context', () => {
      Store.dispatch('myValue', 'myValue');
      assert.equal(Store.getState().myValue, 'myValue');
   });

   it('with context', () => {
      Store.updateStoreContext('contextName');
      Store.dispatch('myValue', 'myValue');
      assert.equal(Store.getState().myValue, 'myValue');
   });

   it('change context', () => {
      Store.updateStoreContext('firstContextName');
      Store.dispatch('myValue', 'myFirstValue');

      Store.updateStoreContext('secondContextName');
      Store.dispatch('myValue', 'mySecondValue');

      Store.updateStoreContext('firstContextName');
      assert.equal(Store.getState().myValue as string, 'myFirstValue');

      Store.updateStoreContext('secondContextName');
      assert.equal(Store.getState().myValue as string, 'mySecondValue');
   });
});
