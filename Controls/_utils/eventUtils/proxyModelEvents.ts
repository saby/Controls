export default function proxyModelEvents(component, model, eventNames: string[]) {
    eventNames.forEach((eventName: string) => {
        model.subscribe(eventName, (event, value) => {
            component._notify(eventName, value);
        });
    });
}
