# Logger implementation tips

Prefer, in this order: (1) the logging framework the repo already uses, (2) the minimal OSLog wrapper below, (3) [swift-log](https://github.com/apple/swift-log) / [Pulse](https://github.com/kean/Pulse) when the app needs pluggable backends, file export or a log viewer.

## Log levels
Minimum four levels: **Error**, **Warning**, **Info**, **Debug**. Every entry carries file, line and function (via `#file`/`#line`/`#function`); the system adds the timestamp.

- **Error**: error details + app state that may have caused it.
- **Warning**: unexpected behavior or input.
- **Info**: major events/checkpoints, usable for analytics and journey timelines.
- **Debug**: debugging only — OSLog does not persist debug messages, and the wrapper below compiles them out of release builds.

## Implementation guideline

- Wrap `os.Logger` in an app-level facade (`Log`) so call sites never touch OSLog directly.
- Synchronous, non-throwing, Swift 6 clean: no mutable statics, no actors needed. Configuration is immutable, read once from the environment (`LOG_LEVELS=error,warning,info,debug`) for per-level enable/disable.
- Privacy: message text is logged as `.private` by default (redacted outside a debugger/dev device). Pass `isPublic: true` only for non-sensitive text. Never log secrets, tokens, or PII even as private.
- Log errors with full detail (`String(describing: error)`), not just `localizedDescription`.
- Variable-length items are accepted and stringified before logging.

## Example (minimal OSLog logger)

```swift
// File: Log.swift
import Foundation
import os

enum LogLevel: String, CaseIterable, Sendable {
    case error, warning, info, debug
}

enum Log {
    private static let logger = Logger(subsystem: Bundle.main.bundleIdentifier ?? "app", category: "app")

    /// Immutable, set once at launch. Override with env var LOG_LEVELS, e.g. "error,warning".
    static let enabledLevels: Set<LogLevel> = {
        if let raw = ProcessInfo.processInfo.environment["LOG_LEVELS"] {
            return Set(raw.split(separator: ",").compactMap { LogLevel(rawValue: $0.trimmingCharacters(in: .whitespaces)) })
        }
        #if DEBUG
        return Set(LogLevel.allCases)
        #else
        return [.error, .warning, .info]          // debug disabled in production
        #endif
    }()

    static func error(_ items: Any..., isPublic: Bool = false, file: String = #file, line: Int = #line, function: String = #function) {
        write(.error, items, isPublic, location(file, line, function))
    }

    static func warning(_ items: Any..., isPublic: Bool = false, file: String = #file, line: Int = #line, function: String = #function) {
        write(.warning, items, isPublic, location(file, line, function))
    }

    static func info(_ items: Any..., isPublic: Bool = false, file: String = #file, line: Int = #line, function: String = #function) {
        write(.info, items, isPublic, location(file, line, function))
    }

    static func debug(_ items: Any..., isPublic: Bool = false, file: String = #file, line: Int = #line, function: String = #function) {
        #if DEBUG
        write(.debug, items, isPublic, location(file, line, function))
        #endif
    }

    private static func location(_ file: String, _ line: Int, _ function: String) -> String {
        "\((file as NSString).lastPathComponent):\(line) \(function)"
    }

    private static func write(_ level: LogLevel, _ items: [Any], _ isPublic: Bool, _ location: String) {
        guard enabledLevels.contains(level) else { return }
        let text = items.map { "\($0)" }.joined(separator: " ")
        switch (level, isPublic) {
        case (.error, true): logger.error("\(text, privacy: .public) [\(location, privacy: .public)]")
        case (.error, false): logger.error("\(text, privacy: .private) [\(location, privacy: .public)]")
        case (.warning, true): logger.warning("\(text, privacy: .public) [\(location, privacy: .public)]")
        case (.warning, false): logger.warning("\(text, privacy: .private) [\(location, privacy: .public)]")
        case (.info, true): logger.info("\(text, privacy: .public) [\(location, privacy: .public)]")
        case (.info, false): logger.info("\(text, privacy: .private) [\(location, privacy: .public)]")
        case (.debug, true): logger.debug("\(text, privacy: .public) [\(location, privacy: .public)]")
        case (.debug, false): logger.debug("\(text, privacy: .private) [\(location, privacy: .public)]")
        }
    }
}
```

Usage: `Log.info("Checklist toggled", id)` · `Log.error("Load failed:", String(describing: error))` · `Log.info("Order placed", orderID, isPublic: true)`.

## Testing the logger
`enabledLevels` is immutable, so test the pure decision logic by extracting `LogLevel` parsing, or run the unit tests with `LOG_LEVELS` set in the scheme's test environment. Do not add mutable global state just for tests.

## Optional backends (only if required)
- File-based logs in the app sandbox (rotating text or CSV) via a custom sink, or export from `OSLogStore` for in-app log sharing.
- Crash/analytics integration (Crashlytics, Firebase Analytics) forwarded from `Log.error`/`Log.info` — mask data before forwarding.
