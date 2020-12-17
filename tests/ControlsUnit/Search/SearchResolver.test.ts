import {SearchResolver} from 'Controls/search';
import {assert} from 'chai';
import * as sinon from 'sinon';
import {ISearchResolverOptions} from 'Controls/_search/SearchResolver';

const defaultOptions = {
   searchCallback: () => null,
   searchResetCallback: () => null
};

const initSearchDelay = (options?: Partial<ISearchResolverOptions>) => {
   const searchCallback = sinon.stub();
   const searchResolver = new SearchResolver({
      ...defaultOptions,
      searchCallback,
      ...options
   });
   return {
      searchResolver, searchCallback
   };
};

describe('Controls/search:SearchDelay', () => {
   const now = new Date().getTime();

   describe('searchDelay', () => {
      it('should callback when delay is undefined', () => {
         const {searchResolver, searchCallback} = initSearchDelay({
            minSearchLength: 3
         });

         searchResolver.resolve('test');
         assert.isTrue(searchCallback.called);
      });

      it('should callback when delay is 0', () => {
         const {searchResolver, searchCallback} = initSearchDelay({
            minSearchLength: 3,
            searchDelay: 0
         });

         searchResolver.resolve('test');
         assert.isTrue(searchCallback.called);
      });

      it('should callback after delay', () => {
         const clock = sinon.useFakeTimers({
            now, toFake: ['setTimeout', 'clearTimeout']
         });
         const {searchResolver, searchCallback} = initSearchDelay({
            minSearchLength: 3,
            searchDelay: 1000
         });

         searchResolver.resolve('test');
         clock.tick(1001);
         assert.isTrue(searchCallback.called);

         clock.restore();
      });
   });

   describe('searchStarted', () => {
      it('shouldn\'t resolve callback if search isn\'t started', () => {
         const searchResetCallback = sinon.stub();
         const {searchResolver, searchCallback} = initSearchDelay({
            minSearchLength: 3,
            searchDelay: 1000,
            searchResetCallback
         });
         searchResolver.resolve('');

         assert.isFalse(searchCallback.called);
         assert.isFalse(searchResetCallback.called);
      });

      it('searchStarted = false when length is > 0', () => {
         const clock = sinon.useFakeTimers({
            now, toFake: ['setTimeout', 'clearTimeout']
         });
         const searchResetCallback = sinon.stub();
         const {searchResolver, searchCallback} = initSearchDelay({
            minSearchLength: 3,
            searchDelay: 1000,
            searchResetCallback
         });
         searchResolver.resolve('te');

         clock.tick(1001);

         assert.isFalse(searchCallback.called);
         assert.isFalse(searchResetCallback.called);
         assert.isFalse(searchResolver._searchStarted);

         clock.restore();
      });

      it('searchStarted = true when searchDelay = 0, length > minLength', () => {
         const searchResetCallback = sinon.stub();
         const {searchResolver, searchCallback} = initSearchDelay({
            minSearchLength: 3,
            searchDelay: 0,
            searchResetCallback
         });
         searchResolver.resolve('test');

         assert.isTrue(searchCallback.called);
         assert.isFalse(searchResetCallback.called);
         assert.isTrue(searchResolver._searchStarted);
      });
   });

   describe('minValueLength', () => {
      it('should resetCallback when value is empty', () => {
         const clock = sinon.useFakeTimers({
            now, toFake: ['setTimeout', 'clearTimeout']
         });
         const searchResetCallback = sinon.stub();
         const {searchResolver, searchCallback} = initSearchDelay({
            minSearchLength: 3,
            searchDelay: 1000,
            searchResetCallback
         });
         searchResolver._searchStarted = true;
         searchResolver.resolve('');

         clock.tick(1001);

         assert.isFalse(searchCallback.called);
         assert.isTrue(searchResetCallback.called);

         clock.restore();
      });

      it('should resetCallback when value is null', () => {
         const clock = sinon.useFakeTimers({
            now, toFake: ['setTimeout', 'clearTimeout']
         });
         const searchResetCallback = sinon.stub();
         const {searchResolver, searchCallback} = initSearchDelay({
            minSearchLength: 3,
            searchDelay: 1000,
            searchResetCallback
         });

         searchResolver._searchStarted = true;
         searchResolver.resolve(null);
         clock.tick(1001);

         assert.isFalse(searchCallback.called);
         assert.isTrue(searchResetCallback.called);

         clock.restore();
      });

      it('shouldn\'t callback when minSearchValueLength is undefined', () => {
         const clock = sinon.useFakeTimers({
            now, toFake: ['setTimeout', 'clearTimeout']
         });
         const {searchResolver, searchCallback} = initSearchDelay({
            searchDelay: 1000
         });

         searchResolver.resolve('test');
         clock.tick(1001);
         assert.isFalse(searchCallback.called);

         clock.restore();
      });

      it('shouldn\'t callback when minSearchValueLength is null and valueLength is 0', () => {
         const searchResetCallback = sinon.stub();
         const {searchResolver, searchCallback} = initSearchDelay({
            searchDelay: 1000,
            minSearchLength: null,
            searchResetCallback
         });

         searchResolver._searchStarted = true;
         searchResolver.resolve('');

         assert.isFalse(searchCallback.called);
         assert.isTrue(searchResetCallback.called);
      });

      it('shouldn\'t callback when minSearchValueLength is null', () => {
         const clock = sinon.useFakeTimers({
            now, toFake: ['setTimeout', 'clearTimeout']
         });
         const searchResetCallback = sinon.stub();
         const {searchResolver, searchCallback} = initSearchDelay({
            searchDelay: 1000,
            minSearchLength: null,
            searchResetCallback
         });

         searchResolver.resolve('test');

         clock.tick(1001);
         assert.isFalse(searchCallback.called);
         assert.isFalse(searchResetCallback.called);

         clock.restore();
      });

      it('should callback when minSearchValueLength is 0', () => {
         const clock = sinon.useFakeTimers({
            now, toFake: ['setTimeout', 'clearTimeout']
         });
         const {searchResolver, searchCallback} = initSearchDelay({
            minSearchLength: 0,
            searchDelay: 1000
         });

         searchResolver.resolve('t');
         clock.tick(1001);
         assert.isTrue(searchCallback.called);

         clock.restore();
      });
   });
});
