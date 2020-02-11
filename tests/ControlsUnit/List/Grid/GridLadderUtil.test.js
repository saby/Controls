define(['Controls/_grid/utils/GridLadderUtil', 'Types/collection', 'Types/display'], function(Util, Collection, Display) {

   describe('Controls/_grid/GridLadderUtil', function() {
      it('isSupportLadder', function() {
         assert.isFalse(Util.isSupportLadder(undefined));
         assert.isFalse(Util.isSupportLadder([]));
         assert.isTrue(Util.isSupportLadder(['photo']));
      });
      it('getStickyColumn', function() {
         assert.deepEqual(Util.getStickyColumn({}), undefined);
         assert.deepEqual(Util.getStickyColumn({ stickyColumn: { index: 1, property: 'sticky' } }), { index: 1, property: 'sticky' });
         assert.deepEqual(Util.getStickyColumn({ stickyColumn: { index: 1, property: 'sticky' }, columns: [] }), { index: 1, property: 'sticky' });
         assert.deepEqual(Util.getStickyColumn({ stickyColumn: { index: 1, property: 'sticky' }, columns: [{ title: 'photo' }] }), { index: 1, property: 'sticky' });
         assert.deepEqual(Util.getStickyColumn({ stickyColumn: { index: 1, property: 'sticky' }, columns: [{ title: 'photo', stickyProperty: 'photo' }] }), { index: 1, property: 'sticky' });
         assert.deepEqual(Util.getStickyColumn({ columns: [{ title: 'photo', stickyProperty: 'photo' }] }), { index: 0, property: 'photo' });
         assert.deepEqual(Util.getStickyColumn({ columns: [{ title: 'title' }, { title: 'photo', stickyProperty: 'photo' }] }), { index: 1, property: 'photo' });
      });
      it('shouldAddStickyLadderCell', function() {
         assert.isFalse(Util.shouldAddStickyLadderCell());
         assert.isFalse(Util.shouldAddStickyLadderCell([]));
         assert.isTrue(Util.shouldAddStickyLadderCell([], { index: 1, property: 'sticky' }));
         assert.isTrue(Util.shouldAddStickyLadderCell([{ title: 'photo' }], { index: 1, property: 'sticky' }));
         assert.isTrue(Util.shouldAddStickyLadderCell([{ title: 'photo', stickyProperty: 'photo' }]));
         assert.isFalse(Util.shouldAddStickyLadderCell([{ title: 'photo', stickyProperty: 'photo' }], undefined, {}));
      });
      it('prepareLadder', function() {
         const date1 = new Date(2017, 00, 01);
         const date2 = new Date(2017, 00, 03);
         const date3 = new Date(2017, 00, 05);
         const date4 = new Date(2017, 00, 07);
         const date5 = new Date(2017, 00, 09);
         const items = new Collection.RecordSet({
            keyProperty: 'key',
            rawData: [
               { key: 0, title: 'i0', date: date1, photo: '1.png' },
               { key: 1, title: 'i1', date: date2, photo: '1.png' },
               { key: 2, title: 'i2', date: date2, photo: '1.png' },
               { key: 3, title: 'i3', date: date2, photo: '2.png' },
               { key: 4, title: 'i4', date: date3, photo: '3.png' },
               { key: 5, title: 'i5', date: date3, photo: '3.png' },
               { key: 6, title: 'i6', date: date4, photo: '3.png' },
               { key: 7, title: 'i7', date: date5, photo: '3.png' },
               { key: 8, title: 'i8', date: date5, photo: '4.png' },
               { key: 9, title: 'i9', date: date5, photo: '5.png' }
            ]
         });
         const columns = [{
            width: '1fr',
            displayProperty: 'title'
         }, {
            width: '1fr',
            template: 'wml!MyTestDir/Photo',
            stickyProperty: 'photo'
         }];
         const resultLadder = {
            0: { date: { ladderLength: 1 } },
            1: { date: { ladderLength: 3 } },
            2: { date: { } },
            3: { date: { } },
            4: { date: { ladderLength: 2 } },
            5: { date: { } },
            6: { date: { ladderLength: 1 } },
            7: { date: { ladderLength: 3 } },
            8: { date: { } },
            9: { date: { } }
         };
         const resultStickyLadder = {
            0: {
               ladderLength: 3,
               headingStyle: 'grid-row: span 3'
            },
            1: {},
            2: {},
            3: {
               ladderLength: 1,
               headingStyle: 'grid-row: span 1'
            },
            4: {
               ladderLength: 4,
               headingStyle: 'grid-row: span 4'
            },
            5: {},
            6: {},
            7: {},
            8: {
               ladderLength: 1,
               headingStyle: 'grid-row: span 1'
            },
            9: {
               ladderLength: 1,
               headingStyle: 'grid-row: span 1'
            }
         };
         const ladder = Util.prepareLadder({
            display: Display.Abstract.getDefaultDisplay(items, { keyProperty: 'key' }),
            columns: columns,
            ladderProperties: ['date'],
            startIndex: 0,
            stopIndex: 10
         });
         assert.deepEqual(ladder.ladder, resultLadder, 'Incorrect value prepared ladder.');
         assert.deepEqual(ladder.stickyLadder, resultStickyLadder, 'Incorrect value prepared stickyLadder.');
      });
   });
});
