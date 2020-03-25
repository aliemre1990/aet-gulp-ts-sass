function formatmessage(str, ...args) {
    if (args.length) {
        var t = typeof args[0];
        var key;
        var args2 = ("string" === t || "number" === t) ?
            Array.prototype.slice.call(args)
            : args[0];

        for (key in args2) {
            str = str.replace(new RegExp("\\{" + key + "\\}", "gi"), args2[key]);
        }
    }

    return str;
}

console.log(formatmessage('hello {0} {1}', 'ali', 'emre'));