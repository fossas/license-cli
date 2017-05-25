var Promise = require('bluebird')
var child_process = require('child_process')
var fs = require('fs')
var path = require('path')

var CTX = module.exports = {
  getProjectGit: function (workdir) {
  	try {
	    return 'git+' + child_process.execSync('git config --get remote.origin.url', {
	    	cwd: workdir
	    }).toString().trim()
	  } catch (e) {
	  	return undefined
	  }
  },
  getProject: function (workdir) {
  	return CTX.getProjectGit(workdir)
  },
  getRevisionGit: function (workdir) {
  	try {
  		return child_process.execSync('git rev-parse HEAD', { cwd: workdir }).toString().trim()
  	} catch (e) {
  		return undefined
  	}
  },
  getRevision: function (workdir) {
  	return CTX.getRevisionGit(workdir)
  },
  getAuth: function () {
  	try {
	  	return fs.readFileSync(path.resolve(__dirname, '../.token')).toString().trim()
	  } catch (err) {
	  	return undefined
	  }
  }
}
