'use strict';

function MainController($window, TweetsFactory) {
  const vm = this;
  const gapi = $window.gapi;

  //<editor-fold desc="Get and display tweets">
  vm.tweets = [];

  TweetsFactory.getTweets().then((data) => {
    vm.tweets = data;
  });

  //</editor-fold>

  //<editor-fold desc="Filter posts by completed">
  vm.viewCompleted = false;

  vm.matchesCompletedFilter = function (post) {
    return post.completedByUser ? vm.viewCompleted : !vm.viewCompleted;
  };

  //</editor-fold>

  //<editor-fold desc="Mark post completed/uncompleted">
  vm.updateCompletedStatus = function (completedStatus, post) {
    // Version that works without connecting to the database:
    //post.completedByUser = (status === 'completed');

    {
      /* jshint camelcase: false */
      TweetsFactory.updateCompletedStatus(completedStatus, post.id_str)
        .then(function () {
          post.completedByUser = (completedStatus === 'completed');
        })
        .catch(function (err) {
          console.error('Failed to update post status. Error:', err);

          // TODO: Some sort of error handling
        });
    }
  };

  //</editor-fold>

  //<editor-fold desc="Gmail authentication">
  vm.gmailLabels = [];
  vm.gmails = [];

  const clientId = '394896127572-n8cak7pmi1vghqm1oj4933pd5tb53r4u.apps.googleusercontent.com';
  const scopes = [
    'https://www.googleapis.com/auth/gmail.readonly',
    'https://www.googleapis.com/auth/gmail.compose',
  ];

  /**
   * Print all Labels in the authorized user's inbox. If no labels
   * are found an appropriate message is printed.
   */
  function listEmails() {
    var request = gapi.client.gmail.users.messages.list({
      userId: 'me',
    });

    request.execute(function (resp) {
      console.log(resp);
      if (resp.messages && resp.messages.length) {
        vm.gmails.push(...resp.messages);
      }
    });
  }

  /**
   * Load Gmail API client library. List labels once client library
   * is loaded.
   */
  function loadGmailApi() {
    gapi.client.load('gmail', 'v1', listEmails);
  }

  /**
   * Handle response from authorization server.
   *
   * @param {Object} authResult Authorization result.
   */
  function handleAuthResult(authResult) {
    /* jshint camelcase: false */
    console.log(authResult);
    if (authResult && !authResult.error) {
      loadGmailApi();
    } else {
      gapi.auth.authorize(
        {
          client_id: clientId,
          scope: scopes,
          immediate: false,
        }, handleAuthResult);
    }
  }

  vm.checkAuth = function () {
    /* jshint camelcase: false */
    gapi.auth.authorize({
      client_id: clientId,
      scope: scopes.join(' '),
      immediate: true,
    }, handleAuthResult);
  };

  //</editor-fold>
}

angular
  .module('universal-inbox.MainController', [])
  .controller('MainController', MainController);

MainController.$inject = ['$window', 'TweetsFactory'];
