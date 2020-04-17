// Establish thrift client
var thrift = require('thrift');
var userService = require('./gen_nodejs/userService.js');
var thriftConnection = thrift.createConnection('127.0.0.1', 6161);
var thriftClient = thrift.createClient(userService, thriftConnection);

thriftConnection.on("error", function(e) {
    console.log(e);
});

// Set up variables
let txtin = document.querySelector('#txtin1')
let result = document.querySelector('#result1')
let btnGen = document.getElementById('btnGen')

// Call function
btnGen.addEventListener('click', () => {
    var dic = {
        txtin: txtin.value
    }
    dic = JSON.stringify(dic)

    // Show loading animation
    document.getElementById('lamp').className = "icon icon-lamp loading"
    btnGen.disabled = true

    // Get result
    result.value = ''
    thriftClient.test1(dic, (error, res) => {
        if (error) {
            console.error(error)
        } else {
            result.value = res
        }
    })
})

// Stop loading animation
result.onclick = () => {
    document.getElementById('lamp').className = "icon icon-lamp"
    btnGen.disabled = false
}
