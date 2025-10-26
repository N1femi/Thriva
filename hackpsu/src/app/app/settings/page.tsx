"use client";

import React, { useState, useEffect } from "react";
import { Eye, Type, Zap, Palette, Check } from "lucide-react";

interface AccessibilitySettings {
    // Color Vision Adjustments
    protanopia: number;
    deuteranopia: number;
    tritanopia: number;
    
    // Display Settings
    fontSize: number;
    reduceMotion: boolean;
    highContrast: boolean;
    
    // Theme Settings
    websiteTheme: "teal" | "purple" | "blue" | "rose" | "green" | "orange";
}

const themeColors = {
    teal: {
        name: "Ocean Teal",
        primary: "from-teal-500 to-cyan-600",
        bg: "from-teal-50 to-cyan-50",
        light: "bg-teal-50",
        accent: "bg-teal-500",
        text: "text-teal-600",
        border: "border-teal-200",
    },
    purple: {
        name: "Royal Purple",
        primary: "from-purple-500 to-violet-600",
        bg: "from-purple-50 to-violet-50",
        light: "bg-purple-50",
        accent: "bg-purple-500",
        text: "text-purple-600",
        border: "border-purple-200",
    },
    blue: {
        name: "Sky Blue",
        primary: "from-blue-500 to-indigo-600",
        bg: "from-blue-50 to-indigo-50",
        light: "bg-blue-50",
        accent: "bg-blue-500",
        text: "text-blue-600",
        border: "border-blue-200",
    },
    rose: {
        name: "Sunset Rose",
        primary: "from-rose-500 to-pink-600",
        bg: "from-rose-50 to-pink-50",
        light: "bg-rose-50",
        accent: "bg-rose-500",
        text: "text-rose-600",
        border: "border-rose-200",
    },
    green: {
        name: "Forest Green",
        primary: "from-green-500 to-emerald-600",
        bg: "from-green-50 to-emerald-50",
        light: "bg-green-50",
        accent: "bg-green-500",
        text: "text-green-600",
        border: "border-green-200",
    },
    orange: {
        name: "Warm Orange",
        primary: "from-orange-500 to-amber-600",
        bg: "from-orange-50 to-amber-50",
        light: "bg-orange-50",
        accent: "bg-orange-500",
        text: "text-orange-600",
        border: "border-orange-200",
    },
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

    // Load settings from localStorage on mount
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

    // Apply settings whenever they change
    useEffect(() => {
        applyAccessibilitySettings(settings);
    }, [settings]);

    const applyAccessibilitySettings = (settings: AccessibilitySettings) => {
        const root = document.documentElement;

        // Apply color filters
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

        // Apply theme
        root.setAttribute("data-theme", settings.websiteTheme);

        // Save to localStorage
        localStorage.setItem("accessibility-settings", JSON.stringify(settings));
    };

    const updateSetting = <K extends keyof AccessibilitySettings>(
        key: K,
        value: AccessibilitySettings[K]
    ) => {
        setSettings((prev) => ({ ...prev, [key]: value }));
    };

    const currentTheme = themeColors[settings.websiteTheme];

    return (
        <div className="max-w-5xl mx-auto p-6 space-y-6">
            {/* Header */}
            <div className="space-y-1">
                <h1 className="text-3xl font-bold text-slate-900">Settings</h1>
                <p className="text-slate-600">
                    Customize your experience and accessibility preferences
                </p>
            </div>

            {/* Theme Customization */}
            <section className="bg-white rounded-3xl shadow-sm p-8 space-y-6">
                <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${currentTheme.primary} flex items-center justify-center`}>
                        <Palette className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h2 className="text-xl font-semibold text-slate-900">
                            Website Theme
                        </h2>
                        <p className="text-sm text-slate-600">
                            Choose your preferred color scheme
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {(Object.keys(themeColors) as Array<keyof typeof themeColors>).map((theme) => (
                        <button
                            key={theme}
                            onClick={() => updateSetting("websiteTheme", theme)}
                            className={`relative p-6 rounded-2xl border-2 transition-all hover:scale-105 ${
                                settings.websiteTheme === theme
                                    ? `${themeColors[theme].border} ${themeColors[theme].light}`
                                    : "border-slate-200 bg-white hover:border-slate-300"
                            }`}
                            aria-pressed={settings.websiteTheme === theme}
                        >
                            {settings.websiteTheme === theme && (
                                <div className={`absolute top-3 right-3 w-6 h-6 rounded-full ${themeColors[theme].accent} flex items-center justify-center`}>
                                    <Check className="w-4 h-4 text-white" />
                                </div>
                            )}
                            <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${themeColors[theme].primary} mx-auto mb-3`}></div>
                            <p className={`font-semibold ${settings.websiteTheme === theme ? themeColors[theme].text : "text-slate-700"}`}>
                                {themeColors[theme].name}
                            </p>
                        </button>
                    ))}
                </div>
            </section>

            {/* Color Vision Adjustments */}
            <section className="bg-white rounded-3xl shadow-sm p-8 space-y-6">
                <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${currentTheme.primary} flex items-center justify-center`}>
                        <Eye className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h2 className="text-xl font-semibold text-slate-900">
                            Color Vision Support
                        </h2>
                        <p className="text-sm text-slate-600">
                            Adjust for different types of color vision
                        </p>
                    </div>
                </div>

                {/* Protanopia */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <div>
                            <label htmlFor="protanopia-slider" className="text-sm font-medium text-slate-900 block">
                                Protanopia (Red-Blind)
                            </label>
                            <p className="text-xs text-slate-500 mt-1">
                                Difficulty with red and green colors
                            </p>
                        </div>
                        <span className={`text-lg font-semibold ${currentTheme.text} min-w-[3rem] text-right`} aria-live="polite">
                            {settings.protanopia}%
                        </span>
                    </div>
                    <div className={`p-4 ${currentTheme.light} rounded-xl`}>
                        <input
                            id="protanopia-slider"
                            type="range"
                            min="0"
                            max="100"
                            value={settings.protanopia}
                            onChange={(e) => updateSetting("protanopia", Number(e.target.value))}
                            className={`w-full h-2 bg-white rounded-lg appearance-none cursor-pointer`}
                        />
                    </div>
                </div>

                {/* Deuteranopia */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <div>
                            <label htmlFor="deuteranopia-slider" className="text-sm font-medium text-slate-900 block">
                                Deuteranopia (Green-Blind)
                            </label>
                            <p className="text-xs text-slate-500 mt-1">
                                Difficulty with green and red colors
                            </p>
                        </div>
                        <span className={`text-lg font-semibold ${currentTheme.text} min-w-[3rem] text-right`} aria-live="polite">
                            {settings.deuteranopia}%
                        </span>
                    </div>
                    <div className={`p-4 ${currentTheme.light} rounded-xl`}>
                        <input
                            id="deuteranopia-slider"
                            type="range"
                            min="0"
                            max="100"
                            value={settings.deuteranopia}
                            onChange={(e) => updateSetting("deuteranopia", Number(e.target.value))}
                            className={`w-full h-2 bg-white rounded-lg appearance-none cursor-pointer`}
                        />
                    </div>
                </div>

                {/* Tritanopia */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <div>
                            <label htmlFor="tritanopia-slider" className="text-sm font-medium text-slate-900 block">
                                Tritanopia (Blue-Blind)
                            </label>
                            <p className="text-xs text-slate-500 mt-1">
                                Difficulty with blue and yellow colors
                            </p>
                        </div>
                        <span className={`text-lg font-semibold ${currentTheme.text} min-w-[3rem] text-right`} aria-live="polite">
                            {settings.tritanopia}%
                        </span>
                    </div>
                    <div className={`p-4 ${currentTheme.light} rounded-xl`}>
                        <input
                            id="tritanopia-slider"
                            type="range"
                            min="0"
                            max="100"
                            value={settings.tritanopia}
                            onChange={(e) => updateSetting("tritanopia", Number(e.target.value))}
                            className={`w-full h-2 bg-white rounded-lg appearance-none cursor-pointer`}
                        />
                    </div>
                </div>

                {/* Color Preview */}
                <div className={`p-6 ${currentTheme.light} rounded-2xl border ${currentTheme.border}`}>
                    <p className="text-sm font-medium text-slate-700 mb-4">Color Preview:</p>
                    <div className="grid grid-cols-6 gap-3">
                        {[
                            { name: "Red", color: "bg-red-500" },
                            { name: "Green", color: "bg-green-500" },
                            { name: "Blue", color: "bg-blue-500" },
                            { name: "Yellow", color: "bg-yellow-400" },
                            { name: "Purple", color: "bg-purple-500" },
                            { name: "Orange", color: "bg-orange-500" },
                        ].map((swatch) => (
                            <div key={swatch.name} className="text-center">
                                <div className={`w-full h-14 ${swatch.color} rounded-xl mb-2 shadow-sm`} aria-label={`${swatch.name} swatch`}></div>
                                <p className="text-xs text-slate-600">{swatch.name}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Text & Display */}
            <section className="bg-white rounded-3xl shadow-sm p-8 space-y-6">
                <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${currentTheme.primary} flex items-center justify-center`}>
                        <Type className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h2 className="text-xl font-semibold text-slate-900">
                            Text & Display
                        </h2>
                        <p className="text-sm text-slate-600">
                            Adjust text size for better readability
                        </p>
                    </div>
                </div>

                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <label htmlFor="font-size-slider" className="text-sm font-medium text-slate-900">
                            Base Font Size
                        </label>
                        <span className={`text-lg font-semibold ${currentTheme.text}`} aria-live="polite">
                            {settings.fontSize}px
                        </span>
                    </div>
                    <div className={`p-4 ${currentTheme.light} rounded-xl`}>
                        <input
                            id="font-size-slider"
                            type="range"
                            min="12"
                            max="24"
                            value={settings.fontSize}
                            onChange={(e) => updateSetting("fontSize", Number(e.target.value))}
                            className={`w-full h-2 bg-white rounded-lg appearance-none cursor-pointer`}
                        />
                    </div>
                    <div className={`p-4 ${currentTheme.light} rounded-xl`}>
                        <p className="text-slate-600" style={{ fontSize: `${settings.fontSize}px` }}>
                            The quick brown fox jumps over the lazy dog
                        </p>
                    </div>
                </div>
            </section>

            {/* Motion & Effects */}
            <section className="bg-white rounded-3xl shadow-sm p-8 space-y-6">
                <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${currentTheme.primary} flex items-center justify-center`}>
                        <Zap className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h2 className="text-xl font-semibold text-slate-900">
                            Motion & Effects
                        </h2>
                        <p className="text-sm text-slate-600">
                            Control animations and visual effects
                        </p>
                    </div>
                </div>

                {/* Reduce Motion */}
                <div className={`flex items-center justify-between p-5 ${currentTheme.light} rounded-2xl`}>
                    <div className="flex-1">
                        <label htmlFor="reduce-motion-toggle" className="text-sm font-medium text-slate-900 block cursor-pointer">
                            Reduce Motion
                        </label>
                        <p className="text-xs text-slate-600 mt-1">
                            Minimize animations for a calmer experience
                        </p>
                    </div>
                    <button
                        id="reduce-motion-toggle"
                        role="switch"
                        aria-checked={settings.reduceMotion}
                        onClick={() => updateSetting("reduceMotion", !settings.reduceMotion)}
                        className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${
                            settings.reduceMotion ? `bg-gradient-to-r ${currentTheme.primary}` : "bg-slate-300"
                        }`}
                    >
                        <span
                            className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform ${
                                settings.reduceMotion ? "translate-x-6" : "translate-x-1"
                            }`}
                        />
                    </button>
                </div>

                {/* High Contrast */}
                <div className={`flex items-center justify-between p-5 ${currentTheme.light} rounded-2xl`}>
                    <div className="flex-1">
                        <label htmlFor="high-contrast-toggle" className="text-sm font-medium text-slate-900 block cursor-pointer">
                            High Contrast Mode
                        </label>
                        <p className="text-xs text-slate-600 mt-1">
                            Increase contrast for better visibility
                        </p>
                    </div>
                    <button
                        id="high-contrast-toggle"
                        role="switch"
                        aria-checked={settings.highContrast}
                        onClick={() => updateSetting("highContrast", !settings.highContrast)}
                        className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${
                            settings.highContrast ? `bg-gradient-to-r ${currentTheme.primary}` : "bg-slate-300"
                        }`}
                    >
                        <span
                            className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform ${
                                settings.highContrast ? "translate-x-6" : "translate-x-1"
                            }`}
                        />
                    </button>
                </div>
            </section>

            {/* Reset Button */}
            <div className="flex justify-end">
                <button
                    onClick={() => {
                        const defaults: AccessibilitySettings = {
                            protanopia: 0,
                            deuteranopia: 0,
                            tritanopia: 0,
                            fontSize: 16,
                            reduceMotion: false,
                            highContrast: false,
                            websiteTheme: "teal",
                        };
                        setSettings(defaults);
                    }}
                    className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl font-medium transition-all"
                >
                    Reset All Settings
                </button>
            </div>
        </div>
    );
}