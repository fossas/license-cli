# License CLI

[![FOSSA Status](https://app.fossa.io/api/projects/git%2Bhttps%3A%2F%2Fgithub.com%2Ffossas%2Flicense-cli.svg?type=shield)](https://app.fossa.io/projects/git%2Bhttps%3A%2F%2Fgithub.com%2Ffossas%2Flicense-cli?ref=badge_shield)

A CLI for running license and compliance scans across your dependencies, powered by http://fossa.io for your termainal or CI.

[![asciicast](https://asciinema.org/a/93epidq1a644e7e19dmb7vyo8.png)](https://asciinema.org/a/93epidq1a644e7e19dmb7vyo8)

## Installation

  Run `npm install -g license-cli` (requires nodejs and npm on your machine) 

## Usage

### Authenticating

If you want to run `license-cli` on priviate projects, you require a FOSSA account and API token.  To get one, register an account at [http://fossa.io](http://fossa.io) and then navigate to **Account Settings > Integrations > API Tokens > Create Token**. 

Then, run `license-cli auth <token>` to .  This will write to a config file at `~/.fossa_cli_token`.

### Scanning

To trigger or lookup scan results for a given project/revision, you can run just cd into a git directory and run `license-cli scan` and wait.  This will automatically tell FOSSA to build, scan and fetch the results of whatever current branch/revision you're on -- provided git is installed on your system.

If you don't have access to your code / git or are working in a unique environment, you can still trigger the same behavior by specifying the `--project` and optionally a `--revision`/`--branch` flag.  Use the options below to customize your behavior.

```
  Usage: license-cli scan [options]

  output FOSSA license scan status for a given project or revision

  Options:

    -h, --help             output usage information
    -p, --project [id]     project id or locator to query, defaults to git details of cwd
    -r, --revision [id]    revision id to query; defaults to git details of cwd then latest
    -b, --branch [branch]  branch to default to if no revision is specified
    -t, --token [token]    api token for accessing private projects
    -o, --timeout [ms]     timeout for waiting on build status; defaults to 30m
    -e, --endpoint [url]   custom fossa instance url

```

Note - license-cli is a client for data from [https://app.fossa.io] and will not work unless FOSSA is already aware of the repository.

## Working with CI

`license-cli` was made to work great with CI systems.  The `scan` command writes scan summaries to `stderr` and `stdout` and uses common exit codes, so you can rely on the output to work out of the box with CI tasks.

If you use a popular CI provider, the FOSSA team already has some pre-written for tasks and plugins:

 - [TravisCI - https://github.com/fossas/fossa-travisci-plugin](https://github.com/fossas/fossa-travisci-plugin)
 - [CircleCI - https://github.com/fossas/fossa-circleci-plugin](https://github.com/fossas/fossa-circleci-plugin)
 - [Jenkins - https://github.com/fossas/fossa-jenkins-plugin](https://github.com/fossas/fossa-jenkins-plugin)

## License 

This project is licensed under the MIT License and runs regular scans/reports using [FOSSA](http://fossa.io).

[![FOSSA Status](https://app.fossa.io/api/projects/git%2Bhttps%3A%2F%2Fgithub.com%2Ffossas%2Flicense-cli.svg?type=large)](https://app.fossa.io/projects/git%2Bhttps%3A%2F%2Fgithub.com%2Ffossas%2Flicense-cli?ref=badge_large)