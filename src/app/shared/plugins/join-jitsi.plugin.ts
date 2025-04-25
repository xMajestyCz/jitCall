import { Capacitor } from '@capacitor/core';
import { v4 as uuidv4 } from 'uuid';

declare global {
    interface PluginRegistry {
        JoinJitsi: {
            joinMeeting(options: { room: string }): Promise<void>;
        };
    }
}

export class JoinJitsiPlugin {
    static async generateMeetingId(): Promise<string> {
        return uuidv4();
    }

    static async joinMeeting(meetingId: string): Promise<void> {
        if (Capacitor.getPlatform() !== 'android') {
        throw new Error('Jitsi solo está soportado en Android con este plugin.');
        }

    await (window as any).Capacitor.Plugins.JoinJitsi.joinMeeting({
        room: meetingId
        });
    }

    static buildNotificationPayload(params: {
        userId: string;
        meetingId: string;
        name: string;
        userFrom: string;
    }) {
        return {
        userId: params.userId,
        meetingId: params.meetingId,
        type: 'incoming_call',
        name: params.name,
        userFrom: params.userFrom
        };
    }
}
