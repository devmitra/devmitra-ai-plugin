# Logger implementation tips

## Log levels
Minimum four levels: **Error**, **Warning**, **Info**, **Debug**. Every entry carries file name, line number, timestamp, and an event/identifier key.

- **Error**: stack trace + error details + app state that may have caused it.
- **Warning**: unexpected behavior or input.
- **Info**: major events/checkpoints, usable for analytics and journey timelines.
- **Debug**: debugging only — must be disabled in production builds.

## Implementation guideline

- Wrap the logger in an app-level facade for customization.
- Configurable via code and external config/env (per-level enable/disable).
- Thread safe and exception free.
- Logging functions accept variable-length arguments.
- Mask secret/sensitive/privacy data before it is written out.
- Optionally integrate with third-party services (CrashLytics, Firebase Analytics) or adopt an existing framework ([swift-log](https://github.com/apple/swift-log), [Pulse](https://github.com/kean/Pulse)) instead of rolling a custom one.

## Logger backend

- Console is one option.
- File-based backends in the app sandbox:
  - **Simple text**: console-style lines with rotating files.
  - **CSV**: one row per logging event.

## Example logger

```swift
// File: Logger.swift
import Foundation

// MARK: - LogLevel Enum
internal enum LogLevel: String, Codable {
    case info = "Info"
    case warning = "Warning"
    case error = "Error"
    case debug = "Debug"
}

// MARK: - LogEntry Struct
internal struct LogEntry: Codable {
    let timestamp: String
    let level: LogLevel
    let message: String

    init(level: LogLevel, message: String) {
        self.timestamp = LogDateFormatter.shared.format(date: Date())
        self.level = level
        self.message = message
    }

    func textRepresentation() -> String {
        return "\(timestamp) | \(level.rawValue) | \(message)"
    }
}

// MARK: - Date Formatter Singleton
internal final class LogDateFormatter {
    static let shared = LogDateFormatter()
    private let formatter: DateFormatter

    private init() {
        formatter = DateFormatter()
        formatter.dateFormat = "ddMMyyyy | HH:mm:ss"
    }

    func format(date: Date) -> String {
        return formatter.string(from: date)
    }
}

// MARK: - Logger Actor
// `actor` isolates journeyLogs/currentGroupIndex so concurrent callers can't race.
internal actor Logger {
    static let shared = Logger()

    static var isEnabled: Bool = true  // Global toggle
    static var maskData: Bool = true

    private let maxLogCount = 100
    private var journeyLogs: [[LogEntry]] = [[], []]
    private var currentGroupIndex = 0

    private init() {}

    // Replace with real redaction rules (emails, tokens, PII patterns, etc.)
    private func masked(_ message: String) -> String {
        guard Logger.maskData else { return message }
        return message
    }

    func startNewGroup() {
        guard Logger.isEnabled else { return }
        currentGroupIndex = (currentGroupIndex + 1) % 2
        journeyLogs[currentGroupIndex].removeAll()
    }

    func log(_ level: LogLevel, message: String) {
        guard Logger.isEnabled else { return }

        let entry = LogEntry(level: level, message: masked(message))
        var group = journeyLogs[currentGroupIndex]

        if group.count >= maxLogCount {
            group.removeFirst()
        }

        group.append(entry)
        journeyLogs[currentGroupIndex] = group

        print(entry.textRepresentation()) // Log to console
    }

    func exportLogsAsJSON() -> String? {
        guard Logger.isEnabled else { return nil }

        let combinedLogs = Array(journeyLogs.flatMap { $0 }.reversed())
        let encoder = JSONEncoder()
        encoder.outputFormatting = .prettyPrinted
        if let data = try? encoder.encode(combinedLogs) {
            return String(data: data, encoding: .utf8)
        }
        return nil
    }

    func exportLogsAsText() -> String {
        guard Logger.isEnabled else { return "" }

        return journeyLogs
            .flatMap { $0 }
            .reversed()
            .map { $0.textRepresentation() }
            .joined(separator: "\n---\n")
    }
}

// MARK: - Public Logging Functions

internal func infoLog(_ items: Any..., file: NSString = #file, line: Int = #line, function: String = #function) async {
    guard Logger.isEnabled else { return }
    let message = items.map { "\($0)" }.joined(separator: " ") + "\n[\(file.lastPathComponent):\(line) \(function)]"
    await Logger.shared.log(.info, message: message)
}

internal func warningLog(_ items: Any..., file: NSString = #file, line: Int = #line, function: String = #function) async {
    guard Logger.isEnabled else { return }
    let message = items.map { "\($0)" }.joined(separator: " ") + "\n[\(file.lastPathComponent):\(line) \(function)]"
    await Logger.shared.log(.warning, message: message)
}

internal func errorLog(_ items: Any..., file: NSString = #file, line: Int = #line, function: String = #function) async {
    guard Logger.isEnabled else { return }
    let message = items.map { "\($0)" }.joined(separator: " ") + "\n[\(file.lastPathComponent):\(line) \(function)]"
    await Logger.shared.log(.error, message: message)
}

internal func debugLog(_ items: Any..., file: NSString = #file, line: Int = #line, function: String = #function) async {
    guard Logger.isEnabled else { return }
    let message = items.map { "\($0)" }.joined(separator: " ") + "\n[\(file.lastPathComponent):\(line) \(function)]"
    await Logger.shared.log(.debug, message: message)
}

// MARK: - Public Controls

internal func startNewLogGroup() async {
    await Logger.shared.startNewGroup()
    await infoLog("A new journey started")
}

internal func exportLogsAsJSON() async -> String? {
    return await Logger.shared.exportLogsAsJSON()
}

internal func exportLogsAsText() async -> String {
    return await Logger.shared.exportLogsAsText()
}

/// Enable SDK Logging
internal func enableLogging() {
    Logger.isEnabled = true
}

/// Disable SDK Logging
internal func disableLogging() {
    Logger.isEnabled = false
}
```
