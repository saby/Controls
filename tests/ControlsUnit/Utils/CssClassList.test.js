define([
   'Controls/list'
], function(list) {

   'use strict';
   describe('Controls.Utils.CssClassList', () => {


      let CssClassList = list.CssClassList;

      it('method "add()" should return this instance of CssClassList', () => {
         let
             classList = new CssClassList(),
             result = classList.add('any', true);

         assert.isTrue(result instanceof CssClassList, 'result of add() is not instanceof CssClassList.');
         assert.isTrue(result === classList, 'result of add() is not the same instance.');
      });

      it('clear()', () => {
         let
             classesObject = {
                'any': true,
                'also': true,
                'me': false
             },
             classList = new CssClassList(classesObject);

         assert.deepEqual(classesObject, classList.getClassList());
         classList.clear();
         assert.deepEqual({}, classList.getClassList());
      });

      it('method "clear()" should return this instance of CssClassList', () => {
         let
             classList = new CssClassList({ 'my': true }),
             result = classList.add('any', true);

         assert.isTrue(result instanceof CssClassList, 'result of clear() is not instanceof CssClassList.');
         assert.isTrue(result === classList, 'result of clear() is not the same instance.');
      });

      it('chaining "add()" method', () => {
         let
             classesObject = {
                'first': true,
                'second': true
             },
             classList = new CssClassList(classesObject);

         assert.deepEqual(classesObject, classList.getClassList());

         classesObject['green'] = false;
         classesObject['blue'] = true;
         classesObject['red'] = true;

         classList.add('green', false).add('blue').add('red', true);

         assert.deepEqual(classesObject, classList.getClassList());
      });

      it('chaining with clear method', () => {
         let
             classesObject = {
                'first': true
             },
             classList = new CssClassList(classesObject);

         assert.deepEqual(classesObject, classList.getClassList());

         classList.add('green', false)
             .add('blue')
             .clear()
             .add('red', true);

         assert.deepEqual({ 'red': true }, classList.getClassList());
      });

      it('"getClassList()" should returns copy of real class list object', () => {
         let
             classList = new CssClassList({ 'my': true }),
             result = classList.getClassList();

         assert.isFalse(result === classList);
         assert.deepEqual({ 'my': true }, result);
      });

      it('"compile()" without chain', () => {

         let
             classesObject = {
                'any': true,
                'also': true,
                'me': false
             },
             classList = new CssClassList(classesObject);

         assert.equal('any also', classList.compile());

      });

      it('"compile()" with chaining', () => {

         let
             classesObject = {
                'any': true,
                'also': true,
                'me': false
             },
             classList = new CssClassList(classesObject),
             result = classList.add('one').add('two', false).add('three', true).compile();

         assert.equal('any also one three', result);

      });

      it('static "compile(classList)" without chain', () => {

         let
             classesObject = {
                'any': true,
                'also': true,
                'me': false
             };

         assert.equal('any also', CssClassList.compile(classesObject));
         assert.equal('', CssClassList.compile());
         assert.equal('', CssClassList.compile({}));

      });

      it('static "compile()" chain', () => {

         let result = CssClassList.add('any', true).add('also').add('me', false).compile();

         assert.equal('any also', result);

         assert.equal('', CssClassList.compile());
         assert.equal('', CssClassList.compile({}));
         assert.equal('', CssClassList.add('').compile({}));

      });

   });
});
