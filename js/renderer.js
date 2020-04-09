// Establish thrift client
var thrift = require('thrift');
var userService = require('./gen_nodejs/userService.js');
var thriftConnection = thrift.createConnection('127.0.0.1', 6161);
var thriftClient = thrift.createClient(userService, thriftConnection);

thriftConnection.on("error", function(e)
{
    console.log(e);
});

// Set up variables
let txtin = document.querySelector('#txtin')
let result = document.querySelector('#result')

// Call function
txtin.addEventListener('input', () => {
  var dic = {txtin: txtin.value}
  dic = JSON.stringify(dic)
  thriftClient.test1(dic, (error, res) => {
    if(error) {
      console.error(error)
    } else {
      result.textContent = res
    }
  })
})
txtin.dispatchEvent(new Event('input'))
