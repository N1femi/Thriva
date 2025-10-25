"use client";

import * as React from "react";
import { PlusIcon, ArrowLeftIcon } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardFooter } from "@/components/ui/card";

interface CalendarEvent {
    id: string;
    title: string;
    from: Date;
    to: Date;
    description?: string;
    reminder?: boolean;
}

export default function Calendar31() {
    const router = useRouter();

    const [date, setDate] = React.useState<Date | undefined>(new Date(2025, 5, 12));
    const [events, setEvents] = React.useState<CalendarEvent[]>([]);
    const [showModal, setShowModal] = React.useState(false);

    // Form state
    const [title, setTitle] = React.useState("");
    const [startTime, setStartTime] = React.useState("09:00");
    const [endTime, setEndTime] = React.useState("10:00");
    const [description, setDescription] = React.useState("");
    const [reminder, setReminder] = React.useState(false);

    const handleAddEvent = () => {
        if (!title || !date) return;

        const [startHour, startMinute] = startTime.split(":").map(Number);
        const [endHour, endMinute] = endTime.split(":").map(Number);

        const from = new Date(date);
        from.setHours(startHour, startMinute);

        const to = new Date(date);
        to.setHours(endHour, endMinute);

        const newEvent: CalendarEvent = {
            id: `${Date.now()}`,
            title,
            from,
            to,
            description,
            reminder,
        };

        setEvents([...events, newEvent]);
        setShowModal(false);

        // Reset form
        setTitle("");
        setStartTime("09:00");
        setEndTime("10:00");
        setDescription("");
        setReminder(false);
    };

    const filteredEvents = events.filter(
        (event) => date && event.from.toDateString() === date.toDateString()
    );

    const formatDateRange = (from: Date, to: Date) => {
        const options: Intl.DateTimeFormatOptions = { hour: "2-digit", minute: "2-digit" };
        return `${from.toLocaleTimeString([], options)} - ${to.toLocaleTimeString([], options)}`;
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-start bg-slate-100 p-4">
            {/* Header */}
            <div className="flex w-full max-w-md items-center justify-between mb-4">
                <h1 className="text-2xl font-bold">My Calendar</h1>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push("/")} // navigates to HomePage
                    className="flex items-center gap-1"
                >
                    <ArrowLeftIcon className="size-4" />
                    Home
                </Button>
            </div>

            {/* Calendar Card */}
            <Card className="w-full max-w-md py-4">
                <CardContent className="px-4 flex justify-center">
                    <Calendar
                        mode="single"
                        selected={date}
                        onSelect={setDate}
                        className="bg-transparent p-0"
                        required
                    />
                </CardContent>

                <CardFooter className="flex flex-col items-start gap-3 border-t px-4 !pt-4">
                    <div className="flex w-full items-center justify-between px-1">
                        <div className="text-sm font-medium">
                            {date?.toLocaleDateString("en-US", {
                                day: "numeric",
                                month: "long",
                                year: "numeric",
                            })}
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="size-6"
                            title="Add Event"
                            onClick={() => setShowModal(true)}
                        >
                            <PlusIcon />
                            <span className="sr-only">Add Event</span>
                        </Button>
                    </div>

                    <div className="flex w-full flex-col gap-2">
                        {filteredEvents.length > 0 ? (
                            filteredEvents.map((event) => (
                                <div
                                    key={event.id}
                                    className="bg-muted after:bg-primary/70 relative rounded-md p-2 pl-6 text-sm after:absolute after:inset-y-2 after:left-2 after:w-1 after:rounded-full"
                                >
                                    <div className="font-medium">{event.title}</div>
                                    <div className="text-muted-foreground text-xs">
                                        {formatDateRange(event.from, event.to)}
                                    </div>
                                    {event.description && <div className="text-xs">{event.description}</div>}
                                    {event.reminder && <div className="text-xs text-red-500">Reminder set</div>}
                                </div>
                            ))
                        ) : (
                            <div className="text-muted-foreground text-sm">No events for this day</div>
                        )}
                    </div>
                </CardFooter>
            </Card>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="bg-white p-6 rounded-md w-full max-w-md shadow-lg">
                        <h2 className="text-xl font-semibold mb-4">
                            Add Event for {date?.toLocaleDateString()}
                        </h2>

                        <input
                            type="text"
                            placeholder="Title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full mb-2 p-2 border rounded"
                        />
                        <div className="flex gap-2 mb-2">
                            <input
                                type="time"
                                value={startTime}
                                onChange={(e) => setStartTime(e.target.value)}
                                className="w-1/2 p-2 border rounded"
                            />
                            <input
                                type="time"
                                value={endTime}
                                onChange={(e) => setEndTime(e.target.value)}
                                className="w-1/2 p-2 border rounded"
                            />
                        </div>
                        <textarea
                            placeholder="Description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full mb-2 p-2 border rounded"
                        />
                        <label className="flex items-center gap-2 mb-4">
                            <input
                                type="checkbox"
                                checked={reminder}
                                onChange={(e) => setReminder(e.target.checked)}
                            />
                            Set Reminder
                        </label>

                        <div className="flex justify-end gap-2">
                            <Button onClick={() => setShowModal(false)} className="px-4 py-2 rounded border">
                                Cancel
                            </Button>
                            <Button
                                onClick={handleAddEvent}
                                className="px-4 py-2 rounded bg-blue-500 text-white hover:bg-blue-600"
                            >
                                Add Event
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
