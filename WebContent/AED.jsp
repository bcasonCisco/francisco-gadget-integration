<?xml version="1.0" encoding="UTF-8"?>
<Module>

<ModulePrefs title = "AED Chat"
        scrolling = "true"
        description = "AED Chat"
        height = "50"
        thumbnail = "http://localhost:8080/">

    <Require feature = "settitle" />
    <Require feature = "dynamic-height" />
    <Require feature = "pubsub-2" />
    <Require feature = "setprefs" />
</ModulePrefs>

<%
String hostIp = java.net.InetAddress.getLocalHost ().getHostAddress ();
//String hostIp = java.net.InetAddress.getLocalHost ().getHostName ();
String hostScheme = request.getScheme ();
int hostPort = 0;
if (hostScheme == "https"){
	hostPort = 8443;
}
else{
	
	hostPort = 8080;
	
}
%>

<UserPref
    name = "gadgetServerIp"
    datatype = "string"
    default_value = "<%= hostIp %>">
</UserPref>

<UserPref
    name = "gadgetServerPort"
    datatype = "int"
    default_value = "<%= hostPort %>">
</UserPref>

<UserPref
    name = "gadgetServerScheme"
    datatype = "string"
    default_value = "<%= hostScheme %>">
</UserPref>

<Content type="html">
<![CDATA[
    <!------------------------------------------------------------------------------------------------------->
    <!--     The following needs to be imported into the Finesse console as the HTML for the AED Widget    -->
    <!------------------------------------------------------------------------------------------------------->

    <!-- jQuery 1.5 -->
    <script type="text/javascript" src="jquery-1.5.min.js"></script>

    <!-- Cisco AJAX XMPP -->
    <script type="text/javascript" src="jabberwerx.js"></script>

    <!-- Finesse Library -->
    <script type="text/javascript" src="finesse-jkh.js"></script>

    <!-- Gadget Business Logic -->
    <script type="text/javascript" src="AED.js"></script>

    <body>
        <div id="iframe-div">
        </div>

        <div id="test-div">
            <hr/>
            <button onClick="openWindow ();">Open Window</button>
            <button onClick="openIframe ();">Open IFrame</button>
            <button onClick="closeIframe ();">Close IFrame</button>
            <label>Topic ID: </label>
            <input type="text" id="topic-id" />
        </div>

        <!--<div id="log-div"> -->
        <!--    <hr/> -->
 		<!--        <button onClick="clearHtml ();">Clear Log</button> -->
        <!--    <p>Logs:</p> -->
<pre>
<!-- <span id="client-error" style="color:red"> -->
</pre>
        </div>

    </body>

    <script type="text/javascript">
        gadgets.HubSettings.onConnect = function () {
            try {
                finesse.modules.AED.init ();
            }
            catch (ex) {
                //console.error ("Exception: " + ex.message + " " + ex.stack);
                //$("#client-error").append ("Exception: " + ex.message + " " + ex.stack);
                //gadgets.window.adjustHeight ();
            }
        };
    </script>

]]>
</Content>
</Module>
