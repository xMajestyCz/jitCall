export interface Message {
    id?: string;
    senderId: string;
    text: string;
    senderImage?: string;
    createdAt?: any;
    status?: 'sent' | 'delivered' | 'read';
    content: string; 
    type: 'text' | 'audio' | 'image' | 'video' | 'file' | 'location';
    duration?: number; 
}