define(function() {
    return {
        exportFunction: function(echo) { return echo; },
        exportFunctionTwice: function (echo) {
            return echo + echo;
        }
    };
});