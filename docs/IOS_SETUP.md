# iOS App Setup Guide

## Overview

The Roll With It iOS app is built using native Swift and SwiftUI, providing a native iOS experience for D&D management.

## Prerequisites

- macOS 13.0+
- Xcode 15.0+
- iOS 17.0+ deployment target
- Swift 5.9+

## Project Structure

```
ios/
├── RollWithIt/
│   ├── App/
│   │   └── RollWithItApp.swift          # App entry point
│   ├── Models/
│   │   ├── Ruleset.swift                # Data models
│   │   ├── Character.swift
│   │   ├── Campaign.swift
│   │   └── Content/                     # Content models
│   ├── Views/
│   │   ├── Home/
│   │   ├── Characters/
│   │   ├── Campaigns/
│   │   ├── Content/
│   │   └── Components/                  # Reusable components
│   ├── ViewModels/
│   │   ├── CharacterViewModel.swift
│   │   ├── CampaignViewModel.swift
│   │   └── ContentViewModel.swift
│   ├── Services/
│   │   ├── SupabaseService.swift        # Supabase integration
│   │   ├── AuthService.swift            # Authentication
│   │   └── ContentService.swift         # Content management
│   ├── Utilities/
│   │   ├── Extensions/
│   │   └── Helpers/
│   └── Resources/
│       ├── Assets.xcassets
│       └── Info.plist
└── RollWithIt.xcodeproj
```

## Setup Steps

### 1. Create Xcode Project

1. Open Xcode
2. Create a new iOS App project
3. Choose:
   - Product Name: `RollWithIt`
   - Organization Identifier: `com.yourorg.rollwithit`
   - Interface: SwiftUI
   - Language: Swift
   - Storage: None

### 2. Add Dependencies

Add the following Swift Package dependencies:

```swift
// File > Add Package Dependencies
// Add these URLs:

// Supabase Swift Client
https://github.com/supabase/supabase-swift

// Additional helpful packages
https://github.com/pointfreeco/swift-composable-architecture  // Optional: State management
```

#### Supabase Swift

Add to your project:
```swift
dependencies: [
    .package(url: "https://github.com/supabase/supabase-swift", from: "2.0.0")
]
```

### 3. Configure Supabase

Create `SupabaseService.swift`:

```swift
import Supabase

class SupabaseService {
    static let shared = SupabaseService()

    let client: SupabaseClient

    private init() {
        // Load from Info.plist or environment
        guard let url = Bundle.main.object(forInfoDictionaryKey: "SUPABASE_URL") as? String,
              let key = Bundle.main.object(forInfoDictionaryKey: "SUPABASE_ANON_KEY") as? String else {
            fatalError("Supabase credentials not found in Info.plist")
        }

        client = SupabaseClient(
            supabaseURL: URL(string: url)!,
            supabaseKey: key
        )
    }
}
```

### 4. Add Supabase Credentials

Add to `Info.plist`:

```xml
<key>SUPABASE_URL</key>
<string>your-supabase-url</string>
<key>SUPABASE_ANON_KEY</key>
<string>your-supabase-anon-key</string>
```

**Important**: For production, use Xcode build configurations or environment variables instead of hardcoding.

### 5. Create Data Models

Models should match the shared TypeScript types. Example:

```swift
// Models/Ruleset.swift
import Foundation

struct Ruleset: Codable, Identifiable {
    let id: UUID
    let name: String
    let shortName: String
    let description: String?
    let version: String?
    let isOfficial: Bool
    let createdBy: UUID?
    let createdAt: Date
    let updatedAt: Date

    enum CodingKeys: String, CodingKey {
        case id
        case name
        case shortName = "short_name"
        case description
        case version
        case isOfficial = "is_official"
        case createdBy = "created_by"
        case createdAt = "created_at"
        case updatedAt = "updated_at"
    }
}
```

### 6. Create Services

Example service for fetching content:

```swift
// Services/ContentService.swift
import Supabase

class ContentService {
    private let client = SupabaseService.shared.client

    func getRulesets() async throws -> [Ruleset] {
        try await client
            .from("rulesets")
            .select()
            .order("name")
            .execute()
            .value
    }

    func getRaces(rulesetId: UUID) async throws -> [Race] {
        try await client
            .from("races")
            .select("""
                *,
                source:sources!inner(ruleset_id)
            """)
            .eq("source.ruleset_id", value: rulesetId.uuidString)
            .order("name")
            .execute()
            .value
    }
}
```

### 7. Create ViewModels

Use `@Observable` macro (iOS 17+) or `ObservableObject`:

```swift
// ViewModels/CharacterViewModel.swift
import SwiftUI

@Observable
class CharacterViewModel {
    var characters: [Character] = []
    var isLoading = false
    var error: Error?

    private let service = CharacterService()

    func loadCharacters() async {
        isLoading = true
        defer { isLoading = false }

        do {
            characters = try await service.getCharacters()
        } catch {
            self.error = error
        }
    }
}
```

