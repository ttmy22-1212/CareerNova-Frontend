"use client";

import { NotificationApi, NotificationResponse } from "@/api/forum/notification";
import useFunction, {
    DEFAULT_FUNCTION_RETURN,
    UseFunctionReturnType,
} from "@/hooks/use-function";
import { createContext, useContext } from "react";

interface NotificationContextValue {
    getNotificationsApi: UseFunctionReturnType<
        {
            offset?: number;
            limit?: number;
        },
        NotificationResponse
    >;
    markAsReadApi: UseFunctionReturnType<string, void>;
    markAllAsReadApi: UseFunctionReturnType<void, void>;
}

const NotificationContext = createContext<NotificationContextValue>({
    getNotificationsApi: DEFAULT_FUNCTION_RETURN,
    markAsReadApi: DEFAULT_FUNCTION_RETURN,
    markAllAsReadApi: DEFAULT_FUNCTION_RETURN,
});

export const NotificationProvider = ({ children }: { children: React.ReactNode }) => {
    const getNotificationsApi = useFunction(NotificationApi.getNotifications, { disableResetOnCall: true });
    const markAsReadApi = useFunction(NotificationApi.markAsRead);
    const markAllAsReadApi = useFunction(NotificationApi.markAllAsRead);

    return (
        <NotificationContext.Provider
            value={{
                getNotificationsApi,
                markAsReadApi,
                markAllAsReadApi,
            }}
        >
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotificationContext = () => useContext(NotificationContext);