// Renderer managing page activities
//
// by nyLiao, 2020

const events = require('events')
const fs = require('fs')
const thrift = require('thrift')

const config = require('./config');
const userService = require('./gen_nodejs/userService.js')

// Init
var eventEmitter = new events.EventEmitter()    // event manager watching textarea value
var numListItem = 0                             // number of current li
newListItem()                                   // new two init list items
newListItem()

// Establish thrift client
var thriftConnection = null
var thriftClient = null
for (var i = 0; i < document.querySelectorAll(".btn-primary").length; i++) {
    btnDisable(document.querySelectorAll(".btn-primary")[i])
}
config.onDidChange('serverStarted', async (newValue, oldValue) => {
    if (newValue) {
        thriftConnection = thrift.createConnection('127.0.0.1', 6161)
        thriftClient = thrift.createClient(userService, thriftConnection)
        thriftConnection.on("error", function(e) {
            console.log('Thrift Error:\n' + e)
        })

        for (var i = 0; i < document.querySelectorAll(".btn-primary").length; i++) {
            btnEnable(document.querySelectorAll(".btn-primary")[i])
        }
    }
})

function btnEnable(btnGen) {
    btnGen.disabled = false
    btnGen.querySelector('.icon-lamp').className = "icon icon-lamp"
}

function btnDisable(btnGen) {
    btnGen.disabled = true
    btnGen.querySelector('.icon-lamp').className = "icon icon-lamp loading"
}

// Bind list item activities
function bindListItem(num) {
    // Set up variables
    let li = document.querySelector('#li' + num)
    let textin = li.querySelector('.textin')
    let result = li.querySelector('.textout')
    let btnClr = li.querySelector('.btn-default')
    let btnGen = li.querySelector('.btn-primary')

    // Clear button
    btnClr.addEventListener('click', () => {
        textin.value = ''
        result.value = ''
        btnEnable(btnGen)
    })

    // Generate button
    btnGen.addEventListener('click', () => {
        let dic = {
            inputs: textin.value,
            length: document.querySelector('#sldLen').value,
            temp: document.querySelector('#sldTmp').value / 10,
            topk: document.querySelector('#sldTpk').value,
            topp: document.querySelector('#sldTpp').value / 10
        }
        // use JSON protocol to put all vars inside a dictionary
        dic = JSON.stringify(dic)

        // Show loading animation
        btnDisable(btnGen)

        // Get result
        result.value = ''
        thriftClient.py_gen_ph(dic, (error, res) => {
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
        btnEnable(btnGen)
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
    var outPath = './outputs/output.txt'
    var outFlie = fs.createWriteStream(outPath, {encoding:'utf8'})
    for (var i = 0; i < document.querySelectorAll(".textout").length; i++) {
        para = document.querySelectorAll(".textout")[i].value
        outFlie.write(para + '\n\n')
    }
    outFlie.end()
    child_process.exec("open " + outPath, (err, sto) => {
        console.log(sto)
    })
}

// Function of refreshing slider value
function sld2val(sldId, valId, handleFunc) {
    let sld = document.querySelector(sldId)
    for (var i = 0; i < document.querySelectorAll(valId).length; i++) {
        handleFunc(document.querySelectorAll(valId)[i], sld.value)
    }
    sld.oninput = () => {
        for (var i = 0; i < document.querySelectorAll(valId).length; i++) {
            handleFunc(document.querySelectorAll(valId)[i], sld.value)
        }
    }
}
// Toolbar parameters adjustment
sld2val("#sldLen", "#valLen", (val, value) => {
    val.innerHTML = value
})
sld2val("#sldTmp", "#valTmp", (val, value) => {
    val.innerHTML = value / 10
})
sld2val("#sldTpk", "#valTpk", (val, value) => {
    val.innerHTML = value
})
sld2val("#sldTpp", "#valTpp", (val, value) => {
    val.innerHTML = value / 10
})
