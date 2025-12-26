import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export function connectSocket(token: string): Socket {
    if (socket?.connected) {
        return socket;
    }

    socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001', {
        auth: {
            token,
        },
        transports: ['websocket', 'polling'],
    });

    return socket;
}

export function disconnectSocket() {
    if (socket) {
        socket.disconnect();
        socket = null;
    }
}

export function getSocket(): Socket | null {
    return socket;
}



