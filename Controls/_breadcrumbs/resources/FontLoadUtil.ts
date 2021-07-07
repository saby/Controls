import * as Deferred from 'Core/Deferred';

const LOADED_FONTS_FOR_CLASS = {};

let fallbackFontWidth;

function _isLoaded(className: string): boolean {
    if (LOADED_FONTS_FOR_CLASS[className]) {
        return true;
    }

    const measurer = document.createElement('div');

    measurer.innerText = 'test string';
    measurer.classList.add('controls-FontLoadUtil__measurer');
    document.body.appendChild(measurer);

    if (!fallbackFontWidth) {
        measurer.classList.add('controls-FontLoadUtil__measurer_fallback');
        fallbackFontWidth = measurer.clientWidth;
        measurer.classList.remove('controls-FontLoadUtil__measurer_fallback');
    }

    measurer.classList.add(className);
    const loadedFontWidth = measurer.clientWidth;
    document.body.removeChild(measurer);
    return fallbackFontWidth !== loadedFontWidth;
}

export const __loadedFonts = LOADED_FONTS_FOR_CLASS;

export function waitForFontLoad(className: string, isLoaded: Function = _isLoaded): Deferred {
    const def = new Deferred();
    let checkFontLoad: number = 0;

    def.addCallback((res) => {
        LOADED_FONTS_FOR_CLASS[className] = true;
        return res;
    });

    if (isLoaded(className)) {
        def.callback();
    } else {
        checkFontLoad = setInterval(() => {
            if (isLoaded(className)) {
                clearInterval(checkFontLoad);
                def.callback();
            }
        }, 300);
    }

    return def;
}
