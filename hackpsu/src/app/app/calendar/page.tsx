"use client";

import * as React from "react";
import Link from "next/link";
import { PlusIcon, ArrowLeftIcon, X, CheckCircle, Bell } from "lucide-react";

// Assuming these components are available and styled with Tailwind
// They've been replaced with custom styled divs/buttons where necessary for simplicity
// but generally, we'd style the underlying Shadcn/ui components.

interface CalendarEvent {
    id: string;
    title: string;
    from: Date;
    to: Date;
    description?: string;
    reminder?: boolean;
}

// --- Styled Calendar Component for HackPSU Wellness ---
// NOTE: In a real app, you would heavily customize the Calendar component itself
// (like Shadcn's) using Tailwind classes to change the day cells, headers, etc.
// For this example, we'll focus on the container and the event list style.
function StyledCalendar({
                            selected,
                            onSelect,
                        }: {
    selected: Date | undefined;
    onSelect: (date: Date | undefined) => void;
}) {
    return (
        <div className="p-4 bg-white rounded-2xl shadow-xl shadow-slate-200 border border-slate-100">
            {/* Placeholder for a styled calendar component.
                In a real scenario, the 'Calendar' component imported from
                "@/components/ui/calendar" would be customized internally
                to use the teal/cyan colors for selected dates and today's date.
                e.g., bg-teal-500/10 for hover, bg-teal-500 for selected.
            */}
            <div className="text-center">
                <div className="text-slate-900 font-semibold mb-2">October 2025</div>
                <div className="grid grid-cols-7 gap-2 text-sm">
                    {/* Simplified Calendar Grid Mockup */}
                    {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
                        <div key={day} className="text-slate-500 font-medium">
                            {day}
                        </div>
                    ))}
                    {[...Array(31)].map((_, i) => (
                        <div
                            key={i}
                            className={`p-1.5 rounded-full cursor-pointer transition 
                                ${i + 1 === selected?.getDate() ? "bg-cyan-500 text-white font-bold shadow-md" : "text-slate-700 hover:bg-teal-50"}`}
                            onClick={() => onSelect(new Date(selected?.getFullYear() || new Date().getFullYear(), selected?.getMonth() || new Date().getMonth(), i + 1))}
                        >
                            {i + 1}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

// --- Custom Styled Button ---
const PrimaryButton = ({ onClick, children, className = "" }: { onClick: () => void, children: React.ReactNode, className?: string }) => (
    <button
        onClick={onClick}
        className={`inline-flex items-center justify-center gap-2 bg-gradient-to-r from-teal-500 to-cyan-600 text-white px-5 py-2 rounded-xl text-sm font-medium hover:from-teal-600 hover:to-cyan-700 transition shadow-md hover:shadow-cyan-500/30 ${className}`}
    >
        {children}
    </button>
);

// --- Custom Styled Input ---
const StyledInput = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(({ className, ...props }, ref) => (
    <input
        ref={ref}
        className={`w-full p-3 border border-slate-300 rounded-lg text-slate-700 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition shadow-sm ${className}`}
        {...props}
    />
));
StyledInput.displayName = 'StyledInput';

// --- Main Calendar Page Component ---
export default function Calendar31() {
    const [date, setDate] = React.useState<Date | undefined>(new Date());
    const [events, setEvents] = React.useState<CalendarEvent[]>([
        {
            id: '1',
            title: 'Morning Gratitude Journal',
            from: new Date(new Date().setHours(8, 0)),
            to: new Date(new Date().setHours(8, 15)),
            reminder: true,
        },
        {
            id: '2',
            title: '10 min Mindful Breathing',
            from: new Date(new Date().setHours(14, 30)),
            to: new Date(new Date().setHours(14, 40)),
        },
    ]);
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
        const options: Intl.DateTimeFormatOptions = { hour: "2-digit", minute: "2-digit", hour12: true };
        return `${from.toLocaleTimeString("en-US", options)} - ${to.toLocaleTimeString("en-US", options)}`;
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-start bg-slate-50 text-slate-800 p-4 sm:p-8">
            {/* Header */}
            <header className="flex w-full max-w-lg items-center justify-between mb-8 pt-4">
                <h1 className="text-3xl font-bold text-slate-900">Your Wellness Plan</h1>
                <Link
                    href="/"
                    className="inline-flex items-center gap-1 bg-white border border-slate-300 text-slate-700 px-4 py-2 rounded-xl text-sm font-medium hover:bg-slate-100 transition shadow-sm"
                >
                    <ArrowLeftIcon className="size-4" />
                    Home
                </Link>
            </header>

            {/* Calendar and Events Card */}
            <div className="w-full max-w-lg">
                <StyledCalendar selected={date} onSelect={setDate} />

                {/* Event List Section */}
                <div className="mt-6 bg-white p-6 rounded-2xl shadow-xl shadow-slate-200 border border-slate-100">
                    <div className="flex w-full items-center justify-between pb-3 border-b border-slate-100">
                        <h2 className="text-xl font-semibold text-slate-900">
                            {date?.toLocaleDateString("en-US", {
                                weekday: "short",
                                day: "numeric",
                                month: "long",
                            })}
                        </h2>
                        <PrimaryButton
                            onClick={() => setShowModal(true)}
                            className="text-sm font-semibold h-9"
                        >
                            <PlusIcon className="size-4" />
                            Add Event
                        </PrimaryButton>
                    </div>

                    <div className="flex w-full flex-col gap-3 pt-4">
                        {filteredEvents.length > 0 ? (
                            filteredEvents
                                .sort((a, b) => a.from.getTime() - b.from.getTime())
                                .map((event) => (
                                    <div
                                        key={event.id}
                                        className="relative rounded-xl p-3 pl-4 bg-teal-50 border border-teal-100 text-slate-800 shadow-sm transition hover:shadow-md"
                                    >
                                        {/* Colored Accent Bar */}
                                        <div className="absolute inset-y-0 left-0 w-1 bg-teal-500 rounded-l-xl"></div>
                                        <div className="font-semibold text-slate-900 ml-1">
                                            {event.title}
                                        </div>
                                        <div className="text-sm text-slate-600 ml-1 mt-0.5">
                                            {formatDateRange(event.from, event.to)}
                                        </div>
                                        {event.reminder && (
                                            <div className="text-xs flex items-center gap-1 text-cyan-600 ml-1 mt-1">
                                                <Bell className="size-3.5" />
                                                Reminder Set
                                            </div>
                                        )}
                                    </div>
                                ))
                        ) : (
                            <div className="text-slate-500 text-center py-4 text-base">
                                No activities scheduled. Add a session or a check-in!
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Modal - Aligned with App Style */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
                    <div className="bg-white p-6 sm:p-8 rounded-3xl w-full max-w-md shadow-2xl">
                        <div className="flex justify-between items-center mb-6 border-b border-slate-200 pb-3">
                            <h2 className="text-2xl font-bold text-slate-900">
                                Schedule Activity
                            </h2>
                            <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-700 transition">
                                <X className="size-6" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <StyledInput
                                type="text"
                                placeholder="Activity Title (e.g., Mindful Walk)"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                            />

                            <div className="flex gap-4">
                                <StyledInput
                                    type="time"
                                    value={startTime}
                                    onChange={(e) => setStartTime(e.target.value)}
                                    title="Start Time"
                                />
                                <StyledInput
                                    type="time"
                                    value={endTime}
                                    onChange={(e) => setEndTime(e.target.value)}
                                    title="End Time"
                                />
                            </div>

                            <textarea
                                placeholder="Notes / Description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="w-full p-3 border border-slate-300 rounded-lg text-slate-700 h-24 resize-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition shadow-sm"
                            />

                            <label className="flex items-center justify-between p-3 bg-slate-50 rounded-lg cursor-pointer transition hover:bg-slate-100 border border-slate-200">
                                <div className="flex items-center gap-3 text-slate-700 font-medium">
                                    <Bell className={`size-5 ${reminder ? 'text-cyan-600' : 'text-slate-400'}`} />
                                    Set a Reminder
                                </div>
                                <input
                                    type="checkbox"
                                    checked={reminder}
                                    onChange={(e) => setReminder(e.target.checked)}
                                    className="h-5 w-5 rounded text-cyan-600 border-slate-300 focus:ring-cyan-500 transition"
                                />
                            </label>
                        </div>

                        <div className="flex justify-end gap-3 mt-8">
                            <button
                                onClick={() => setShowModal(false)}
                                className="px-5 py-2 rounded-xl border border-slate-300 text-slate-700 font-medium bg-white hover:bg-slate-50 transition shadow-sm"
                            >
                                Cancel
                            </button>
                            <PrimaryButton
                                onClick={handleAddEvent}
                                className="font-semibold"
                            >
                                <CheckCircle className="size-4" />
                                Add Activity
                            </PrimaryButton>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}