# Logging reference

Minimal, Swift 6-clean OSLog facade (`Log`) with four levels, per-level toggles and private-by-default messages.

## Index
- [Choosing a logger](#choosing-a-logger) — what to prefer
- [Levels](#levels) — Error/Warning/Info/Debug semantics
- [Rules](#rules) — facade, privacy, config
- [Implementation](#implementation) — `Log.swift` + usage
- [Testing](#testing) · [Optional backends](#optional-backends)

## Choosing a logger
Prefer, in order: (1) the framework the repo already uses, (2) the wrapper below, (3) [swift-log](https://github.com/apple/swift-log) / [Pulse](https://github.com/kean/Pulse) for pluggable backends, file export or a log viewer.

## Levels
Every entry carries file, line, function; the system adds the timestamp.
- **Error**: details + app state that may have caused it.
- **Warning**: unexpected behavior or input.
- **Info**: major events/checkpoints (analytics, journey timelines).
- **Debug**: debugging only; not persisted by OSLog and compiled out of release builds.

## Rules
- Call sites use the `Log` facade, never `os.Logger` directly.
- Synchronous, non-throwing, no mutable statics or actors. Immutable config read once from `LOG_LEVELS=error,warning,info,debug`.
- Messages are `.private` by default; pass `isPublic: true` only for non-sensitive text. Never log secrets, tokens or PII, even as private.
- Log errors with `String(describing: error)`, not just `localizedDescription`.

## Implementation

```swift
// File: Log.swift
import Foundation
import os

enum LogLevel: String, CaseIterable, Sendable {
    case error, warning, info, debug

    var osType: OSLogType {
        switch self {
        case .error: .error
        case .warning: .default
        case .info: .info
        case .debug: .debug
        }
    }
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
        write(.error, items, isPublic, file, line, function)
    }

    static func warning(_ items: Any..., isPublic: Bool = false, file: String = #file, line: Int = #line, function: String = #function) {
        write(.warning, items, isPublic, file, line, function)
    }

    static func info(_ items: Any..., isPublic: Bool = false, file: String = #file, line: Int = #line, function: String = #function) {
        write(.info, items, isPublic, file, line, function)
    }

    static func debug(_ items: Any..., isPublic: Bool = false, file: String = #file, line: Int = #line, function: String = #function) {
        #if DEBUG
        write(.debug, items, isPublic, file, line, function)
        #endif
    }

    private static func write(_ level: LogLevel, _ items: [Any], _ isPublic: Bool, _ file: String, _ line: Int, _ function: String) {
        guard enabledLevels.contains(level) else { return }
        let text = items.map { "\($0)" }.joined(separator: " ")
        let location = "\((file as NSString).lastPathComponent):\(line) \(function)"
        if isPublic {
            logger.log(level: level.osType, "\(text, privacy: .public) [\(location, privacy: .public)]")
        } else {
            logger.log(level: level.osType, "\(text, privacy: .private) [\(location, privacy: .public)]")
        }
    }
}
```

Usage: `Log.info("Checklist toggled", id)` · `Log.error("Load failed:", String(describing: error))` · `Log.info("Order placed", orderID, isPublic: true)`.

## Testing
`enabledLevels` is immutable: test pure `LogLevel` parsing, or set `LOG_LEVELS` in the scheme's test environment. Don't add mutable global state for tests.

## Optional backends
Only if required: file logs in the sandbox (custom sink or `OSLogStore` export); crash/analytics forwarding (Crashlytics, Firebase) from `Log.error`/`Log.info` with data masked.
