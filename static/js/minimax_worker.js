onmessage = function(ev) {
    var dataObj = ev.data;
    console.log(' Worker: Data read: '+ dataObj);



    var result;


    postMessage(result)
}