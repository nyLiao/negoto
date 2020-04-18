// Renderer managing page activities
//
// by nyLiao, 2020

var events = require('events')
var fs = require('fs')
var thrift = require('thrift')

// Init
var eventEmitter = new events.EventEmitter()    // event manager watching textarea value
var numListItem = 0                             // number of current li
newListItem()                                   // new two init list items
newListItem()

// Establish thrift client
var userService = require('./gen_nodejs/userService.js')
var thriftConnection = thrift.createConnection('127.0.0.1', 6161)
var thriftClient = thrift.createClient(userService, thriftConnection)
thriftConnection.on("error", function(e) {
    console.log(e)
});

// Bind list item activities
function bindListItem(num) {
    // Set up variables
    let li = document.querySelector('#li' + num)
    let textin = li.querySelector('.textin')
    let result = li.querySelector('.textout')
    let btnClr = li.querySelector('.btn-default')
    let btnGen = li.querySelector('.btn-primary')
    let iconLamp = btnGen.querySelector('.icon-lamp')

    // Clear button
    btnClr.addEventListener('click', () => {
        textin.value = ''
        result.value = ''
    })

    // Generate button
    btnGen.addEventListener('click', () => {
        let dic = {
            txtin: textin.value
        }
        dic = JSON.stringify(dic)

        // Show loading animation
        iconLamp.className = "icon icon-lamp loading"
        btnGen.disabled = true

        // Get result
        result.value = ''
        thriftClient.test1(dic, (error, res) => {
            if (error) {
                console.error(error)
            } else {
                result.value = res
                eventEmitter.emit('generated')
            }
        })
    })
    // Stop loading animation
    eventEmitter.on('generated', function() {
        iconLamp.className = "icon icon-lamp"
        btnGen.disabled = false
    })
}

// Add li, use appendChild method as directly edit innerHTML will lose textarea inputs
function newListItem() {
    numListItem += 1

    let li = document.createElement("li")
    li.setAttribute("class", "list-group-item")
    li.setAttribute("id", "li" + numListItem)
    document.querySelector(".list-group").appendChild(li)

    let label = document.createElement("label")
    label.innerHTML = 'Paragraph ' + numListItem
    li.appendChild(label)

    let textin = document.createElement("textarea")
    textin.setAttribute("class", "form-control textin")
    textin.setAttribute("placeholder", "Input beginning...")
    li.appendChild(textin)

    let textout = document.createElement("textarea")
    textout.setAttribute("class", "form-control textout")
    li.appendChild(textout)

    let btnClr = document.createElement("button")
    btnClr.setAttribute("class", "btn btn-default")
    li.appendChild(btnClr)

    let iconCanc = document.createElement("span")
    iconCanc.setAttribute("class", "icon icon-cancel-circled")
    iconCanc.setAttribute("style", "color:black")
    btnClr.appendChild(iconCanc)
    btnClr.innerHTML += '&nbsp;Clear'

    let btnGen = document.createElement("button")
    btnGen.setAttribute("class", "btn btn-primary pull-right")
    li.appendChild(btnGen)

    let iconLamp = document.createElement("span")
    iconLamp.setAttribute("class", "icon icon-lamp")
    iconLamp.setAttribute("style", "color:white")
    btnGen.appendChild(iconLamp)
    btnGen.innerHTML += '&nbsp;Generate!'

    bindListItem(numListItem)
}

// Set toolbar buttons
// Add a new list item
document.getElementById('btnAdd').onclick = () => {
    newListItem()
}

// Clear all texts
document.getElementById('btnRfr').onclick = () => {
    for (var i = 0; i < document.querySelectorAll("textarea").length; i++) {
        document.querySelectorAll("textarea")[i].value = ''
    }
    // TODO: model init
}

// Export text to txt
document.getElementById('btnShr').onclick = () => {
    var outFlie = fs.createWriteStream('./outputs/output.txt', {encoding:'utf8'})
    for (var i = 0; i < document.querySelectorAll(".textout").length; i++) {
        para = document.querySelectorAll(".textout")[i].value
        outFlie.write(para + '\n\n')
    }
    outFlie.end()
}
