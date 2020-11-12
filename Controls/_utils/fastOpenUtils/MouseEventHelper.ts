export enum MouseButtons {
    Left,
    Wheel,
    Right
}

export function isMouseEvent(event: Event): boolean {
    return event instanceof MouseEvent;
}

export const MouseUp = {
    isButton(event: MouseEvent, button: MouseButtons): boolean {
        if ('buttons' in event) {
            return button === event.button;
        }
        return button === event.which - 1;
    }
};
