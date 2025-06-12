import { useState, useEffect } from "react";
import { Clock, Globe, Calendar, MapPin, Copy, Check } from "lucide-react";
import { sdk } from "@farcaster/frame-sdk";

export default function App() {
  const [eventTime, setEventTime] = useState("");
  const [convertedTimes, setConvertedTimes] = useState<any[]>([]);
  const [error, setError] = useState("");
  const [isConverting, setIsConverting] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [inputMode, setInputMode] = useState<"text" | "datetime">("text");

  // Popular time zones to display
  const popularTimeZones = [
    { name: "New York", zone: "America/New_York", flag: "🇺🇸" },
    { name: "Los Angeles", zone: "America/Los_Angeles", flag: "🇺🇸" },
    { name: "London", zone: "Europe/London", flag: "🇬🇧" },
    { name: "Tokyo", zone: "Asia/Tokyo", flag: "🇯🇵" },
    { name: "Sydney", zone: "Australia/Sydney", flag: "🇦🇺" },
    { name: "Dubai", zone: "Asia/Dubai", flag: "🇦🇪" },
  ];

  // Automatically set current UTC time and trigger conversion on load
  useEffect(() => {
    sdk.actions.ready();
    const now = new Date();
    setEventTime(now.toISOString());
    handleConvert();
  }, []);

  const handleConvert = async () => {
    if (!eventTime) {
      setError("Please enter an event time");
      return;
    }

    setIsConverting(true);
    setError("");

    try {
      await new Promise((resolve) => setTimeout(resolve, 300));

      const eventDate = new Date(eventTime);
      if (isNaN(eventDate.getTime())) {
        setError(
          "Invalid date format. Please use ISO format (e.g., 2025-06-12T12:00:00Z) or select a valid date."
        );
        setIsConverting(false);
        return;
      }

      const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

      const allTimeZones = [
        {
          name: "Your Local Time",
          zone: userTimeZone,
          flag: "📍",
          isLocal: true,
        },
        ...popularTimeZones,
      ];

      const conversions = allTimeZones.map((tz) => {
        const options: Intl.DateTimeFormatOptions = {
          timeZone: tz.zone,
          year: "numeric",
          month: "short",
          day: "numeric",
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        };

        const dateOptions: Intl.DateTimeFormatOptions = {
          timeZone: tz.zone,
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        };

        const timeOnly: Intl.DateTimeFormatOptions = {
          timeZone: tz.zone,
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        };

        const formatter = new Intl.DateTimeFormat("en-US", {
          timeZone: tz.zone,
          hour: "numeric",
          minute: "numeric",
        });
        const parts = formatter.formatToParts(eventDate);
        const offsetPart =
          parts.find((part) => part.type === "timeZoneName")?.value || "";
        const offset = offsetPart.includes("GMT")
          ? offsetPart
          : `GMT${eventDate.toLocaleString("en-US", { timeZone: tz.zone, timeZoneName: "short" }).split(" ")[2]}`;

        return {
          ...tz,
          converted: eventDate.toLocaleString("en-US", options),
          fullDate: eventDate.toLocaleString("en-US", dateOptions),
          timeOnly: eventDate.toLocaleString("en-US", timeOnly),
          offset,
        };
      });

      setConvertedTimes(conversions);
    } catch (err) {
      setError("Error converting time. Please try again.");
    } finally {
      setIsConverting(false);
    }
  };

  const copyToClipboard = async (text: string, index: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (err) {
      console.log("Copy failed");
    }
  };

  const getCurrentDateTime = () => {
    const now = new Date();
    return now.toISOString().slice(0, 16);
  };

  const handleQuickFill = (hours = 0) => {
    const now = new Date();
    now.setHours(now.getHours() + hours);
    setEventTime(now.toISOString());
    handleConvert();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-100/40 backdrop-blur-3xl text-slate-900">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-200/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-indigo-200/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        <div className="max-w-2xl w-full">
          <div className="backdrop-blur-xl bg-white/80 border border-white/20 rounded-3xl shadow-2xl shadow-slate-200/50 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600/10 via-indigo-600/10 to-purple-600/10 p-8 border-b border-white/10">
              <div className="flex items-center justify-center gap-3 mb-2">
                <div className="p-3 bg-blue-500/10 rounded-2xl">
                  <Clock className="w-8 h-8 text-blue-600" />
                </div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Time Converter
                </h1>
              </div>
              <p className="text-slate-600 text-center text-sm">
                Convert UTC time to multiple timezones instantly
              </p>
            </div>

            <div className="p-8 space-y-6">
              <div className="flex bg-slate-100/50 rounded-2xl p-1">
                <button
                  onClick={() => setInputMode("text")}
                  className={`flex-1 py-3 px-4 rounded-xl text-sm font-medium transition-all ${
                    inputMode === "text"
                      ? "bg-white shadow-sm text-slate-900"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <Calendar className="w-4 h-4 inline mr-2" />
                  Text Input
                </button>
                <button
                  onClick={() => setInputMode("datetime")}
                  className={`flex-1 py-3 px-4 rounded-xl text-sm font-medium transition-all ${
                    inputMode === "datetime"
                      ? "bg-white shadow-sm text-slate-900"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <Clock className="w-4 h-4 inline mr-2" />
                  Date Picker
                </button>
              </div>

              <div className="space-y-3">
                <label className="block text-sm font-medium text-slate-700">
                  {inputMode === "text"
                    ? "UTC Time (ISO Format)"
                    : "Select Date & Time (UTC)"}
                </label>
                {inputMode === "text" ? (
                  <div className="relative">
                    <input
                      type="text"
                      value={eventTime}
                      onChange={(e) => setEventTime(e.target.value)}
                      placeholder="2025-06-12T12:00:00Z"
                      className="w-full p-4 bg-white/60 border border-slate-200/50 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all placeholder-slate-400 text-slate-900 backdrop-blur-sm"
                    />
                    <Globe className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                  </div>
                ) : (
                  <input
                    type="datetime-local"
                    value={eventTime.slice(0, 16)}
                    onChange={(e) => setEventTime(e.target.value + ":00Z")}
                    className="w-full p-4 bg-white/60 border border-slate-200/50 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all text-slate-900 backdrop-blur-sm"
                  />
                )}
              </div>

              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => handleQuickFill(0)}
                  className="px-4 py-2 bg-slate-100/50 hover:bg-slate-200/50 rounded-xl text-sm font-medium text-slate-700 transition-all backdrop-blur-sm"
                >
                  Now
                </button>
                <button
                  onClick={() => handleQuickFill(1)}
                  className="px-4 py-2 bg-slate-100/50 hover:bg-slate-200/50 rounded-xl text-sm font-medium text-slate-700 transition-all backdrop-blur-sm"
                >
                  +1 Hour
                </button>
                <button
                  onClick={() => handleQuickFill(24)}
                  className="px-4 py-2 bg-slate-100/50 hover:bg-slate-200/50 rounded-xl text-sm font-medium text-slate-700 transition-all backdrop-blur-sm"
                >
                  Tomorrow
                </button>
              </div>

              <button
                onClick={handleConvert}
                disabled={isConverting}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-slate-400 disabled:to-slate-500 text-white py-4 rounded-2xl font-semibold shadow-lg shadow-blue-500/25 transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:hover:scale-100"
              >
                {isConverting ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Converting...
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <Globe className="w-5 h-5" />
                    Convert Time
                  </div>
                )}
              </button>

              {error && (
                <div className="p-4 bg-red-50/80 border border-red-200/50 text-red-700 rounded-2xl backdrop-blur-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-red-500"></div>
                    {error}
                  </div>
                </div>
              )}
            </div>

            {convertedTimes.length > 0 && (
              <div className="border-t border-white/10 bg-gradient-to-b from-transparent to-slate-50/30">
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-blue-600" />
                    Converted Times
                  </h3>
                  <div className="space-y-3">
                    {convertedTimes.map((time, index) => (
                      <div
                        key={index}
                        className={`p-4 rounded-2xl border transition-all hover:shadow-md ${
                          time.isLocal
                            ? "bg-blue-50/80 border-blue-200/50 shadow-sm"
                            : "bg-white/40 border-white/20 hover:bg-white/60"
                        } backdrop-blur-sm group`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">{time.flag}</span>
                            <div>
                              <div className="font-semibold text-slate-800 flex items-center gap-2">
                                {time.name}
                                {time.isLocal && (
                                  <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-lg text-xs font-medium">
                                    LOCAL
                                  </span>
                                )}
                              </div>
                              <div className="text-sm text-slate-600">
                                {time.zone} ({time.offset})
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold text-slate-900">
                              {time.timeOnly}
                            </div>
                            <div className="text-sm text-slate-600">
                              {time.converted.split(",")[0]}
                            </div>
                          </div>
                          <button
                            onClick={() =>
                              copyToClipboard(time.converted, index)
                            }
                            className="ml-3 p-2 hover:bg-white/50 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                          >
                            {copiedIndex === index ? (
                              <Check className="w-4 h-4 text-green-600" />
                            ) : (
                              <Copy className="w-4 h-4 text-slate-400" />
                            )}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="text-center mt-6 text-sm text-slate-500">
            Real-time timezone conversion
          </div>
        </div>
      </div>
    </div>
  );
}
