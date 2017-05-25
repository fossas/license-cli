# License CLI

A CLI for running license and compliance scans across your dependencies, powered by http://fossa.io for your termainal or CI.

[![asciicast](https://asciinema.org/a/9uqxkbggyo7z3nmam51ramzmp.png)](https://asciinema.org/a/9uqxkbggyo7z3nmam51ramzmp?t=0:06)

## Installation

  1. Run `npm install -g license-cli` (requires nodejs and npm on your machine) 
	2. **Get an API key from FOSSA** - Register an account at [http://fossa.io](http://fossa.io) if you have not already and then navigate to **Account Settings > Integrations > API Tokens > Create Token**

## Usage

```

  Usage: fossa-cli [options] [command]


  Commands:

    scan   output FOSSA license scan status for a given project or revision

  Options:

    -h, --help             output usage information
    -V, --version          output the version number
    -p, --project <id>     (required) project id or locator to query
    -r, --revision [id]    (optional) revision id to query; defaults to latest
    -b, --branch [branch]  (optional) branch to default to if no revision is specified
    -t, --token [token]    (optional) api token for accessing private projects
    -o, --timeout [ms]     (optional) timeout for waiting on build status; defaults to 30m
    -e, --endpoint [url]   (optional) custom fossa instance url

```

## Working with CI

`license-cli` was made to work great with CI systems.  The `scan` command writes scan summaries to `stderr` and `stdout` and uses common exit codes, so you can rely on the output to work out of the box with CI tasks.

If you a popular CI provider, the FOSSA team already has some pre-written for tasks and plugins:

 - [TravisCI - https://github.com/fossas/fossa-travisci-plugin](https://github.com/fossas/fossa-travisci-plugin)
 - [CircleCI - https://github.com/fossas/fossa-circleci-plugin](https://github.com/fossas/fossa-circleci-plugin)
 - [Jenkins - https://github.com/fossas/fossa-jenkins-plugin](https://github.com/fossas/fossa-jenkins-plugin)