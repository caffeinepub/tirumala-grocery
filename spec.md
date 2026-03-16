# Tirumala Grocery

## Current State
The app has a Motoko backend with stable storage for products and categories. Categories (Fruits, Vegetables, Dairy, Grains, Spices) are seeded on first launch. No products are pre-seeded. Admin can add products manually.

## Requested Changes (Diff)

### Add
- Pre-seed ~25 dairy products in the Dairy category on first launch, matching Blinkit's dairy section (Amul milk, Mother Dairy milk, butter, paneer, ghee, curd, cheese, cream, lassi, chaas, flavored milk, condensed milk, etc.) with realistic prices in rupees.

### Modify
- Backend init logic: add a `dairySeedDone` stable flag; when false, insert all dairy products and set it to true.

### Remove
- Nothing removed.

## Implementation Plan
1. Add `stable var dairySeedDone : Bool = false` to backend.
2. In init block, when `dairySeedDone == false`, insert all dairy products into the products map and set `dairySeedDone := true`.
3. Ensure `nextProductId` is advanced correctly after seeding.
