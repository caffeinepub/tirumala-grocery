import Array "mo:core/Array";
import Map "mo:core/Map";
import Iter "mo:core/Iter";
import Text "mo:core/Text";
import Nat "mo:core/Nat";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";

actor {
  // Original Product type — must NOT change for stable compatibility
  type Product = {
    id : Nat;
    name : Text;
    description : Text;
    price : Nat;
    imageUrl : Text;
    category : Text;
  };

  // Extended type returned to clients (includes stock)
  type ProductWithStock = {
    id : Nat;
    name : Text;
    description : Text;
    price : Nat;
    imageUrl : Text;
    category : Text;
    stock : Nat;
  };

  // Stable storage
  stable var nextProductId : Nat = 0;
  stable var stableProducts : [(Nat, Product)] = [];
  stable var stableCategories : [Text] = [];
  stable var stableCarts : [(Principal, [Nat])] = [];
  stable var stableStocks : [(Nat, Nat)] = [];  // productId -> stock
  stable var dairySeedDone : Bool = false;

  // In-memory working maps
  let products = Map.empty<Nat, Product>();
  let categories = Map.empty<Text, ()>();
  let carts = Map.empty<Principal, [Nat]>();
  let stocks = Map.empty<Nat, Nat>();

  // Initialize from stable storage on every startup
  for ((id, p) in stableProducts.values()) {
    products.add(id, p);
  };
  if (stableCategories.size() == 0) {
    for (cat in ["Fruits", "Vegetables", "Dairy", "Grains", "Spices"].values()) {
      categories.add(cat, ());
    };
  } else {
    for (cat in stableCategories.values()) {
      categories.add(cat, ());
    };
  };
  for ((principal, cart) in stableCarts.values()) {
    carts.add(principal, cart);
  };
  for ((id, s) in stableStocks.values()) {
    stocks.add(id, s);
  };

  // Helper to merge Product + stock into ProductWithStock
  func withStock(p : Product) : ProductWithStock {
    let s = switch (stocks.get(p.id)) {
      case (null) { 0 };
      case (?v) { v };
    };
    {
      id = p.id;
      name = p.name;
      description = p.description;
      price = p.price;
      imageUrl = p.imageUrl;
      category = p.category;
      stock = s;
    };
  };

  // Seed dairy products on very first launch
  if (not dairySeedDone) {
    switch (categories.get("Dairy")) {
      case (null) { categories.add("Dairy", ()) };
      case (?_) {};
    };
    let dairyItems : [(Text, Text, Nat, Nat)] = [
      ("Amul Taaza Toned Milk 500ml", "Fresh toned milk, 3% fat, rich in calcium and protein", 28, 50),
      ("Amul Taaza Toned Milk 1L", "Fresh toned milk 1 litre pack, 3% fat", 54, 50),
      ("Amul Gold Full Cream Milk 1L", "Full cream milk with 6% fat, rich and creamy", 66, 50),
      ("Mother Dairy Full Cream Milk 1L", "Fresh full cream milk, 6% fat, direct from farmers", 66, 50),
      ("Mother Dairy Toned Milk 500ml", "Fresh toned milk 500ml, 3% fat", 28, 50),
      ("Amul Butter 100g", "Pasteurised butter, classic salted flavour", 57, 50),
      ("Amul Butter 500g", "Pasteurised salted butter value pack", 270, 30),
      ("Amul Masti Dahi 400g", "Set curd, thick and creamy, made from toned milk", 38, 50),
      ("Amul Masti Dahi 1kg", "Set curd 1kg pack, thick and creamy", 89, 40),
      ("Mother Dairy Mishti Doi 100g", "Sweet Bengali-style mishti doi, smooth and rich", 30, 40),
      ("Amul Fresh Paneer 200g", "Soft fresh paneer made from pure cow milk", 85, 50),
      ("Amul Fresh Paneer 500g", "Fresh soft paneer 500g, ideal for cooking", 205, 30),
      ("Amul Pure Ghee 500ml", "Pure cow ghee, rich aroma and golden colour", 320, 40),
      ("Amul Pure Ghee 1L", "Pure cow ghee 1 litre, for cooking and tempering", 620, 30),
      ("Mother Dairy Ghee 500ml", "Pure cow ghee, traditionally churned", 310, 40),
      ("Amul Cheese Slices 200g", "Processed cheddar cheese slices, 10 slices per pack", 115, 40),
      ("Amul Processed Cheese Block 200g", "Processed cheddar cheese block, smooth and mild", 105, 40),
      ("Amul Cream 250ml", "Fresh low-fat cream for cooking, baking, and desserts", 75, 40),
      ("Amul Masti Spiced Buttermilk 500ml", "Refreshing spiced chaas with cumin and coriander", 22, 60),
      ("Mother Dairy Chaas 500ml", "Traditional salted buttermilk, light and refreshing", 22, 60),
      ("Amul Mango Lassi 200ml", "Chilled mango flavoured lassi, sweet and creamy", 25, 50),
      ("Amul Kool Cafe 200ml", "Chilled milk-based coffee drink, ready to serve", 30, 50),
      ("Amul Kool Chocolate Milk 200ml", "Flavoured chocolate milk drink, rich and sweet", 30, 50),
      ("Nestle Milkmaid Condensed Milk 400g", "Sweetened condensed milk, perfect for desserts and sweets", 115, 40),
      ("Amul Shrikhand Elaichi 100g", "Traditional strained yoghurt dessert with cardamom", 45, 40)
    ];
    for ((name, desc, price, stock) in dairyItems.values()) {
      let p : Product = {
        id = nextProductId;
        name;
        description = desc;
        price;
        imageUrl = "";
        category = "Dairy";
      };
      products.add(nextProductId, p);
      stocks.add(nextProductId, stock);
      nextProductId += 1;
    };
    dairySeedDone := true;
  };

  // Save to stable storage before upgrade
  system func preupgrade() {
    stableProducts := products.entries().toArray();
    stableCategories := categories.keys().toArray();
    stableCarts := carts.entries().toArray();
    stableStocks := stocks.entries().toArray();
  };

  // Products
  public shared func addProduct(name : Text, description : Text, price : Nat, category : Text, imageUrl : Text, stock : Nat) : async ProductWithStock {
    switch (categories.get(category)) {
      case (null) { Runtime.trap("Category " # category # " does not exist.") };
      case (?_) {};
    };
    let newProduct : Product = {
      id = nextProductId;
      name;
      description;
      price;
      imageUrl;
      category;
    };
    products.add(nextProductId, newProduct);
    stocks.add(nextProductId, stock);
    nextProductId += 1;
    withStock(newProduct);
  };

  public shared func updateProduct(id : Nat, name : Text, description : Text, price : Nat, category : Text, imageUrl : Text, stock : Nat) : async ProductWithStock {
    switch (products.get(id)) {
      case (null) { Runtime.trap("Product with id " # id.toText() # " does not exist.") };
      case (?_) {};
    };
    switch (categories.get(category)) {
      case (null) { Runtime.trap("Category " # category # " does not exist.") };
      case (?_) {};
    };
    let updatedProduct : Product = {
      id;
      name;
      description;
      price;
      imageUrl;
      category;
    };
    products.add(id, updatedProduct);
    stocks.add(id, stock);
    updatedProduct |> withStock(_);
  };

  public shared func deleteProduct(id : Nat) : async () {
    switch (products.get(id)) {
      case (null) { Runtime.trap("Product with id " # id.toText() # " does not exist.") };
      case (?_) {
        products.remove(id);
        stocks.remove(id);
      };
    };
  };

  public query func getAllProducts() : async [ProductWithStock] {
    products.values().toArray().map(withStock);
  };

  public query func getProduct(id : Nat) : async ProductWithStock {
    switch (products.get(id)) {
      case (null) { Runtime.trap("Product with id " # id.toText() # " does not exist.") };
      case (?product) { withStock(product) };
    };
  };

  // Categories
  public shared func addCategory(name : Text) : async () {
    switch (categories.get(name)) {
      case (null) { categories.add(name, ()) };
      case (?_) { Runtime.trap("Category " # name # " already exists.") };
    };
  };

  public shared func deleteCategory(name : Text) : async () {
    switch (categories.get(name)) {
      case (null) { Runtime.trap("Category " # name # " does not exist.") };
      case (?_) { categories.remove(name) };
    };
  };

  public query func getAllCategories() : async [Text] {
    categories.keys().toArray();
  };

  // Cart
  public shared ({ caller }) func addToCart(productId : Nat) : async () {
    switch (products.get(productId)) {
      case (null) { Runtime.trap("Product with id " # productId.toText() # " does not exist.") };
      case (?_) {};
    };
    let currentCart = switch (carts.get(caller)) {
      case (null) { [] };
      case (?cart) { cart };
    };
    carts.add(caller, currentCart.concat([productId]));
  };

  public shared ({ caller }) func removeFromCart(productId : Nat) : async () {
    let currentCart = switch (carts.get(caller)) {
      case (null) { Runtime.trap("Cart does not exist") };
      case (?cart) { cart };
    };
    let newCart = currentCart.filter(func(id) { id != productId });
    carts.add(caller, newCart);
  };

  public shared ({ caller }) func clearCart() : async () {
    carts.remove(caller);
  };

  public query ({ caller }) func getCart() : async [ProductWithStock] {
    let productIds = switch (carts.get(caller)) {
      case (null) { [] };
      case (?cart) { cart };
    };
    productIds.map(
      func(id) {
        switch (products.get(id)) {
          case (null) { Runtime.trap("Product with id " # id.toText() # " does not exist.") };
          case (?product) { withStock(product) };
        };
      }
    );
  };

  // Place order: reduce stock for each item in cart, then clear cart
  public shared ({ caller }) func placeOrder() : async () {
    let productIds = switch (carts.get(caller)) {
      case (null) { [] };
      case (?cart) { cart };
    };
    // Count quantity per product
    let counts = Map.empty<Nat, Nat>();
    for (id in productIds.values()) {
      let current = switch (counts.get(id)) {
        case (null) { 0 };
        case (?n) { n };
      };
      counts.add(id, current + 1);
    };
    // Deduct stock
    for ((id, qty) in counts.entries()) {
      let currentStock = switch (stocks.get(id)) {
        case (null) { 0 };
        case (?s) { s };
      };
      let newStock = if (currentStock >= qty) { currentStock - qty } else { 0 };
      stocks.add(id, newStock);
    };
    // Clear cart
    carts.remove(caller);
  };
};
