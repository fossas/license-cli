var Promise = require('bluebird')
var child_process = require('child_process')
var fs = require('fs')
var path = require('path')
var os = require('os')

var AUTH_TOKEN_PATH = path.resolve(os.homedir(), '.fossa_cli_token')

var CTX = module.exports = {
  getProjectGit: function (workdir) {
  	try {
  		var git_url = 'git+' + child_process.execSync('git config --get remote.origin.url 2>/dev/null', {
	    	cwd: workdir
	    }).toString().trim()
	    if (git_url.slice(-4) === '.git') git_url = git_url.slice(0, -4)
	    return git_url
	  } catch (e) {
	  	return undefined
	  }
  },
  getProject: function (workdir) {
  	return CTX.getProjectGit(workdir)
  },
  getRevisionGit: function (workdir) {
  	try {
  		return child_process.execSync('git rev-parse HEAD 2>/dev/null', { cwd: workdir }).toString().trim()
  	} catch (e) {
  		return undefined
  	}
  },
  getRevision: function (workdir) {
  	return CTX.getRevisionGit(workdir)
  },
  getAuth: function () {
  	try {
	  	return fs.readFileSync(AUTH_TOKEN_PATH).toString().trim()
	  } catch (err) {
	  	return undefined
	  }
  },
  setAuth: function (token) {
    try {
      fs.writeFileSync(AUTH_TOKEN_PATH, token)
      console.log('Config written')
    } catch (err) {
      console.error('Unable to write token config: ' + err.message)
    }
  }
}