### 8. Create Views

Example SwiftUI view:

```swift
// Views/Characters/CharactersListView.swift
import SwiftUI

struct CharactersListView: View {
    @State private var viewModel = CharacterViewModel()

    var body: some View {
        NavigationStack {
            Group {
                if viewModel.isLoading {
                    ProgressView()
                } else if viewModel.characters.isEmpty {
                    ContentUnavailableView(
                        "No Characters",
                        systemImage: "figure.walk",
                        description: Text("Create your first character")
                    )
                } else {
                    List(viewModel.characters) { character in
                        NavigationLink(value: character) {
                            CharacterRow(character: character)
                        }
                    }
                }
            }
            .navigationTitle("Characters")
            .toolbar {
                Button("Add", systemImage: "plus") {
                    // Add character
                }
            }
        }
        .task {
            await viewModel.loadCharacters()
        }
    }
}
```

## Type Generation

To keep Swift types in sync with TypeScript types, consider:

1. **Manual Sync**: Update Swift models when TypeScript types change
2. **Code Generation**: Use tools like `quicktype` to generate Swift from JSON Schema
3. **Shared Source of Truth**: Use the database schema as the source of truth

### Using quicktype

```bash
# Install quicktype
npm install -g quicktype

# Generate Swift types from JSON
quicktype -s schema \
  --src packages/shared/src/types/index.ts \
  --out ios/RollWithIt/Models/Generated.swift \
  --lang swift
```

## Authentication

Implement authentication with Supabase:

```swift
// Services/AuthService.swift
import Supabase

class AuthService {
    private let client = SupabaseService.shared.client

    func signIn(email: String, password: String) async throws {
        try await client.auth.signIn(email: email, password: password)
    }

    func signUp(email: String, password: String) async throws {
        try await client.auth.signUp(email: email, password: password)
    }

    func signOut() async throws {
        try await client.auth.signOut()
    }

    func currentUser() -> User? {
        client.auth.currentUser
    }

    func observeAuthState(onChange: @escaping (User?) -> Void) -> Task<Void, Never> {
        Task {
            for await state in client.auth.authStateChanges {
                onChange(state.session?.user)
            }
        }
    }
}
```

## Real-time Subscriptions

Listen to database changes in real-time:

```swift
func subscribeToCharacterUpdates() async {
    let channel = client.channel("character-updates")

    let changes = channel.on(
        .postgresChanges(
            event: .all,
            schema: "public",
            table: "characters",
            filter: "user_id=eq.\(userId)"
        )
    )

    await channel.subscribe()

    for await change in changes {
        // Handle character updates
        handleCharacterChange(change)
    }
}
```

## Testing

### Unit Tests

```swift
// RollWithItTests/CharacterViewModelTests.swift
import XCTest
@testable import RollWithIt

final class CharacterViewModelTests: XCTestCase {
    func testLoadCharacters() async throws {
        let viewModel = CharacterViewModel()
        await viewModel.loadCharacters()

        XCTAssertFalse(viewModel.characters.isEmpty)
    }
}
```

### UI Tests

```swift
// RollWithItUITests/CharactersFlowTests.swift
import XCTest

final class CharactersFlowTests: XCTestCase {
    func testCreateCharacter() throws {
        let app = XCUIApplication()
        app.launch()

        app.buttons["Characters"].tap()
        app.buttons["Add"].tap()

        // Fill out character form
        app.textFields["Name"].tap()
        app.textFields["Name"].typeText("Gandalf")

        app.buttons["Create"].tap()

        XCTAssertTrue(app.staticTexts["Gandalf"].exists)
    }
}
```

## Building and Running

1. **Development**: Select simulator or device, press Cmd+R
2. **Testing**: Press Cmd+U
3. **Archive**: Product > Archive (for App Store submission)

## Deployment

### TestFlight

1. Archive the app (Product > Archive)
2. Upload to App Store Connect
3. Add to TestFlight
4. Invite testers

### App Store

1. Complete App Store Connect setup
2. Add screenshots and metadata
3. Submit for review
4. Release when approved

## Best Practices

1. **Async/Await**: Use modern Swift concurrency
2. **Type Safety**: Leverage Swift's type system
3. **SwiftUI**: Use declarative UI patterns
4. **MVVM**: Separate concerns with ViewModels
5. **Testing**: Write tests for critical paths
6. **Accessibility**: Support VoiceOver and Dynamic Type
7. **Performance**: Use lazy loading and pagination
8. **Error Handling**: Provide meaningful error messages

## Resources

- [Swift Documentation](https://swift.org/documentation/)
- [SwiftUI Documentation](https://developer.apple.com/documentation/swiftui/)
- [Supabase Swift](https://github.com/supabase/supabase-swift)
- [Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/)
