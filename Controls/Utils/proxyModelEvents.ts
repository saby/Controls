export default function proxyModelEvents(component, model, eventNames) {
    eventNames.forEach(function(eventName) {
        model.subscribe(eventName, function(event, value) {
            component._notify(eventName, value);
        });
    });
}
