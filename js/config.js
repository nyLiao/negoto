'use strict'
const Store = require('electron-store')

module.exports = new Store({
	// defaults: {
	// 	serverStarted: false,
	// 	progress: -1,
	// },
	// watch: true
	serverStarted: {
		type: 'boolean',
		default: false
	},
	genProgress: {
		type: 'number',
		default: 0
	},
	watch: true
})
