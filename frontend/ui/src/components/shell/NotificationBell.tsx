import { useCallback, useEffect, useRef, useState } from 'react';
import { ActionIcon, Box, Indicator, Menu, ScrollArea, Text, UnstyledButton } from '@mantine/core';
import { IoNotificationsOutline } from 'react-icons/io5';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { usePageTransition } from '../../hooks/usePageTransition';
import { notify } from '../../shared/notify';
import {
    getNotifications,
    getUnreadNotificationCount,
    markAllNotificationsRead,
    markNotificationRead,
    type UserNotificationItem,
} from '../../shared/api/notifications.api';

const POLL_MS = 30_000;

export function NotificationBell() {
    const { navigateWithTransition } = usePageTransition();
    const queryClient = useQueryClient();
    const seenIdsRef = useRef<Set<number>>(new Set());
    const initializedRef = useRef(false);
    const [menuOpen, setMenuOpen] = useState(false);

    const { data: unreadCount = 0 } = useQuery({
        queryKey: ['notifications', 'unread-count'],
        queryFn: getUnreadNotificationCount,
        refetchInterval: POLL_MS,
    });

    const { data: notifications = [], refetch: refetchList } = useQuery({
        queryKey: ['notifications', 'list'],
        queryFn: getNotifications,
        enabled: menuOpen,
    });

    const toastNewNotifications = useCallback((items: UserNotificationItem[]) => {
        const unread = items.filter((n) => !n.readAt);
        for (const n of unread) {
            if (seenIdsRef.current.has(n.id)) continue;
            seenIdsRef.current.add(n.id);
            notify.info(n.title, n.message, { id: `notif-${n.id}` });
        }
    }, []);

    useEffect(() => {
        const poll = async () => {
            try {
                const [count, list] = await Promise.all([
                    getUnreadNotificationCount(),
                    getNotifications(),
                ]);
                queryClient.setQueryData(['notifications', 'unread-count'], count);

                if (!initializedRef.current) {
                    list.forEach((n) => seenIdsRef.current.add(n.id));
                    initializedRef.current = true;
                    return;
                }

                toastNewNotifications(list);
            } catch {
                // ignore polling errors
            }
        };

        void poll();
        const timer = setInterval(() => void poll(), POLL_MS);
        return () => clearInterval(timer);
    }, [queryClient, toastNewNotifications]);

    const handleOpen = () => {
        setMenuOpen(true);
        void refetchList();
    };

    const handleSelect = async (item: UserNotificationItem) => {
        if (!item.readAt) {
            await markNotificationRead(item.id);
            await queryClient.invalidateQueries({ queryKey: ['notifications'] });
        }
        setMenuOpen(false);
        navigateWithTransition('/friends');
    };

    const handleMarkAllRead = async () => {
        await markAllNotificationsRead();
        await queryClient.invalidateQueries({ queryKey: ['notifications'] });
    };

    return (
        <Menu opened={menuOpen} onChange={setMenuOpen} position="bottom-end" width={320} withArrow>
            <Menu.Target>
                <Indicator
                    inline
                    label={unreadCount > 99 ? '99+' : unreadCount}
                    size={16}
                    disabled={unreadCount === 0}
                    color="teal"
                    offset={4}
                >
                    <ActionIcon
                        variant="subtle"
                        size="lg"
                        aria-label="Notifications"
                        onClick={handleOpen}
                        style={{ color: 'var(--modern-text-primary)' }}
                    >
                        <IoNotificationsOutline size={22} />
                    </ActionIcon>
                </Indicator>
            </Menu.Target>
            <Menu.Dropdown>
                <Box px="sm" py="xs">
                    <Text fw={600} size="sm">
                        Notifications
                    </Text>
                </Box>
                <ScrollArea.Autosize mah={320} type="auto">
                    {notifications.length === 0 ? (
                        <Text size="sm" c="dimmed" px="sm" py="md">
                            No notifications yet
                        </Text>
                    ) : (
                        notifications.map((item) => (
                            <Menu.Item key={item.id} onClick={() => void handleSelect(item)}>
                                <UnstyledButton w="100%">
                                    <Text size="sm" fw={item.readAt ? 400 : 600}>
                                        {item.title}
                                    </Text>
                                    <Text size="xs" c="dimmed" lineClamp={2}>
                                        {item.message}
                                    </Text>
                                </UnstyledButton>
                            </Menu.Item>
                        ))
                    )}
                </ScrollArea.Autosize>
                {unreadCount > 0 && (
                    <Menu.Item onClick={() => void handleMarkAllRead()}>
                        <Text size="sm" c="teal">
                            Mark all as read
                        </Text>
                    </Menu.Item>
                )}
            </Menu.Dropdown>
        </Menu>
    );
}
