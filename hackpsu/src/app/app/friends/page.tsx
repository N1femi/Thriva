"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Users, UserPlus, Search, X, Trash2 } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface Profile {
    id: string;
    name: string;
    created_at?: string;
}

export default function FriendsPage() {
    const { user, loading } = useAuth();
    const [friends, setFriends] = useState<Profile[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [searchResults, setSearchResults] = useState<Profile[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [addingFriend, setAddingFriend] = useState<string | null>(null);

    // Fetch friends
    const fetchFriends = async () => {
        try {
            if (!user) return;

            const { data: { session }, error: sessionError } = await supabase.auth.getSession();
            
            if (sessionError || !session) {
                console.error('Session error:', sessionError);
                return;
            }
            
            const accessToken = session?.access_token;
            
            if (!accessToken) {
                console.error('No access token available');
                return;
            }

            const response = await fetch('/api/friends', {
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    setFriends(data.data);
                }
            }
        } catch (error) {
            console.error('Error fetching friends:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchFriends();
    }, [user]);

    // Search for users
    const searchUsers = async () => {
        if (!searchTerm.trim()) {
            setSearchResults([]);
            setIsSearching(false);
            return;
        }

        setIsSearching(true);
        try {
            // Get session token
            const { data: { session } } = await supabase.auth.getSession();
            
            if (!session) return;

            // For now, since profiles table might be empty, we'll just show a message
            // In a real implementation, you'd want to fetch from auth.users or have profiles populated
            // For demonstration, we'll create placeholder users
            const { data: profiles, error } = await supabase
                .from("profiles")
                .select("*")
                .ilike("name", `%${searchTerm}%`);

            if (error) {
                console.error('Search error:', error);
                // Don't throw, just show no results
                setSearchResults([]);
                return;
            }

            // Filter out current user and existing friends
            const friendIds = friends.map(f => f.id);
            const filteredProfiles = profiles?.filter(
                profile => profile.id !== user?.id && !friendIds.includes(profile.id)
            ) || [];

            setSearchResults(filteredProfiles.slice(0, 10));
        } catch (error) {
            console.error('Error searching users:', error);
            // Don't show error toast, just set empty results
            setSearchResults([]);
        } finally {
            setIsSearching(false);
        }
    };

    useEffect(() => {
        const delayTimer = setTimeout(() => {
            searchUsers();
        }, 300);

        return () => clearTimeout(delayTimer);
    }, [searchTerm]);

    // Add friend
    const addFriend = async (friendId: string) => {
        setAddingFriend(friendId);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            
            if (!session) {
                toast.error("Please log in to add friends");
                return;
            }

            const response = await fetch('/api/friends', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.access_token}`
                },
                body: JSON.stringify({ friendId })
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    toast.success("Friend added successfully!");
                    await fetchFriends();
                    setSearchTerm("");
                    setSearchResults([]);
                } else {
                    toast.error(data.error || "Failed to add friend");
                }
            } else {
                toast.error("Failed to add friend");
            }
        } catch (error) {
            console.error('Error adding friend:', error);
            toast.error("Failed to add friend");
        } finally {
            setAddingFriend(null);
        }
    };

    // Remove friend
    const removeFriend = async (friendId: string) => {
        if (!confirm("Are you sure you want to remove this friend?")) {
            return;
        }

        try {
            const { data: { session } } = await supabase.auth.getSession();
            
            if (!session) {
                toast.error("Please log in to remove friends");
                return;
            }

            const response = await fetch(`/api/friends?friendId=${friendId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${session.access_token}`
                }
            });

            if (response.ok) {
                toast.success("Friend removed successfully!");
                await fetchFriends();
            } else {
                toast.error("Failed to remove friend");
            }
        } catch (error) {
            console.error('Error removing friend:', error);
            toast.error("Failed to remove friend");
        }
    };

    if (loading || isLoading) {
        return (
            <div className="h-screen bg-gradient-to-br from-teal-50 to-cyan-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mx-auto mb-4"></div>
                    <p className="text-slate-600">Loading your friends...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-teal-50 to-cyan-50">
            <div className="max-w-7xl mx-auto px-6 py-12 pb-24">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-4 mb-4">
                        <Link href="/app/home">
                            <Button variant="ghost" size="sm">
                                ← Back
                            </Button>
                        </Link>
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-gradient-to-br from-teal-100 to-cyan-100 rounded-2xl">
                                <Users className="w-8 h-8 text-teal-600" />
                            </div>
                            <div>
                                <h1 className="text-4xl font-bold text-slate-900">Your Friends</h1>
                                <p className="text-slate-500">Connect with others on your wellness journey</p>
                            </div>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                        <div className="bg-white rounded-2xl p-4 shadow-sm">
                            <div className="text-sm text-slate-500 mb-1">Total Friends</div>
                            <div className="text-3xl font-bold text-slate-900">{friends.length}</div>
                        </div>
                    </div>
                </div>

                {/* Search Bar */}
                <div className="mb-8">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                        <Input
                            type="text"
                            placeholder="Search for users to add as friends..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-12 pr-4 py-3 bg-white rounded-2xl border-slate-200 focus:border-teal-300"
                        />
                        {searchTerm && (
                            <button
                                onClick={() => {
                                    setSearchTerm("");
                                    setSearchResults([]);
                                }}
                                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        )}
                    </div>

                    {/* Search Results */}
                    {searchTerm && (
                        <div className="mt-4 bg-white rounded-2xl shadow-lg overflow-hidden border border-slate-200">
                            {isSearching ? (
                                <div className="p-8 text-center text-slate-500">
                                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-teal-600 mx-auto mb-2"></div>
                                    Searching...
                                </div>
                            ) : searchResults.length > 0 ? (
                                <div className="divide-y divide-slate-100">
                                    {searchResults.map((profile) => (
                                        <motion.div
                                            key={profile.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="p-4 flex items-center justify-between hover:bg-slate-50 transition"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-gradient-to-br from-teal-100 to-cyan-100 rounded-full flex items-center justify-center">
                                                    <Users className="w-5 h-5 text-teal-600" />
                                                </div>
                                                <div>
                                                    <div className="font-semibold text-slate-900">{profile.name}</div>
                                                    <div className="text-sm text-slate-500">User</div>
                                                </div>
                                            </div>
                                            <Button
                                                size="sm"
                                                onClick={() => addFriend(profile.id)}
                                                disabled={addingFriend === profile.id}
                                                className="bg-teal-600 hover:bg-teal-700"
                                            >
                                                {addingFriend === profile.id ? (
                                                    <>
                                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                                        Adding...
                                                    </>
                                                ) : (
                                                    <>
                                                        <UserPlus className="w-4 h-4 mr-2" />
                                                        Add Friend
                                                    </>
                                                )}
                                            </Button>
                                        </motion.div>
                                    ))}
                                </div>
                            ) : !isSearching && (
                                <div className="p-8 text-center text-slate-500">
                                    {searchTerm ? `No users found matching "${searchTerm}"` : "Start typing to search for users"}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Friends List */}
                <div>
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-gradient-to-br from-teal-100 to-cyan-100 rounded-xl">
                            <Users className="w-6 h-6 text-teal-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900">Your Friends</h2>
                        <div className="flex-1 h-px bg-gradient-to-r from-teal-200 to-transparent"></div>
                    </div>

                    {friends.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {friends.map((friend, index) => (
                                <motion.div
                                    key={friend.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.3, delay: index * 0.1 }}
                                    className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 hover:border-teal-300 transition-all"
                                >
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="w-12 h-12 bg-gradient-to-br from-teal-100 to-cyan-100 rounded-full flex items-center justify-center">
                                            <Users className="w-6 h-6 text-teal-600" />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-bold text-lg text-slate-900">{friend.name}</h3>
                                            <p className="text-sm text-slate-500">Friend</p>
                                        </div>
                                    </div>
                                    <Button
                                        variant="destructive"
                                        size="sm"
                                        onClick={() => removeFriend(friend.id)}
                                        className="w-full"
                                    >
                                        <Trash2 className="w-4 h-4 mr-2" />
                                        Remove Friend
                                    </Button>
                                </motion.div>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-white rounded-2xl p-12 text-center">
                            <Users className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                            <h3 className="text-xl font-semibold text-slate-900 mb-2">No friends yet</h3>
                            <p className="text-slate-500 mb-6">Start by searching for users above to add friends!</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

