import {constants} from 'Env/Env';

export = function(className, hashMap) {
    if (!constants.isBrowserPlatform) {
        return {};
    }

    var obj = {};

    var div = document.createElement('div');
    div.setAttribute('class', className);
    div.setAttribute('style', 'position: absolute; top: -1000px; left: -1000px;');
    document.body.appendChild(div);

    var computedStyles = getComputedStyle(div);
    for (var key in hashMap) {
        obj[key] = parseInt(computedStyles[hashMap[key]]);
    }

    div.parentNode.removeChild(div);
    return obj;
};
