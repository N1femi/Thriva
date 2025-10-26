"use client";

import React, { useState, useEffect } from "react";
import { Eye, Type, Zap, Palette, Check } from "lucide-react";

interface AccessibilitySettings {
    protanopia: number;
    deuteranopia: number;
    tritanopia: number;
    fontSize: number;
    reduceMotion: boolean;
    highContrast: boolean;
    websiteTheme: "teal" | "purple" | "blue" | "rose" | "green" | "orange";
}

const themes = {
    teal: { name: "Teal", color: "bg-teal-500", light: "bg-teal-50", text: "text-teal-600", border: "border-teal-500" },
    purple: { name: "Purple", color: "bg-purple-500", light: "bg-purple-50", text: "text-purple-600", border: "border-purple-500" },
    blue: { name: "Blue", color: "bg-blue-500", light: "bg-blue-50", text: "text-blue-600", border: "border-blue-500" },
    rose: { name: "Rose", color: "bg-rose-500", light: "bg-rose-50", text: "text-rose-600", border: "border-rose-500" },
    green: { name: "Green", color: "bg-green-500", light: "bg-green-50", text: "text-green-600", border: "border-green-500" },
    orange: { name: "Orange", color: "bg-orange-500", light: "bg-orange-50", text: "text-orange-600", border: "border-orange-500" },
};

