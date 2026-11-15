import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { getSocketUrl } from '../api.js';

const EVENTS = ['connected', 'order:new', 'order:updated', 'inventory:low'];

export const useRealtime = (token, handlers = {}) => {
    const handlersRef = useRef(handlers);

    useEffect(() => {
        handlersRef.current = handlers;
    }, [handlers]);

    useEffect(() => {
        if (!token) {
            return undefined;
        }

        const socket = io(getSocketUrl(), {
            auth: { token },
            transports: ['websocket', 'polling']
        });

        const listeners = EVENTS.map((event) => {
            const listener = (payload) => {
                const handler = handlersRef.current?.[event];
                if (handler) {
                    handler(payload);
                }
            };
            socket.on(event, listener);
            return [event, listener];
        });

        return () => {
            listeners.forEach(([event, listener]) => socket.off(event, listener));
            socket.disconnect();
        };
    }, [token]);
};
