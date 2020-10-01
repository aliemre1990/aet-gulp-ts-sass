// function formatmessage(str, ...args) {
//     if (args.length) {
//         var t = typeof args[0];
//         var key;
//         var args2 = ("string" === t || "number" === t) ?
//             Array.prototype.slice.call(args)
//             : args[0];

//         for (key in args2) {
//             str = str.replace(new RegExp("\\{" + key + "\\}", "gi"), args2[key]);
//         }
//     }

//     return str;
// }

// console.log(formatmessage('hello {0} {1}', 'ali', 'emre'));

function myClass() {

}
myClass.prototype.fn = function () {
    console.log(this.getValue());
}
myClass.prototype.getValue = function () {
    return 'value';
}

function childClass() {

}
childClass.prototype = Object.create(myClass.prototype);
childClass.prototype.getValue = function(){
    return 'overrided value'
}

var obj = new childClass();
obj.fn();