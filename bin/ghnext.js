#!/usr/bin/env node
/*
 *
 *  The MIT License (MIT)
 *
 *  Copyright (c) 2013 Jakub Gieryluk <jakub.g.opensource@gmail.com>
 *
 *  Permission is hereby granted, free of charge, to any person obtaining a copy
 *  of this software and associated documentation files (the "Software"), to deal
 *  in the Software without restriction, including without limitation the rights
 *  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 *  copies of the Software, and to permit persons to whom the Software is
 *  furnished to do so, subject to the following conditions:
 *
 *  The above copyright notice and this permission notice shall be included in
 *  all copies or substantial portions of the Software.
 *
 *  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 *  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 *  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 *  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 *  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 *  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 *  THE SOFTWARE.
 *
 */

/*
 *  ghnext: GitHub next issue number finder
 *
 *  This is a simple command line utility that checks what will be the ID of the next
 *  issue / pull request that you'll open. It can be used e.g. if you want to create
 *  a pull request without opening an issue before, and embed "fix #nnn " in the commit message
 *  without the need to alter your commit and push --force.
 *
 *  Uses GitHub API v3: http://developer.github.com/v3/issues/
 *  Compatible with NodeJS 0.8.23.
 */

var https = require('https');

var openBrowser;
switch(process.argv.length){
    case 5:
        openBrowser = (process.argv[4] == '--open' || process.argv[4] == "-o");
        break;
    case 4:
        openBrowser = false; // process.env.npm_package_config_openBrowser only works via npm start...;
        break;
    default:
        console.error("Usage: ghnext <orgname> <reponame> [--open | -o]");
        process.exit();
}

var org = process.argv[2];
var repo = process.argv[3];

var basePath = 'https://api.github.com/repos/'+org+'/'+repo+'/issues?sort=created&direction=desc';
var path1 = basePath + '&state=closed';
var path2 = basePath + '&state=open';

var nbCompleted = 0;
var ids = [];

var callbackFactory = function () {
    return function (res) {
        var buffer = [];
        res.setEncoding('utf8');

        res.on('data', function (chunk) {
            buffer.push(chunk);
        });
        res.on('end', function () {
            var finalResponseJson = JSON.parse(buffer.join(''));
            var id = finalResponseJson[0].number; // get the number of first (newest) issue
            ids.push(id);
            nbCompleted++;

            if(nbCompleted === 2) {
                // voila, return max(a,b)+1
                var maxId = Math.max(ids[0], ids[1]);
                var nextId = maxId + 1;
                console.log('Next issue id for ' + org + '/' + repo + ':\r\n' + nextId);
            }
        });
    }
};

// Obtain the newest open and newest closed issue.
https.get(path1, callbackFactory());
https.get(path2, callbackFactory());

// Opening the browser before the callbacks are finished, because invoking a new page
// from command line takes a few seconds.
if(openBrowser) {
    var open = require('open');
    console.log('Opening new pull request page in browser...');
    open('https://github.com/'+org+'/'+repo+'/pull/new', function (err) {
        if(err){
            console.log(err);
        }
    });
}
