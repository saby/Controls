import {assert} from 'chai';
import {getImageClasses, getImageUrl, getImageSize, IMAGE_FIT} from 'Controls/_tile/TileView/resources/imageUtil';

describe('tileImageUtil', () => {
    describe('getImageClasses', () => {
        assert.strictEqual(getImageClasses(IMAGE_FIT.CONTAIN), 'controls-TileView__image-contain');
        assert.strictEqual(getImageClasses(IMAGE_FIT.COVER), '');
    });
    describe('getImageUrl', () => {
        it ('get url', () => {
            const imageUrlResolver = () => 'resolvedUrl';
            const baseUrl = '/online.sbis.ru/doc';
            const defaultPrefix = '/previewer/c';
            let defaultUrl = getImageUrl(0, 100, baseUrl, null);
            assert.strictEqual(defaultUrl, `${defaultPrefix}/100${baseUrl}`);

            defaultUrl = getImageUrl(100, 0, baseUrl, null);
            assert.strictEqual(defaultUrl, `${defaultPrefix}/100${baseUrl}`);

            defaultUrl = getImageUrl(100, 100, baseUrl, null);
            assert.strictEqual(defaultUrl, `${defaultPrefix}/100/100${baseUrl}`);

            defaultUrl = getImageUrl(100, 0, baseUrl, null, imageUrlResolver);
            assert.strictEqual(defaultUrl, 'resolvedUrl');
        })
    });
    describe('getImageSize', () => {
        describe('cover image fit', () => {
            it('proportional image must be require with scale width by 1.5', () => {
                const proportionalImage = getImageSize(200, 200, 'static', 25, 25, 'cover');
                assert.isTrue(proportionalImage.height === 25);
                assert.isTrue(proportionalImage.width === 25);
            });

            it('wide image', () => {
                const imageSizesWide = getImageSize(200, 300, 'static', 400, 2500, 'cover');
                assert.isTrue(imageSizesWide.height === 450);
                assert.isTrue(imageSizesWide.width === 300);
            });
            it('tall image', () => {
                const imageSizesTall = getImageSize(200, 300, 'static', 4000, 350, 'cover');
                assert.isTrue(imageSizesTall.width === 300);
                assert.isTrue(imageSizesTall.height === 450);
            });
            it('image is wider then tile, but not wider scaled tile ', () => {
                const imageSizesTall = getImageSize(200, 200, 'static', 200, 250, 'cover');
                assert.isTrue(imageSizesTall.width === 300);
                assert.isTrue(imageSizesTall.height === 0);
            });
        });
        describe('none and contain image fit', () => {
            it('returns image original sizes', () => {
                const imageSizes = getImageSize(200, 300, 'static', 1, 1, 'contain');
                assert.isTrue(imageSizes.width === 1);
                assert.isTrue(imageSizes.height === 1);

                const imageSizes = getImageSize(200, 300, 'static', 1, 1, 'none');
                assert.isTrue(imageSizes.width === 200);
                assert.isTrue(imageSizes.height === 300);
            });
        })
    });
});
