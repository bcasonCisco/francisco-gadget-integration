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
    finesse.modules.LiveAssist = (function ($) {
        var host;
        var hostScheme;
        var hostPort;
        var consoleBaseLink = "/liveassist-finesse-console/";
        var embeddedBaseLink = "/francisco-agent/";
        var sipCallVariableName = "callVariable1";
        var laCallVariableName = "callVariable2";
        var chatCallVariableName = "callVariable3";

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
            $ ("#client-error").append ("<br>" + getTimeStamp () + " Log: " + text);
            $ ("#log-div").show ();
            gadgets.window.adjustHeight ();

            setTimeout ('$ ("#log-div").fadeOut (1000);', 2000);
            setTimeout ('gadgets.window.adjustHeight ();', 3100);
        };

        var closeWindow = function () {
            var correlationId = $ ("#correlation-id").val ();

            if (correlationId) {
                appendToHtml ("Creating session shutdown Popup Window using Correlation ID value: " + correlationId);

                var link = hostScheme + "://" + host + ":" + hostPort + consoleBaseLink + "?correlationId=" + correlationId
                        + "&endSupport=y";

                window
                        .open (
                                link,
                                correlationId,
                                "menubar=off,location=no,resizable=yes,scrollbars=yes,status=off,height=850,width=900,centerscreen=yes,toolbar=off,personalbar=off,dialog=yes,dependent=yes");
            }
            else
                appendToHtml ("No session shutdown Popup Window created -- No correlation ID");
        };

        openWindow = function () {
            var correlationId = $ ("#correlation-id").val ();

            if (correlationId) {
                appendToHtml ("Creating Popup Window using Correlation ID value: " + correlationId);
                console.log("link= " + hostScheme + "://" + host + ":" + hostPort + consoleBaseLink + "?correlationId=" + correlationId);
                var link = hostScheme + "://" + host + ":" + hostPort + consoleBaseLink + "?correlationId=" + correlationId;

                window
                        .open (
                                link,
                                "LiveAssist",
                                "menubar=off,location=no,resizable=yes,scrollbars=yes,status=off,height=850,width=900,centerscreen=yes,toolbar=off,personalbar=off,dialog=yes,dependent=yes");
            }
            else
                appendToHtml ("No Popup Window created -- No correlation ID");
        };

        openIframe = function () {
            var correlationId = $ ("#correlation-id").val ();

            if (correlationId) {
                appendToHtml ("Creating IFrame using Correlation ID value: " + correlationId);

                var link = hostScheme + "://" + host + ":" + hostPort + embeddedBaseLink + "?correlationId=" + correlationId;
                
                $ ("#iframe-div")
                        .html (
                                '<hr/><iframe src="'
                                        + link
                                        + '" width="100%" height="950px" scrollbars="no" frameborder="1"><p>Your browser does not support iframes.</p></iframe>');
            }
            else
                appendToHtml ("No IFrame created -- No correlation ID");

            gadgets.window.adjustHeight ();
        };

        closeIframe = function () {
            var correlationId = $ ("#correlation-id").val ();

            if (correlationId) {
                appendToHtml ("Closing IFrame using Correlation ID value: " + correlationId);

                var link = hostScheme + "://" + host + ":" + hostPort + embeddedBaseLink + "?correlationId=" + correlationId
                        + "&endSupport=y";

                $ ("#iframe-div")
                        .html (
                                '<hr/><iframe src="'
                                        + link
                                        + '" width="100%" height="100" frameborder="1"><p>Your browser does not support iframes.</p></iframe>');
            }
            else
                appendToHtml ("No IFrame created -- No correlation ID");

            setTimeout ('$("#iframe-div").html(""); appendToHtml ("IFrame closed"); gadgets.window.adjustHeight ();', 2000);

            gadgets.window.adjustHeight ();
        };

        var handleDialogLoad = function (dialog) {
            try {
                _dialog = dialog;

                $ ("#correlation-id").val ("");

                var length = dialog._data.mediaProperties.callvariables.CallVariable.length;

                for ( var x = 0; x < length; ++x) {
                    var name = dialog._data.mediaProperties.callvariables.CallVariable[x].name;
                    var value = dialog._data.mediaProperties.callvariables.CallVariable[x].value;

                    if (name == laCallVariableName) {
                        if (value) {
                            var correlationId = value;

                            appendToHtml ("Picked up Correlation ID as: " + correlationId);
                            $ ("#correlation-id").val (correlationId);
                            openIframe ();
                        }
                        else {
                            appendToHtml ("Found Call Variable for Correlation ID, but no value");
                        }
                    }
                    else if (name == sipCallVariableName) {
                        if (value)
                            appendToHtml ("SIP user ID: " + value);
                        else
                            appendToHtml ("No SIP user ID");
                    }
                }
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
            _dialog = undefined;

            $ ("#correlation-id").val ("");

            closeIframe ();
        };

        var handleDialogsLoaded = function (dialog) {
            appendToHtml ("Existing Dialog loaded: " + dialog._data.Dialog.id);

            $ ("#correlation-id").val ("");

            var length = dialog._data.Dialog.mediaProperties.callvariables.CallVariable.length;

            for ( var x = 0; x < length; ++x) {
                var name = dialog._data.Dialog.mediaProperties.callvariables.CallVariable[x].name;
                var value = dialog._data.Dialog.mediaProperties.callvariables.CallVariable[x].value;

                if (name == laCallVariableName) {
                    if (value) {
                        var correlationId = value;

                        appendToHtml ("Picked up Correlation ID as: " + correlationId);
                        $ ("#correlation-id").val (correlationId);
                        // openIframe ();
                    }
                    else {
                        appendToHtml ("Found Call Variable for Correlation ID, but no value");
                    }
                }
                else if (name == sipCallVariableName) {
                    if (value)
                        appendToHtml ("SIP user ID: " + value);
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
            // appendToHtml ("User loaded");

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
                console.log("In LiveAssist.js setting ip = " + host);
                hostPort = prefs.getInt ("gadgetServerPort");
                console.log("In LiveAssist.js setting PORT = " + hostPort);
                hostScheme = prefs.getString ("gadgetServerScheme");
                console.log("In LiveAssist.js setting scheme = " + hostScheme);

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
/*
 * <!-------------------------------------------------------------------------------------------------------> <!-- The following
 * needs to be invoked by the Finesse console when the call is received --> <!-- correlationId - this is the ANI from the incoming
 * call --> <!-- agentName - name of the agent to be displayed on the customer view -->
 * <!------------------------------------------------------------------------------------------------------->
 * LiveAssistAgentSDK.startSupport ( { correlationId : correlationId, agentName : agentName } );
 * 
 * <!-------------------------------------------------------------------------------------------------------> <!-- The following
 * needs to be invoked by the Finesse console when the call is ended -->
 * <!------------------------------------------------------------------------------------------------------->
 * LiveAssistAgentSDK.endSupport ();
 */
