// configure
BlazeLayout.setRoot("body");

FlowRouter.notFound = {
  action: function() {
    BlazeLayout.render("layout_main", {
      header: "layout_header",
      main: "layout_notFound"
    });
  }
};

// redirect on start to dahsboard on file protocol
if (location.origin === "file://") {
  FlowRouter.wait();
  FlowRouter.initialize({ hashbang: true });

  Meteor.startup(function() {
    FlowRouter.go("dashboard");
  });
}

FlowRouter.triggers.enter([
  function() {
    EthElements.Modal.hide();
    $(window).scrollTop(0);
  }
]);

// ROUTES

/**
The receive route, showing the wallet overview

@method dashboard
*/
FlowRouter.route("/", {
  name: "dashboard",
  action: function(params, queryParams) {
    BlazeLayout.render("layout_main", {
      header: "layout_header",
      main: "views_dashboard"
    });
  }
});

/**
The send route.

@method send
*/
FlowRouter.route("/send", {
  name: "send",
  action: function(params, queryParams) {
    BlazeLayout.render("layout_main", {
      header: "layout_header",
      main: "views_send"
    });
  }
});

/**
The send newaccount.

@method tokens
*/
FlowRouter.route("/send/newaccount", {
  name: "newaccount",
  action: function(params, queryParams) {
    BlazeLayout.render("layout_main", {
      header: "layout_header",
      main: "views_send"
    });
  }
});

/**
The send route.

@method send
*/
FlowRouter.route("/send/:address", {
  name: "sendTo",
  action: function(params, queryParams) {
    BlazeLayout.render("layout_main", {
      header: "layout_header",
      main: "views_send"
    });
  }
});

/**
The send route.

@method send
*/
FlowRouter.route("/send-from/", {
  name: "sendFrom",
  action: function(params, queryParams) {
    BlazeLayout.render("layout_main", {
      header: "layout_header",
      main: "views_send"
    });
  }
});

/**
The send route.

@method send
*/
FlowRouter.route("/send-from/:from", {
  name: "sendFrom",
  action: function(params, queryParams) {
    BlazeLayout.render("layout_main", {
      header: "layout_header",
      main: "views_send"
    });
  }
});

/**
The create account route.

@method send
*/
FlowRouter.route("/account/new", {
  name: "createAccount",
  action: function(params, queryParams) {
    BlazeLayout.render("layout_main", {
      header: "layout_header",
      main: "views_account_create"
    });
  }
});

/**
The account route.

@method send
*/
FlowRouter.route("/account/:name", {
  name: "account",
  action: function(params, queryParams) {
    BlazeLayout.render("layout_main", {
      header: "layout_header",
      main: "views_account"
    });
  }
});

/**
The settings route.

@method send
*/
FlowRouter.route("/settings", {
  name: "settings",
  action: function(params, queryParams) {
    BlazeLayout.render("layout_main", {
      header: "layout_header",
      main: "views_settings"
    });
  }
});
