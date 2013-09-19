# ummon
## Javascript API Client & Command Line Tool

[![NPM version](https://badge.fury.io/js/ummon.png)](http://badge.fury.io/js/ummon) [![Build Status](https://secure.travis-ci.org/punkave/ummon.png?branch=master)](http://travis-ci.org/punkave/ummon) [![Dependency Status](https://gemnasium.com/punkave/ummon.png)](https://gemnasium.com/punkave/ummon)

The command line interface to the [ummon server](https://github.com/punkave/ummon-server). Since `ummon-server` only communicates over an HTTP API, you can install this module on any computer and as long as you have the url and a user and pass you can interact with it.

# The Command Line Client

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

Warning! Obviously if you save your password, it will be saved in clear text. Use appropriate caution

# [Ummon Javascript Client](http://punkave.github.io/ummon/)