export default function SettingsPage() {
    const [settings, setSettings] = useState<AccessibilitySettings>({
        protanopia: 0,
        deuteranopia: 0,
        tritanopia: 0,
        fontSize: 16,
        reduceMotion: false,
        highContrast: false,
        websiteTheme: "teal",
    });

    useEffect(() => {
        const saved = localStorage.getItem("accessibility-settings");
        if (saved) {
            try {
                setSettings(JSON.parse(saved));
            } catch (e) {
                console.error("Failed to load settings:", e);
            }
        }
    }, []);

    useEffect(() => {
        const root = document.documentElement;

        let filters = [];
        if (settings.protanopia > 0) {
            filters.push(`url(#protanopia-${Math.round(settings.protanopia / 25) * 25})`);
        }
        if (settings.deuteranopia > 0) {
            filters.push(`url(#deuteranopia-${Math.round(settings.deuteranopia / 25) * 25})`);
        }
        if (settings.tritanopia > 0) {
            filters.push(`url(#tritanopia-${Math.round(settings.tritanopia / 25) * 25})`);
        }

        root.style.filter = filters.length > 0 ? filters.join(" ") : "none";
        root.style.setProperty("--base-font-size", `${settings.fontSize}px`);

        if (settings.reduceMotion) {
            root.style.setProperty("--animation-duration", "0.01ms");
        } else {
            root.style.setProperty("--animation-duration", "200ms");
        }

        root.setAttribute("data-theme", settings.websiteTheme);
        localStorage.setItem("accessibility-settings", JSON.stringify(settings));
    }, [settings]);

    const updateSetting = <K extends keyof AccessibilitySettings>(
        key: K,
        value: AccessibilitySettings[K]
    ) => {
        setSettings((prev) => ({ ...prev, [key]: value }));
    };

    const theme = themes[settings.websiteTheme];

    return (
        <>
            {/* SVG Filters - Hidden but necessary for color blindness adjustments */}
            <svg style={{ position: 'absolute', width: 0, height: 0 }} aria-hidden="true">
                <defs>
                    {/* Protanopia Filters */}
                    <filter id="protanopia-0"><feColorMatrix type="matrix" values="1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 1 0"/></filter>
                    <filter id="protanopia-25"><feColorMatrix type="matrix" values="0.817 0.183 0 0 0 0.333 0.667 0 0 0 0.000 0.125 0.875 0 0 0 0 0 1 0"/></filter>
                    <filter id="protanopia-50"><feColorMatrix type="matrix" values="0.567 0.433 0 0 0 0.558 0.442 0 0 0 0.000 0.242 0.758 0 0 0 0 0 1 0"/></filter>
                    <filter id="protanopia-75"><feColorMatrix type="matrix" values="0.367 0.633 0 0 0 0.734 0.266 0 0 0 0.000 0.367 0.633 0 0 0 0 0 1 0"/></filter>
                    <filter id="protanopia-100"><feColorMatrix type="matrix" values="0.152 0.848 0 0 0 0.114 0.886 0 0 0 0.000 0.000 1.000 0 0 0 0 0 1 0"/></filter>
                    
                    {/* Deuteranopia Filters */}
                    <filter id="deuteranopia-0"><feColorMatrix type="matrix" values="1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 1 0"/></filter>
                    <filter id="deuteranopia-25"><feColorMatrix type="matrix" values="0.800 0.200 0 0 0 0.258 0.742 0 0 0 0.000 0.142 0.858 0 0 0 0 0 1 0"/></filter>
                    <filter id="deuteranopia-50"><feColorMatrix type="matrix" values="0.625 0.375 0 0 0 0.700 0.300 0 0 0 0.000 0.300 0.700 0 0 0 0 0 1 0"/></filter>
                    <filter id="deuteranopia-75"><feColorMatrix type="matrix" values="0.425 0.575 0 0 0 0.858 0.142 0 0 0 0.000 0.450 0.550 0 0 0 0 0 1 0"/></filter>
                    <filter id="deuteranopia-100"><feColorMatrix type="matrix" values="0.292 0.708 0 0 0 0.958 0.042 0 0 0 0.000 0.617 0.383 0 0 0 0 0 1 0"/></filter>
                    
                    {/* Tritanopia Filters */}
                    <filter id="tritanopia-0"><feColorMatrix type="matrix" values="1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 1 0"/></filter>
                    <filter id="tritanopia-25"><feColorMatrix type="matrix" values="0.967 0.033 0 0 0 0 0.733 0.267 0 0 0 0.183 0.817 0 0 0 0 0 1 0"/></filter>
                    <filter id="tritanopia-50"><feColorMatrix type="matrix" values="0.950 0.050 0 0 0 0 0.433 0.567 0 0 0 0.475 0.525 0 0 0 0 0 1 0"/></filter>
                    <filter id="tritanopia-75"><feColorMatrix type="matrix" values="0.933 0.067 0 0 0 0 0.267 0.733 0 0 0 0.692 0.308 0 0 0 0 0 1 0"/></filter>
                    <filter id="tritanopia-100"><feColorMatrix type="matrix" values="0.917 0.083 0 0 0 0 0.125 0.875 0 0 0 0.875 0.125 0 0 0 0 0 1 0"/></filter>
                </defs>
            </svg>

            <div className="max-w-4xl mx-auto p-6 space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-2xl font-semibold text-slate-900">Settings</h1>
                    <p className="text-sm text-slate-500 mt-1">Customize your experience</p>
                </div>

                {/* Theme */}
                <section className="bg-white rounded-2xl shadow-sm p-6 space-y-4">
                    <div className="flex items-center gap-3">
                        <Palette className={`w-5 h-5 ${theme.text}`} />
                        <h2 className="text-lg font-medium text-slate-900">Theme</h2>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                        {(Object.keys(themes) as Array<keyof typeof themes>).map((t) => (
                            <button
                                key={t}
                                onClick={() => updateSetting("websiteTheme", t)}
                                className={`relative p-4 rounded-xl border-2 transition-all ${
                                    settings.websiteTheme === t
                                        ? `${themes[t].border} ${themes[t].light}`
                                        : "border-slate-200 hover:border-slate-300"
                                }`}
                            >
                                {settings.websiteTheme === t && (
                                    <Check className={`absolute top-2 right-2 w-4 h-4 ${themes[t].text}`} />
                                )}
                                <div className={`w-12 h-12 rounded-lg ${themes[t].color} mx-auto mb-2`}></div>
                                <p className="text-xs text-slate-700">{themes[t].name}</p>
                            </button>
                        ))}
                    </div>
                </section>

                {/* Color Vision */}
                <section className="bg-white rounded-2xl shadow-sm p-6 space-y-5">
                    <div className="flex items-center gap-3">
                        <Eye className={`w-5 h-5 ${theme.text}`} />
                        <h2 className="text-lg font-medium text-slate-900">Color Vision</h2>
                    </div>

                    {/* Protanopia */}
                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <label htmlFor="protanopia" className="text-sm text-slate-700">
                                Protanopia
                            </label>
                            <span className={`text-sm font-medium ${theme.text}`}>{settings.protanopia}%</span>
                        </div>
                        <input
                            id="protanopia"
                            type="range"
                            min="0"
                            max="100"
                            value={settings.protanopia}
                            onChange={(e) => updateSetting("protanopia", Number(e.target.value))}
                            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                        />
                    </div>

                    {/* Deuteranopia */}
                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <label htmlFor="deuteranopia" className="text-sm text-slate-700">
                                Deuteranopia
                            </label>
                            <span className={`text-sm font-medium ${theme.text}`}>{settings.deuteranopia}%</span>
                        </div>
                        <input
                            id="deuteranopia"
                            type="range"
                            min="0"
                            max="100"
                            value={settings.deuteranopia}
                            onChange={(e) => updateSetting("deuteranopia", Number(e.target.value))}
                            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                        />
                    </div>

                    {/* Tritanopia */}
                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <label htmlFor="tritanopia" className="text-sm text-slate-700">
                                Tritanopia
                            </label>
                            <span className={`text-sm font-medium ${theme.text}`}>{settings.tritanopia}%</span>
                        </div>
                        <input
                            id="tritanopia"
                            type="range"
                            min="0"
                            max="100"
                            value={settings.tritanopia}
                            onChange={(e) => updateSetting("tritanopia", Number(e.target.value))}
                            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                        />
                    </div>

                    {/* Preview */}
                    <div className="flex gap-2 pt-2">
                        {[
                            { name: "Red", color: "bg-red-500" },
                            { name: "Green", color: "bg-green-500" },
                            { name: "Blue", color: "bg-blue-500" },
                            { name: "Yellow", color: "bg-yellow-400" },
                            { name: "Purple", color: "bg-purple-500" },
                            { name: "Orange", color: "bg-orange-500" },
                        ].map((c) => (
                            <div key={c.name} className="flex-1">
                                <div className={`h-10 ${c.color} rounded-lg`} title={c.name}></div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Text & Display */}
                <section className="bg-white rounded-2xl shadow-sm p-6 space-y-4">
                    <div className="flex items-center gap-3">
                        <Type className={`w-5 h-5 ${theme.text}`} />
                        <h2 className="text-lg font-medium text-slate-900">Display</h2>
                    </div>

                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <label htmlFor="font-size" className="text-sm text-slate-700">
                                Font Size
                            </label>
                            <span className={`text-sm font-medium ${theme.text}`}>{settings.fontSize}px</span>
                        </div>
                        <input
                            id="font-size"
                            type="range"
                            min="12"
                            max="24"
                            value={settings.fontSize}
                            onChange={(e) => updateSetting("fontSize", Number(e.target.value))}
                            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                        />
                        <p className="text-slate-500 text-xs pt-2" style={{ fontSize: `${settings.fontSize}px` }}>
                            Preview text
                        </p>
                    </div>
                </section>

                {/* Motion & Effects */}
                <section className="bg-white rounded-2xl shadow-sm p-6 space-y-4">
                    <div className="flex items-center gap-3">
                        <Zap className={`w-5 h-5 ${theme.text}`} />
                        <h2 className="text-lg font-medium text-slate-900">Effects</h2>
                    </div>

                    <div className="flex justify-between items-center">
                        <div>
                            <label htmlFor="reduce-motion" className="text-sm text-slate-700 cursor-pointer">
                                Reduce Motion
                            </label>
                            <p className="text-xs text-slate-500 mt-0.5">Minimize animations</p>
                        </div>
                        <button
                            id="reduce-motion"
                            role="switch"
                            aria-checked={settings.reduceMotion}
                            onClick={() => updateSetting("reduceMotion", !settings.reduceMotion)}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                settings.reduceMotion ? theme.color : "bg-slate-300"
                            }`}
                        >
                            <span
                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                    settings.reduceMotion ? "translate-x-6" : "translate-x-1"
                                }`}
                            />
                        </button>
                    </div>

                    <div className="flex justify-between items-center pt-2">
                        <div>
                            <label htmlFor="high-contrast" className="text-sm text-slate-700 cursor-pointer">
                                High Contrast
                            </label>
                            <p className="text-xs text-slate-500 mt-0.5">Increase visibility</p>
                        </div>
                        <button
                            id="high-contrast"
                            role="switch"
                            aria-checked={settings.highContrast}
                            onClick={() => updateSetting("highContrast", !settings.highContrast)}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                settings.highContrast ? theme.color : "bg-slate-300"
                            }`}
                        >
                            <span
                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                    settings.highContrast ? "translate-x-6" : "translate-x-1"
                                }`}
                            />
                        </button>
                    </div>
                </section>

                {/* Reset */}
                <div className="flex justify-end">
                    <button
                        onClick={() => {
                            setSettings({
                                protanopia: 0,
                                deuteranopia: 0,
                                tritanopia: 0,
                                fontSize: 16,
                                reduceMotion: false,
                                highContrast: false,
                                websiteTheme: "teal",
                            });
                        }}
                        className="px-5 py-2 text-sm bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors">
                        Reset to Defaults
                    </button>
                </div>
            </div>
        </>
    );
}