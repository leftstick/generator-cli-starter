'use strict';

var generators = require('yeoman-generator');

var gen = generators.Base.extend({
    initializing: function() {

        try {
            this.username = process.env['USER'] || process.env['USERPROFILE'].split(require('path').sep)[2];
        } catch (e) {
            this.username = '';
        }
    },
    prompting: function() {
        var done = this.async();
        var self = this;

        this.prompt([{
            type: 'input',
            name: 'name',
            message: 'Your project name',
            validate: function(name) {
                if (!name) {
                    return 'Project name cannot be empty';
                }
                if (!/\w+/.test(name)) {
                    return 'Project name should only consist of 0~9, a~z, A~Z, _, .';
                }

                var fs = require('fs');
                if (!fs.existsSync(self.destinationPath(name))) {
                    return true;
                }
                if (require('fs').statSync(self.destinationPath(name)).isDirectory()) {
                    return 'Project already exist';
                }
                return true;
            }
        }, {
            type: 'input',
            name: 'command',
            message: 'Your command name',
            default: ''
        }], function(answers) {
            this.answers = answers;
            this.obj = {
                answers: this.answers
            };
            done();
        }.bind(this));
    },
    configuring: function() {
        var path = require('path');
        var fs = require('fs');
        var self = this;
        var done = this.async();
        fs.exists(this.destinationPath(this.answers.name), function(exists) {
            if (exists && fs.statSync(self.destinationPath(self.answers.name)).isDirectory()) {
                self.log.error('Directory [' + self.answers.name + '] exists');
                process.exit(1);
            }
            self.destinationRoot(path.join(self.destinationRoot(), self.answers.name));
            done();
        });
    },
    writing: function() {
        var self = this;

        self.fs.copyTpl(self.templatePath('bin/command.js'), self.destinationPath('bin/' + this.answers.command + '.js'), self.obj);
        self.fs.copyTpl(self.templatePath('package.json'), self.destinationPath('package.json'), self.obj);
    },
    install: function() {
        this.spawnCommand('npm', ['link']);
    },
    end: function() {
        this.log.ok('Project ' + this.answers.name + ' generated!!!');
    }
});

module.exports = gen;
