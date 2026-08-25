## Table of Contents

1. [Product Overview](#1-product-overview)
2. [Goals & Scope](#2-goals--scope)
3. [Users & Roles](#3-users--roles)
4. [Core User Journeys](#4-core-user-journeys)
5. [Product Domains](#5-product-domains)
6. [Non-Functional Requirements](#6-non-functional-requirements)
7. [Product Architecture](#7-product-architecture)
8. [System Boundary](#8-system-boundary)
9. [System Architecture](#9-system-architecture)
10. [Application Architecture](#10-application-architecture)
11. [Data Architecture](#11-data-architecture)
12. [Authentication & Authorization](#12-authentication--authorization)
13. [External Services](#13-external-services)
14. [API Architecture](#14-api-architecture)
15. [Frontend Architecture](#15-frontend-architecture)
16. [Backend Architecture](#16-backend-architecture)
17. [Non-Functional Architecture](#17-non-functional-architecture)
18. [Security Architecture](#18-security-architecture)
19. [Deployment Architecture](#19-deployment-architecture)
20. [Project Structure & Code Organization](#20-project-structure--code-organization)
21. [System Flows](#21-system-flows)
22. [Testing & Quality Strategy](#22-testing--quality-strategy)
23. [Architecture Evolution & Governance](#23-architecture-evolution--governance)

# 1. Product Overview

YumYard is a recipe discovery and sharing web application whose primary purpose is to help users easily find recipes they want to cook.

The core experience does not require authentication. A visitor can discover recipes through search and filtering, open a recipe, and access all information required to prepare it, including ingredients, instructions, cooking information, and other recipe details.

Authenticated users gain additional capabilities such as saving recipes, creating and managing their own recipes, and rating/reviewing recipes.

YumYard does not manage or track the user's actual cooking process. The application's responsibility ends with providing the recipe information needed by the user to prepare the dish.

# 2. Goals & Scope

## 2.1 Goals

YumYard V1 should:

- Make recipe discovery simple and efficient.
- Allow users to search and filter recipes using meaningful recipe attributes.
- Provide complete and clearly structured recipe information.
- Allow authenticated users to save recipes for later.
- Allow authenticated users to create, edit, publish, and manage their own recipes.
- Support recipe drafts with automatic saving while editing.
- Allow users to rate recipes and optionally provide written reviews.
- Maintain clear ownership and access rules for user-created recipes.
- Provide a clean foundation that can be extended in future versions.

## 2.2 Scope (V1)

The V1 product includes:

### Recipe Discovery

- Recipe browsing
- Search
- Filtering by:
  - Category
  - Cuisine
  - Type
  - Cooking time
  - Difficulty

### Recipe Details

- Title
- Description
- Cover image
- Category
- Cuisine
- Type
- Cooking time
- Difficulty
- Servings
- Structured ingredients
- Ordered instructions
- Author
- Ratings
- Reviews
- Publication information
- Last-updated information
- Recipe view count

### User Accounts

- Email/password authentication
- Google OAuth authentication
- Basic user information
- A single YumYard user identity regardless of authentication method

### Personal Library

- Save/unsave recipes
- View saved recipes
- View and manage owned recipes
- Draft recipes
- Published recipes

### Recipe Management

- Create recipes
- Automatically save drafts while editing
- Publish recipes
- Edit owned recipes
- Soft-delete owned recipes
- Make owned recipes public/private

### Reviews & Ratings

- One rating per user per recipe
- Rating is required when submitting an interaction
- Written review is optional
- Users can edit their own review/rating

## 2.3 Non-goals / Out of Scope for V1

The following are intentionally excluded from V1:

- Recipe videos
- AI-powered recipe assistance
- Personalized recommendations
- Social following/subscriptions
- Social activity feeds
- Cooking-process tracking
- Automatic ingredient quantity scaling
- Advanced recipe version history
- Complex recipe moderation workflows

These features may be considered in future versions but should not influence the V1 architecture unless a current requirement depends on them.

## 3. Users & Roles

YumYard has three levels of access:

1. Guest
2. User
3. Admin

The Admin role is an operational role and is not considered part of the core consumer product domains.

### 3.1 Guest

A guest is an unauthenticated visitor to YumYard.

Guests can:

- Browse publicly available recipes.
- Search recipes.
- Filter recipes by supported discovery attributes.
- View recipe details.
- View recipe ratings and reviews.
- View recipe author information.

Guests cannot:

- Save recipes.
- Create recipes.
- Manage recipes.
- Rate recipes.
- Submit reviews.
- Access private or draft recipes.

The primary guest journey is:

`Discover → Search/Filter → View Recipe → Cook`

The actual cooking process occurs outside the YumYard system.

### 3.2 User

A User is an authenticated YumYard account.

A User has the same underlying YumYard identity regardless of whether the account is authenticated through:

- Email/password authentication.
- Google OAuth.

Users retain all Guest capabilities and additionally can:

- Save and unsave recipes.
- View saved recipes.
- Create recipes.
- Create and manage drafts.
- Publish their own recipes.
- Edit their own recipes.
- Soft-delete their own recipes.
- Make their own recipes public or private.
- Rate recipes.
- Submit optional written reviews.
- Edit their own ratings/reviews.

Users may only manage recipes they own.

Authentication does not grant access to another user's:

- Draft recipes.
- Private recipes.
- Recipe management operations.

### 3.3 Admin

An Admin is a privileged YumYard user responsible for operational and moderation tasks.

Admin is an **operational role**, not a core consumer product domain.

Potential administrative responsibilities include:

- Managing problematic or inappropriate recipes.
- Managing user accounts when operational intervention is required.
- Managing reference data when necessary.
- Handling moderation or reported content.
- Performing other application-level operational tasks.

The detailed administrative feature set is intentionally kept separate from the core product architecture and will be defined when the corresponding operational requirements are established.

#### Admin Interface

The administrative interface will be kept separate from the primary React consumer application.

The intended architecture is:

- Consumer application: React + TypeScript + Tailwind.
- Administrative interface: server-rendered HTML + HTMX.
- Both interfaces use the same backend business logic and data layer.

The Admin interface must not expose infrastructure secrets or deployment configuration.

Infrastructure and sensitive configuration such as:

- Database credentials.
- OAuth secrets.
- API keys.
- AWS credentials.
- Application secrets.

are managed through the application's deployment and secret-management mechanisms rather than the Admin interface.

### 3.4 Access Model

The access model can be summarized as:

| Capability                  | Guest | User | Admin |
| --------------------------- | :---: | :--: | :---: |
| Browse recipes              |   ✓   |  ✓   |   ✓   |
| Search recipes              |   ✓   |  ✓   |   ✓   |
| Filter recipes              |   ✓   |  ✓   |   ✓   |
| View public recipes         |   ✓   |  ✓   |   ✓   |
| Save recipes                |   —   |  ✓   |   ✓   |
| Create recipes              |   —   |  ✓   |   ✓   |
| Manage own recipes          |   —   |  ✓   |   ✓   |
| Rate recipes                |   —   |  ✓   |   ✓   |
| Submit reviews              |   —   |  ✓   |   ✓   |
| Manage other users' recipes |   —   |  —   |   ✓   |
| Operational management      |   —   |  —   |   ✓   |

Admin capabilities are subject to the specific permissions defined for each administrative operation.

## 4. Core User Journeys

YumYard V1 is organized around a small set of primary user journeys. These journeys describe product behavior and user goals without prescribing specific technical implementations.

### 4.1 Discover and View a Recipe

The primary YumYard journey does not require authentication.

```text
Guest
  ↓
Discover Recipes
  ↓
Search / Filter
  ↓
Recipe List
  ↓
Recipe Detail
  ↓
Ingredients + Instructions
  ↓
Cook
```

A guest can:

1. Open YumYard.
2. Browse available recipes.
3. Search for recipes.
4. Filter recipes by supported discovery attributes.
5. Select a recipe.
6. View all available recipe details.
7. Use the ingredients and instructions to prepare the recipe.

The actual cooking process occurs outside the YumYard system.

Authentication is not required to complete this journey.

### 4.2 Authenticate and Establish an Account

Authentication is required only when a user wants to access capabilities that require an account.

Users can authenticate through:

- Email/password.
- Google OAuth.

Both authentication methods result in the same underlying YumYard user identity.

```text
Guest
  ↓
Register / Login
  ↓
Authenticate
  ↓
YumYard User
```

Once authenticated, the user can access account-specific capabilities.

### 4.3 Save a Recipe

An authenticated user can save a recipe for later.

```text
User
  ↓
Recipe Detail
  ↓
Save Recipe
  ↓
Recipe associated with user's saved recipes
  ↓
Personal Library
```

A user can save a particular recipe only once.

The user can later remove the recipe from their saved recipes.

### 4.4 Create and Publish a Recipe

A user can create a recipe through a draft-based workflow.

```text
User
  ↓
Create Recipe
  ↓
Draft
  ↓
Edit Recipe
  ↓
Debounced Autosave
  ↓
Draft Persisted
  ↓
Publish
  ↓
Published Recipe
```

When a new recipe is created, it exists as a draft.

While editing a draft:

- Changes are automatically persisted.
- Autosave is debounced to avoid unnecessary requests.
- The user does not need to explicitly save every change.

Publishing does not create a separate recipe. The existing draft is validated and its publication state is changed to `PUBLISHED`.

A published recipe becomes available through public discovery and can be viewed by other users.

### 4.5 Edit a Published Recipe

Editing a published recipe is different from editing a draft.

```text
Recipe Owner
  ↓
Edit Published Recipe
  ↓
Modify Data Locally
  ↓
Click Update
  ↓
Validate
  ↓
Persist Changes
  ↓
Published Recipe Updated
```

Changes to a published recipe are **not automatically persisted**.

The user must explicitly select the update action to persist the changes.

If the user cancels or leaves the editing process before updating, the unsaved changes are discarded.

When an update is successfully persisted:

- The recipe remains published.
- `updatedAt` is updated.
- The updated timestamp is displayed to users.

### 4.6 Manage Recipe Visibility

The owner of a recipe can change its visibility.

```text
Published
   │
   ├── Make Private → Private
   │
   └── Make Public ← Private
```

A private recipe:

- Is not included in public discovery.
- Cannot be found through public search or filters.
- Cannot be accessed by other users through the normal application.
- Remains accessible to its owner.

Making a recipe private does not delete the recipe or its associated data.

The owner can make the recipe public again.

### 4.7 Delete a Recipe

A recipe owner can delete their own recipe.

Deletion uses a soft-delete mechanism.

```text
Recipe
  ↓
Delete
  ↓
deletedAt = timestamp
  ↓
Recipe removed from normal product experience
```

A deleted recipe:

- Is no longer publicly discoverable.
- Is no longer accessible through normal recipe viewing.
- Is excluded from normal recipe listings.
- Remains stored internally for data integrity and future operational handling.

If a user attempts to access a deleted recipe, the application should provide a meaningful unavailable-resource message rather than exposing internal implementation details.

### 4.8 Rate and Review a Recipe

An authenticated user can rate a recipe and optionally provide a written review.

```text
User
  ↓
Recipe Detail
  ↓
Select Rating
  ↓
Optional Written Review
  ↓
Submit
  ↓
Rating + Review Persisted
```

Rules:

- A rating is required when submitting.
- A written review is optional.
- A user can have at most one rating/review associated with a recipe.
- A user can edit their existing rating/review.
- The rating is stored as a numeric value.
- The written review is stored as text.

### 4.9 Personal Library

The Personal Library provides authenticated users with access to their saved recipes and owned recipes.

```text
Personal Library
│
├── Saved Recipes
│
└── My Recipes
    ├── Drafts
    └── Published
```

Saved recipes represent recipes the user wants to keep for later.

Owned recipes represent recipes created by the user and include both draft and published recipes.

### 4.10 Recipe Ownership

Recipe management is ownership-based.

A user can:

- Create their own recipes.
- Edit their own recipes.
- Delete their own recipes.
- Change the visibility of their own recipes.

A user cannot modify another user's recipes.

Authentication alone does not grant permission to manage resources owned by another user.

### 4.11 Administrative Journey

Administrative operations are separate from the core consumer journeys.

```text
Admin
  ↓
Admin Interface
  ↓
Operational / Moderation Tasks
```

The administrative interface is intended for operational concerns such as problematic content, user accounts, and reference data when necessary.

The Admin interface is not part of the primary recipe discovery and cooking journey.

## 5. Product Domains

YumYard is divided into core product domains and supporting capabilities based on business responsibilities.

The domains describe **what part of the product is responsible for a particular capability**, rather than prescribing a specific code or folder structure.

### 5.1 Core Product Domains

YumYard V1 consists of four primary product domains:

1. Discovery
2. Recipes
3. Reviews & Ratings
4. Personal Library

### 5.2 Discovery

The Discovery domain is responsible for helping users find recipes.

Responsibilities include:

- Recipe browsing.
- Recipe search.
- Recipe filtering.
- Category-based discovery.
- Cuisine-based discovery.
- Recipe type-based discovery.
- Cooking-time-based filtering.
- Difficulty-based filtering.

Discovery uses recipe information to provide discovery capabilities but does not own the underlying recipe content.

### 5.3 Recipes

The Recipes domain is the core product domain responsible for recipe content and its lifecycle.

Responsibilities include:

- Recipe identity and core information.
- Recipe descriptions.
- Recipe images.
- Ingredients.
- Instructions.
- Servings.
- Cooking time.
- Difficulty.
- Recipe category, cuisine, and type associations.
- Recipe ownership.
- Draft creation and persistence.
- Recipe publication.
- Recipe editing.
- Recipe visibility.
- Recipe deletion.
- Recipe publication metadata.
- Recipe update metadata.
- Recipe view counting.

The Recipes domain is responsible for determining whether a recipe is available for public discovery and viewing.

### 5.4 Reviews & Ratings

The Reviews & Ratings domain is responsible for user feedback associated with recipes.

Responsibilities include:

- Recipe ratings.
- Written reviews.
- Creating a rating/review.
- Editing an existing rating/review.
- Enforcing the one-rating/review-per-user-per-recipe rule.

A rating is required when submitting a rating/review interaction. A written review is optional.

### 5.5 Personal Library

The Personal Library domain is responsible for a user's personal relationship with recipes.

Responsibilities include:

- Saving recipes.
- Removing saved recipes.
- Retrieving saved recipes.
- Managing the user's own recipes.
- Accessing owned drafts.
- Accessing owned published recipes.

A saved recipe represents a user's intent to keep a recipe available for later use.

### 5.6 Identity & Authentication

Identity & Authentication is a supporting capability rather than a core consumer product domain.

It is responsible for:

- YumYard user identity.
- User account creation.
- Email/password authentication.
- Google OAuth authentication.
- Authentication state.

Email/password and Google OAuth authentication methods must resolve to the same underlying YumYard user identity.

Authentication method must not determine the user's product capabilities or ownership relationships.

### 5.7 Authorization

Authorization is a cross-cutting supporting capability responsible for determining whether an authenticated user or administrator is permitted to perform an operation.

Examples include:

- A user can edit their own recipe.
- A user cannot edit another user's recipe.
- A user can access their own drafts.
- A user cannot access another user's drafts.
- A recipe owner can change the visibility of their own recipe.
- An administrator can perform authorized operational or moderation actions.

Authentication establishes identity; authorization determines what that identity is allowed to do.

### 5.8 Admin

Admin is an operational surface rather than a core consumer product domain.

The Admin interface supports privileged operational and moderation activities such as:

- Managing problematic content.
- Managing user accounts when operational intervention is required.
- Managing reference data when necessary.
- Handling moderation tasks.

The Admin interface is separate from the primary consumer experience.

The initial Admin interface will use server-rendered HTML with HTMX while sharing the same backend business logic and data layer as the consumer application.

### 5.9 Domain Relationship Overview

The primary relationships between the domains can be represented as:

```text
                    ┌──────────────┐
                    │  Discovery   │
                    └──────┬───────┘
                           │
                    finds / filters
                           │
                           ▼
                    ┌──────────────┐
                    │   Recipes    │
                    └──────┬───────┘
                           │
              ┌────────────┼────────────┐
              │            │            │
              ▼            ▼            ▼
        Reviews &      Personal      Discovery
         Ratings        Library       Metadata
```

Supporting the domains:

```text
					Identity & Authentication
							│
							▼
						Authorization
							│
							▼
					Protected operations
```

The Admin operational surface can interact with capabilities across the system according to its authorized responsibilities.

### 5.10 Persistence Principle

Authoritative application data must be persisted through the backend and database.

Client-side storage such as localStorage must not be used as a substitute for authoritative application persistence.

Persistent product data, including recipes, drafts, saved recipes, ratings, reviews, and user data, must remain available independently of a particular browser or device.

Client-side persistence may be used for explicitly client-local concerns when there is a justified requirement, but it must not become the source of truth for application data.

## 6. Core Business Rules

Core business rules define behavior that must remain true regardless of how a user interacts with the system. They guide application behavior, validation, authorization, and data integrity.

### 6.1 Recipe Ownership

- Every user-created recipe has an owner.
- A user may create and manage their own recipes.
- A user may not modify another user's recipe.
- Authentication does not grant ownership or management rights over another user's recipe.

### 6.2 Recipe Visibility

- Draft recipes are accessible only to their owner.
- Published recipes are publicly accessible unless made private or deleted.
- Private recipes are accessible only to their owner through the normal application.
- Private recipes are excluded from public discovery, search, and filtering.
- A recipe's owner can change the visibility of their own published recipe.
- Making a recipe private does not delete its data.

### 6.3 Recipe Lifecycle

A recipe can move through the following states:

```text
DRAFT
  ↓
PUBLISHED
  ↕
PRIVATE

DRAFT / PUBLISHED / PRIVATE
  ↓
SOFT DELETED
```

More specifically:

- New recipes begin as drafts.
- Draft changes are automatically persisted using debounced autosave.
- Publishing changes the existing recipe's state to `PUBLISHED`.
- Publishing does not create a duplicate recipe.
- Editing a published recipe does not return it to draft status.
- Published recipe edits are persisted only when the owner explicitly submits the update.
- A successfully updated published recipe remains published.
- A published recipe's `updatedAt` value changes when an update is persisted.
- Deleted recipes are soft-deleted using `deletedAt`.
- Deleted recipes are excluded from normal product experiences.

### 6.4 Recipe Publishing

A recipe must satisfy the required published-recipe data requirements before it can be published.

Publishing:

1. Validates the recipe.
2. Persists any required final changes.
3. Changes its publication state to `PUBLISHED`.

The existing recipe remains the same entity throughout its lifecycle.

### 6.5 Recipe Content

A published recipe must contain the information necessary for a user to understand and prepare it.

Required recipe information includes:

- Title
- Description
- Cover image
- Category
- Cuisine
- Recipe type
- Cooking time
- Difficulty
- Servings
- Ingredients
- Instructions
- Owner

Ingredients are stored as structured data while being presented to users as readable ingredient descriptions.

Instructions are ordered because their sequence can affect how a recipe is prepared.

### 6.6 Saved Recipes

- Only authenticated users can save recipes.
- A user can save a particular recipe at most once.
- A user can remove a recipe from their saved recipes.
- Saving a recipe does not transfer ownership.
- A saved recipe represents the user's personal relationship with an existing recipe.

### 6.7 Ratings and Reviews

- Only authenticated users can rate or review recipes.
- A user can have at most one rating/review interaction for a particular recipe.
- A rating is required when submitting the interaction.
- A written review is optional.
- A rating is stored as a numeric value.
- A written review is stored as text.
- Users can edit their own rating/review.
- Users cannot modify another user's rating/review.

### 6.8 Recipe Views

- Recipe views are counted separately from recipe ownership, saves, ratings, and reviews.
- A page request must not automatically be treated as a unique view.
- The initial V1 implementation will use a simple deduplication strategy.
- The view-counting mechanism may be improved later in V1 as requirements and usage become clearer.
- View counting must not interfere with the ability of users to access recipes.

### 6.9 Reference Data

Recipe discovery attributes such as category, cuisine, recipe type, and other controlled values should use reusable values rather than unrestricted arbitrary strings where consistency is important.

Reference data should:

- Avoid duplicate values.
- Be reusable across recipes.
- Be extensible without requiring application-code changes for every new value where appropriate.
- Support different creation policies depending on the type of reference data.

User-created reference values must be normalized and checked against existing values before a new value is created.

Highly constrained values, such as measurement units or other values where unrestricted creation would damage data consistency, may remain predefined.

The exact governance rules for each reference-data type will be defined in the data architecture.

### 6.10 User Identity

- Email/password and Google OAuth authentication resolve to the same underlying YumYard user identity.
- Authentication method does not determine ownership or application capabilities.
- User-owned data is associated with the YumYard user identity rather than directly with an authentication provider.

### 6.11 Persistence

- The backend and database are the authoritative source of truth for persistent application data.
- Persistent application data must not depend on browser-local storage.
- `localStorage` must not be used as a substitute for backend persistence.
- Client-side storage may be used for explicitly client-local concerns when justified.
- Draft data must be persisted through the backend so that it remains available independently of a particular browser or device.

### 6.12 Data Access and Authorization

All operations involving protected resources must verify authorization on the backend.

The system must not rely solely on frontend restrictions to enforce ownership or access rules.

For example:

```text
User A → Recipe owned by User A → Edit → Allowed

User A → Recipe owned by User B → Edit → Denied

User A → Own Draft → View → Allowed

User A → User B's Draft → View → Denied
```

These rules must be enforced regardless of whether the request originates from the React application, the Admin interface, or another client.

## 7. Recipe Lifecycle

A recipe has a defined lifecycle that controls its creation, publication, visibility, modification, and deletion.

The lifecycle is designed to keep recipe creation flexible while ensuring that only valid, intentionally published content becomes publicly discoverable.

### 7.1 Lifecycle States

A recipe can exist in one of the following active states:

- `DRAFT`
- `PUBLISHED`
- `PRIVATE`

Deletion is represented separately using `deletedAt`.

```text
                 Create
                   │
                   ▼
                DRAFT
                   │
                   │ Publish
                   ▼
              PUBLISHED
               /       \
              /         \
     Make Private       Edit
          │               │
          ▼               ▼
       PRIVATE         PUBLISHED
          │
          │ Make Public
          ▼
       PUBLISHED


DRAFT / PUBLISHED / PRIVATE
              │
              │ Delete
              ▼
        Soft Deleted
        (deletedAt set)
```

### 7.2 Draft

A newly created recipe begins as a draft.

Drafts:

- Are accessible only to their owner.
- Are not publicly discoverable.
- Are not included in public search results.
- Are not included in public filters.
- Can be edited by their owner.
- Are automatically persisted while the owner is editing.

Drafts do not need to satisfy all published-recipe requirements until the owner attempts to publish them.

### 7.3 Draft Autosave

Changes made while editing a draft are automatically persisted.

The frontend uses debouncing so that rapid consecutive changes do not result in unnecessary persistence requests.

```text
User changes recipe
        ↓
Wait for debounce period
        ↓
Persist latest draft state
        ↓
Draft updated
```

The backend remains the authoritative source of the draft.

Autosave applies to drafts only.

### 7.4 Publishing

A draft can be published by its owner.

Publishing:

1. Validates all required published-recipe data.
2. Persists any final changes required for publication.
3. Changes the recipe state from `DRAFT` to `PUBLISHED`.
4. Records the publication timestamp.

Publishing does not create a new recipe record.

The draft and the published recipe remain the same underlying recipe entity.

Once published, the recipe becomes eligible for public discovery and viewing.

### 7.5 Published

A published recipe:

- Is publicly discoverable.
- Can appear in search results.
- Can appear in filters.
- Can be viewed by guests and authenticated users.
- Can receive ratings and reviews.
- Can be saved by authenticated users.
- Can be edited by its owner.
- Can be made private by its owner.
- Can be soft-deleted by its owner.

### 7.6 Editing a Published Recipe

Editing a published recipe does not change its lifecycle state.

```text
PUBLISHED
    │
    │ Edit
    ▼
Local Unsaved Changes
    │
    │ Update
    ▼
PUBLISHED
```

While editing:

- Changes remain unsaved until the owner submits the update.
- The owner can cancel or leave the editing process without persisting the changes.
- The existing published recipe remains unchanged until the update is submitted.
- A successful update modifies the existing recipe.
- The recipe remains `PUBLISHED`.
- `updatedAt` is updated after a successful update.

Published recipe edits do not use draft autosave.

### 7.7 Private

A published recipe can be made private by its owner.

A private recipe:

- Is accessible to its owner.
- Is excluded from public discovery.
- Is excluded from public search results.
- Is excluded from public filters.
- Cannot be accessed by other users through the normal application.
- Retains its existing recipe data.
- Retains its existing ratings, reviews, saves, and other associated data.

A private recipe can be made public again by its owner.

```text
PUBLISHED
    │
    │ Make Private
    ▼
PRIVATE
    │
    │ Make Public
    ▼
PUBLISHED
```

### 7.8 Deletion

Recipe deletion uses a soft-delete mechanism.

When the owner deletes a recipe:

- `deletedAt` is set to the deletion timestamp.
- The recipe is removed from normal product experiences.
- The recipe is no longer publicly discoverable.
- The recipe is no longer available through normal recipe viewing.
- The recipe remains stored internally.

Deletion does not immediately destroy the underlying recipe data.

A deleted recipe is treated as unavailable regardless of its previous lifecycle state.

### 7.9 Access Rules by Lifecycle State

| State        | Owner                                           | Other Authenticated Users | Guests    | Public Discovery |
| ------------ | ----------------------------------------------- | ------------------------- | --------- | ---------------- |
| Draft        | View / Edit                                     | No access                 | No access | No               |
| Published    | View / Edit                                     | View                      | View      | Yes              |
| Private      | View / Edit                                     | No access                 | No access | No               |
| Soft Deleted | Not available through normal product experience | No access                 | No access | No               |

Administrative access is governed separately by the Admin authorization rules.

### 7.10 Lifecycle Invariants

The following invariants must always hold:

- A recipe cannot be publicly discoverable while in `DRAFT`.
- A recipe cannot be publicly discoverable while `PRIVATE`.
- A deleted recipe cannot be publicly discoverable.
- Only the recipe owner can publish their draft.
- Only the recipe owner can edit their recipe.
- Only the recipe owner can change their recipe's visibility.
- Only the recipe owner can delete their recipe.
- Publishing does not create a duplicate recipe.
- Editing a published recipe does not automatically create a draft.
- Draft autosave does not apply to published recipe editing.
- `updatedAt` changes only when persisted recipe data is successfully updated.
- `deletedAt` is set when a recipe is soft-deleted.

## 8. System Context

The system context defines the major actors, external systems, and high-level boundaries of YumYard.

At this level, the architecture describes how YumYard interacts with the outside world without specifying internal implementation details such as controllers, services, database tables, or frontend components.

### 8.1 System Boundary

YumYard consists of the consumer-facing application, administrative interface, backend application, and persistent data layer.

The system interacts with external services where required, including Google OAuth and external image storage.

```text
									┌─────────────────────┐
									│        Guest        │
									└──────────┬──────────┘
											│
											│ Browse / Search /
											│ Filter / View
											▼
				┌────────────────────────────────────────────────────────┐
				│                       YUM YARD                         │
				│                                                        │
				│  ┌──────────────────┐       ┌──────────────────────┐   │
				│  │ Consumer Web App │ ───── │     Backend API      │   │
				│  └──────────────────┘       └──────────┬───────────┘   │
				│                                        │               │
				│                                        ▼               │
				│                                 Persistent Data        │
				└─────────────────────────────────────┼──────────────────┘
													  │
									┌─────────────────┼─────────────────┐
									│                 │                 │
									▼                 ▼                 ▼
								PostgreSQL       Image Storage      Google OAuth
```

### 8.2 Actors

#### Guest

A guest is an unauthenticated visitor.

The guest interacts with the consumer application to:

- Browse recipes.
- Search recipes.
- Filter recipes.
- View public recipe details.

#### User

A user is an authenticated YumYard account.

A user can access all guest capabilities and authenticated capabilities such as:

- Saving recipes.
- Creating recipes.
- Managing drafts.
- Publishing recipes.
- Managing owned recipes.
- Rating recipes.
- Reviewing recipes.

#### Admin

An admin is an authorized YumYard operator.

The admin interacts with the separate administrative interface to perform operational and moderation tasks.

The Admin interface is not part of the primary consumer experience.

### 8.3 Consumer Application

The consumer application is the primary user-facing interface for YumYard.

It provides:

- Recipe discovery.
- Recipe search and filtering.
- Recipe detail pages.
- User authentication flows.
- Personal Library.
- Recipe creation and management.
- Ratings and reviews.

The consumer application communicates with the YumYard backend for authoritative application operations and persistent data.

### 8.4 Admin Interface

The Admin interface is a separate operational interface intended for authorized administrators.

The initial Admin interface will use server-rendered HTML with HTMX.

It shares the same:

- Backend application logic.
- Authorization mechanisms.
- Data layer.
- Persistent database.

The Admin interface does not maintain a separate copy of application data.

### 8.5 Backend

The backend is responsible for providing the application's authoritative business operations and data access.

It serves both:

- The consumer application.
- The Admin interface.

The backend is responsible for:

- Enforcing business rules.
- Authentication and authorization.
- Validating requests.
- Managing application data.
- Persisting data.
- Protecting resources according to ownership and visibility rules.

The detailed internal backend architecture will be defined in later sections.

### 8.6 Primary Data Store

PostgreSQL is the primary persistent data store for YumYard.

Application data that must survive beyond a browser session or device is persisted through the backend and stored in PostgreSQL.

The database is the authoritative source of truth for persistent application data.

### 8.7 External Services

#### Google OAuth

Google OAuth is an external authentication provider.

It provides an authentication mechanism that allows users to authenticate into their YumYard account using their Google identity.

Google OAuth does not become the source of truth for YumYard's user relationships or ownership data.

YumYard maintains its own underlying user identity.

#### Image Storage

Recipe images are stored using an external image-storage service.

The application stores the necessary reference to the image rather than treating the image binary as ordinary application data.

The specific image-storage provider will be determined separately.

### 8.8 High-Level Interaction Model

The major interactions can be summarized as:

```text
Guest
  │
  ▼
Consumer Web App (UI)
  │
  ▼
YumYard Backend
  │
  ▼
PostgreSQL


User
  │
  ▼
Consumer Web App (UI)
  │
  ▼
YumYard Backend
  │
  ├── PostgreSQL
  ├── Image Storage
  └── Google OAuth


Admin
  │
  ▼
Admin Interface (UI)
  │
  ▼
YumYard Backend
  │
  ▼
PostgreSQL
```

### 8.9 System Boundary Principles

The following principles define the system boundary:

- The consumer application is responsible for presenting the YumYard product to users.
- The Admin interface is an operational interface and is separate from the consumer experience.
- The backend is the authoritative application layer.
- PostgreSQL is the authoritative persistent data store.
- Client-side storage is not an authoritative source of application data.
- External authentication providers authenticate users but do not own YumYard user relationships.
- External image storage stores recipe media but does not own recipe metadata or recipe relationships.
- Business rules and authorization must be enforced by the backend rather than trusted to a particular client interface.

## 9. System Architecture

YumYard V1 uses a modular monolithic application architecture with a separate consumer frontend and backend application.

The architecture is intentionally kept simple for V1 while maintaining clear boundaries between major product and technical responsibilities.

### 9.1 Architecture Style

YumYard uses a **modular monolith** for the backend.

The backend is deployed and operated as a single application, while its internal responsibilities are organized into logical modules based on product domains and supporting capabilities.

The system is not divided into independently deployed microservices.

The primary reasons for using a modular monolith are:

- Simpler development.
- Simpler deployment.
- Simpler local development.
- Straightforward transactions and data consistency.
- Lower operational complexity.
- Clear internal domain boundaries.
- Ability to evolve the system without introducing distributed-system complexity prematurely.

The architecture should preserve module boundaries so that individual capabilities can be changed or extracted later if the system's scale or requirements justify doing so.

### 9.2 High-Level Architecture

The major components of YumYard are:

- Consumer Web Application.
- Admin Interface.
- Backend Application.
- Application/Data Access Layer.
- PostgreSQL Database.
- External Image Storage.
- Google OAuth.

```text
                         YUM YARD
                            │
              ┌─────────────┴─────────────┐
              │                           │
              ▼                           ▼
       Consumer Application          Admin Interface
       React + TypeScript            HTML + HTMX
              │                           │
              └─────────────┬─────────────┘
                            │
                            ▼
                     Express Backend
                     TypeScript
                            │
              ┌─────────────┼─────────────┐
              │             │             │
              ▼             ▼             ▼
         Application     Data Access   Integrations
           Logic           Layer          │
              │             │             ├── Google OAuth
              │             │             └── Image Storage
              └─────────────┼
                            ▼
                         Prisma
                            │
                            ▼
                       PostgreSQL
```

### 9.3 Consumer Web Application

The consumer application is a React application written in TypeScript and styled using Tailwind CSS.

It is responsible for the primary user-facing experience.

Responsibilities include:

- Recipe discovery.
- Search.
- Filtering.
- Recipe detail presentation.
- Authentication interfaces.
- Personal Library.
- Recipe creation and editing interfaces.
- Draft editing.
- Recipe publishing.
- Recipe visibility management.
- Ratings and reviews.

The consumer application is not the authoritative source of persistent application data.

It communicates with the backend for application operations and persistence.

### 9.4 Admin Interface

The Admin interface is a separate server-rendered interface using HTML and HTMX.

It is intended for internal operational and moderation use.

Responsibilities include administrative operations such as:

- Content management.
- User management.
- Reference-data management when required.
- Moderation operations.

The Admin interface shares the same backend application, business logic, authorization mechanisms, and database as the consumer application.

It does not maintain an independent data store.

### 9.5 Backend Application

The backend is an Express application written in TypeScript.

It is the authoritative application layer and is responsible for enforcing application behavior and business rules.

Responsibilities include:

- Request handling.
- Authentication.
- Authorization.
- Request validation.
- Business logic.
- Application-domain operations.
- Data access.
- Integration with external services.
- Error handling.
- Persistent data management.

The backend serves both the consumer application and the Admin interface.

### 9.6 Application Modules

The backend is organized around logical modules corresponding to the product's domains and supporting capabilities.

The initial module structure is:

```text
Backend
├── Discovery
├── Recipes
├── Reviews & Ratings
├── Personal Library
├── Identity & Authentication
├── Authorization
└── Admin
```

These modules exist within the same backend application and are not independently deployed services.

Each module should have clear responsibilities and should avoid directly manipulating another module's internal implementation when a well-defined interface or application operation is more appropriate.

The detailed internal structure of these modules is defined in the Application Architecture section.

### 9.7 Data Access

Prisma is used as the application's database access layer.

The backend interacts with PostgreSQL through Prisma rather than allowing individual application modules to issue arbitrary database operations throughout the codebase.

The data access layer is responsible for:

- Database queries.
- Persistence operations.
- Mapping application operations to database operations.
- Maintaining consistency with the database schema.

The exact data-access organization will be defined in the Application Architecture and Data Architecture sections.

### 9.8 PostgreSQL

PostgreSQL is the primary database for YumYard.

It stores authoritative persistent application data, including:

- Users.
- Recipes.
- Recipe ingredients.
- Recipe instructions.
- Categories.
- Cuisines.
- Recipe types.
- Saved recipes.
- Ratings.
- Reviews.
- Recipe lifecycle information.
- Recipe ownership information.
- Other application data required by the system.

The detailed data model is defined separately in the Data Architecture section.

### 9.9 External Integrations

The backend integrates with external systems where required.

#### Google OAuth

Google OAuth provides an additional authentication method for YumYard users.

The backend is responsible for translating successful external authentication into the corresponding YumYard user identity.

#### Image Storage

Recipe images are stored using an external image-storage service.

The backend manages the relationship between a recipe and its stored image metadata.

The specific image-storage provider and integration strategy will be defined separately.

### 9.10 Communication Model

The primary communication flow is:

```text
React Consumer Application
          │
          │ HTTP / REST
          ▼
Express Backend
          │
          ├── Application Modules
          │
          ├── Data Access
          │
          └── External Integrations
                    │
          ┌─────────┴─────────┐
          ▼                   ▼
     PostgreSQL          External Services
```

The Admin interface communicates with the same backend through its server-rendered/HTMX interaction model.

The consumer frontend and Admin interface do not communicate directly with PostgreSQL.

### 9.11 Architectural Boundaries

The following boundaries apply:

- The frontend does not directly access PostgreSQL.
- The frontend does not contain authoritative business rules.
- The Admin interface does not maintain a separate backend or database.
- Product data is persisted through the backend.
- Domain modules should communicate through defined application boundaries rather than relying on another module's internal implementation.
- External services are accessed through the backend where server-side credentials or business rules are involved.
- Infrastructure credentials and secrets are never exposed to the client.

### 9.12 Scalability Strategy

The initial architecture prioritizes simplicity over premature scalability.

The system will begin as a modular monolith with a single primary PostgreSQL database.

Scaling individual components will be considered only when actual requirements justify the additional complexity.

Potential future scaling strategies may include:

- Horizontal scaling of the backend.
- Caching.
- Background processing.
- CDN usage.
- Database optimization.
- Separating particularly independent modules into services.

These are future considerations and are not part of the required V1 architecture.

## 10. Application Architecture

Application architecture defines the internal organization and responsibilities of the major YumYard applications.

YumYard consists of:

- A React consumer application.
- An Express backend application.
- An HTMX-based Admin interface.

The applications have different presentation responsibilities but share the same backend business logic and persistent data.

### 10.1 Architectural Principles

The application architecture follows these principles:

- Separate presentation concerns from application and business logic.
- Keep authoritative business rules on the backend.
- Organize backend functionality around domain boundaries.
- Keep data-access concerns separate from application logic.
- Avoid unnecessary abstraction and ceremony.
- Prefer simple modules that can evolve as requirements grow.
- Avoid duplicating business logic between the consumer application and Admin interface.
- Keep client-side state separate from authoritative server state.
- Do not use browser storage as a substitute for backend persistence.

### 10.2 Consumer Application

The consumer application uses React with TypeScript and Tailwind CSS.

Its primary responsibility is presenting the YumYard product and managing client-side interaction.

The frontend is responsible for:

- Rendering the user interface.
- Managing user interactions.
- Managing client-side UI state.
- Managing form state.
- Performing client-side validation where useful for user experience.
- Communicating with the backend.
- Presenting server responses and errors.
- Managing navigation and routing.
- Providing loading, empty, and error states.

The frontend must not be treated as the authoritative source of business rules or persistent application data.

### 10.3 Frontend Domain Organization

Frontend code should be organized primarily around product capabilities rather than creating one global collection of technical utilities.

A conceptual structure is:

```text
Frontend
├── Discovery
├── Recipes
├── Reviews & Ratings
├── Personal Library
├── Authentication
└── Shared UI / Infrastructure
```

The exact folder structure is an implementation detail and may evolve as the application grows.

Frontend modules should contain presentation and client-side behavior relevant to their capability while relying on the backend for authoritative operations.

### 10.4 Backend Application

The backend uses Express with TypeScript.

The backend is organized as a modular monolith.

The conceptual structure is:

```text
Backend
├── Discovery
├── Recipes
├── Reviews & Ratings
├── Personal Library
├── Identity & Authentication
├── Authorization
├── Admin
└── Shared Infrastructure
```

Each module owns the application operations and rules associated with its responsibility.

Modules remain part of the same backend application and share the same database and runtime.

### 10.5 Backend Request Flow

A typical backend request follows this general flow:

```text
HTTP Request
      ↓
Route
      ↓
Controller
      ↓
Request Validation
      ↓
Application / Domain Logic
      ↓
Data Access
      ↓
Database / External Service
      ↓
Response
```

The exact flow may vary for operations that do not require every stage.

### 10.6 Routes

Routes define how HTTP requests are mapped to application operations.

Responsibilities include:

- Defining HTTP methods.
- Defining URL paths.
- Connecting requests to the appropriate controller.
- Applying route-level middleware where required.

Routes should not contain business logic.

### 10.7 Controllers

Controllers translate HTTP requests into application operations and application results into HTTP responses.

Controllers are responsible for:

- Reading request data.
- Receiving validated input.
- Calling the appropriate application logic.
- Returning appropriate HTTP responses.
- Mapping application errors to API responses.

Controllers should remain thin and should not contain substantial business logic or database operations.

### 10.8 Validation

Input validation ensures that data entering the application satisfies the required structural and semantic constraints.

Validation should occur on the backend regardless of whether the client performs its own validation.

Client-side validation may be used to provide immediate feedback, but it does not replace backend validation.

Validation is responsible for concerns such as:

- Required fields.
- Data types.
- Value ranges.
- Field formats.
- Published-recipe requirements.
- Request-specific constraints.

### 10.9 Application and Domain Logic

Application and domain logic contains the rules and operations that determine how YumYard behaves.

Examples include:

- Creating a recipe.
- Autosaving a draft.
- Publishing a recipe.
- Updating a published recipe.
- Changing recipe visibility.
- Saving a recipe.
- Submitting a rating/review.
- Enforcing recipe ownership.
- Determining whether a recipe can be publicly accessed.

This logic must not depend on a specific presentation interface.

The same application logic should be usable by both:

- The consumer application's API requests.
- The Admin interface.

### 10.10 Data Access

Data access is responsible for communicating with PostgreSQL through Prisma.

Its responsibilities include:

- Reading persistent data.
- Creating persistent data.
- Updating persistent data.
- Deleting or soft-deleting persistent data.
- Executing database queries.
- Managing database-specific concerns.

Application logic should not need to know the implementation details of how database queries are constructed.

### 10.11 External Service Integrations

External services should be accessed through dedicated integration boundaries.

Examples include:

- Google OAuth.
- Image storage.

Application logic should depend on the capability provided by an integration rather than being tightly coupled to provider-specific implementation details where practical.

This allows external providers to be changed without unnecessarily affecting unrelated application logic.

### 10.12 Admin Application

The Admin interface uses server-rendered HTML with HTMX.

Its responsibilities are limited to presenting administrative operations and handling administrator interactions.

```text
Admin Browser
      ↓
HTMX Request
      ↓
Express Backend
      ↓
Admin Application Logic
      ↓
Shared Domain / Application Logic
      ↓
Data Access
      ↓
PostgreSQL
```

The Admin interface must not duplicate consumer-domain business rules.

For example, if deleting a recipe requires ownership or administrative authorization checks, those checks belong to the backend application logic rather than being implemented independently in the Admin interface.

### 10.13 Shared Business Logic

Consumer and Admin interfaces must use the same authoritative business rules.

```text
                ┌──────────────────┐
                │ Consumer React   │
                └────────┬─────────┘
                         │
                         ▼
                ┌──────────────────┐
                │                  │
                │ Backend Business │
                │     Logic        │
                │                  │
                └────────┬─────────┘
                         ▲
                         │
                ┌────────┴─────────┐
                │                  │
                │   Admin HTMX     │
                │                  │
                └──────────────────┘
```

Business rules must not be duplicated merely because two different interfaces use them.

### 10.14 Client State vs Server State

The frontend may maintain temporary client-side state required for interaction.

Examples include:

- Form input currently being edited.
- Modal visibility.
- Selected filters before submission.
- Loading state.
- Temporary UI state.

Authoritative application state remains on the backend.

Examples include:

- Recipes.
- Drafts.
- Saved recipes.
- Ratings.
- Reviews.
- Users.
- Ownership.
- Recipe visibility.

The frontend may cache server data for performance and user experience, but such cached data is not the authoritative source of truth.

### 10.15 Error Handling Boundary

The backend is responsible for determining whether an operation succeeded or failed according to application rules.

The frontend is responsible for presenting the resulting state to the user.

For example:

```text
User attempts to edit another user's recipe
              ↓
Backend checks authorization
              ↓
Operation denied
              ↓
Backend returns appropriate error
              ↓
Frontend presents useful feedback
```

The frontend must not assume that hiding an action is sufficient to enforce authorization.

### 10.16 Abstraction Principle

The architecture should avoid creating abstractions without a demonstrated need.

Modules and layers should be introduced when they provide a meaningful separation of responsibility, improve maintainability, or protect an architectural boundary.

The architecture does not require every module to contain identical files or layers.

The implementation should remain as simple as possible while preserving the boundaries defined by this architecture.

## 11. Data Architecture

The data architecture defines the major persistent data concepts, their relationships, ownership, and integrity requirements.

The data model is designed around the relational nature of YumYard's data and the strong relationships between users, recipes, saved recipes, ratings/reviews, and reference data.

### 11.1 Primary Data Store

PostgreSQL is the authoritative persistent data store for YumYard.

Persistent application data must be stored through the backend and persisted in PostgreSQL.

The database is responsible for maintaining:

- Persistent application data.
- Relationships between entities.
- Referential integrity.
- Uniqueness constraints.
- Data required to enforce important business invariants.

The frontend and client-side storage must not be treated as authoritative sources of persistent application data.

### 11.2 Core Entities

The initial conceptual data model consists of the following major entities:

- User
- Authentication Identity
- Recipe
- Ingredient
- Saved Recipe
- Rating/Review
- Category
- Cuisine
- Recipe Type

Instructions are currently modeled as structured ordered data within a Recipe rather than as a separate entity.

### 11.3 User

The `User` represents the application's underlying YumYard identity.

A User exists independently of the authentication method used to access the account.

A User may:

- Own recipes.
- Save recipes.
- Submit ratings/reviews.
- Authenticate using one or more supported authentication methods.

User-owned application data references the YumYard User rather than directly referencing a specific authentication provider.

### 11.4 Authentication Identity

Authentication identities represent the mechanisms through which a YumYard User can authenticate.

Supported authentication methods include:

- Email/password.
- Google OAuth.

Authentication identity information is conceptually separate from the core User entity.

```text
User
  │
  └── Authentication Identity
        ├── Email/Password
        └── Google OAuth
```

The authentication provider-specific identity must not replace the YumYard User identity.

This allows the same YumYard account to remain associated with its recipes, saved recipes, ratings, reviews, and other data regardless of the authentication method used.

### 11.5 Recipe

A `Recipe` is the central content entity of YumYard.

A recipe belongs to exactly one User.

A Recipe contains or references:

- Title.
- Description.
- Cover image reference.
- Category.
- Cuisine.
- Recipe type.
- Cooking time.
- Difficulty.
- Servings.
- Ingredients.
- Instructions.
- Lifecycle state.
- Publication metadata.
- Update metadata.
- View count.
- Deletion metadata.

The Recipe remains the same underlying entity throughout its lifecycle.

Publishing, editing, making a recipe private, and soft deletion do not create replacement recipe entities.

### 11.6 Recipe Lifecycle Data

Recipe lifecycle information is stored as part of the Recipe.

The active lifecycle state is one of:

- `DRAFT`
- `PUBLISHED`
- `PRIVATE`

Deletion is represented separately through `deletedAt`.

Conceptually:

```text
Recipe
├── status
│   ├── DRAFT
│   ├── PUBLISHED
│   └── PRIVATE
│
└── deletedAt
```

A non-null `deletedAt` indicates that the recipe has been soft-deleted.

### 11.7 Ingredients

Ingredients are modeled separately from the Recipe because each recipe may contain multiple structured ingredients.

A Recipe has a one-to-many relationship with Ingredients.

Conceptually:

```text
Recipe
  │
  └── Ingredients
        ├── quantity
        ├── unit
        ├── name
        └── note
```

Ingredient data is structured so that the application can present a readable ingredient description while retaining its individual attributes.

For example:

```text
Quantity: 2
Unit: cups
Name: onion
Note: finely chopped
```

The user may see this as:

> 2 cups onion, finely chopped

The exact ingredient schema and measurement-unit model will be defined during concrete database schema design.

### 11.8 Instructions

Instructions belong to a Recipe and are currently modeled as ordered structured data within the Recipe rather than as a separate persistent entity.

Conceptually:

```text
Recipe
└── Instructions
    ├── Step 1
    ├── Step 2
    ├── Step 3
    └── ...
```

Each instruction must preserve its order.

The initial model intentionally avoids creating a separate instruction entity because V1 only requires ordered textual preparation steps.

Instructions may become a separate entity in a future architecture if additional requirements justify it, such as:

- Step-specific images.
- Timers.
- Equipment associations.
- Step-level analytics.
- More complex instruction structures.

### 11.9 Reference Data

Recipe attributes that should be reused consistently across recipes are represented as reference data.

Initial reference-data concepts include:

- Category.
- Cuisine.
- Recipe Type.

A Recipe stores references to these entities rather than duplicating their names.

Conceptually:

```text
Recipe
├── categoryId
├── cuisineId
└── recipeTypeId
```

This allows the same reference value to be associated with many recipes.

Reference data must avoid unnecessary duplication and should support controlled extensibility.

The creation and governance policy may differ between reference-data types.

### 11.10 Image References

Recipe image binaries are not stored in PostgreSQL.

The Recipe stores a reference to the image maintained by the external image-storage system.

Conceptually:

```text
Recipe
└── image reference
```

The reference may represent a storage path, object key, or another stable identifier.

The architecture does not require the database to store the image binary itself.

The exact image-storage provider and reference format will be defined in the External Services and Deployment Architecture sections.

### 11.11 Saved Recipe

A `Saved Recipe` represents a relationship between a User and a Recipe.

Conceptually:

```text
User
  │
  └── Saved Recipe ─── Recipe
```

A user can save many recipes.

A recipe can be saved by many users.

Therefore, the relationship is many-to-many and requires an associative entity.

The same user must not be able to create multiple saved relationships for the same recipe.

A database-level uniqueness constraint must enforce:

```text
(userId, recipeId)
```

as unique.

Saving a recipe does not transfer ownership.

### 11.12 Rating and Review

Rating and written review are represented as one conceptual `Rating/Review` entity.

A User can submit one Rating/Review for a Recipe.

Conceptually:

```text
User
  │
  └── Rating/Review ─── Recipe
```

The entity contains:

- User relationship.
- Recipe relationship.
- Numeric rating.
- Optional written review.
- Creation metadata.
- Update metadata.

A rating is mandatory.

A written review is optional.

The same user cannot have multiple Rating/Review entities for the same Recipe.

A database-level uniqueness constraint must enforce:

```text
(userId, recipeId)
```

as unique.

### 11.13 Recipe Views

Recipe views are initially represented as an aggregate count on the Recipe.

Conceptually:

```text
Recipe
└── viewCount
```

For V1, viewing a recipe will initially increment the aggregate count using a simple implementation.

No separate persistent view entity or complex visitor-deduplication system is required for the initial implementation.

The architecture allows the view-counting mechanism to become more sophisticated later without changing the fundamental Recipe concept.

### 11.14 Ownership Relationships

The primary ownership relationships are:

```text
User
  │
  └── owns ───► Recipe
```

Only the owning User may:

- Edit the Recipe.
- Publish the Recipe.
- Change the Recipe's visibility.
- Delete the Recipe.

Authorization must be enforced by the backend.

### 11.15 Entity Relationship Overview

The conceptual data relationships are:

```text
                         ┌──────────────┐
                         │     User     │
                         └──────┬───────┘
                                │
              ┌─────────────────┼─────────────────┐
              │                 │                 │
            owns              saves           submits
              │                 │                 │
              ▼                 ▼                 ▼
         ┌─────────┐      ┌────────────┐   ┌──────────────┐
         │ Recipe  │      │   Saved    │   │   Rating /   │
         │         │◄─────│   Recipe   │   │    Review    │
         └────┬────┘      └────────────┘   └──────────────┘
              │
      ┌───────┼────────┬──────────────┐
      │       │        │              │
      ▼       ▼        ▼              ▼
 Ingredients  │    Category        Cuisine
              │
              ▼
        Instructions[]
              │
              ▼
         Recipe Type
```

### 11.16 Data Integrity Principles

The database must enforce important invariants wherever practical.

Examples include:

- A Recipe must have exactly one owner.
- A Saved Recipe relationship must be unique per User and Recipe.
- A Rating/Review relationship must be unique per User and Recipe.
- Recipe references to controlled reference data must point to valid records.
- Required Recipe data must satisfy the appropriate database constraints.
- Deleted Recipes must retain their underlying data when soft deletion is used.
- Referential integrity must be maintained between related entities.

Application-level validation and database-level constraints should work together.

The database must not be expected to enforce business rules that require application context, but critical structural invariants should not rely solely on frontend behavior.

### 11.17 Data Ownership

YumYard owns and controls the relationships between its application entities.

External systems do not become owners of YumYard's application data.

For example:

- Google provides authentication.
- Image storage provides media storage.
- PostgreSQL stores YumYard's authoritative application data.

The YumYard backend remains responsible for maintaining the application's relationships and business rules.

### 11.18 Schema Evolution

The concrete database schema will evolve through controlled schema changes and migrations.

Changes to the database schema must preserve the business rules and data relationships defined by this architecture.

The concrete schema, indexes, constraints, and migration strategy will be documented and implemented separately from this conceptual architecture.

## 12. Authentication & Authorization

YumYard uses a unified user identity with multiple supported authentication methods.

Authentication establishes **who the user is**. Authorization determines **what that user is allowed to do**.

### 12.1 Authentication Methods

YumYard V1 supports:

- Email/password authentication.
- Google OAuth authentication.

Both methods resolve to the same underlying YumYard `User` identity.

The authentication provider must not determine:

- Recipe ownership.
- Saved recipes.
- Ratings or reviews.
- User permissions.
- Other application relationships.

A user's application data is associated with the YumYard user identity rather than directly with the authentication method.

### 12.2 Authentication Model

YumYard uses short-lived access tokens and longer-lived refresh tokens.

Both tokens are stored in HTTP-only cookies.

```text
User
  ↓
Authenticate
  ↓
Express Backend
  ↓
Access Token + Refresh Token
  ↓
HTTP-only Cookies
  ↓
Browser
```

The frontend does not need direct access to either token.

Tokens must not be stored in `localStorage` or other JavaScript-accessible browser storage.

### 12.3 Access Tokens

The access token is used to authenticate normal protected API requests.

Access tokens should:

- Have a relatively short lifetime.
- Be cryptographically signed and verifiable by the backend.
- Be stored in an HTTP-only cookie.
- Not be accessible to client-side JavaScript.
- Identify the authenticated YumYard user.

The exact token format, claims, signing algorithm, and lifetime will be defined during implementation.

### 12.4 Refresh Tokens

Refresh tokens provide continued authentication after an access token expires.

Refresh tokens should:

- Have a longer lifetime than access tokens.
- Be stored in an HTTP-only cookie.
- Not be accessible to client-side JavaScript.
- Be used only for obtaining new access tokens.
- Support refresh-token rotation.

The exact refresh-token revocation and rotation mechanism will be finalized during the security implementation.

The architecture does not require a traditional server-side session store.

### 12.5 Browser Storage

Authentication tokens must not be stored in `localStorage`, `sessionStorage`, or other JavaScript-accessible browser storage.

HTTP-only cookies are used so that authentication credentials are not directly accessible to client-side JavaScript.

Client-side application state may still exist for temporary UI purposes, but it must not become the authoritative authentication state or persistent application data store.

### 12.6 Cookie Security

Authentication cookies must use appropriate security attributes.

The production configuration should use:

- `HttpOnly`
- `Secure`
- Appropriate `SameSite` configuration
- Appropriate cookie scope

The exact cookie configuration depends on the final deployment topology and frontend/API domains.

Where practical, the production system should use related domains such as:

```text
www.yumyard.com
api.yumyard.com
admin.yumyard.com
```

This keeps the frontend and backend within the same site while allowing them to remain separate origins.

### 12.7 Cross-Origin Requests

The consumer application and API may operate on different origins.

For example:

```text
https://www.yumyard.com
https://api.yumyard.com
```

The backend must explicitly configure CORS to allow the trusted consumer application origin.

Credentialed requests must be supported so that authentication cookies can be sent with API requests.

The backend must not use a permissive wildcard origin for credentialed authentication requests.

### 12.8 CSRF Protection

Because authentication credentials are automatically sent through cookies, state-changing operations must be protected against Cross-Site Request Forgery (CSRF).

Operations such as:

- Creating recipes.
- Updating recipes.
- Deleting recipes.
- Saving recipes.
- Submitting ratings/reviews.
- Changing recipe visibility.

must use an appropriate CSRF protection strategy.

The exact mechanism will be determined during the security implementation.

### 12.9 Authentication Flow

A typical email/password authentication flow is:

```text
User
  ↓
Submit credentials
  ↓
Backend validates credentials
  ↓
YumYard User identified
  ↓
Access + Refresh tokens issued
  ↓
Tokens stored in HTTP-only cookies
  ↓
Authenticated session established
```

Google OAuth follows the provider's OAuth flow:

```text
User
  ↓
Continue with Google
  ↓
Google Authentication
  ↓
Google Callback
  ↓
Identify or establish YumYard User
  ↓
Access + Refresh tokens issued
  ↓
Tokens stored in HTTP-only cookies
```

### 12.10 Account Linking

Email/password and Google OAuth must resolve to the same YumYard identity when they represent the same user account.

The authentication system must avoid unintentionally creating duplicate YumYard accounts for the same verified email identity.

Account-linking behavior must be handled explicitly and securely.

### 12.11 Authorization

Authorization determines whether an authenticated identity is permitted to perform a particular operation.

Authorization is enforced by the backend.

The frontend may hide or disable actions based on the user's state, but frontend restrictions are not considered security controls.

For example:

```text
Authenticated User
        ↓
Request to edit Recipe
        ↓
Backend identifies User
        ↓
Backend checks Recipe ownership
        ↓
┌───────────────┴───────────────┐
│                               │
Owns Recipe                 Does not own
│                               │
▼                               ▼
Allow                         Deny
```

### 12.12 Ownership Authorization

Recipe ownership is enforced independently of authentication method.

A user may:

- Edit their own recipes.
- Delete their own recipes.
- Publish their own drafts.
- Change the visibility of their own recipes.

A user may not:

- Edit another user's recipes.
- Delete another user's recipes.
- Publish another user's drafts.
- Change another user's recipe visibility.
- Access another user's private or draft recipes.

### 12.13 Resource Visibility Authorization

The backend must enforce recipe visibility.

```text
Draft
  → Owner only

Published
  → Public

Private
  → Owner only

Soft Deleted
  → Unavailable through normal product access
```

Public recipe access does not require authentication.

Private and draft recipe access requires the appropriate ownership authorization.

### 12.14 Admin Authorization

Admin operations require an authenticated YumYard identity with the appropriate administrative role.

The Admin interface must not rely on its separate UI to enforce administrative permissions.

The backend must independently verify administrative authorization for every protected administrative operation.

### 12.15 Authentication and Authorization Boundary

Authentication and authorization remain separate concerns.

```text
Authentication
      ↓
Who is this?
      ↓
YumYard User
      ↓
Authorization
      ↓
What can this User do?
      ↓
Application Operation
```

An authenticated user is not automatically authorized to access every resource.

### 12.16 Authentication State

The backend is the authority for determining whether a request is authenticated.

The frontend may maintain derived authentication state for user experience, but it must be able to recover the current authentication state from the backend.

Authentication state must not depend on persistent client-side storage.

### 12.17 Security Principles

The authentication and authorization architecture follows these principles:

- Authentication credentials are not stored in `localStorage`.
- Authentication tokens are not directly accessible to client-side JavaScript.
- Authorization is enforced on the backend.
- Ownership checks are enforced on the backend.
- Private and draft resources are protected on the backend.
- Administrative operations require backend authorization.
- External authentication providers do not become the source of truth for YumYard user relationships.
- Credentialed cross-origin requests are explicitly restricted to trusted origins.
- State-changing cookie-authenticated requests require CSRF protection.
- Authentication secrets and provider credentials are never exposed to the frontend.

## 13. External Services

YumYard relies on external services for capabilities that are better provided outside the core application.

External services are treated as dependencies of the system. YumYard remains responsible for its own application data, business rules, relationships, and authorization regardless of which external provider supplies a particular capability.

### 13.1 External Service Principles

External services should be used for capabilities that provide clear value without unnecessarily transferring ownership of YumYard's application logic or data.

The architecture follows these principles:

- External services must have a clearly defined responsibility.
- YumYard remains the source of truth for its own application data.
- External providers must not define YumYard's domain relationships.
- Provider-specific implementation details should remain isolated from unrelated application logic.
- External credentials and secrets must remain server-side.
- External service failures must be handled without exposing provider-specific implementation details to users where possible.
- Providers should be replaceable where practical without requiring changes throughout the application.

### 13.2 Google OAuth

Google OAuth is used as an authentication provider.

Its responsibility is limited to authenticating a user through their Google identity.

Google OAuth provides:

- User authentication.
- Provider-specific identity information required to establish or identify the corresponding YumYard account.

Google OAuth does not own or manage:

- YumYard user relationships.
- Recipe ownership.
- Saved recipes.
- Ratings.
- Reviews.
- Recipe permissions.

The backend translates successful Google authentication into the corresponding YumYard User identity.

### 13.3 Image Storage

Recipe images are stored outside the application server using an external image-storage service.

The image-storage service is responsible for:

- Storing recipe image files.
- Retrieving stored image files.
- Providing access to stored images.

YumYard is responsible for:

- Associating an image with a recipe.
- Maintaining the image reference.
- Controlling which application resources can use the image.
- Managing image-related application behavior.

The image binary is not stored in PostgreSQL.

Conceptually:

```text
Recipe
  │
  └── Image Reference
          │
          ▼
   External Image Storage
          │
          ▼
      Image File
```

The specific image-storage provider has not yet been finalized.

The provider should support the application's expected storage, retrieval, and deployment requirements.

### 13.4 Database

PostgreSQL is the primary persistent data store for YumYard.

Although PostgreSQL is an external infrastructure component from the application server's perspective, it is considered part of the core YumYard system's data infrastructure rather than a third-party business service.

PostgreSQL is responsible for:

- Persistent application data.
- Relational data integrity.
- Referential integrity.
- Database-level constraints.
- Transactional operations.

The backend remains the only application layer responsible for accessing the database.

The consumer application and Admin interface must not connect directly to PostgreSQL.

### 13.5 Deployment Infrastructure

YumYard is intended to be deployed on AWS as part of the project's learning objectives.

AWS will provide infrastructure capabilities such as:

- Application hosting.
- Database hosting.
- Image storage where appropriate.
- Networking.
- Security controls.
- Domain and HTTPS infrastructure where applicable.

The exact AWS services and deployment topology will be defined in the Deployment Architecture section.

The application architecture must not depend on a specific AWS service unless that dependency provides a deliberate architectural benefit.

### 13.6 External Service Failure

External service failures must be isolated from unrelated application functionality where practical.

Examples:

```text
Google OAuth unavailable
        ↓
Google authentication unavailable
        ↓
Existing authenticated users may still use
capabilities that do not require re-authentication
```

```text
Image storage unavailable
        ↓
Image upload/retrieval may fail
        ↓
Unrelated recipe metadata operations
should remain independent where practical
```

The exact failure-handling behavior will be defined as part of the application's error-handling and reliability design.

### 13.7 External Service Credentials

Credentials required to communicate with external services must:

- Remain on the server side.
- Never be exposed to the consumer application.
- Never be committed to source control.
- Be provided through environment or secret-management mechanisms.
- Be separated between development and production environments where appropriate.

Examples include:

- Google OAuth client secrets.
- Image-storage credentials.
- Database credentials.
- AWS credentials or service-role configuration.

### 13.8 Provider Abstraction

External integrations should expose application-level capabilities rather than allowing provider-specific details to spread throughout the application.

For example, application logic should conceptually request:

```text
Store Recipe Image
        ↓
Image Storage Integration
        ↓
Configured Provider
```

rather than directly depending on provider-specific APIs throughout recipe-related code.

This allows the storage provider to be changed with limited impact on the rest of the application.

### 13.9 Current External Dependencies

The current external dependencies are:

| Dependency    | Responsibility                | Status                    |
| ------------- | ----------------------------- | ------------------------- |
| Google OAuth  | User authentication           | Decided                   |
| Image Storage | Recipe image storage          | Provider not yet selected |
| PostgreSQL    | Persistent application data   | Decided                   |
| AWS           | Deployment and infrastructure | Target platform           |

## 14. Non-Functional Requirements

Non-functional requirements define the quality attributes and operational expectations of YumYard.

These requirements describe how the system should behave rather than defining individual product features.

The requirements are intentionally appropriate for a V1 application and may be strengthened as actual usage and operational requirements become clearer.

### 14.1 Performance

The application should provide a responsive experience for expected V1 usage.

Requirements:

- Public recipe pages should load without unnecessary requests.
- Recipe discovery should avoid unnecessary database queries.
- API endpoints should return within a reasonable response time under expected V1 load.
- Database queries should retrieve only the data required by the operation.
- Large recipe collections should use pagination or another appropriate limiting strategy.
- Images should be optimized and served efficiently.
- The frontend should avoid unnecessary rendering and network requests.

Performance should be measured using actual application behavior rather than premature optimization.

### 14.2 Security

Security is required at both the application and infrastructure levels.

Requirements:

- Authentication credentials must be handled securely.
- Authentication tokens must not be stored in `localStorage`.
- Authentication tokens must use HTTP-only cookies.
- Passwords must never be stored in plaintext.
- Passwords must be securely hashed using an appropriate password-hashing algorithm.
- Authorization must be enforced by the backend.
- Ownership checks must be enforced by the backend.
- Draft and private recipes must not be exposed to unauthorized users.
- Administrative operations must require appropriate authorization.
- State-changing cookie-authenticated requests must have CSRF protection.
- API inputs must be validated on the backend.
- Database queries must use safe parameterization through the database access layer.
- Secrets must not be committed to source control.
- Production credentials must not be exposed to the frontend.
- HTTPS must be used in production.
- External service credentials must remain server-side.

Security requirements may be strengthened as the application evolves.

### 14.3 Reliability

The system should behave predictably when individual operations fail.

Requirements:

- Failed requests should return appropriate errors.
- The frontend should present useful feedback for failed operations.
- Failed draft autosave operations should not silently appear successful.
- Database failures should not result in misleading successful responses.
- External service failures should be isolated where practical.
- Invalid requests should not corrupt persistent data.
- Operations that modify related data should use appropriate transactional behavior where required.

The system should favor data correctness over silently accepting partially completed operations.

### 14.4 Data Integrity

Persistent data must remain consistent with the business rules.

Requirements:

- Recipe ownership must remain valid.
- Saved recipes must not contain duplicate User/Recipe relationships.
- Ratings/reviews must not contain duplicate User/Recipe relationships.
- Recipe references must point to valid reference data.
- Soft-deleted recipes must remain distinguishable from active recipes.
- Required data must satisfy the appropriate database constraints.
- Related records must maintain referential integrity.
- Business-critical invariants should be protected at the database level where practical.

Application validation and database constraints should work together to protect data integrity.

### 14.5 Scalability

YumYard V1 does not require large-scale distributed architecture.

The initial architecture should support reasonable growth without unnecessary complexity.

The system should be designed so that common scaling techniques can be introduced later, including:

- Horizontal backend scaling.
- Database indexing and optimization.
- Caching.
- CDN usage.
- Background processing.
- Image optimization.
- Database read optimization.

Microservices are not required for V1.

The modular monolith should remain the default architecture until actual requirements justify separating a capability into an independently deployed service.

### 14.6 Availability

YumYard should remain available during normal operation and should avoid unnecessary single points of failure where practical within the V1 infrastructure budget.

The V1 architecture does not require an enterprise-level availability target.

Availability improvements should be introduced according to actual requirements and deployment constraints.

The application should:

- Fail gracefully when possible.
- Avoid exposing internal infrastructure errors to users.
- Provide meaningful error states when a dependency is unavailable.
- Recover normally after transient failures where practical.

### 14.7 Maintainability

The system should be easy to understand, modify, and extend.

Requirements:

- Backend modules should have clear responsibilities.
- Business logic should not be duplicated across interfaces.
- Frontend and backend responsibilities should remain separated.
- Data-access concerns should remain separated from presentation concerns.
- External integrations should have clear boundaries.
- Important architectural decisions should be documented.
- Significant deviations from the architecture should be recorded.
- Code should favor clarity over unnecessary abstraction.

The architecture should make it possible for a developer unfamiliar with the project to understand the major system boundaries and responsibilities.

### 14.8 Testability

The application should be structured so that important behavior can be tested independently.

Testing should prioritize:

- Business rules.
- Authorization.
- Recipe lifecycle transitions.
- Recipe ownership.
- Authentication flows.
- Saved-recipe uniqueness.
- Rating/review uniqueness.
- API behavior.
- Critical database operations.

The exact testing strategy and tooling will be defined separately.

### 14.9 Observability

The system should provide enough information to understand failures and operational behavior.

The backend should provide appropriate:

- Application logs.
- Error logs.
- Request information.
- Authentication and authorization failure information.
- External-service failure information.

Sensitive information such as:

- Passwords.
- Authentication tokens.
- Secrets.
- Private user information.

must not be written to logs.

More advanced observability such as distributed tracing and extensive metrics is not required for V1 unless actual deployment needs justify it.

### 14.10 Accessibility

The consumer application should follow reasonable accessibility practices.

The frontend should:

- Use semantic HTML.
- Provide accessible form controls.
- Support keyboard navigation where applicable.
- Provide meaningful labels and accessible names.
- Maintain sufficient visual contrast.
- Communicate important validation and error states.
- Avoid relying solely on color to communicate information.

Accessibility should be considered during feature implementation rather than treated as a final-stage task.

### 14.11 Deployment Independence

The application should avoid unnecessary coupling to a specific deployment environment.

Although AWS is the intended deployment platform, application code should remain reasonably portable where practical.

Infrastructure-specific behavior should be isolated to infrastructure configuration and integration boundaries.

The application should not rely on local development assumptions that are unavailable in production.

### 14.12 Development and Production Separation

Development and production environments must be separated.

They should use separate:

- Database environments.
- Authentication credentials.
- External service credentials.
- Configuration values.
- Deployment resources.

Production data must not be unintentionally modified by local development activity.

### 14.13 Configuration Management

Configuration that varies between environments must not be hardcoded into application source code.

Examples include:

- Database connection information.
- OAuth credentials.
- Image-storage credentials.
- Cookie configuration.
- API URLs.
- Environment-specific security settings.

Environment configuration and secret management will be defined further in the Deployment Architecture section.

### 14.14 Non-Functional Requirement Principle

Non-functional requirements should evolve based on actual system needs.

The V1 architecture intentionally avoids premature requirements that would introduce unnecessary infrastructure or development complexity.

When the application gains real usage or new operational requirements, these requirements should be reviewed and updated accordingly.

## 15. API Architecture

The YumYard backend exposes a REST-style HTTP API for communication between the consumer application and the backend.

The API acts as a contract between clients and the application layer.

The API must expose application capabilities without exposing the internal database schema or implementation details.

### 15.1 API Style

YumYard V1 uses a REST-style HTTP API.

The API is organized around application resources and operations.

The API should:

- Use standard HTTP methods.
- Use meaningful resource-oriented URLs.
- Use appropriate HTTP status codes.
- Return predictable response structures.
- Validate incoming requests.
- Enforce authentication and authorization on the backend.
- Avoid exposing database implementation details.
- Remain independent of the React application's internal implementation.

GraphQL is not required for V1.

### 15.2 API Boundary

The consumer application communicates with the backend through the API.

```text
React Consumer Application
          │
          │ HTTP
          ▼
     Express API
          │
          ▼
 Application Logic
          │
          ▼
     Data Access
          │
          ▼
      PostgreSQL
```

The React application must not communicate directly with PostgreSQL or other protected backend infrastructure.

### 15.3 Resource-Oriented Design

API endpoints should represent application resources rather than directly mirroring database tables.

Examples of conceptual resources include:

- Recipes.
- Users.
- Saved recipes.
- Ratings/reviews.
- Categories.
- Cuisines.
- Recipe types.

The exact endpoint structure will be defined during implementation.

### 15.4 HTTP Methods

The API should use HTTP methods according to the intended operation.

| Method   | Purpose                                                            |
| -------- | ------------------------------------------------------------------ |
| `GET`    | Retrieve data                                                      |
| `POST`   | Create a resource or perform a creation/action operation           |
| `PATCH`  | Partially update an existing resource                              |
| `PUT`    | Replace a resource when full replacement semantics are appropriate |
| `DELETE` | Delete or soft-delete a resource                                   |

The API should prefer the simplest appropriate method for each operation.

### 15.5 Authentication

Authentication is handled using HTTP-only cookies containing the access and refresh tokens defined in the Authentication & Authorization architecture.

The frontend does not directly read or manage authentication tokens.

Conceptually:

```text
Browser
  │
  ├── HTTP-only Access Token Cookie
  └── HTTP-only Refresh Token Cookie
            │
            ▼
       Express API
```

Protected requests are authenticated by the backend using the credentials provided by the browser.

### 15.6 Authorization

Authentication and authorization are separate API concerns.

A request may be authenticated but still unauthorized to access a particular resource.

For protected operations, the backend must:

1. Identify the YumYard User.
2. Determine the requested resource.
3. Verify the user's permission to perform the operation.
4. Allow or deny the operation.

The API must not rely on client-provided ownership information as proof of authorization.

For example, a request attempting to update a recipe must use the authenticated user's identity when determining ownership rather than trusting a user ID supplied by the client.

### 15.7 Public and Protected APIs

The API contains both public and authenticated operations.

Public operations include capabilities such as:

- Browsing published recipes.
- Searching recipes.
- Filtering recipes.
- Viewing publicly available recipe details.

Authenticated operations include capabilities such as:

- Saving recipes.
- Creating recipes.
- Managing drafts.
- Publishing recipes.
- Editing owned recipes.
- Changing recipe visibility.
- Deleting owned recipes.
- Rating recipes.
- Reviewing recipes.
- Accessing personal library data.

The exact authentication requirement for each endpoint will be defined when the endpoint catalog is created.

### 15.8 Request Validation

All API input must be validated on the backend.

Validation should cover:

- Request body.
- URL parameters.
- Query parameters.
- Required fields.
- Data types.
- Allowed values.
- Field constraints.
- Operation-specific rules.

Frontend validation may provide faster user feedback but does not replace backend validation.

Invalid requests must not reach application operations that require valid input.

### 15.9 Request and Response Data

API request and response structures should represent application concepts rather than directly exposing database models.

The backend should control:

- Which fields are accepted.
- Which fields are returned.
- Which fields are writable.
- Which fields are internal.
- How related data is represented.

Database-specific fields or internal implementation details should not be exposed unless they are intentionally part of the API contract.

### 15.10 Response Structure

Successful API responses should use a consistent structure appropriate to the operation.

Responses should clearly communicate:

- Whether the operation succeeded.
- The resulting resource or data where applicable.
- Pagination information where applicable.
- Any additional metadata intentionally exposed by the API.

The exact response envelope will be defined during API implementation.

The API should avoid creating different response conventions for every endpoint without a clear reason.

### 15.11 Error Handling

API errors should use appropriate HTTP status codes and predictable error responses.

Common categories include:

| Status | Meaning                                      |
| ------ | -------------------------------------------- |
| `400`  | Invalid request                              |
| `401`  | Authentication required or invalid           |
| `403`  | Authenticated but not authorized             |
| `404`  | Resource not found or unavailable            |
| `409`  | Resource conflict                            |
| `422`  | Semantically invalid input where appropriate |
| `429`  | Rate limit exceeded where applicable         |
| `500`  | Unexpected server error                      |

The exact status code used should reflect the semantics of the failure.

Error responses should provide enough information for the client to respond appropriately without exposing sensitive internal implementation details.

### 15.12 Not Found and Unavailable Resources

The API must not expose private implementation details when a resource is unavailable.

For example, requests for:

- Deleted recipes.
- Private recipes belonging to another user.
- Drafts belonging to another user.

must not reveal information that would allow an unauthorized client to determine protected resource details.

The exact distinction between `404` and `403` will be determined according to the security requirements of each resource.

### 15.13 Pagination

Endpoints returning potentially large collections should use pagination.

Pagination applies particularly to:

- Recipe discovery.
- Search results.
- Reviews.
- Saved recipes.
- User-owned recipes.
- Administrative listings.

The API should avoid returning unbounded collections.

The exact pagination strategy will be finalized during implementation.

### 15.14 Filtering and Search

Discovery-related filtering and search parameters should be provided through query parameters.

Conceptually:

```text
GET /recipes?category=...&cuisine=...&difficulty=...
```

The API should define supported filters explicitly rather than accepting arbitrary database fields.

Initial discovery filters include:

- Category.
- Cuisine.
- Recipe type.
- Cooking time.
- Difficulty.

Search behavior and supported search parameters will be defined as part of the Discovery API.

### 15.15 Sorting

Collection endpoints may support explicit sorting where required.

Sorting options should be defined by the application rather than allowing clients to provide arbitrary database fields or expressions.

For example, the API may eventually support concepts such as:

- Newest.
- Recently updated.
- Most viewed.
- Highest rated.

Only supported sorting options should be accepted.

### 15.16 API Versioning

The API should have a clear versioning strategy.

V1 will initially use a versioned API namespace so that future incompatible changes can be introduced without silently breaking existing clients.

Conceptually:

```text
/api/v1/...
```

The exact routing implementation will be finalized during backend implementation.

### 15.17 Idempotency

Operations should have predictable behavior when requests are repeated.

Where the underlying operation should be unique, database constraints must protect the invariant.

Examples include:

```text
(userId, recipeId)
```

being unique for:

- Saved recipes.
- Rating/review relationships.

The API should not rely solely on the frontend to prevent duplicate requests.

Additional idempotency mechanisms may be introduced for operations where repeated requests could cause undesirable side effects.

### 15.18 Draft Autosave API

Draft autosave is a special update flow.

The frontend may send draft changes after a debounce period.

```text
User changes draft
      ↓
Frontend debounce
      ↓
Draft update request
      ↓
Backend authentication
      ↓
Ownership check
      ↓
Validation
      ↓
Persist draft
```

Autosave applies to drafts only.

Published recipe editing uses an explicit update operation rather than autosave.

### 15.19 Published Recipe Update

Updating a published recipe requires an explicit user action.

```text
User edits recipe
      ↓
Local client state
      ↓
User clicks Update
      ↓
API request
      ↓
Authentication
      ↓
Ownership authorization
      ↓
Validation
      ↓
Persist changes
      ↓
Update updatedAt
```

The API must not persist published recipe changes merely because the user changed a frontend form field.

### 15.20 API and Admin Interface

The Admin interface uses the same backend application and business logic but may use server-rendered HTML and HTMX rather than consuming the public JSON API in exactly the same way as the React application.

The Admin interface must still use the same:

- Authentication rules.
- Authorization rules.
- Business rules.
- Data access layer.
- Database.

Administrative presentation concerns must not duplicate domain logic.

### 15.21 API Security Principles

The API must follow these principles:

- Never trust client-provided ownership information.
- Authenticate protected requests on the backend.
- Authorize protected operations on the backend.
- Validate all external input.
- Do not expose secrets or internal credentials.
- Do not expose unnecessary database implementation details.
- Use secure transport in production.
- Protect cookie-authenticated state-changing operations against CSRF.
- Apply appropriate rate limiting where required.
- Return safe errors without exposing internal stack traces or sensitive information.

### 15.22 API Documentation

The API contract should be documented as the implementation develops.

Documentation should eventually describe:

- Endpoint.
- HTTP method.
- Authentication requirement.
- Request parameters.
- Request body.
- Response structure.
- Possible errors.
- Authorization requirements.
- Pagination/filtering behavior where applicable.

The API documentation must remain consistent with the implemented backend behavior.

## 16. Frontend Architecture

The YumYard consumer application is built with React and TypeScript.

The frontend is responsible for presenting the product, managing user interaction, maintaining temporary client-side state, and communicating with the backend.

The backend remains the authoritative source of application data and business rules.

### 16.1 Frontend Responsibilities

The React application is responsible for:

- Rendering the user interface.
- Managing navigation.
- Managing temporary UI state.
- Managing form state.
- Providing client-side validation and feedback.
- Communicating with the backend API.
- Displaying server data.
- Handling loading, empty, and error states.
- Providing responsive interactions.

The frontend must not be responsible for authoritative persistence or security enforcement.

### 16.2 Frontend Organization

The frontend should be organized primarily around product capabilities rather than one large collection of technical components.

The conceptual structure is:

```text
Frontend
├── Discovery
├── Recipes
├── Reviews & Ratings
├── Personal Library
├── Authentication
└── Shared
```

Each feature may contain the components, hooks, API interactions, types, and other client-side logic required for that capability.

The exact folder structure is an implementation detail and may evolve as the application grows.

### 16.3 Shared UI

Shared UI contains reusable presentation components that are not specific to one business domain.

Examples include:

- Buttons.
- Inputs.
- Modals.
- Dialogs.
- Cards.
- Form controls.
- Loading indicators.
- Error states.
- Layout components.
- Navigation components.

Shared UI components should remain presentation-focused.

Business-specific behavior should remain within the relevant feature.

### 16.4 Routing

The React application uses client-side routing for navigation between application views.

Routes should correspond to meaningful product experiences rather than internal implementation details.

Examples include:

- Recipe discovery.
- Recipe detail.
- Login.
- Registration.
- Personal Library.
- Recipe creation.
- Recipe editing.

Protected routes may require an authenticated user.

However, frontend route protection is primarily a user-experience mechanism.

The backend must independently enforce authorization for protected operations and resources.

### 16.5 Server State

Server state represents data owned and persisted by the backend.

Examples include:

- User information.
- Recipes.
- Drafts.
- Saved recipes.
- Ratings.
- Reviews.
- Categories.
- Cuisines.
- Recipe types.

The backend is the authoritative source for this data.

The frontend may temporarily cache or derive server data for performance and user experience, but such data must not become the authoritative source of truth.

### 16.6 Client and UI State

Client state represents temporary state required to provide the user experience.

Examples include:

- Modal visibility.
- Selected tabs.
- Temporary form values.
- Open menus.
- Loading indicators.
- Temporary validation state.
- Local filter selections before applying them.
- Unsaved edits to a published recipe.

Client state does not automatically become persistent application data.

### 16.7 Persistent Client Storage

Browser storage must not be used as a substitute for backend persistence.

The following must not rely on `localStorage` as their source of truth:

- Recipes.
- Drafts.
- Saved recipes.
- Ratings.
- Reviews.
- Users.
- Ownership information.
- Recipe visibility.
- Other persistent application data.

Client-side persistent storage may be used when a requirement is genuinely local to the browser or device.

Any such use must have a clear purpose and must not conflict with the backend as the authoritative source.

### 16.8 API Communication

The frontend communicates with the backend through the API defined in the API Architecture.

Feature-specific API interactions should remain close to the feature that uses them rather than being scattered throughout unrelated UI components.

Conceptually:

```text
Feature
   ↓
API Interaction
   ↓
Express Backend
   ↓
Application Logic
   ↓
Database / External Services
```

UI components should not directly contain database or backend implementation details.

### 16.9 Forms

Forms should maintain temporary input state while the user is interacting with them.

The frontend may perform client-side validation to provide immediate feedback.

However, the backend must always perform authoritative validation.

```text
User Input
    ↓
Client-side Validation
    ↓
API Request
    ↓
Backend Validation
    ↓
Application Operation
```

Client-side validation improves user experience but does not provide security or data-integrity guarantees.

### 16.10 Recipe Editor

The recipe editor behaves differently depending on the recipe lifecycle state.

#### Draft Editor

Draft editing uses debounced autosave.

```text
User changes draft
      ↓
React form state
      ↓
Debounce
      ↓
Autosave API request
      ↓
Backend validation
      ↓
Draft persisted
```

The latest persisted draft remains available independently of the browser session.

#### Published Recipe Editor

Published recipe editing does not use autosave.

```text
Published Recipe
      ↓
Edit
      ↓
React form state
      ↓
User modifies recipe
      ↓
Local unsaved changes
      ↓
Click Update
      ↓
API request
      ↓
Backend validation
      ↓
Recipe updated
```

Leaving the editor or cancelling before the update is submitted discards the unsaved changes.

### 16.11 Recipe Discovery

The Discovery feature is responsible for presenting recipe search, filtering, and browsing.

The frontend manages:

- Search input.
- Selected filters.
- Pagination state.
- Loading state.
- Empty results.
- Error state.
- Recipe result presentation.

The backend remains responsible for performing the actual search and filtering against authoritative recipe data.

The frontend must not download the entire recipe collection and perform discovery filtering as the authoritative mechanism.

### 16.12 Recipe Detail

The Recipe Detail experience presents the information returned by the backend.

It may include:

- Recipe information.
- Ingredients.
- Instructions.
- Serving information.
- Cooking information.
- Ratings.
- Reviews.
- View count.
- Save action.
- Recipe ownership actions where applicable.

The frontend should derive presentation state from the server response and authenticated user context.

### 16.13 Authentication State

The browser does not directly manage authentication tokens.

Authentication credentials are stored in HTTP-only cookies and are therefore inaccessible to JavaScript.

The frontend may maintain derived authentication state such as:

```text
Authenticated
Unauthenticated
Loading
```

The frontend should obtain or refresh this state through communication with the backend.

Authentication state must not depend on reading a token from `localStorage`.

### 16.14 Personal Library

The Personal Library consumes authenticated server data.

It presents:

- Saved recipes.
- User-owned recipes.
- Drafts.
- Published recipes.

The frontend does not independently maintain the authoritative contents of the library.

Operations such as saving or removing a recipe must be persisted through the backend.

### 16.15 Ratings and Reviews

The rating/review interface maintains temporary form state while the user is preparing a submission.

```text
Select Rating
      ↓
Optional Review
      ↓
Local Form State
      ↓
Submit
      ↓
Backend
      ↓
Persist Rating/Review
```

The backend determines whether the operation is valid.

The frontend presents the resulting state returned by the backend.

### 16.16 Loading, Empty, and Error States

Features should explicitly handle:

- Initial loading.
- Subsequent loading.
- Empty results.
- Validation errors.
- Authentication errors.
- Authorization errors.
- Not-found resources.
- Network failures.
- Unexpected server errors.

The frontend should present user-friendly messages rather than exposing raw backend errors.

### 16.17 Optimistic Updates

Optimistic UI updates may be used for simple interactions where the expected result is highly predictable.

Examples may include:

- Toggling a save state.
- Other lightweight UI interactions.

Optimistic updates must not replace backend persistence.

If the backend operation fails, the frontend must reconcile its state with the authoritative server state.

Optimistic behavior should not be used where an operation has significant validation or authorization complexity unless there is a clear user-experience benefit.

### 16.18 Frontend Security Boundary

The frontend is considered an untrusted client.

It must not be relied upon to enforce:

- Ownership.
- Authorization.
- Recipe visibility.
- Administrative permissions.
- Data integrity.
- Authentication security.

The backend must independently enforce these requirements.

### 16.19 TypeScript

TypeScript is used throughout the frontend.

Types should represent application-facing data and frontend contracts.

Frontend types should not require direct knowledge of the internal Prisma schema.

If the backend API representation changes, the frontend API contract should be updated accordingly rather than coupling the frontend directly to database models.

### 16.20 Frontend Architecture Principle

The frontend should remain responsible for **presentation and interaction**, while the backend remains responsible for **authoritative application behavior and persistence**.

```text
Frontend
  ↓
Presentation + Interaction + Temporary State
  ↓
API
  ↓
Backend
  ↓
Business Rules + Authorization + Persistence
```

This boundary should remain intact as the application grows.

## 17. Backend Architecture

The YumYard backend is an Express application written in TypeScript.

It follows a modular monolith architecture in which business capabilities are organized into logical modules while running within a single application.

The backend is responsible for HTTP communication, authentication, authorization, application logic, persistence, and external service integration.

### 17.1 Backend Responsibilities

The backend is the authoritative application layer.

Its responsibilities include:

- Handling HTTP requests.
- Authentication.
- Authorization.
- Request validation.
- Business rules.
- Application operations.
- Data access.
- Database transactions.
- External service integration.
- Error handling.
- Persistent application data management.

The backend must not rely on the frontend to enforce security or business-critical rules.

### 17.2 Backend Module Structure

The backend is organized around product domains and supporting capabilities.

The conceptual structure is:

```text
Backend
├── Discovery
├── Recipes
├── Reviews & Ratings
├── Personal Library
├── Identity & Authentication
├── Authorization
├── Admin
└── Shared Infrastructure
```

These modules are part of one backend application.

They are not independently deployed services.

Each module should own the behavior and application operations associated with its responsibility.

### 17.3 Internal Module Structure

Modules may contain internal layers according to their needs.

A typical module may conceptually contain:

```text
Module
├── Routes
├── Controllers
├── Application / Domain Logic
├── Validation
├── Repository / Data Access
└── Types
```

Not every module is required to contain every layer.

The architecture favors meaningful separation of responsibility over uniform file structures.

A simple operation should not require unnecessary abstractions.

### 17.4 Request Lifecycle

A typical request follows this flow:

```text
HTTP Request
     ↓
Express Middleware
     ↓
Route
     ↓
Controller
     ↓
Validation
     ↓
Application / Domain Logic
     ↓
Repository / Data Access
     ↓
Prisma
     ↓
PostgreSQL
     ↓
Response
```

Protected requests additionally pass through authentication and authorization.

```text
HTTP Request
     ↓
Authentication
     ↓
Authorization
     ↓
Validation
     ↓
Application / Domain Logic
     ↓
Data Access
```

The exact middleware ordering may vary depending on the operation.

### 17.5 Express Application

Express provides the HTTP application layer.

Its responsibilities include:

- Registering middleware.
- Registering routes.
- Receiving HTTP requests.
- Passing requests through the appropriate processing pipeline.
- Returning HTTP responses.
- Handling HTTP-level errors.

Express should not contain the application's core business logic.

### 17.6 Middleware

Middleware handles cross-cutting HTTP concerns.

Examples include:

- Authentication.
- Authorization.
- Request parsing.
- CORS.
- Security headers.
- Request logging.
- Rate limiting where required.
- Error handling.

Middleware should remain focused on concerns that are naturally cross-cutting.

Business-specific operations should remain in the appropriate application module.

### 17.7 Routes

Routes map HTTP requests to application operations.

Responsibilities include:

- Defining HTTP methods.
- Defining URL paths.
- Applying relevant middleware.
- Connecting requests to controllers.

Routes should remain thin.

They should not contain substantial business logic or direct database operations.

### 17.8 Controllers

Controllers translate between HTTP and application operations.

Responsibilities include:

- Reading request information.
- Receiving validated input.
- Calling application logic.
- Returning HTTP responses.
- Mapping known application errors to appropriate HTTP responses.

Controllers should not become the primary location for business rules.

For example, a recipe controller should not independently determine whether the current user owns a recipe by implementing ownership rules itself.

That behavior belongs to the application/domain logic and authorization boundary.

### 17.9 Validation

Backend validation ensures that incoming data satisfies the requirements of the requested operation.

Validation applies to:

- Request bodies.
- URL parameters.
- Query parameters.
- Authentication input.
- Recipe data.
- Search and filtering parameters.
- Other externally supplied values.

Validation should happen before application operations are executed.

Frontend validation may exist for user experience, but backend validation remains authoritative.

### 17.10 Application and Domain Logic

Application and domain logic contains the behavior that makes YumYard work.

Examples include:

- Creating a recipe.
- Updating a draft.
- Publishing a recipe.
- Updating a published recipe.
- Changing recipe visibility.
- Deleting a recipe.
- Saving a recipe.
- Removing a saved recipe.
- Submitting a rating/review.
- Editing a rating/review.
- Determining whether a user can perform an operation.

This logic should not depend on React, HTMX, or a specific HTTP route.

The same business behavior can therefore be used by different interfaces.

### 17.11 Authorization

Authorization is enforced within the backend.

The backend must determine whether the authenticated YumYard User is permitted to perform the requested operation.

For ownership-based operations:

```text
Authenticated User
        ↓
Requested Resource
        ↓
Ownership / Permission Check
        ↓
┌───────────────┴───────────────┐
│                               │
Allowed                       Denied
│                               │
▼                               ▼
Continue                    Reject Request
```

The backend must never trust a user ID supplied by the client as proof of ownership.

The authenticated identity must be used when determining authorization.

### 17.12 Repository and Data Access

The data-access layer is responsible for persistence operations.

It communicates with PostgreSQL through Prisma.

Responsibilities include:

- Querying data.
- Creating records.
- Updating records.
- Soft-deleting records.
- Loading related data.
- Applying database-specific operations.
- Participating in transactions where required.

Application logic should not need to know how Prisma queries are constructed.

### 17.13 Prisma

Prisma is the database access technology used by the backend.

The backend communicates with PostgreSQL through Prisma rather than allowing individual controllers or frontend code to directly access the database.

Prisma is responsible for providing the application with a typed interface to the database.

Prisma-specific implementation details should remain within the data-access boundary where practical.

### 17.14 Database Transactions

Database transactions should be used when multiple database operations must succeed or fail together to preserve consistency.

Examples may include:

- Publishing a recipe when multiple related records must be updated together.
- Creating related records that must remain consistent.
- Operations involving multiple changes where partial completion would violate an application invariant.

Transactions should not be introduced merely because an operation performs more than one query.

They should be used when atomicity is actually required.

### 17.15 External Service Integrations

External services are accessed through dedicated integration boundaries.

Examples include:

- Google OAuth.
- Image storage.

Conceptually:

```text
Application Logic
      ↓
Integration Boundary
      ↓
External Provider
```

Application modules should not spread provider-specific API calls throughout their business logic.

This keeps provider-specific implementation isolated and makes future provider changes easier.

### 17.16 Authentication Integration

The authentication module is responsible for:

- Email/password authentication.
- Password verification.
- Google OAuth flow.
- Identifying the YumYard User.
- Creating authentication tokens.
- Refreshing authentication tokens.
- Authentication-related account linking.

Authentication establishes a YumYard User identity.

It does not determine the user's application permissions beyond establishing their identity.

### 17.17 Image Storage Integration

Recipe image storage is handled through an image-storage integration.

The integration is responsible for communicating with the configured storage provider.

Conceptually:

```text
Recipe Operation
      ↓
Image Storage Integration
      ↓
Configured Image Provider
```

The Recipes module should work with an application-level image reference rather than depending directly on provider-specific storage APIs.

### 17.18 Error Handling

Errors should be handled at the appropriate layer.

Application logic should produce meaningful application-level errors.

Controllers and HTTP middleware should translate those errors into appropriate HTTP responses.

Conceptually:

```text
Database / Integration Error
          ↓
Application Error Handling
          ↓
HTTP Error Mapping
          ↓
Safe API Response
```

Unexpected internal errors must not expose:

- Stack traces.
- Database credentials.
- Authentication secrets.
- Internal infrastructure details.

Detailed diagnostic information may be recorded in server-side logs where appropriate.

### 17.19 Module Communication

Modules should communicate through clearly defined application boundaries.

A module should not depend unnecessarily on another module's internal implementation.

For example, the Personal Library module may need to associate a recipe with a user, but it should not directly manipulate internal Recipe module state unless that interaction is explicitly part of the application's design.

Shared concepts should be accessed through appropriate application operations or shared infrastructure rather than uncontrolled cross-module access.

### 17.20 Shared Infrastructure

Shared infrastructure contains technical concerns used across multiple modules.

Examples include:

- Database client configuration.
- Logging.
- Configuration.
- Error types.
- Common HTTP utilities.
- External integration infrastructure.
- Security utilities.

Shared infrastructure must not become a general-purpose dumping ground for unrelated business logic.

Business behavior belongs in the appropriate domain module.

### 17.21 Admin Backend Operations

The Admin interface uses the same backend application and business logic as the consumer application.

Administrative operations may require additional authorization based on the administrator's role.

Conceptually:

```text
Admin Request
      ↓
Authentication
      ↓
Admin Authorization
      ↓
Admin Operation
      ↓
Shared Application / Domain Logic
      ↓
Data Access
```

The Admin interface must not bypass the normal authorization and data-integrity boundaries.

### 17.22 Background Processing

V1 does not require a dedicated background-processing system.

Operations should remain synchronous unless there is a clear requirement for asynchronous processing.

Future candidates for background processing may include:

- Image processing.
- Large media operations.
- Notifications.
- Analytics processing.
- Other long-running tasks.

Background processing should be introduced only when the workload justifies the additional infrastructure.

### 17.23 Backend Security Boundary

The backend is the security boundary for application operations.

The backend must independently enforce:

- Authentication.
- Authorization.
- Ownership.
- Recipe visibility.
- Administrative permissions.
- Input validation.
- Data integrity.
- External-service credential protection.

The frontend and Admin interface are treated as untrusted clients from the perspective of security enforcement.

### 17.24 Backend Architecture Principle

The backend should remain understandable as a set of business modules rather than becoming a collection of unrelated technical layers.

The desired separation is:

```text
                              HTTP Concerns
                                    ↓
                              Routes / Controllers
                                    ↓
                              Application / Domain Behavior
                                    ↓
                              Data Access / Integrations
                                    ↓
                              Infrastructure
```

Each layer should have a clear responsibility.

The architecture should remain as simple as possible while preserving these boundaries.

## 18. Security Architecture

Security is treated as a cross-cutting concern across the YumYard system.

The backend is the primary security boundary and must independently enforce authentication, authorization, input validation, ownership, and access control.

The frontend is considered an untrusted client and must not be relied upon for security enforcement.

### 18.1 Security Principles

YumYard follows these core security principles:

- Never trust client-provided authorization information.
- Enforce authorization on the backend.
- Keep authentication credentials inaccessible to client-side JavaScript.
- Validate all externally supplied input.
- Minimize the amount of sensitive information exposed to clients.
- Keep secrets outside source code.
- Protect data both in transit and at rest where appropriate.
- Give users and administrators only the permissions required for their operations.
- Fail securely when authorization or validation cannot be established.
- Avoid exposing internal implementation details through errors or responses.

### 18.2 Authentication Security

YumYard supports:

- Email/password authentication.
- Google OAuth authentication.

Both authentication methods resolve to a YumYard User identity.

Authentication credentials must be handled by the backend.

Authentication must not rely on:

- `localStorage`.
- `sessionStorage`.
- Client-managed JWT storage.
- Frontend-only authentication checks.

### 18.3 Password Security

Passwords must never be stored in plaintext.

Passwords must be securely hashed using a modern password-hashing algorithm designed for password storage.

The backend must:

- Hash passwords before persistence.
- Verify passwords through the password-hashing mechanism.
- Never return password hashes to clients.
- Never log passwords.
- Never include passwords in API responses.

The exact hashing algorithm and configuration will be finalized during implementation.

### 18.4 OAuth Security

Google OAuth must use the appropriate OAuth flow for the application.

The backend is responsible for:

- Initiating the OAuth flow where applicable.
- Handling the OAuth callback.
- Validating the OAuth response.
- Establishing the corresponding YumYard User identity.
- Issuing YumYard authentication credentials.

Google OAuth client secrets must remain server-side.

The application must not trust arbitrary client-provided Google identity information as proof of authentication.

### 18.5 Access Token Security

Access tokens are short-lived authentication credentials.

They must:

- Be stored in HTTP-only cookies.
- Use secure cookie configuration in production.
- Not be accessible to client-side JavaScript.
- Be cryptographically verifiable by the backend.
- Contain only the information required for authentication and authorization.

The exact token lifetime, claims, signing algorithm, and implementation will be determined during authentication implementation.

### 18.6 Refresh Token Security

Refresh tokens provide longer-lived authentication.

They must:

- Be stored in HTTP-only cookies.
- Not be accessible to client-side JavaScript.
- Have a longer lifetime than access tokens.
- Be rotated according to the authentication strategy.
- Be used only for obtaining new access tokens.

The final refresh-token rotation and revocation strategy must balance security with the stateless authentication architecture.

### 18.7 Cookie Security

Authentication cookies should use appropriate security attributes.

Production authentication cookies should use:

- `HttpOnly`.
- `Secure`.
- Appropriate `SameSite` configuration.
- Appropriate domain and path restrictions.

Cookie configuration must match the final deployment topology.

Authentication cookies should be scoped as narrowly as practical.

### 18.8 CSRF Protection

Because authentication credentials are automatically sent through cookies, YumYard must protect state-changing requests against Cross-Site Request Forgery.

CSRF protection applies to operations such as:

- Creating recipes.
- Updating recipes.
- Deleting recipes.
- Saving recipes.
- Removing saved recipes.
- Submitting ratings/reviews.
- Changing recipe visibility.
- Administrative mutations.

The final CSRF protection mechanism will be selected during implementation.

### 18.9 CORS

The backend must explicitly restrict cross-origin requests.

Only trusted application origins should be permitted to make credentialed API requests.

The API must not use a wildcard origin for credentialed requests.

Development and production environments may use different trusted origins.

### 18.10 Authorization

Authentication establishes identity.

Authorization determines whether the identified user may perform an operation.

Authorization must be enforced by the backend.

Examples include:

```text
User A → Edit own recipe → Allowed

User A → Edit User B's recipe → Denied

User A → View own draft → Allowed

User A → View User B's draft → Denied

User A → Change own recipe visibility → Allowed

User A → Change User B's recipe visibility → Denied
```

### 18.11 Resource-Level Authorization

Authorization must be evaluated for the specific resource being accessed.

The backend must not assume that an authenticated user can access every resource.

For recipe resources:

```text
Draft
  → Owner only

Published
  → Public

Private
  → Owner only

Soft Deleted
  → Unavailable through normal product access
```

Resource access rules must be enforced regardless of which client makes the request.

### 18.12 Admin Security

Administrative operations require an authenticated user with the appropriate administrative privileges.

Admin privileges must be enforced by the backend.

The Admin interface must not be treated as a trusted security boundary simply because it is intended for internal use.

Every protected administrative operation must independently verify the administrator's authorization.

Administrative credentials must not be exposed through the consumer application.

### 18.13 Input Validation

All externally supplied input must be validated by the backend.

Input sources include:

- Request bodies.
- Query parameters.
- URL parameters.
- Authentication input.
- Uploaded files.
- OAuth callback data.
- Administrative input.

Validation must occur before sensitive application operations are performed.

Client-side validation is supplementary and does not replace backend validation.

### 18.14 Database Security

Database access must occur through the backend.

The consumer application must never connect directly to PostgreSQL.

Database credentials must:

- Remain server-side.
- Never be exposed to the frontend.
- Never be committed to source control.
- Be supplied through secure configuration mechanisms.

Database permissions should follow the principle of least privilege where practical.

### 18.15 Database Integrity

Database-level constraints should protect important structural invariants.

Examples include:

- Unique user identity constraints.
- Unique saved-recipe relationships.
- Unique rating/review relationships.
- Referential integrity.
- Required fields.
- Valid relationships between entities.

Application logic remains responsible for business rules that cannot be expressed through database constraints alone.

### 18.16 Image Upload Security

Recipe images are external user-controlled input and must be treated as untrusted files.

The application should validate:

- File type.
- File size.
- File content where appropriate.
- Upload permissions.
- Storage destination.

The application must not trust a filename or MIME type supplied by the client without appropriate validation.

Uploaded files must not be allowed to execute as application code.

Image storage should use controlled storage locations and appropriate access policies.

### 18.17 Image Access

Public recipe images may be served through the configured image-storage or delivery mechanism.

Images associated with private or otherwise restricted resources must not unintentionally become publicly accessible solely because the underlying storage location is known.

The final access model depends on the selected image-storage provider and deployment architecture.

### 18.18 Rate Limiting

Rate limiting should be applied to operations that are particularly susceptible to abuse.

Potential targets include:

- Login.
- Registration.
- Password-related operations.
- OAuth-related operations.
- Token refresh.
- Recipe creation.
- Reviews and ratings.
- Other endpoints with significant abuse potential.

Rate limits should be introduced according to actual requirements rather than applying arbitrary limits to every endpoint.

### 18.19 Abuse Prevention

The system should protect against common application abuse scenarios.

Examples include:

- Repeated authentication attempts.
- Automated account creation.
- Excessive recipe creation.
- Repeated review submission attempts.
- Excessive API requests.
- Malicious file uploads.
- Unauthorized resource access attempts.

Abuse-prevention mechanisms should be proportionate to the V1 application's expected usage.

### 18.20 Secrets Management

Secrets must never be committed to source control.

Sensitive configuration includes:

- Database credentials.
- Google OAuth secrets.
- Token-signing secrets.
- Image-storage credentials.
- AWS credentials where applicable.
- Other private service credentials.

Secrets must be provided through secure environment or secret-management mechanisms.

Different environments must use different credentials where appropriate.

### 18.21 Logging Security

Application logs must not contain sensitive information.

The system must not log:

- Passwords.
- Authentication tokens.
- Refresh tokens.
- OAuth client secrets.
- Database credentials.
- Private keys.
- Other sensitive authentication material.

Logs should contain enough contextual information to diagnose failures without exposing protected data.

### 18.22 Error Security

Production API responses must not expose internal implementation details.

Responses must not expose:

- Stack traces.
- Database errors containing sensitive information.
- Internal file paths.
- Credentials.
- Provider-specific secrets.
- Internal infrastructure configuration.

Detailed diagnostic information may be recorded in secure server-side logs.

### 18.23 HTTPS

Production communication must use HTTPS.

HTTPS protects:

- Authentication credentials.
- API requests.
- API responses.
- User data.
- Recipe management operations.

HTTP should not be used for authenticated production traffic.

### 18.24 Security Headers

The backend should use appropriate HTTP security headers.

The exact header configuration will be finalized during implementation and deployment.

Security headers should be configured consistently across the consumer and Admin interfaces where applicable.

### 18.25 Dependency Security

Third-party dependencies should be kept reasonably up to date.

The project should:

- Review dependency vulnerabilities.
- Remove unnecessary dependencies.
- Avoid packages with unclear or unmaintained security posture.
- Use lockfiles to provide reproducible dependency versions.

Dependency updates should be tested before being applied to production.

### 18.26 Security Boundaries

The primary security boundaries are:

```text
                    ┌───────────────────┐
                    │      Browser      │
                    │    Untrusted      │
                    └─────────┬─────────┘
                              │
                              ▼
                    ┌───────────────────┐
                    │   Express API     │
                    │ Security Boundary │
                    └─────────┬─────────┘
                              │
                ┌─────────────┼─────────────┐
                ▼             ▼             ▼
           Application     PostgreSQL    External
             Logic                       Services
```

The backend is responsible for deciding whether an operation is permitted before accessing protected application resources.

### 18.27 Security Principle for V1

YumYard V1 should prioritize strong fundamental security practices without introducing unnecessary infrastructure complexity.

The architecture should provide:

- Secure authentication.
- Backend-enforced authorization.
- Protected authentication cookies.
- CSRF protection.
- Input validation.
- Secure secret handling.
- Database integrity.
- Safe file handling.
- HTTPS.
- Appropriate abuse prevention.

More advanced security controls should be introduced when actual requirements justify them.

## 19. Deployment Architecture

YumYard V1 is intended to be deployed on AWS as part of the project's learning objectives.

The deployment architecture prioritizes simplicity, low operational complexity, and reasonable cost while providing practical experience with AWS infrastructure.

### 19.1 Deployment Principles

The deployment architecture follows these principles:

- Frontend and backend should be independently deployable.
- PostgreSQL should be managed separately from the application runtime.
- Recipe images should not depend on the local filesystem of the backend server.
- Production secrets must be managed outside source control.
- Development and production environments must remain separate.
- Deployment should be reproducible.
- Infrastructure should be kept as simple as practical for V1.
- AWS services should be introduced when they provide a meaningful operational or learning benefit.
- The application should avoid unnecessary coupling to AWS-specific APIs where practical.

### 19.2 High-Level Deployment

The production deployment consists of the following major components:

```text
                         Internet
                            │
              ┌─────────────┴─────────────┐
              │                           │
              ▼                           ▼
       React Web App                 Express API
       Static Hosting                AWS Compute
                                          │
                              ┌───────────┼───────────┐
                              │           │           │
                              ▼           ▼           ▼
                         PostgreSQL   Image Storage  External
                                                     Services
```

The exact AWS services used for each component will be selected according to V1 requirements, cost, operational simplicity, and learning objectives.

### 19.3 Frontend Deployment

The React application is a statically built frontend.

The production build should be deployable independently from the Express backend.

The frontend deployment is responsible for:

- Serving static application assets.
- Providing HTTPS.
- Providing the public consumer application.
- Connecting the application to the configured backend API.

The frontend should not contain:

- Database credentials.
- OAuth client secrets.
- Token-signing secrets.
- Image-storage credentials.
- Other server-side secrets.

### 19.4 Backend Deployment

The Express backend runs as a server-side application.

The backend deployment is responsible for:

- Serving the API.
- Handling authentication.
- Enforcing authorization.
- Running application logic.
- Accessing PostgreSQL.
- Communicating with external services.
- Managing recipe image operations.

The backend must not depend on its local filesystem for persistent application data.

Temporary filesystem usage may be permitted for short-lived processing when required.

### 19.5 Database Deployment

PostgreSQL runs as a separate persistent database service.

The application server must communicate with PostgreSQL through the configured database connection.

The database must not be exposed directly to the public internet unless there is a deliberate infrastructure requirement.

Where practical:

```text
Internet
   │
   ▼
Express Backend
   │
   ▼
Private / Restricted PostgreSQL
```

Database access should be restricted to trusted application infrastructure.

### 19.6 Image Storage Deployment

Recipe images are stored outside the backend application server.

The image-storage architecture allows backend instances to be replaced or restarted without losing uploaded images.

Conceptually:

```text
React
  │
  ▼
Backend
  │
  ▼
Image Storage
  │
  ▼
Recipe Image
```

The specific image-storage provider will be selected during infrastructure implementation.

AWS S3 is a potential V1 choice because it provides object storage and integrates naturally with AWS deployment.

The provider should be replaceable without changing the Recipe domain model.

### 19.7 Domain Structure

The production system should use a clear domain structure.

A potential deployment is:

```text
www.yumyard.com
        │
        ▼
Consumer React Application

api.yumyard.com
        │
        ▼
Express Backend

admin.yumyard.com
        │
        ▼
Admin Interface
```

The exact domains may differ depending on the final deployment configuration.

The frontend and API may use different origins while remaining within the same site.

### 19.8 HTTPS

All production application traffic must use HTTPS.

HTTPS should be configured for:

- Consumer application.
- Backend API.
- Admin interface.
- External requests involving authentication.

Authentication cookies require secure production transport.

### 19.9 Environment Separation

At minimum, the project should distinguish between:

- Development.
- Production.

Each environment should have its own:

- Database.
- Authentication credentials.
- External service configuration.
- Secrets.
- Application configuration.

Development activity must not unintentionally modify production data.

### 19.10 Configuration

Environment-specific configuration must be provided through environment variables or appropriate secret/configuration mechanisms.

Configuration may include:

- Database connection information.
- API configuration.
- Google OAuth credentials.
- Token-signing secrets.
- Image-storage configuration.
- Cookie configuration.
- CORS origins.
- Application environment.

Secrets must never be committed to source control.

### 19.11 Database Migrations

Database schema changes must be applied through controlled migrations.

Deployment should not depend on manually modifying production database structures.

The deployment process should provide a predictable way to:

1. Deploy the backend version.
2. Apply required database migrations.
3. Start or restart the application.
4. Verify application health.

Migration strategy must account for compatibility between application versions and database versions.

### 19.12 Application Health

The backend should expose an appropriate health mechanism for determining whether the application is operating correctly.

A health check should be able to determine basic application availability.

Where appropriate, the health check may also verify critical dependencies such as database connectivity.

Health checks should not expose sensitive infrastructure information.

### 19.13 Logging

Production backend logs should be available through the deployment infrastructure.

Logs should provide enough information to diagnose:

- Application errors.
- Failed requests.
- Authentication failures.
- Authorization failures.
- External service failures.
- Database failures.

Sensitive credentials and authentication material must not be logged.

### 19.14 Deployment Process

The production deployment should follow a repeatable process.

Conceptually:

```text
Code Change
    ↓
Git Repository
    ↓
Build
    ↓
Test
    ↓
Deploy
    ↓
Database Migration
    ↓
Application Health Check
    ↓
Production
```

The exact CI/CD tooling will be selected separately.

### 19.15 Continuous Integration and Deployment

The project should eventually use automated CI/CD.

At minimum, the pipeline should be capable of:

- Installing dependencies.
- Running linting.
- Running tests.
- Building the frontend.
- Building the backend.
- Detecting build failures.

Deployment automation can be introduced once the initial deployment is working reliably.

The initial development phase does not require a sophisticated CI/CD system.

### 19.16 AWS Architecture

AWS is the target production platform.

The initial deployment should use only the AWS services required to satisfy the application's needs.

Potential services include:

- Compute service for the Express backend.
- Object storage for recipe images.
- Managed PostgreSQL.
- DNS and domain services.
- HTTPS/certificate services.
- Logging and monitoring services.

The exact AWS service selection will be documented after evaluating cost, complexity, and V1 requirements.

### 19.17 Cost-Conscious V1

The deployment should prioritize low-cost infrastructure.

The project is primarily a learning and portfolio application and is not expected to require production-scale infrastructure during V1.

The deployment should therefore avoid introducing services that provide little benefit at the expected scale.

Examples of infrastructure that are not required merely for architectural completeness include:

- Kubernetes.
- Microservices.
- Distributed caching.
- Dedicated message queues.
- Complex autoscaling systems.
- Multi-region deployment.
- Multi-database architectures.

These may be introduced later if actual requirements justify them.

### 19.18 AWS Learning Objective

AWS deployment is also a project-learning objective.

The deployment should therefore provide practical exposure to concepts such as:

- Compute.
- Networking.
- Security groups.
- IAM.
- Object storage.
- Managed databases.
- DNS.
- HTTPS.
- Environment configuration.
- Logging.
- Deployment automation.

Learning objectives should not justify unnecessary production complexity.

The simplest architecture that provides meaningful AWS experience should be preferred.

### 19.19 Backup and Recovery

Persistent production data must have a recovery strategy.

At minimum, the PostgreSQL deployment should use an appropriate backup mechanism supported by the selected hosting solution.

Recipe images stored externally must also remain recoverable independently of the backend application instance.

The exact backup retention and recovery strategy will be defined according to the selected infrastructure.

### 19.20 Deployment Independence

Although AWS is the intended deployment platform, the application architecture should remain reasonably portable.

The following should remain application-level concerns:

- Business logic.
- Domain rules.
- Authentication behavior.
- Authorization.
- API behavior.
- Database model.

AWS-specific implementation should primarily exist within:

- Infrastructure configuration.
- Deployment configuration.
- External service integrations.
- Environment configuration.

### 19.21 Deployment Architecture Principle

YumYard V1 should use the simplest deployment architecture that provides:

- Reliable application hosting.
- Persistent PostgreSQL storage.
- External image storage.
- Secure HTTPS communication.
- Secure secret handling.
- Repeatable deployment.
- Practical AWS learning experience.

Infrastructure complexity should increase only when the application's requirements justify it.

## 20. Project Structure & Code Organization

The project structure translates the architectural boundaries into a maintainable repository organization.

The folder structure supports the architecture but does not define the architecture itself.

Architectural responsibilities and boundaries are defined by the architecture document.

### 20.1 Repository Structure

YumYard uses a single repository containing the major application components and project documentation.

The high-level structure is:

```text
yum-yard/
├── frontend/
├── backend/
├── docs/
└── README.md
```

The exact repository name may differ.

### 20.2 Frontend

The `frontend` application contains the React consumer application.

Conceptually:

```text
frontend/
├── src/
├── public/
├── package.json
├── tsconfig.json
└── ...
```

The frontend source should be organized primarily around product capabilities and shared presentation infrastructure.

A conceptual structure is:

```text
frontend/
└── src/
    ├── features/
    │   ├── discovery/
    │   ├── recipes/
    │   ├── reviews/
    │   ├── library/
    │   └── auth/
    │
    ├── components/
    ├── layouts/
    ├── routes/
    ├── lib/
    └── ...
```

The exact structure may evolve as implementation progresses.

### 20.3 Backend

The `backend` application contains the Express API and server-side application logic.

Conceptually:

```text
backend/
├── src/
├── prisma/
├── package.json
├── tsconfig.json
└── ...
```

The backend source is organized primarily around application modules.

A conceptual structure is:

```text
backend/
└── src/
    ├── modules/
    │   ├── discovery/
    │   ├── recipes/
    │   ├── reviews/
    │   ├── library/
    │   ├── auth/
    │   └── admin/
    │
    ├── shared/
    └── ...
```

### 20.4 Backend Module Organization

Each backend module owns the code related to its responsibility.

A module may contain:

```text
recipes/
├── routes
├── controllers
├── application / domain logic
├── validation
├── repository / data access
└── types
```

These are conceptual responsibilities rather than mandatory filenames.

A module should contain only the layers that provide meaningful separation for that capability.

### 20.5 Shared Backend Code

Shared backend code belongs in the `shared` area only when it is genuinely shared infrastructure or cross-cutting functionality.

Examples include:

- Database client.
- Configuration.
- Logging.
- Error infrastructure.
- Authentication infrastructure.
- Common HTTP utilities.
- External-service infrastructure.

Business logic should not be moved into `shared` merely because multiple modules currently use it.

Shared code should have a clear reason to exist outside a specific domain module.

### 20.6 Database Structure

Prisma and database-related configuration belong to the backend application.

Conceptually:

```text
backend/
├── prisma/
│   ├── schema
│   └── migrations/
│
└── src/
```

The database schema is part of the backend's persistence implementation.

Database migrations must be committed to the repository and applied through the deployment process.

### 20.7 Admin Structure

The Admin interface is an operational interface rather than a core consumer product domain.

It uses the Express backend and server-rendered HTML with HTMX.

The Admin implementation should remain separate from the React consumer application's presentation code.

Conceptually:

```text
backend/
└── src/
    └── modules/
        └── admin/
```

The Admin module may contain:

- Admin routes.
- Admin controllers.
- Server-rendered views.
- HTMX-specific presentation behavior.
- Administrative operations.

The Admin interface must reuse the backend's existing application logic and data-access boundaries.

It must not create duplicate business rules.

### 20.8 Documentation

Project documentation belongs in the `docs` directory.

Conceptually:

```text
docs/
├── architecture/
└── decisions/
```

The architecture documentation acts as the primary technical source of truth for the project.

The architecture should describe:

- System boundaries.
- Product domains.
- Data architecture.
- Authentication.
- Security.
- API architecture.
- Application architecture.
- Deployment.
- Other significant architectural concerns.

### 20.9 Architecture Decision Records

Individual architectural decisions are stored separately from the main architecture document.

Conceptually:

```text
docs/
└── decisions/
    ├── 001-postgresql.md
    ├── 002-authentication.md
    └── ...
```

Each significant decision should have its own document.

Decision records should explain:

- Context.
- Problem.
- Options considered.
- Decision.
- Reasoning.
- Consequences.

The architecture document should describe the resulting architecture, while decision records preserve the reasoning behind significant choices.

### 20.10 Configuration

Environment-specific configuration should remain outside source-controlled secrets.

The repository may contain safe examples such as:

```text
.env.example
```

but real environment files containing secrets must not be committed.

Configuration should be loaded through the backend and frontend configuration mechanisms appropriate to each application.

### 20.11 Tests

Tests should be located close to the code or within a clearly defined test structure according to the testing strategy.

The project should avoid creating a single unstructured test directory containing unrelated tests for the entire system.

Tests should remain understandable in relation to the capability they verify.

For example:

```text
recipes/
├── ...
└── tests/
```

or an equivalent structure may be used depending on the selected testing tooling.

### 20.12 Dependency Boundaries

Dependencies should follow the architecture.

Examples:

```text
Frontend
   ↓
API Contract
   ↓
Backend
   ↓
Application Logic
   ↓
Data Access
   ↓
Database
```

The frontend must not depend directly on backend implementation details.

Domain modules should not depend unnecessarily on unrelated modules' internal implementations.

Database-specific implementation should remain behind the backend data-access boundary where practical.

### 20.13 File Naming and Organization

File naming should remain consistent within each application.

Names should communicate responsibility clearly.

The project should avoid generic filenames such as:

```text
utils.ts
helpers.ts
common.ts
misc.ts
```

when a more specific responsibility can be identified.

For example, a utility related specifically to recipe parsing should belong to the relevant recipe capability rather than becoming a generic global utility.

### 20.14 Code Organization Principle

Code should be placed according to the responsibility it serves.

The preferred decision process is:

```text
What responsibility does this code have?
             ↓
Which domain owns that responsibility?
             ↓
Is it specific to that domain?
       ┌─────┴─────┐
      Yes          No
       ↓            ↓
   Domain module   Shared infrastructure
```

This prevents the repository from becoming organized solely around technical categories.

### 20.15 Structure Evolution

The initial structure should remain simple.

As YumYard grows, modules may be reorganized when their responsibilities become large enough to justify it.

The project should not introduce additional architectural layers, packages, services, or directories solely for theoretical future requirements.

Changes to significant architectural boundaries should be reflected in the architecture documentation and, where appropriate, recorded as an Architecture Decision Record.

Next is **Section 21 — System Flows**.

This section documents the important end-to-end behaviors of YumYard. Unlike the previous sections, it focuses on **how the system behaves over time** when a user performs an important action.

I recommend keeping the flows at the architectural level rather than turning this into API documentation.

````markdown
## 21. System Flows

System flows describe how important YumYard operations move through the major system components.

They connect the product behavior defined in the product architecture with the technical boundaries defined throughout the system architecture.

The flows describe the expected behavior of the system without prescribing every implementation detail.

### 21.1 User Registration

A user may create a YumYard account using email and password.

```text
User
  ↓
React Registration Form
  ↓
Registration API
  ↓
Validate Input
  ↓
Create YumYard User
  ↓
Create Password Authentication Identity
  ↓
Persist User
  ↓
Issue Authentication Tokens
  ↓
HTTP-only Cookies
  ↓
Authenticated User
```
````

The backend is responsible for validating the registration request and securely storing the password representation.

The frontend must not persist the user's password.

### 21.2 Google Authentication

A user may authenticate using Google OAuth.

```text
User
  ↓
React
  ↓
Google OAuth
  ↓
Google Authentication
  ↓
OAuth Callback
  ↓
Express Backend
  ↓
Identify or Establish YumYard User
  ↓
Issue Authentication Tokens
  ↓
HTTP-only Cookies
  ↓
Authenticated User
```

Google remains the authentication provider while YumYard remains the source of truth for the application user identity.

### 21.3 Authenticated Request

A protected request follows this general flow:

```text
React
  ↓
HTTP Request
  ↓
HTTP-only Authentication Cookie
  ↓
Express
  ↓
Authenticate Request
  ↓
Identify YumYard User
  ↓
Authorize Operation
  ↓
Application Logic
  ↓
Data Access
  ↓
PostgreSQL
  ↓
Response
  ↓
React
```

The frontend does not directly provide proof of ownership or authorization.

The backend derives the authenticated identity from the authentication mechanism.

### 21.4 Access Token Refresh

When an access token expires, the client can request a new access token using the refresh token.

```text
React / Browser
  ↓
Refresh Request
  ↓
Refresh Token Cookie
  ↓
Express
  ↓
Validate Refresh Token
  ↓
Issue New Access Token
  ↓
HTTP-only Cookie
  ↓
Continue Authenticated Requests
```

Refresh-token rotation and revocation behavior follows the authentication security design.

### 21.5 Recipe Discovery

A user can discover recipes without authentication.

```text
User
  ↓
Recipe Discovery Page
  ↓
Search / Filter Request
  ↓
Express API
  ↓
Validate Query
  ↓
Discovery Logic
  ↓
Recipe Data Access
  ↓
PostgreSQL
  ↓
Filtered Results
  ↓
React
```

The backend performs authoritative search and filtering.

The frontend is responsible for presenting the results and managing the user's current search and filter state.

### 21.6 Recipe Viewing

A user can view a publicly available recipe without authentication.

```text
User
  ↓
Recipe Detail Page
  ↓
Request Recipe
  ↓
Express API
  ↓
Determine Recipe Availability
  ↓
Retrieve Recipe
  ↓
Return Recipe Data
  ↓
React
  ↓
Display Recipe
```

The backend determines whether the recipe is publicly accessible.

A recipe that is a draft, private, or soft-deleted must not be exposed through normal public access.

### 21.7 Recipe View Counting

V1 uses a simple aggregate view counter.

```text
Recipe Viewed
      ↓
Backend records view
      ↓
Recipe viewCount incremented
      ↓
Updated count persisted
```

The initial implementation does not attempt to provide sophisticated visitor deduplication.

More advanced view integrity can be introduced later.

### 21.8 Recipe Creation

An authenticated user can create a recipe.

The initial recipe may begin as a draft.

```text
User
  ↓
Recipe Editor
  ↓
Create Recipe Request
  ↓
Authentication
  ↓
Authorization
  ↓
Validate Input
  ↓
Create Draft Recipe
  ↓
Persist Recipe
  ↓
Return Recipe
  ↓
React
```

The newly created recipe belongs to the authenticated YumYard User.

### 21.9 Draft Autosave

Draft changes are automatically persisted after the user stops making changes for the configured debounce period.

```text
User edits draft
      ↓
React form state
      ↓
Debounce
      ↓
Draft Update Request
      ↓
Authentication
      ↓
Recipe Ownership Check
      ↓
Validation
      ↓
Persist Draft
      ↓
Response
      ↓
React updates save state
```

Autosave applies only to drafts.

The frontend should communicate whether the latest changes are:

- Saving.
- Saved.
- Failed to save.

A failed autosave must not be presented as successfully persisted.

### 21.10 Recipe Publishing

Publishing is an explicit user action.

```text
Draft Recipe
      ↓
User clicks Publish
      ↓
Publish Request
      ↓
Authentication
      ↓
Ownership Check
      ↓
Validate Publishable Recipe
      ↓
Change Status
      ↓
Persist Recipe
      ↓
Recipe becomes publicly discoverable
```

Publishing should only succeed when all requirements for a public recipe are satisfied.

The backend is responsible for determining whether the recipe is publishable.

### 21.11 Published Recipe Editing

Published recipe changes are not automatically persisted.

```text
Published Recipe
      ↓
User selects Edit
      ↓
React loads editable state
      ↓
User changes fields
      ↓
Local unsaved changes
      ↓
User clicks Update
      ↓
Update Request
      ↓
Authentication
      ↓
Ownership Check
      ↓
Validation
      ↓
Persist Changes
      ↓
Update Metadata
      ↓
Updated Recipe Returned
```

The recipe's update metadata is changed when the update is successfully persisted.

The frontend can then display the updated timestamp or equivalent "updated ago" information.

### 21.12 Recipe Visibility Change

The owner may change the visibility of a published recipe.

```text
Recipe Owner
      ↓
Change Privacy
      ↓
Visibility Request
      ↓
Authentication
      ↓
Ownership Check
      ↓
Validate Transition
      ↓
Update Visibility
      ↓
Persist Recipe
```

The backend determines whether the user is authorized to perform the operation.

A private recipe is no longer available through normal public discovery.

### 21.13 Recipe Soft Deletion

Recipe deletion uses soft deletion.

```text
Recipe Owner
      ↓
Delete Recipe
      ↓
Authentication
      ↓
Ownership Check
      ↓
Delete Request
      ↓
Set deletedAt
      ↓
Recipe excluded from normal discovery
```

The underlying recipe data remains in the database.

A request to access a deleted recipe through normal product access should receive an appropriate unavailable/not-found response rather than exposing the deleted recipe.

### 21.14 Save Recipe

An authenticated user can save a recipe.

```text
User
  ↓
Click Save
  ↓
Save Request
  ↓
Authentication
  ↓
Validate Recipe Availability
  ↓
Create Saved Recipe Relationship
  ↓
Persist
  ↓
Return Updated State
  ↓
React
```

The database prevents duplicate saved relationships for the same user and recipe.

### 21.15 Remove Saved Recipe

A user can remove a previously saved recipe.

```text
User
  ↓
Click Remove Save
  ↓
Request
  ↓
Authentication
  ↓
Identify User
  ↓
Remove Saved Recipe Relationship
  ↓
Persist
  ↓
Return Updated State
```

The operation affects only the authenticated user's saved relationship.

### 21.16 Submit Rating and Review

A user submits a rating and optional written review through one interaction.

```text
User
  ↓
Select Rating
  ↓
Optionally Enter Review
  ↓
Click Submit
  ↓
Rating/Review Request
  ↓
Authentication
  ↓
Validate Rating
  ↓
Validate Optional Review
  ↓
Check Existing User/Recipe Relationship
  ↓
Create Rating/Review
  ↓
Persist
  ↓
Return Result
```

A rating is mandatory.

A written review is optional.

A user may have only one Rating/Review entity for a given recipe.

### 21.17 Edit Rating and Review

A user can edit their existing rating/review.

```text
User
  ↓
Edit Existing Rating/Review
  ↓
Modify Rating / Optional Review
  ↓
Submit
  ↓
Authentication
  ↓
Ownership Check
  ↓
Validation
  ↓
Update Rating/Review
  ↓
Persist
```

The user may edit only their own rating/review.

### 21.18 Personal Library

The Personal Library retrieves data belonging to the authenticated user.

```text
User
  ↓
Personal Library
  ↓
Authenticated Request
  ↓
Identify YumYard User
  ↓
Retrieve Saved / Owned Recipes
  ↓
PostgreSQL
  ↓
Return User-specific Data
  ↓
React
```

The backend determines which records belong to the authenticated user.

The frontend does not send arbitrary user IDs to determine whose library should be returned.

### 21.19 Admin Operation

An administrator performs an operational or moderation action through the HTMX Admin interface.

```text
Administrator
      ↓
Admin Interface
      ↓
HTMX Request
      ↓
Express Backend
      ↓
Authentication
      ↓
Admin Authorization
      ↓
Admin Operation
      ↓
Shared Application Logic
      ↓
Data Access
      ↓
PostgreSQL
      ↓
HTML / HTMX Response
      ↓
Admin Interface
```

Admin operations use the same underlying business and data rules as the consumer application wherever applicable.

### 21.20 Image Upload

Recipe image handling uses external image storage.

A conceptual upload flow is:

```text
User
  ↓
Recipe Editor
  ↓
Image Upload
  ↓
Backend / Image Storage Integration
  ↓
Validate Image
  ↓
Store Image
  ↓
Receive Image Reference
  ↓
Associate Reference with Recipe
```

The exact upload mechanism may be direct-to-storage or backend-mediated depending on the selected storage architecture.

The image binary is not stored in PostgreSQL.

### 21.21 Error Flow

When an operation fails, the system should preserve a clear boundary between internal errors and user-facing responses.

```text
Request
  ↓
Operation
  ↓
Failure
  ↓
Application Error Handling
  ↓
HTTP Error Response
  ↓
Frontend
  ↓
User-friendly Feedback
```

Internal implementation details should not be exposed to the user.

### 21.22 General System Flow Principle

Important operations should follow the same fundamental boundary:

```text
User Interaction
      ↓
Presentation Layer
      ↓
API
      ↓
Authentication / Authorization
      ↓
Validation
      ↓
Application / Domain Logic
      ↓
Data Access / External Integration
      ↓
Persistent State / External Service
      ↓
Response
      ↓
Presentation Layer
```

The exact number of steps may vary depending on the operation, but security, business rules, and persistence must remain backend responsibilities.

## 22. Testing & Quality Strategy

Testing ensures that YumYard behaves according to the product and technical requirements defined by the architecture.

The testing strategy prioritizes correctness of important application behavior rather than maximizing test count or code coverage.

### 22.1 Testing Principles

The testing strategy follows these principles:

- Test behavior rather than implementation details where practical.
- Prioritize business-critical behavior.
- Test security boundaries explicitly.
- Test important data-integrity rules.
- Test important user flows.
- Keep tests maintainable.
- Avoid tests that provide little confidence or duplicate other tests.
- Use multiple levels of testing rather than relying on a single test type.

The project does not require an arbitrary 100% code-coverage target.

### 22.2 Testing Levels

YumYard uses multiple testing levels:

```text
Unit Tests
    ↓
Integration Tests
    ↓
API / Backend Tests
    ↓
End-to-End Tests
```

Each level serves a different purpose.

### 22.3 Unit Tests

Unit tests verify isolated application behavior.

They are appropriate for logic that can be tested independently of external systems.

Examples include:

- Recipe validation rules.
- Recipe lifecycle rules.
- Visibility rules.
- Rating validation.
- Filtering logic.
- Data transformation.
- Utility behavior.
- Other deterministic application logic.

Unit tests should avoid unnecessary dependencies on:

- PostgreSQL.
- External authentication providers.
- Image-storage providers.
- The browser.

### 22.4 Integration Tests

Integration tests verify that multiple parts of the application work correctly together.

Examples include:

- Application logic with the database.
- Repository behavior.
- Recipe persistence.
- Saved-recipe relationships.
- Rating/review persistence.
- Transaction behavior.
- Authentication persistence.
- Database constraints.

Integration tests should use an isolated test environment rather than production data.

### 22.5 API Tests

API tests verify the backend HTTP contract.

They should cover important API behavior such as:

- Request validation.
- Authentication.
- Authorization.
- HTTP status codes.
- Response structures.
- Error responses.
- Recipe operations.
- Saved recipes.
- Ratings/reviews.
- Discovery.
- User-specific resources.

API tests should verify that the backend does not rely on frontend restrictions for security.

### 22.6 Authentication Testing

Authentication flows should be tested independently and through appropriate integration/API tests.

Important scenarios include:

- Successful email/password registration.
- Invalid registration data.
- Successful login.
- Invalid credentials.
- Google OAuth authentication.
- Authentication failure.
- Access-token expiration.
- Refresh-token flow.
- Authentication cookie behavior.
- Account identity resolution.

Sensitive credentials must not appear in test output or committed test fixtures.

### 22.7 Authorization Testing

Authorization is a critical testing area.

Tests should verify that:

```text
User A → Own Recipe → Allowed

User A → User B's Recipe → Denied

User A → Own Draft → Allowed

User A → User B's Draft → Denied

User A → Own Private Recipe → Allowed

User A → User B's Private Recipe → Denied
```

Similar tests should exist for:

- Saved recipes.
- Ratings/reviews.
- Administrative operations.

Authorization must be tested at the backend level.

### 22.8 Recipe Lifecycle Testing

Recipe lifecycle behavior should be tested explicitly.

Important transitions include:

```text
DRAFT
  ↓
PUBLISHED
```

and:

```text
PUBLISHED
  ↓
PRIVATE
```

as well as:

```text
PRIVATE
  ↓
PUBLISHED
```

Soft deletion must also be tested.

Tests should verify that:

- Drafts are not publicly discoverable.
- Published recipes are publicly discoverable.
- Private recipes are not publicly discoverable.
- Deleted recipes are excluded from normal discovery.
- Only the owner can perform lifecycle operations.
- Publishing validates the required recipe data.
- Published edits require explicit submission.

### 22.9 Draft Autosave Testing

Draft autosave should be tested at both the frontend and backend boundaries.

Important behavior includes:

- Changes are debounced before autosaving.
- The latest changes are persisted.
- Autosave does not publish the recipe.
- Unauthorized users cannot autosave another user's draft.
- Failed autosaves are represented correctly in the UI.
- Repeated autosave requests do not corrupt the draft.

### 22.10 Published Recipe Editing Testing

Published recipes must not be automatically updated from ordinary form changes.

Tests should verify:

```text
Edit Published Recipe
       ↓
Change Form
       ↓
No Backend Update
       ↓
Click Update
       ↓
Backend Update
```

The updated timestamp should change only after a successful persisted update.

### 22.11 Saved Recipe Testing

Saved-recipe behavior should verify:

- A user can save an accessible recipe.
- A user can remove a saved recipe.
- The same recipe cannot be saved multiple times by the same user.
- One user's saved relationship does not affect another user's library.
- Unauthorized users cannot modify saved-recipe relationships.

Database uniqueness constraints should also be tested.

### 22.12 Rating and Review Testing

Rating/review behavior should verify:

- A rating is required.
- A written review is optional.
- Valid ratings can be submitted.
- Invalid ratings are rejected.
- A user can submit only one rating/review per recipe.
- A user can edit their own rating/review.
- A user cannot edit another user's rating/review.

The database uniqueness constraint should also be verified.

### 22.13 Discovery Testing

Discovery tests should verify:

- Published recipes can be discovered.
- Draft recipes are excluded.
- Private recipes are excluded.
- Deleted recipes are excluded.
- Supported filters behave correctly.
- Search behaves according to the defined search rules.
- Pagination behaves correctly.
- Unsupported filter or sorting values are rejected appropriately.

### 22.14 Frontend Testing

Frontend tests should focus on user-visible behavior and important interactions.

Examples include:

- Form behavior.
- Validation feedback.
- Loading states.
- Error states.
- Recipe editor behavior.
- Draft autosave state.
- Published recipe update behavior.
- Save/unsave interactions.
- Rating/review interactions.
- Authentication UI.
- Navigation.

Frontend tests should avoid tightly coupling tests to implementation details such as internal component state or specific DOM structures unless necessary.

### 22.15 End-to-End Testing

End-to-end tests verify important user journeys across the frontend and backend.

The initial E2E suite should focus on high-value flows.

Examples include:

```text
Register
  ↓
Create Recipe
  ↓
Edit Draft
  ↓
Publish
  ↓
Discover Recipe
  ↓
View Recipe
```

Other important journeys include:

```text
Login
  ↓
Save Recipe
  ↓
Open Personal Library
  ↓
Remove Saved Recipe
```

and:

```text
Login
  ↓
View Recipe
  ↓
Submit Rating/Review
  ↓
Edit Rating/Review
```

The project does not need an E2E test for every possible UI interaction.

### 22.16 Database Testing

Database behavior should be tested where it protects important invariants.

Examples include:

- Unique user identity.
- Unique saved-recipe relationship.
- Unique rating/review relationship.
- Referential integrity.
- Soft deletion behavior.
- Required fields.
- Transaction behavior where applicable.

### 22.17 External Service Testing

External services should not be called unnecessarily during automated tests.

External integrations should be isolated or mocked where appropriate.

Examples include:

- Google OAuth.
- Image storage.

Tests should verify YumYard's behavior when an external service:

- Succeeds.
- Rejects a request.
- Becomes unavailable.
- Returns unexpected data where relevant.

The project should not depend on the availability of external providers for every test run.

### 22.18 Security Testing

Security-sensitive behavior should be explicitly tested.

Examples include:

- Authentication failures.
- Authorization failures.
- Ownership enforcement.
- Cookie configuration.
- CSRF protection.
- CORS restrictions.
- Input validation.
- File upload validation.
- Rate limiting where implemented.
- Administrative authorization.

Security testing should focus particularly on cases where an attacker attempts to bypass normal frontend behavior.

### 22.19 Regression Testing

When a significant bug is discovered, an appropriate regression test should be added when practical.

The purpose is to ensure that a previously fixed behavior does not silently break again.

Regression tests should focus on the underlying behavior rather than reproducing only the exact UI interaction that exposed the issue.

### 22.20 Code Quality Checks

The project should use automated quality checks appropriate to the technology stack.

The development workflow should include checks such as:

- TypeScript type checking.
- Linting.
- Formatting.
- Automated tests.
- Production builds.

These checks should run locally and eventually as part of CI.

### 22.21 Continuous Integration

The CI pipeline should verify the project before changes are merged into the main development branch.

A conceptual pipeline is:

```text
Pull Request
     ↓
Install Dependencies
     ↓
Type Check
     ↓
Lint
     ↓
Test
     ↓
Build
     ↓
Pass / Fail
```

The exact CI provider and configuration will be defined separately.

### 22.22 Test Environment

Automated tests must use isolated test data.

Tests must not depend on:

- Production data.
- A developer's personal account.
- Production credentials.
- Uncontrolled external services.

Test configuration should be separate from development and production configuration.

### 22.23 Coverage

Code coverage may be used as a supporting quality metric.

Coverage should not become the primary definition of test quality.

A high coverage percentage does not guarantee correct behavior.

Testing priority should instead follow risk:

```text
High Risk / High Importance
        ↓
Authentication
Authorization
Data Integrity
Recipe Lifecycle
Critical User Flows
        ↓
Lower Risk UI Details
```

### 22.24 Definition of Quality

A feature should be considered sufficiently tested when:

- Its important business behavior is covered.
- Security boundaries are verified.
- Important data-integrity constraints are protected.
- Critical user flows work.
- Expected error conditions are handled.
- Type checking and linting pass.
- The application builds successfully.

The appropriate level of testing may increase as a feature becomes more complex or business-critical.

### 22.25 Testing Principle for V1

YumYard V1 should prioritize confidence over test quantity.

Testing effort should focus on the parts of the system where failure would cause:

- Data corruption.
- Security vulnerabilities.
- Unauthorized access.
- Broken recipe lifecycle behavior.
- Loss of user data.
- Significant user-facing failures.

The testing strategy should evolve as the application's complexity and usage increase.

## 23. Architecture Evolution & Governance

The YumYard architecture is a living source of truth for the intended structure and behavior of the system.

The architecture should evolve as requirements, technical constraints, and project understanding change.

The purpose of architecture governance is not to prevent change. It is to ensure that significant changes are deliberate, understandable, and documented.

### 23.1 Architecture as the Source of Truth

The architecture document defines the current intended architecture of YumYard.

It should be consulted when:

- Starting a new feature.
- Making a significant technical decision.
- Changing a system boundary.
- Introducing a new external service.
- Changing persistent data relationships.
- Changing authentication or authorization behavior.
- Changing deployment architecture.
- Resolving uncertainty about how a feature should be implemented.

The architecture document should describe the system as it is intended to exist at the current stage of development.

### 23.2 Architecture vs Implementation

The architecture and implementation serve different purposes.

```text
Architecture
    ↓
Defines intended structure and behavior

Implementation
    ↓
Realizes that architecture in code
```

The implementation must not silently redefine architectural boundaries.

If implementation requirements reveal that the architecture is insufficient or incorrect, the architecture should be reconsidered and updated rather than allowing undocumented architectural drift.

### 23.3 Architecture Changes

An architectural change is any change that materially affects the structure, boundaries, responsibilities, or important technical behavior of the system.

Examples include:

- Changing the primary database.
- Changing authentication architecture.
- Introducing a new major external service.
- Changing the deployment model.
- Introducing a new major application module.
- Moving business responsibility between domains.
- Changing persistent data relationships.
- Introducing a new architectural layer.
- Changing the API architecture significantly.

Small implementation changes do not require an architecture update.

### 23.4 Architecture Decision Records

Significant architectural decisions should be documented separately in the decisions directory.

Conceptually:

```text
docs/
└── decisions/
    ├── 001-postgresql.md
    ├── 002-authentication.md
    ├── 003-image-storage.md
    └── ...
```

Each decision should have its own document.

Decision records preserve the reasoning behind significant choices even after the implementation evolves.

### 23.5 When to Create a Decision Record

An Architecture Decision Record should be created when a decision:

- Has meaningful technical consequences.
- Is difficult or expensive to reverse.
- Affects multiple parts of the system.
- Establishes an important architectural convention.
- Involves meaningful trade-offs.
- Would otherwise cause future developers to ask "why did we do it this way?"

Not every implementation choice requires an ADR.

### 23.6 Decision Record Structure

A decision record should generally contain:

```text
Title
Status
Context
Problem
Options Considered
Decision
Reasoning
Consequences
```

The format may evolve if the project develops additional needs.

### 23.7 Architecture Document Updates

The architecture document should be updated when the implemented or intended architecture changes materially.

An update should:

- Describe the current architecture.
- Remove obsolete assumptions where appropriate.
- Preserve important historical reasoning through ADRs.
- Avoid documenting implementation details that do not belong at the architecture level.

The architecture document should remain useful to a developer who needs to understand how the system is intended to work today.

### 23.8 Architecture and ADR Relationship

The architecture document and ADRs have different responsibilities.

```text
Architecture Document
        ↓
Current architectural state

ADR
        ↓
Historical reasoning behind a significant decision
```

The architecture document should not become a chronological history of every decision.

Similarly, ADRs should not be used as a replacement for documenting the current architecture.

### 23.9 Superseding Decisions

Architectural decisions may become obsolete.

When a decision is replaced:

- The old ADR should remain available as historical context.
- Its status should indicate that it has been superseded.
- The new decision should reference the previous decision where useful.
- The main architecture document should describe the current architecture.

Conceptually:

```text
ADR-001
  ↓
Superseded by
  ↓
ADR-014
  ↓
Current Architecture
```

Historical decisions should not be deleted merely because they are no longer active.

### 23.10 Handling Architectural Uncertainty

When implementation reveals an architectural question that is not answered by the architecture document, the developer should:

1. Identify the relevant architectural boundary.
2. Check the architecture document.
3. Check relevant ADRs.
4. Determine whether the question is an implementation detail or an architectural decision.
5. If it is an architectural decision, evaluate the alternatives.
6. Record the decision when appropriate.
7. Update the architecture if the resulting decision changes the intended architecture.

This prevents important decisions from being made accidentally through implementation.

### 23.11 Handling Conflicts

If the implementation and architecture disagree, the discrepancy should be identified rather than ignored.

The possible outcomes are:

```text
Architecture is correct
        ↓
Implementation should be corrected
```

or:

```text
Implementation requirement reveals
architecture is outdated
        ↓
Architecture is updated
        ↓
Decision recorded if significant
```

The project should avoid maintaining a known mismatch between the architecture and implementation without documenting the reason.

### 23.12 Feature Development Workflow

A significant feature should generally follow this process:

```text
Feature Requirement
        ↓
Understand Product Responsibility
        ↓
Check Architecture
        ↓
Identify Affected Domains
        ↓
Identify Data / API / Security Impact
        ↓
Determine Whether an ADR Is Required
        ↓
Implement
        ↓
Test
        ↓
Update Architecture if Necessary
```

This keeps implementation aligned with the system design.

### 23.13 Architectural Review

Before implementing a major architectural change, the change should be reviewed against:

- Product requirements.
- Existing domain boundaries.
- Data architecture.
- Security requirements.
- API architecture.
- Deployment architecture.
- Non-functional requirements.
- Existing ADRs.

The purpose is to understand the consequences of the change before implementation.

### 23.14 Avoiding Over-Architecture

Architecture governance must not become a reason to over-engineer the application.

The project should avoid introducing:

- Unnecessary services.
- Unnecessary abstractions.
- Unnecessary infrastructure.
- Complex patterns without a demonstrated need.
- Architecture for hypothetical requirements.

The simplest architecture that satisfies the actual requirements should be preferred.

### 23.15 Architecture Review Checkpoints

The architecture should be reviewed at meaningful milestones rather than continuously rewritten.

Useful checkpoints include:

- Before major implementation begins.
- After completing a major V1 domain.
- Before production deployment.
- When a significant architectural decision changes.
- When accumulated implementation changes reveal architectural drift.

### 23.16 Documentation Ownership

The developer maintaining the project is responsible for keeping the architecture and decision records consistent with the current intended system.

When multiple developers work on YumYard, any developer introducing a significant architectural change is responsible for ensuring that the corresponding documentation is updated.

Architecture documentation should be treated as part of the development work rather than optional project paperwork.

### 23.17 Source-of-Truth Hierarchy

When determining how the system should behave, the following hierarchy should be used:

```text
Product Requirements
        ↓
Architecture
        ↓
Architecture Decision Records
        ↓
Implementation
```

Product requirements define what the product needs.

The architecture defines how the system is intended to satisfy those requirements.

ADRs explain significant architectural choices and their trade-offs.

The implementation realizes the architecture.

If a lower level conflicts with a higher level, the conflict should be resolved rather than silently ignored.

### 23.18 Architecture Evolution Principle

YumYard's architecture should evolve deliberately.

The goal is not to keep the architecture unchanged.

The goal is to ensure that:

- Important decisions are intentional.
- Architectural boundaries remain understandable.
- The documentation reflects the current intended system.
- Historical reasoning remains available.
- Implementation does not silently introduce architectural drift.
- Complexity is introduced only when justified.

The architecture should remain a practical engineering tool rather than becoming documentation maintained for its own sake.
