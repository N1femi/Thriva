"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
    Bell,
    Users,
    BookOpen,
    Award,
    Calendar,
    CheckCircle2,
    Trash2,
    CheckCheck,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

interface Notification {
    id: string;
    user_id: string;
    type: string;
    title: string;
    message: string;
    read: boolean;
    metadata?: Record<string, any>;
    created_at: string;
    updated_at: string;
}

const getIcon = (type: string) => {
    switch (type) {
        case "friend_request":
        case "friend_added":
            return Users;
        case "journal_entry":
            return BookOpen;
        case "badge_earned":
            return Award;
        case "calendar_event":
            return Calendar;
        default:
            return Bell;
    }
};

const getIconColor = (type: string) => {
    switch (type) {
        case "friend_request":
        case "friend_added":
            return "bg-blue-100 text-blue-600";
        case "journal_entry":
            return "bg-purple-100 text-purple-600";
        case "badge_earned":
            return "bg-yellow-100 text-yellow-600";
        case "calendar_event":
            return "bg-green-100 text-green-600";
        default:
            return "bg-slate-100 text-slate-600";
    }
};

export default function NotificationsPage() {
    const { user, loading } = useAuth();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedFilter, setSelectedFilter] = useState<"all" | "unread">("all");

    const fetchNotifications = async () => {
        try {
            if (!user) return;

            const { data: { session: freshSession }, error: sessionError } = await supabase.auth.getSession();
            
            if (sessionError || !freshSession) {
                console.error('Session error:', sessionError);
                setNotifications([]);
                return;
            }
            
            const accessToken = freshSession?.access_token;
            
            if (!accessToken) {
                console.error('No access token available');
                setNotifications([]);
                return;
            }

            const response = await fetch('/api/notifications', {
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    setNotifications(data.data);
                }
            }
        } catch (error) {
            console.error('Error fetching notifications:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
        
        // Set up real-time subscription
        const channel = supabase
            .channel('notifications')
            .on('postgres_changes', 
                { event: '*', schema: 'public', table: 'notifications' },
                (payload) => {
                    if (user && payload.new && 'user_id' in payload.new && payload.new.user_id === user.id) {
                        fetchNotifications();
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [user]);

    const handleMarkAsRead = async (id: string) => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;

            const response = await fetch('/api/notifications', {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${session.access_token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ id, read: true })
            });

            if (response.ok) {
                setNotifications(notifications.map((n: Notification) => n.id === id ? { ...n, read: true } : n));
                toast.success("Notification marked as read");
            }
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;

            const response = await fetch('/api/notifications', {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${session.access_token}`,
                }
            });

            if (response.ok) {
                setNotifications(notifications.map((n: Notification) => ({ ...n, read: true })));
                toast.success("All notifications marked as read");
            }
        } catch (error) {
            console.error('Error marking all as read:', error);
        }
    };

    const handleDelete = async (id: string) => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;

            const response = await fetch(`/api/notifications?id=${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${session.access_token}`,
                }
            });

            if (response.ok) {
                setNotifications(notifications.filter(n => n.id !== id));
                toast.success("Notification deleted");
            }
        } catch (error) {
            console.error('Error deleting notification:', error);
        }
    };

    const filteredNotifications = selectedFilter === "unread" 
        ? notifications.filter(n => !n.read)
        : notifications;

    const unreadCount = notifications.filter(n => !n.read).length;

    if (loading || isLoading) {
        return (
            <div className="h-screen bg-gradient-to-br from-teal-50 to-cyan-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mx-auto mb-4"></div>
                    <p className="text-slate-600">Loading notifications...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-teal-50 to-cyan-50">
            <div className="max-w-7xl mx-auto px-6 py-12 pb-24">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl">
                                <Bell className="w-8 h-8 text-purple-600" />
                            </div>
                            <div>
                                <h1 className="text-4xl font-bold text-slate-900">Notifications</h1>
                                <p className="text-slate-500">Stay updated with your activity</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleMarkAllAsRead}
                                disabled={unreadCount === 0}
                            >
                                <CheckCheck className="w-4 h-4 mr-2" />
                                Mark all read
                            </Button>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-4 mt-6">
                        <div className="bg-white rounded-2xl p-4 shadow-sm">
                            <div className="text-sm text-slate-500 mb-1">Total</div>
                            <div className="text-3xl font-bold text-slate-900">{notifications.length}</div>
                        </div>
                        <div className="bg-white rounded-2xl p-4 shadow-sm">
                            <div className="text-sm text-slate-500 mb-1">Unread</div>
                            <div className="text-3xl font-bold text-purple-600">{unreadCount}</div>
                        </div>
                        <div className="bg-white rounded-2xl p-4 shadow-sm">
                            <div className="text-sm text-slate-500 mb-1">Read</div>
                            <div className="text-3xl font-bold text-slate-600">{notifications.length - unreadCount}</div>
                        </div>
                    </div>
                </div>

                {/* Filter Tabs */}
                <div className="flex gap-2 mb-6">
                    <Button
                        variant={selectedFilter === "all" ? "default" : "outline"}
                        onClick={() => setSelectedFilter("all")}
                    >
                        All
                    </Button>
                    <Button
                        variant={selectedFilter === "unread" ? "default" : "outline"}
                        onClick={() => setSelectedFilter("unread")}
                    >
                        Unread ({unreadCount})
                    </Button>
                </div>

                {/* Notifications List */}
                {filteredNotifications.length === 0 ? (
                    <div className="bg-white rounded-2xl p-12 text-center shadow-sm">
                        <Bell className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-slate-900 mb-2">No notifications</h3>
                        <p className="text-slate-500">
                            {selectedFilter === "unread" 
                                ? "You're all caught up!" 
                                : "You don't have any notifications yet"}
                        </p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {filteredNotifications.map((notification, index) => {
                            const Icon = getIcon(notification.type);
                            const iconColor = getIconColor(notification.type);
                            
                            return (
                                <motion.div
                                    key={notification.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.3, delay: index * 0.05 }}
                                    className={`bg-white rounded-2xl p-6 shadow-sm border-l-4 ${
                                        notification.read 
                                            ? 'border-slate-200' 
                                            : 'border-purple-500'
                                    } hover:shadow-md transition-all`}
                                >
                                    <div className="flex items-start gap-4">
                                        <div className={`p-3 ${iconColor} rounded-xl`}>
                                            <Icon className="w-6 h-6" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <h3 className={`font-semibold mb-1 ${
                                                        notification.read ? 'text-slate-700' : 'text-slate-900'
                                                    }`}>
                                                        {notification.title}
                                                    </h3>
                                                    <p className="text-sm text-slate-600 mb-2">
                                                        {notification.message}
                                                    </p>
                                                    <p className="text-xs text-slate-400">
                                                        {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                                                    </p>
                                                </div>
                                                {!notification.read && (
                                                    <span className="w-3 h-3 bg-purple-500 rounded-full"></span>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-2 mt-3">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleMarkAsRead(notification.id)}
                                                    className="text-xs"
                                                >
                                                    <CheckCircle2 className="w-3 h-3 mr-1" />
                                                    Mark read
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleDelete(notification.id)}
                                                    className="text-xs text-red-600 hover:text-red-700"
                                                >
                                                    <Trash2 className="w-3 h-3 mr-1" />
                                                    Delete
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
