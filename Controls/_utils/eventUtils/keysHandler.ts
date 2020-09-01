/**
 * This used in control to handle keyDown events.
 */
export default function keysHandler(event: Event, keys, handlerSet, scope: object, dontStop: boolean): void {
    for (const action in keys) {
        if (keys.hasOwnProperty(action)) {
            if (event.nativeEvent.keyCode === keys[action]) {
                handlerSet[action](scope, event);

                // Так как наша система событий ловит события на стадии capture,
                // а подписки в БТРе на стадии bubbling, то не нужно звать stopPropagation
                // так как обработчики БТРа в таком случае не отработают, потому что
                // у события не будет bubbling фазы
                // TODO: will be fixed https://online.sbis.ru/opendoc.html?guid=cefa8cd9-6a81-47cf-b642-068f9b3898b7
                if (!dontStop) {
                    if (event.target.closest('.richEditor_TinyMCE')) {
                        event._bubbling = false;
                    } else {
                        event.stopImmediatePropagation();
                    }
                }
                return;
            }
        }
    }
}
