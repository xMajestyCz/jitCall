package com.jitcall.app;

import android.os.Bundle;
import org.jitsi.meet.sdk.JitsiMeet;
import org.jitsi.meet.sdk.JitsiMeetActivity;
import org.jitsi.meet.sdk.JitsiMeetConferenceOptions;
import com.getcapacitor.BridgeActivity;

import java.net.MalformedURLException;
import java.net.URL;

public class MainActivity extends BridgeActivity {

  public void launchMeeting(String meetingId) {
    try {
      URL serverURL = new URL("https://jitsi1.geeksec.de/");
      JitsiMeetConferenceOptions options = new JitsiMeetConferenceOptions.Builder()
        .setServerURL(serverURL)
        .setRoom(meetingId)
        .setAudioMuted(false)
        .setVideoMuted(false)
        .setFeatureFlag("welcomepage.enabled", false)
        .build();
      JitsiMeetActivity.launch(this, options);
    } catch (Exception e) {
      e.printStackTrace();
    }
  }

  @Override
  protected void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);
    try {
      URL serverURL = new URL("https://jitsi1.geeksec.de/");
      JitsiMeetConferenceOptions defaultOptions
        = new JitsiMeetConferenceOptions.Builder()
        .setServerURL(serverURL)
        .setFeatureFlag("welcomepage.enabled", false)
        .build();
      JitsiMeet.setDefaultConferenceOptions(defaultOptions);
    } catch (MalformedURLException e) {
      e.printStackTrace();
    }
  }
}
