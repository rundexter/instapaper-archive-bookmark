var Instapaper = require('instapaper')
  , _          = require('lodash')
  , q          = require('q')
  , util       = require('./util.js')
;

var apiUrl = 'https://www.instapaper.com/api/1.1';

var pickOutputs = {
    'bookmark_id': 'bookmark_id',
    'title': 'title',
    'url': 'url',
    'description': 'description'
};

module.exports = {
    /**
     * The main entry point for the Dexter module
     *
     * @param {AppStep} step Accessor for the configuration for the step using this module.  Use step.input('{key}') to retrieve input data.
     * @param {AppData} dexter Container for all data used in this workflow.
     */
    run: function(step, dexter) {
        var auth        = dexter.provider('instapaper').credentials()
          , client      = Instapaper(auth.consumer_key, auth.consumer_secret, {apiUrl: apiUrl})
          , self        = this
          , bookmarkIds = step.input('bookmark_id')
          , connections = []
        ;

        if (!auth) return self.fail('No instapaper auth credentials provided');
        client.setOAuthCredentials(auth.access_token, auth.access_token_secret);

        _.each(bookmarkIds,function(bookmarkId) {
            var deferred = q.defer();
          
            client.bookmarks.archive(bookmarkId).then(function(bookmarks) {
                deferred.resolve();
            }.bind(this)).catch(function (errors) {
                deferred.reject(errors);
            });

            connections.push(deferred.promise);
        });

        q.all(connections)
           .then(this.complete.bind(this, {}))
           .fail(this.fail.bind(this))
        ;
    }
};
