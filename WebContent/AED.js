if (!finesse) {
    console.error ("Finesse library is not available");
    alert ("Finesse library is not available");
}
else {
    var finesse = finesse || {};
    finesse.gadget = finesse.gadget || {};
    finesse.container = finesse.container || {};

    /** @namespace */
    // Configuration for the gadget
    finesse.gadget.Config = (function () {
        var _prefs = new gadgets.Prefs ();

        /** @scope finesse.gadget.Config */

        return {
            authorization : _prefs.getString ("authorization"),
            host : _prefs.getString ("host"),
            restHost : "localhost"
        };
    } ());

    /** @namespace */
    finesse.modules = finesse.modules || {};
    finesse.modules.AED = (function ($) {
        var host;
        var hostScheme;
        var hostPort;
        var URL = "/clicktochat-finesse-console/";
        var sipCallVariableName = "callVariable1";
        var laCallVariableName = "callVariable2";
        var chatCallVariableName = "callVariable3";
        var sipId = null;
        var _user = null;
        var _agentId = null;
        var _firstName = null;
        var _lastName = null;
        var _window = null;

        clearHtml = function () {
            $ ("#client-error").html ("");
            gadgets.window.adjustHeight ();
        };

        var padTwoDigits = function (num) {
            return (num < 10) ? '0' + num : num;
        };

        /**
         * Gets a timestamp.
         * 
         * @returns {String} is a timestamp in the following format: HH:MM:SS
         */
        var getTimeStamp = function () {
            var date = new Date ();
            var timeStr = padTwoDigits (date.getHours ()) + ":" + padTwoDigits (date.getMinutes ()) + ":"
                    + padTwoDigits (date.getSeconds ());

            return timeStr;
        };

        appendToHtml = function (text) {
            $ ("#client-error").append ("<br>" + getTimeStamp () + "  Log: " + text);
            $ ("#log-div").show ();
            gadgets.window.adjustHeight ();

            setTimeout ('$ ("#log-div").fadeOut (1000);', 2000);
            setTimeout ('gadgets.window.adjustHeight ();', 3100);
        }

        var closeWindow = function () {
            _window.close ();

            _window = null;

            $ ("#topic-id").val ("");
        };

        openWindow = function () {
            var topicId = $ ("#topic-id").val ();

            var link;
            console.log("hostport: " + hostPort);

            if (topicId) {
                appendToHtml ("Creating Popup Window using Topic ID value: " + topicId);
                link = hostScheme + "://" + host + ":" + hostPort + URL + "?topicId=" + topicId + "&agentId=" + _agentId + "&custId="
                        + sipId + "&firstName=" + _firstName + "&lastName=" + _lastName;
            }
            else {
                appendToHtml ("Creating Popup Window using no Topic ID");
                link = hostScheme + "://" + host + ":" + hostPort + URL + "?agentId=" + _agentId + "&custId=" + sipId + "&firstName="
                        + _firstName + "&lastName=" + _lastName;
            }

            _window = window
                    .open (
                            link,
                            "Chat",
                            "menubar=off,location=no,resizable=yes,scrollbars=no,status=off,height=305,width=470,centerscreen=yes,toolbar=off,personalbar=off,dialog=yes,dependent=yes");
        };

        openIframe = function () {
            var topicId = $ ("#topic-id").val ();

            if (topicId) {
                appendToHtml ("Creating IFrame using Topic ID value: " + topicId);

                var link = hostScheme + "://" + host + ":" + hostPort + URL + "?topicId=" + topicId + "&agentId=" + _agentId + "&custId="
                        + sipId + "&firstName=" + _firstName + "&lastName=" + _lastName;

                $ ("#iframe-div")
                        .html (
                                '<hr/><iframe src="'
                                        + link
                                        + '" width="100%" height="305" frameborder="1"><p>Your browser does not support iframes.</p></iframe>');
            }
            else
                appendToHtml ("No IFrame created -- No topic ID");

            gadgets.window.adjustHeight ();
        };

        closeIframe = function () {
            $ ("#iframe-div").html ("");

            gadgets.window.adjustHeight ();
        };

        //var holdCall = function (dialog) {
          //  dialog.requestAction (_user.getExtension (), finesse.restservices.Dialog.Actions.HOLD);
        //}

        var handleDialogLoad = function (dialog) {
            try {
                sipId = null;

                $ ("#topic-id").val ("");

                var length = dialog._data.mediaProperties.callvariables.CallVariable.length;

                for ( var x = 0; x < length; ++x) {
                    var name = dialog._data.mediaProperties.callvariables.CallVariable[x].name;
                    var value = dialog._data.mediaProperties.callvariables.CallVariable[x].value;

                    if (name == chatCallVariableName) {
                        if (value) {
                            var topicId = value;

                            appendToHtml ("Picked up Topic ID as: " + topicId);
                            $ ("#topic-id").val (topicId);
                            openWindow ();
                        }
                        else {
                            appendToHtml ("Found Call Variable for Topic ID, but no value");
                        }
                    }
                    else if (name == sipCallVariableName) {
                        if (value) {
                            sipId = value;
                            appendToHtml ("SIP user ID: " + sipId);
                        }
                        else
                            appendToHtml ("No SIP user ID");
                    }
                }

                //if (!sipId)
                   // holdCall (dialog);
            }
            catch (ex) {
                appendToHtml ("Exception: " + ex);
            }
        };

        var handleDialogChange = function (dialog) {
            // var id = dialog.getId ();

            // appendToHtml ("handleDialogChange(): " + id);
        };

        var handleDialogDelete = function (dialog) {
            // var id = dialog.getId ();

            // appendToHtml ("handleDialogDelete(): " + id);
        };

        var handleDialogError = function (rsp) {
            appendToHtml ("handleDialogError(): " + rsp);
        };

        var handleNewDialog = function (dialog) {
            try {
                // appendToHtml ("New dialog loaded");

                dialog.addHandler ("load", handleDialogLoad);
                dialog.addHandler ("change", handleDialogChange);
                dialog.addHandler ("delete", handleDialogDelete);
                dialog.addHandler ("error", handleDialogError);
            }
            catch (ex) {
                appendToHtml ("Exception: " + ex);
            }
        };

        var handleErrorDialog = function (err) {
            appendToHtml ("Error in loading new Dialog: " + err);
        };

        var handleEndDialog = function (dialog) {
            $ ("#topic-id").val ("");

            closeWindow ();
            closeIframe ();
        };

        var handleDialogsLoaded = function (dialog) {
            appendToHtml ("Existing Dialog loaded: " + dialog._data.Dialog.id);

            sipId = null;

            $ ("#topic-id").val ("");

            var length = dialog._data.Dialog.mediaProperties.callvariables.CallVariable.length;

            for ( var x = 0; x < length; ++x) {
                var name = dialog._data.Dialog.mediaProperties.callvariables.CallVariable[x].name;
                var value = dialog._data.Dialog.mediaProperties.callvariables.CallVariable[x].value;

                if (name == chatCallVariableName) {
                    if (value) {
                        var topicId = value;

                        appendToHtml ("Picked up Topic ID as: " + topicId);
                        $ ("#topic-id").val (topicId);
                        openWindow ();
                    }
                    else {
                        appendToHtml ("Found Call Variable for Topic ID, but no value");
                    }
                }
                else if (name == sipCallVariableName) {
                    if (value) {
                        sipId = value;
                        appendToHtml ("SIP user ID: " + sipId);
                    }
                    else
                        appendToHtml ("No SIP user ID");
                }
            }
        };

        var handleDialogsError = function (err) {
            appendToHtml ("Error in loading existing Dialog: " + err);
        };

        /**
         * Handler for the onLoad of a User object. This occurs when the User object is initially read from the Finesse server. Any
         * once only initialization should be done within this function.
         */
        var handleUserLoad = function (user) {
            _user = user;

            _agentId = _user.getId ();
            _firstName = _user.getFirstName ();
            _lastName = _user.getLastName ();

            appendToHtml ("Agent ID: " + _agentId);

            user.getDialogs ({
                onCollectionAdd : handleNewDialog,
                onCollectionError : handleErrorDialog,
                onCollectionDelete : handleEndDialog,
                onLoad : handleDialogsLoaded,
                onError : handleDialogsError
            });
        };

        var handleUserChange = function (user) {
            // appendToHtml ("User change state");
        };

        var handleUserError = function (err) {
            appendToHtml ("User load error");
        };

        return {

            /**
             * Performs all initialization for this gadget
             */
            init : function () {
                var prefs = new gadgets.Prefs ();
                var id = prefs.getString ("id");

                host = prefs.getString ("gadgetServerIp");
                hostPort = prefs.getInt ("gadgetServerPort");
                hostScheme = prefs.getString ("gadgetServerScheme");

                appendToHtml ("Gadget server: " + hostScheme + "://" + host + ":" + hostPort);

                finesse.clientservices.ClientServices.init (finesse.gadget.Config);

                new finesse.restservices.User ({
                    id : id,
                    onLoad : handleUserLoad,
                    onChange : handleUserChange,
                    onLoadError : handleUserError
                });

                $ ("#log-div").hide ();

                gadgets.window.adjustHeight ();

                window.onresize = function () {
                    gadgets.window.adjustHeight ();
                };

                appendToHtml ("Ready");
            }
        };
    } (jQuery));
}
