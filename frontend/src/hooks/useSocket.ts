import { useEffect, useRef, useCallback } from "react";
import { io, Socket } from "socket.io-client";
import { useAuthStore } from "../store/authStore";

type SocketListener = (data: unknown) => void;

export function useSocket(namespace: string = "alerts") {
  const socketRef = useRef<Socket | null>(null);
  const listenersRef = useRef<Map<string, Set<SocketListener>>>(new Map());
  const userId = useAuthStore((state) => state.user?.id);
  const token = useAuthStore((state) => state.token);

  useEffect(() => {
    if (!token || !userId) {
      socketRef.current?.disconnect();
      socketRef.current = null;
      return;
    }

    const socket = io(`/${namespace}`, {
      auth: { token },
      query: { userId },
      transports: ["websocket"],
    });

    for (const [event, callbacks] of listenersRef.current.entries()) {
      callbacks.forEach((callback) => {
        socket.on(event, callback);
      });
    }

    socketRef.current = socket;
    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [namespace, token, userId]);

  const emit = useCallback((event: string, data: unknown) => {
    socketRef.current?.emit(event, data);
  }, []);

  const on = useCallback(
    (event: string, callback: SocketListener): (() => void) => {
      const eventListeners = listenersRef.current.get(event) ?? new Set<SocketListener>();
      eventListeners.add(callback);
      listenersRef.current.set(event, eventListeners);
      socketRef.current?.on(event, callback);

      return () => {
        const currentListeners = listenersRef.current.get(event);
        currentListeners?.delete(callback);
        if (currentListeners && currentListeners.size === 0) {
          listenersRef.current.delete(event);
        }
        socketRef.current?.off(event, callback);
      };
    },
    []
  );

  return { emit, on };
}
