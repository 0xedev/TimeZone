import { useState, useEffect, useCallback } from "react";
import { Clock, Globe, MapPin, Copy, Check, Calendar } from "lucide-react";
import { sdk } from "@farcaster/frame-sdk";

interface TimeZone {
  name: string;
  zone: string;
  flag: string;
  isLocal?: boolean;
}

interface ConvertedTime extends TimeZone {
  converted: string;
  timeOnly: string;
  dateOnly: string;
}

export default function App() {
  const [eventDate, setEventDate] = useState<string>("");
  const [eventTime, setEventTime] = useState<string>("");
  const [eventTimeZone, setEventTimeZone] = useState<string>("UTC");
  const [convertedTimes, setConvertedTimes] = useState<ConvertedTime[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  // UTC offset options for event timezone
  const utcOffsets = [
    "UTC-12",
    "UTC-11",
    "UTC-10",
    "UTC-9",
    "UTC-8",
    "UTC-7",
    "UTC-6",
    "UTC-5",
    "UTC-4",
    "UTC-3",
    "UTC-2",
    "UTC-1",
    "UTC",
    "UTC+1",
    "UTC+2",
    "UTC+3",
    "UTC+4",
    "UTC+5",
    "UTC+6",
    "UTC+7",
    "UTC+8",
    "UTC+9",
    "UTC+10",
    "UTC+11",
    "UTC+12",
  ];

  // Popular time zones for display
  const popularTimeZones: TimeZone[] = [
    { name: "New York", zone: "America/New_York", flag: "🇺🇸" },
    { name: "Los Angeles", zone: "America/Los_Angeles", flag: "🇺🇸" },
    { name: "London", zone: "Europe/London", flag: "🇬🇧" },
    { name: "Tokyo", zone: "Asia/Tokyo", flag: "🇯🇵" },
    { name: "Sydney", zone: "Australia/Sydney", flag: "🇦🇺" },
    { name: "Dubai", zone: "Asia/Dubai", flag: "🇦🇪" },
  ];

  const formatDateTime = (date: Date): { dateStr: string; timeStr: string } => {
    const d = new Date(date);
    const dateStr = d.toISOString().split("T")[0];
    const timeStr = d.toTimeString().slice(0, 5);
    return { dateStr, timeStr };
  };

  const convertTimes = useCallback(() => {
    if (!eventDate || !eventTime) return;

    try {
      // Create event datetime in UTC
      const eventDateTime = new Date(`${eventDate}T${eventTime}:00`);
      const offsetHours = parseInt(eventTimeZone.replace("UTC", "") || "0");
      const adjustedDate = new Date(
        eventDateTime.getTime() - offsetHours * 60 * 60 * 1000
      );

      const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

      const allTimeZones: TimeZone[] = [
        {
          name: "Your Local Time",
          zone: userTimeZone,
          flag: "📍",
          isLocal: true,
        },
        ...popularTimeZones,
      ];

      const conversions: ConvertedTime[] = allTimeZones.map((tz) => {
        const converted = new Intl.DateTimeFormat("en-US", {
          timeZone: tz.zone,
          year: "numeric",
          month: "short",
          day: "numeric",
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        }).format(adjustedDate);

        const timeOnly = new Intl.DateTimeFormat("en-US", {
          timeZone: tz.zone,
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        }).format(adjustedDate);

        const dateOnly = new Intl.DateTimeFormat("en-US", {
          timeZone: tz.zone,
          month: "short",
          day: "numeric",
        }).format(adjustedDate);

        return {
          ...tz,
          converted,
          timeOnly,
          dateOnly,
        };
      });

      setConvertedTimes(conversions);
    } catch (err) {
      console.error("Conversion error:", err);
    }
  }, [eventDate, eventTime, eventTimeZone]);

  // Initialize with current time
  useEffect(() => {
    sdk.actions.ready();
    const now = new Date();
    const { dateStr, timeStr } = formatDateTime(now);
    setEventDate(dateStr);
    setEventTime(timeStr);
  }, []);

  // Auto-convert when inputs change
  useEffect(() => {
    convertTimes();
  }, [convertTimes]);

  const copyToClipboard = async (
    text: string,
    index: number
  ): Promise<void> => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 1500);
    } catch (err) {
      console.log("Copy failed");
    }
  };

  const handleQuickFill = (hours: number = 0): void => {
    const now = new Date();
    now.setHours(now.getHours() + hours);
    const { dateStr, timeStr } = formatDateTime(now);
    setEventDate(dateStr);
    setEventTime(timeStr);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-950 text-white">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/6 w-64 h-64 bg-blue-400/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/3 right-1/5 w-48 h-48 bg-purple-400/8 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 p-4 pb-8">
        <div className="max-w-md mx-auto">
          {/* Header */}
          <div className="text-center mb-6 pt-4">
            <div className="inline-flex items-center gap-2 mb-2">
              <div className="p-2 bg-white/10 backdrop-blur-xl rounded-xl border border-white/15">
                <Clock className="w-6 h-6 text-blue-300" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                Time Converter
              </h1>
            </div>
            <p className="text-white/60 text-sm">
              Convert to multiple timezones
            </p>
          </div>

          {/* Input Section */}
          <div className="backdrop-blur-xl bg-white/8 border border-white/12 rounded-2xl p-4 mb-4 shadow-xl">
            <div className="space-y-4">
              {/* Date Input */}
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Event Date
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    className="w-full p-3 bg-white/5 backdrop-blur-xl border border-white/12 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400/30 focus:border-white/20 transition-all text-white text-base"
                  />
                  <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/40 pointer-events-none" />
                </div>
              </div>

              {/* Time Input */}
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Event Time
                </label>
                <input
                  type="time"
                  value={eventTime}
                  onChange={(e) => setEventTime(e.target.value)}
                  className="w-full p-3 bg-white/5 backdrop-blur-xl border border-white/12 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400/30 focus:border-white/20 transition-all text-white text-base"
                />
              </div>

              {/* Timezone Select */}
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Event Timezone
                </label>
                <div className="relative">
                  <select
                    value={eventTimeZone}
                    onChange={(e) => setEventTimeZone(e.target.value)}
                    className="w-full p-3 bg-white/5 backdrop-blur-xl border border-white/12 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400/30 focus:border-white/20 transition-all text-white appearance-none text-base"
                  >
                    {utcOffsets.map((offset) => (
                      <option
                        key={offset}
                        value={offset}
                        className="bg-slate-800 text-white"
                      >
                        {offset}
                      </option>
                    ))}
                  </select>
                  <Globe className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/40 pointer-events-none" />
                </div>
              </div>

              {/* Quick Fill Buttons */}
              <div className="flex gap-2">
                <button
                  onClick={() => handleQuickFill(0)}
                  className="flex-1 px-3 py-2 bg-white/5 hover:bg-white/8 backdrop-blur-xl border border-white/10 hover:border-white/15 rounded-lg text-sm font-medium text-white/80 hover:text-white transition-all"
                >
                  Now
                </button>
                <button
                  onClick={() => handleQuickFill(1)}
                  className="flex-1 px-3 py-2 bg-white/5 hover:bg-white/8 backdrop-blur-xl border border-white/10 hover:border-white/15 rounded-lg text-sm font-medium text-white/80 hover:text-white transition-all"
                >
                  +1 Hour
                </button>
                <button
                  onClick={() => handleQuickFill(24)}
                  className="flex-1 px-3 py-2 bg-white/5 hover:bg-white/8 backdrop-blur-xl border border-white/10 hover:border-white/15 rounded-lg text-sm font-medium text-white/80 hover:text-white transition-all"
                >
                  Tomorrow
                </button>
              </div>
            </div>
          </div>

          {/* Results Section */}
          {convertedTimes.length > 0 && (
            <div className="backdrop-blur-xl bg-white/8 border border-white/12 rounded-2xl shadow-xl overflow-hidden">
              <div className="p-4 border-b border-white/8 bg-white/5">
                <h3 className="text-lg font-semibold text-white/90 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-blue-300" />
                  Converted Times
                </h3>
              </div>

              <div className="divide-y divide-white/8">
                {convertedTimes.map((time, index) => (
                  <div
                    key={index}
                    className={`p-4 transition-all group ${
                      time.isLocal
                        ? "bg-blue-500/10 border-l-4 border-l-blue-400"
                        : "hover:bg-white/5"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <span className="text-xl">{time.flag}</span>
                        <div className="min-w-0 flex-1">
                          <div className="font-semibold text-white/90 flex items-center gap-2 text-sm">
                            {time.name}
                            {time.isLocal && (
                              <span className="px-2 py-0.5 bg-blue-400/20 text-blue-300 rounded text-xs font-medium border border-blue-400/30">
                                LOCAL
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-white/50 truncate">
                            {time.zone}
                          </div>
                        </div>
                      </div>

                      <div className="text-right flex items-center gap-2">
                        <div>
                          <div className="text-lg font-bold text-white/95">
                            {time.timeOnly}
                          </div>
                          <div className="text-xs text-white/60">
                            {time.dateOnly}
                          </div>
                        </div>

                        <button
                          onClick={() => copyToClipboard(time.converted, index)}
                          className="p-2 hover:bg-white/8 backdrop-blur-xl rounded-lg transition-all opacity-0 group-hover:opacity-100 border border-transparent hover:border-white/10"
                        >
                          {copiedIndex === index ? (
                            <Check className="w-4 h-4 text-green-400" />
                          ) : (
                            <Copy className="w-4 h-4 text-white/40" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="text-center mt-6 text-xs text-white/40">
            Real-time timezone conversion
          </div>
        </div>
      </div>
    </div>
  );
}
