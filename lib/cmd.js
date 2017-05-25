var Promise = require('bluebird')
var request = require('request-promise')
var url = require('url')
var colors = require('colors')
var _ = require('underscore')
var ora = require('ora')
var moment = require('moment')

var PING_WAIT_TIME = 1000 * 10 // 15 second ping wait time

function makeRequest (request_opts, cmd_opts) {
  request_opts = _.defaults(request_opts, getRequestOptions(cmd_opts))
  return request(request_opts).then(function (body) {
    return JSON.parse(body)
  }).catch(function (err) {
    throw new Error('server error: ' + err.message)
  })
}

function getLocator (options) {
  return Promise.resolve().then(function getRevision () {
    var project_url = url.resolve(options.endpoint, '/api/projects/' + encodeURIComponent(options.project))
    if (!options.revision) {
      // query server for latest revision
      return makeRequest({
        url: project_url
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

function queueBuild (locator, options, indicator) {
  indicator.start()
  indicator.text = 'Queuing build in FOSSA...'

  return makeRequest({
    url: url.resolve(options.endpoint, '/api/revisions/' + encodeURIComponent(locator) + '/build'),
    method: 'PUT'
  }, options)
  .then(function handleBuild (build) {
    return Promise.resolve().then(function () {
      if (!build || !build.id) throw new Error('Unable to read build')
      switch (build.status) {
        case 'FAILED':
          throw new Error('FOSSA failed to analyze build #' + build.id + ' <' + build.error + '>. Go to FOSSA or contact support to fix.')
        case 'SUCCEEDED':
          indicator.info('Build #' + build.id + ' succeeded '.green + moment(build.finished).fromNow().bold)
          return
        default:
          indicator.text = 'Waiting for FOSSA to analyze build#' + build.id + '...'
          return Promise.delay(PING_WAIT_TIME)
            .then(function () {
              return makeRequest({
                url: url.resolve(options.endpoint, '/api/builds/' + encodeURIComponent(build.id))
              }, options)
            })
            .then(handleBuild)
      }
    })
  })
}

function queueScan (locator, options, indicator) {
  indicator.text = 'Waiting for scan data...'
  return makeRequest({
    url: url.resolve(options.endpoint, '/api/revisions/' + encodeURIComponent(locator))
  }, options).then(function (scan_data) {
    if (!scan_data.meta || !scan_data.meta.length || !scan_data.meta[0].last_scan) {
      return Promise.delay(PING_WAIT_TIME).then(function () {
        return queueScan(locator, options, indicator)
      })
    }
    indicator.info('Issue scan completed ' + moment(scan_data.meta[0].last_scan).fromNow().bold)
    indicator.start()
    indicator.text = 'Fetching report...'
    return makeRequest({
      // issue endpoint for only unresolved w/ metadata
      url: url.resolve(options.endpoint, '/api/revisions/' + encodeURIComponent(locator) + '/issues')
    }, options)
  })
}

function renderScanResults (issues, indicator) {
  if (issues.length === 0) return indicator.succeed('No license issues found from your FOSSA scan')
  console.log(('\n * FOSSA discovered ' + issues.length.toString().bold + ' license issue(s) in your dependencies').bgRed.white)
  var issue_groups = _.groupBy(issues, function (i) { return i.type })
  _.mapObject(issue_groups, function (issue_list, issue_group) {
    console.log((issue_group.toUpperCase().bold + ' (' + issue_list.length + ')').red.underline)
    _.each(issue_list.slice(0, 10), function (issue) {
      console.log(' * ' + issue.revisionId)
    })
    if (issue_list.length > 10) { console.log('...more hidden') }
  })
  throw new Error('FOSSA license scan failed: ' + issues.length + ' issue(s) found - go to FOSSA to resolve.')
}

var CMD = module.exports = {
  scan: function () {
    var options = this
    var indicator = ora('Loading revision from FOSSA...').start()
    return getLocator(options).then(function (locator) {
      indicator.info('View project in browser at: '.bold + url.resolve(options.endpoint, '/projects/' + encodeURIComponent(options.project)).underline.blue)
      indicator.info('Selecting revision ID <' + locator.italic + '>')
      indicator.start()
      return queueBuild(locator, options, indicator).timeout(options.timeout)
        .then(function () {
          indicator.start()
          return queueScan(locator, options, indicator).timeout(options.timeout)
            .then(function (issues) {
              indicator.stop()
              return renderScanResults(issues, indicator)
            })
        })
    }).then(function () {
      process.exit(0)
    }, function (err) {
      if (!options.token) indicator.warn(colors.bold('warning:') + ' no API token specified; private projects are expected to error'.italic)
      indicator.fail(err.message.red)
      process.exit(1)
    })
  }
}
