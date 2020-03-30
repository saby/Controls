import {assert} from 'chai';
import {readWithAdditionalFields} from 'Controls/_form/crudProgression';
import {PrefetchProxy, SbisService} from 'Types/source';

describe('Controls/_form/crudProgression', () => {
   context('readWithAdditionalFields()', () => {
      let provider;
      let lastName;
      let lastArgs;

      beforeEach(() => {
         provider = {
            call(name: string, args: unknown): Promise<unknown> {
               lastName = name;
               lastArgs = args;
               return Promise.resolve('It\'s fine');
            }
         };
      });

      it('should call SbisService\'s provider read method with given key', () => {
         const source = new SbisService({provider, binding: {read: 'Read'}});

         readWithAdditionalFields(source, 'foo');
         assert.equal(lastName, 'Read');
         assert.equal(lastArgs.ИдО, 'foo');
      });

      it('should call SbisService\'s provider read method with given key and meta data', () => {
         const source = new SbisService({provider, binding: {read: 'Read'}});

         readWithAdditionalFields(source, 'foo', ['bar']);
         assert.equal(lastName, 'Read');
         assert.equal(lastArgs.ИдО, 'foo');
         assert.deepEqual(lastArgs.ДопПоля, ['bar']);
      });

      it('should call target source if Types/source:IDecorator is implemented', () => {
         const target = new SbisService({provider, binding: {read: 'Read'}});
         const source = new PrefetchProxy({target});

         readWithAdditionalFields(source, 'foo');
         assert.equal(lastName, 'Read');
         assert.equal(lastArgs.ИдО, 'foo');
      });
   });
});
