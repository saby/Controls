import {detection} from 'Env/Env';

const constants = 'Controls/_utils/fontUtils/FontWidthConstants/';
const fontSizes = ['xs', 's', 'm', 'l', 'xl', '2xl', '3xl', '4xl', '5xl'];

export const getFontWidth = (text, size, fonts) => {
    let textWidth = 0;
    for (let i = 0; i < text.length; i++) {
        textWidth += fonts[size][text[i]];
    }
    return textWidth;
};

const getBrowser = () => {
    if (detection.firefox) {
        return 'FF';
    }
    if (detection.safari) {
        return 'Safari';
    }
    if (detection.isIE) {
        return 'IE';
    }
    return 'Chrome';
};

export const loadFontWidthConstants = () => {
    const browser = getBrowser();
    let promiseResolver;
    const module = constants + browser;
    const promise = new Promise((resolve) => {
        promiseResolver = resolve;
    });
    if (requirejs.defined(module)) {
        promiseResolver(import(module).then((constant) => {
            return constant[browser];
        }));
    } else {
        import(module).then((constant) => {
            promiseResolver(constant[browser]);
        });
    }
    return promise;
};
