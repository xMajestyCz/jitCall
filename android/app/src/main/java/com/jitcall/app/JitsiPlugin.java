package com.jitcall.app;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "Jitsi")
public class JitsiPlugin extends Plugin {

    @PluginMethod
    public void startCall(PluginCall call) {
        String room = call.getString("room");
        MainActivity activity = (MainActivity) getActivity();
        activity.launchMeeting(room);
        call.resolve();
    }
}