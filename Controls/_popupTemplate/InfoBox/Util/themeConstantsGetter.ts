import {constants} from 'Env/Env';

export default (className, hashMap) => {
    if (!constants.isBrowserPlatform) {
        return {};
    }

    const obj = {};

    const div = document.createElement('div');
    div.setAttribute('class', className);
    div.setAttribute('style', 'position: absolute; top: -1000px; left: -1000px;');
    document.body.appendChild(div);

    const computedStyles = getComputedStyle(div);
    for (const key in hashMap) {
        if (hashMap.hasOwnProperty(key)) {
            obj[key] = parseInt(computedStyles[hashMap[key]], 10);
        }
    }

    div.parentNode.removeChild(div);
    return obj;
};
