import { io, Socket } from 'socket.io-client';
import { Message } from '../types';

export interface ServerToClientEvents {
  new_message: (payload: { chatId: string; message: Message }) => void;
  typing_status: (payload: { chatId: string; username: string; isTyping: boolean }) => void;
  user_status: (payload: { userId: string; isOnline: boolean }) => void;
  chat_updated: (payload: { chatId: string; lastMessage: string }) => void;
}

export interface ClientToServerEvents {
  join_chat: (payload: { chatId: string; userId: string }) => void;
  leave_chat: (payload: { chatId: string; userId: string }) => void;
  send_message: (payload: { chatId: string; message: Message }) => void;
  typing: (payload: { chatId: string; username: string; isTyping: boolean }) => void;
}

class ChatSocketService {
  private socket: Socket<ServerToClientEvents, ClientToServerEvents> | null = null;
  private currentChatId: string | null = null;
  private isConnected: boolean = false;

  private getSocketServerUrl(): string {
    if (typeof window === 'undefined') return 'http://localhost:3000';

    // 1. Environment variable override if specified
    if ((import.meta as any).env?.VITE_SOCKET_URL) {
      return (import.meta as any).env.VITE_SOCKET_URL;
    }

    const hostname = window.location.hostname;
    const port = window.location.port || '3000';
    const protocol = window.location.protocol.startsWith('https') ? 'https:' : 'http:';

    // 2. Mobile App (Capacitor/Cordova) webview detection
    const isCapacitor = (window as any).Capacitor !== undefined ||
                        window.location.protocol.includes('capacitor') ||
                        window.location.protocol.includes('file');

    if (isCapacitor) {
      // Connect to your development computer's local Wi-Fi IP
      return 'http://172.16.59.15:3000';
    }

    // 3. Browser on phone or external device accessing via LAN IP
    if (hostname && hostname !== 'localhost' && hostname !== '127.0.0.1') {
      return `${protocol}//${hostname}:${port}`;
    }

    return 'http://localhost:3000';
  }

  public connect(token?: string): void {
    if (this.socket && this.isConnected) return;

    try {
      const serverUrl = this.getSocketServerUrl();
      console.log(`🔌 Connecting Socket.io to server: ${serverUrl}`);

      this.socket = io(serverUrl, {
        auth: { token },
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });

      this.socket.on('connect', () => {
        this.isConnected = true;
        console.log('⚡ Socket.io connected successfully, ID:', this.socket?.id);
      });

      this.socket.on('disconnect', (reason) => {
        this.isConnected = false;
        console.warn('Socket.io disconnected:', reason);
      });

      this.socket.on('connect_error', (err) => {
        console.warn('Socket.io connection error:', err.message);
      });
    } catch (e) {
      console.warn('Could not initialize socket.io client:', e);
    }
  }

  public getRawSocket(): Socket | null {
    if (!this.socket || !this.isConnected) {
      this.connect();
    }
    return this.socket;
  }

  public disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  public joinChat(chatId: string, userId: string): void {
    if (!this.socket) return;
    if (this.currentChatId && this.currentChatId !== chatId) {
      this.leaveChat(this.currentChatId, userId);
    }
    this.currentChatId = chatId;
    this.socket.emit('join_chat', { chatId, userId });
  }

  public leaveChat(chatId: string, userId: string): void {
    if (!this.socket) return;
    this.socket.emit('leave_chat', { chatId, userId });
    if (this.currentChatId === chatId) {
      this.currentChatId = null;
    }
  }

  public sendMessage(chatId: string, message: Message): void {
    if (!this.socket) return;
    this.socket.emit('send_message', { chatId, message });
  }

  public sendTyping(chatId: string, username: string, isTyping: boolean): void {
    if (!this.socket) return;
    this.socket.emit('typing', { chatId, username, isTyping });
  }

  public onNewMessage(callback: (payload: { chatId: string; message: Message }) => void): () => void {
    if (!this.socket) return () => {};
    this.socket.on('new_message', callback);
    return () => {
      this.socket?.off('new_message', callback);
    };
  }

  public onTypingStatus(
    callback: (payload: { chatId: string; username: string; isTyping: boolean }) => void
  ): () => void {
    if (!this.socket) return () => {};
    this.socket.on('typing_status', callback);
    return () => {
      this.socket?.off('typing_status', callback);
    };
  }

  public onUserStatus(
    callback: (payload: { userId: string; isOnline: boolean }) => void
  ): () => void {
    if (!this.socket) return () => {};
    this.socket.on('user_status', callback);
    return () => {
      this.socket?.off('user_status', callback);
    };
  }
}

export const chatService = new ChatSocketService();
