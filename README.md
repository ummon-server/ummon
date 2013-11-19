# ummon [![Build Status](https://secure.travis-ci.org/punkave/ummon.png?branch=master)](http://travis-ci.org/punkave/ummon)

This package comprises a Node.js client library as well as a command line tool for communicating with the HTTP API of [ummon-server](https://github.com/punkave/ummon-server).

[![NPM](https://nodei.co/npm/ummon.png)](https://nodei.co/npm/ummon/)

# The CLI

## Installation

```
npm install -g ummon
```

## Usage

```
$ ummon --help

Commands:

   collection             Set the default settings for a particular collection
   config                 Get the server status as well as control various aspects of the server
   log                    Show recent log output. Filter logs by using --collection, --task or --run (only one!)
   pulse                  Ping server status for a queue/worker numbers
   queue                  Show or clear the queue
   status                 Get the server status as well as control various aspects of the server
   task                   Show and modify the configuration for a task
   help <sub-command>     Show the --help for a specific command

```

## Default options for every command

* `url`: The url where `ummon-server` is accepting connections
* `retries`: The number of times
* `timeout`: Time to wait
* `username`
* `password`

## The `.ummonrc` file

You can save all of the above settings in `~/.ummonrc` so you don't have to type them in every time.

`$ cat ~/.ummonrc`
```ini
defaultEnv=development # The default environment. Recuded the need to type --env development

[development] # As of now, environments are the only sections
url=http://localhost:8888
username=superusername
password=science

[production]
url=http://111.111.111.111:8080
username=nameOfUser
password=superTopSecretPassword
```

Warning! Obviously, if you include your password in this file, it will be saved in clear text. Use appropriate caution.

# The Client Library

See generated docs at http://punkave.github.io/ummon/.
