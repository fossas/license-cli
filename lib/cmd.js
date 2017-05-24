var Promise = require('bluebird')
var request = Promise.promisifyAll(require('request'))
var url = require('url')
var colors = require('colors')
var _ = require('underscore')
var ora = require('ora')

function makeRequest (request_opts, cmd_opts) {
  request_opts = _.defaults(request_opts, getRequestOptions(cmd_opts))
  return request.getAsync(request_opts).then(function (response) {
    var contents = JSON.parse(response.body)
    if (response.statusCode !== 200) throw new Error(contents.errors || contents.message || response.statusCode)
    return contents
  }).catch(function (err) {
    if (!cmd_opts.token) console.log(colors.bold('WARNING:') + ' no API token specified; these commands will error with private projects'.italic)
    throw new Error('server error: ' + err.message)
  })
}

function getLocator (options) {
  var request_headers = options.token ? {
    Authorization: 'token ' + options.token
  } : {}
  return Promise.resolve().then(function getRevision () {
    var project_url = url.resolve(options.endpoint, '/api/projects/' + encodeURIComponent(options.project))
    if (!options.revision) {
      // query server for latest revision
      return makeRequest({
        url: project_url,
        method: 'GET',
        headers: request_headers
      }, options)
      .then(function (data) {
        var selected_branch = options.branch || data.default_branch
        var selected_ref = _.find(data.references, function (ref) {
          return ref.type === 'branch' && ref.name === selected_branch
        })
        return selected_ref ? selected_ref.revision_id : data.head.locator
      })
    }
    return options.project + '$' + options.revision
  })
}

function getRequestOptions (options) {
  return {
    method: 'GET',
    headers: options.token ? {
      Authorization: 'token ' + options.token
    } : {}
  }
}

function queueFOSSABuild (locator, options, indicator) {
  indicator.text = 'Queuing build in FOSSA'
  return makeRequest({
    url: url.resolve(options.endpoint, '/api/revisions/' + encodeURIComponent(locator) + '/build'),
    method: 'PUT'
  }, options)
  .then(function (build) {
    if (!build || !build.id) throw new Error('unable to queue build')
    switch (build.status) {
      default:
        throw new Error('unable to handle build status: ' + build.status)
    }
  })
}

var CMD = module.exports = {
  issues: function () {
    var options = this.parent
    var indicator = ora('Loading revision from FOSSA...').start()
    return getLocator(options).then(function (locator) {
      console.log('\nSelected Revision: '.bold + locator.underline)
      return queueFOSSABuild(locator, options, indicator)
    }).catch(function (err) {
      console.error(err.message.red)
      // console.log(err.stack)
      process.exit(1)
    })
  },
  build: function () {
  },
  run: function () {
    console.log('running build')
  }
}
