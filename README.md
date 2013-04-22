ghnext - GitHub next issue number finder
========================================

This tiny script checks what will be the number of the next issue you'll open on a given GitHub repo.

This might be useful if you want to put `fix #nnn` in your commit message without opening any issue beforehand -- just to open a pull request right after the `git push`. Of course this prone to a race condition if your fellow developer opens an issue in the meantime though that should rarely happen.

Dependencies
------------

NodeJS 0.8.x

Install
-------

    $ npm install -g ghnext

Usage
-----

    $ ghnext gruntjs grunt

    Next issue id for gruntjs/grunt:
    771

Options
-------

If you want to open browser on the "new pull request" page after displaying the number:

    $ ghnext gruntjs grunt --open
    $ ghnext gruntjs grunt -o

If that's still too long, you can naturally create aliases in your shell.
