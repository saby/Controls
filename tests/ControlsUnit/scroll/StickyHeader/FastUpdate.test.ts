import fastUpdate from 'Controls/_scroll/StickyHeader/FastUpdate';

describe('Controls/_scroll/StickyHeader/FastUpdate', () => {
    describe('resetSticky', () => {
        it("should add an element to reset", () => {
            const stickyHeaderElement = {};

            fastUpdate.resetSticky([stickyHeaderElement]);

            assert.lengthOf(fastUpdate._stickyContainersForReset, 1);
            assert.deepInclude(fastUpdate._stickyContainersForReset, { container: stickyHeaderElement });

            // Почистим, потому что он очищается только после вызова методов measure или mutate, причем асинхронно.
            fastUpdate._stickyContainersForReset = [];
        });
        it("should't add the same element to reset", () => {
            const stickyHeaderElement = {};

            fastUpdate.resetSticky([stickyHeaderElement]);
            fastUpdate.resetSticky([stickyHeaderElement]);

            assert.lengthOf(fastUpdate._stickyContainersForReset, 1);

            // Почистим, потому что он очищается только после вызова методов measure или mutate, причем асинхронно.
            fastUpdate._stickyContainersForReset = [];
        });
    });
});
