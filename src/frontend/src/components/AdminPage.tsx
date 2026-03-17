import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Building2,
  CreditCard,
  KeyRound,
  Loader2,
  Pencil,
  Plus,
  ShieldOff,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { Product } from "../backend.d";
import {
  useAddCategory,
  useAddProduct,
  useDeleteCategory,
  useDeleteProduct,
  useGetAllCategories,
  useGetAllProducts,
  useUpdateProduct,
} from "../hooks/useQueries";
import type { Offer } from "./OffersBanner";

const DEFAULT_CATEGORIES = [
  "Fruits",
  "Vegetables",
  "Dairy",
  "Grains",
  "Spices",
];

export const BANK_DETAILS_KEY = "tg_bank_details";
export const OFFERS_KEY = "tg_offers";

export interface BankDetails {
  accountHolder: string;
  accountNumber: string;
  ifsc: string;
  bankName: string;
  upiId: string;
}

export function getBankDetails(): BankDetails {
  try {
    const raw = localStorage.getItem(BANK_DETAILS_KEY);
    if (raw) return JSON.parse(raw) as BankDetails;
  } catch {}
  return {
    accountHolder: "",
    accountNumber: "",
    ifsc: "",
    bankName: "",
    upiId: "",
  };
}

function getOffers(): Offer[] {
  try {
    const raw = localStorage.getItem(OFFERS_KEY);
    if (raw) return JSON.parse(raw) as Offer[];
  } catch {}
  return [];
}

function saveOffers(offers: Offer[]) {
  localStorage.setItem(OFFERS_KEY, JSON.stringify(offers));
}

interface ProductFormData {
  name: string;
  description: string;
  price: string;
  category: string;
  imageUrl: string;
  stock: string;
}

function formatPrice(price: bigint) {
  return `\u20B9${Number(price).toLocaleString("en-IN")}`;
}

function productToForm(product?: Product): ProductFormData {
  if (!product)
    return {
      name: "",
      description: "",
      price: "",
      category: "",
      imageUrl: "",
      stock: "0",
    };
  return {
    name: product.name,
    description: product.description,
    price: Number(product.price).toString(),
    category: product.category,
    imageUrl: product.imageUrl,
    stock: product.stock.toString(),
  };
}

function StockBadge({ stock }: { stock: bigint }) {
  if (Number(stock) === 0) {
    return (
      <Badge className="text-xs bg-destructive/15 text-destructive border-destructive/30 border font-medium">
        Out of Stock
      </Badge>
    );
  }
  if (Number(stock) <= 5) {
    return (
      <Badge className="text-xs bg-amber-500/15 text-amber-700 border-amber-400/40 border font-medium">
        Low: {stock.toString()}
      </Badge>
    );
  }
  return (
    <Badge className="text-xs bg-green-500/15 text-green-700 border-green-400/40 border font-medium">
      Stock: {stock.toString()}
    </Badge>
  );
}

interface ProductDialogProps {
  open: boolean;
  onClose: () => void;
  product?: Product;
  categories: string[];
}

function ProductDialog({
  open,
  onClose,
  product,
  categories,
}: ProductDialogProps) {
  const [form, setForm] = useState<ProductFormData>(() =>
    productToForm(product),
  );
  const addProduct = useAddProduct();
  const updateProduct = useUpdateProduct();
  const isPending = addProduct.isPending || updateProduct.isPending;

  function handleChange(field: keyof ProductFormData, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit() {
    if (!form.name.trim() || !form.price || !form.category) {
      toast.error("Please fill in all required fields");
      return;
    }
    const price = BigInt(
      Math.round(Math.abs(Number.parseFloat(form.price) || 0)),
    );
    const stock = BigInt(Math.max(0, Number.parseInt(form.stock) || 0));
    try {
      if (product) {
        await updateProduct.mutateAsync({
          id: product.id,
          name: form.name.trim(),
          description: form.description.trim(),
          price,
          category: form.category,
          imageUrl: form.imageUrl.trim(),
          stock,
        });
        toast.success("Product updated successfully");
      } else {
        await addProduct.mutateAsync({
          name: form.name.trim(),
          description: form.description.trim(),
          price,
          category: form.category,
          imageUrl: form.imageUrl.trim(),
          stock,
        });
        toast.success("Product added successfully");
      }
      onClose();
    } catch {
      toast.error("Something went wrong. Please try again.");
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent data-ocid="admin.product.dialog" className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display text-lg">
            {product ? "Edit Product" : "Add New Product"}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="prod-name">Name *</Label>
            <Input
              id="prod-name"
              data-ocid="admin.product.name.input"
              value={form.name}
              onChange={(e) => handleChange("name", e.target.value)}
              placeholder="e.g. Fresh Mango"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="prod-desc">Description</Label>
            <Textarea
              id="prod-desc"
              data-ocid="admin.product.description.textarea"
              value={form.description}
              onChange={(e) => handleChange("description", e.target.value)}
              placeholder="Short product description"
              rows={3}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="prod-price">Price (\u20B9) *</Label>
              <Input
                id="prod-price"
                data-ocid="admin.product.price.input"
                type="number"
                min="0"
                step="1"
                value={form.price}
                onChange={(e) => handleChange("price", e.target.value)}
                placeholder="50"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Category *</Label>
              <Select
                value={form.category}
                onValueChange={(v) => handleChange("category", v)}
              >
                <SelectTrigger data-ocid="admin.product.category.select">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="prod-stock">Stock Quantity</Label>
            <Input
              id="prod-stock"
              data-ocid="admin.product.stock.input"
              type="number"
              min="0"
              step="1"
              value={form.stock}
              onChange={(e) => handleChange("stock", e.target.value)}
              placeholder="0"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="prod-img">Image URL (optional)</Label>
            <Input
              id="prod-img"
              data-ocid="admin.product.image.input"
              value={form.imageUrl}
              onChange={(e) => handleChange("imageUrl", e.target.value)}
              placeholder="https://..."
            />
          </div>
        </div>
        <DialogFooter className="gap-2">
          <Button
            type="button"
            variant="outline"
            data-ocid="admin.product.cancel_button"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            type="button"
            data-ocid="admin.product.save_button"
            onClick={handleSubmit}
            disabled={isPending}
            className="bg-primary text-primary-foreground"
          >
            {isPending ? (
              <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
            ) : null}
            {isPending
              ? "Saving..."
              : product
                ? "Update Product"
                : "Add Product"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Offers Tab ────────────────────────────────────────────────────────────────

const EMPTY_OFFER_FORM = {
  title: "",
  description: "",
  badge: "",
  color: "saffron",
};

function OffersTab() {
  const [offers, setOffers] = useState<Offer[]>(() => getOffers());
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_OFFER_FORM);

  function handleFormChange(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function openAddForm() {
    setEditingId(null);
    setForm(EMPTY_OFFER_FORM);
    setShowForm(true);
  }

  function openEditForm(offer: Offer) {
    setEditingId(offer.id);
    setForm({
      title: offer.title,
      description: offer.description,
      badge: offer.badge,
      color: offer.color,
    });
    setShowForm(true);
  }

  function handleSave() {
    if (!form.title.trim()) {
      toast.error("Title is required");
      return;
    }
    let updated: Offer[];
    if (editingId) {
      updated = offers.map((o) =>
        o.id === editingId
          ? {
              ...o,
              title: form.title.trim(),
              description: form.description.trim(),
              badge: form.badge.trim() || "OFFER",
              color: form.color,
            }
          : o,
      );
    } else {
      const newOffer: Offer = {
        id: `offer_${Date.now()}`,
        title: form.title.trim(),
        description: form.description.trim(),
        badge: form.badge.trim() || "OFFER",
        color: form.color,
      };
      updated = [...offers, newOffer];
    }
    saveOffers(updated);
    setOffers(updated);
    setShowForm(false);
    setEditingId(null);
    toast.success(editingId ? "Offer updated" : "Offer added");
  }

  function handleDelete(id: string) {
    const updated = offers.filter((o) => o.id !== id);
    saveOffers(updated);
    setOffers(updated);
    toast.success("Offer removed");
  }

  function handleCancel() {
    setShowForm(false);
    setEditingId(null);
  }

  const COLOR_LABELS: Record<string, string> = {
    saffron: "Saffron / Orange",
    green: "Green",
    red: "Red",
    blue: "Blue",
  };

  return (
    <div className="space-y-5 max-w-lg">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-semibold text-foreground">
            Festival &amp; Offers
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Offers shown in the scrolling banner on the homepage.
          </p>
        </div>
        {!showForm && (
          <Button
            type="button"
            data-ocid="admin.offer.add_button"
            size="sm"
            onClick={openAddForm}
            className="bg-primary text-primary-foreground gap-1.5"
          >
            <Plus className="h-3.5 w-3.5" />
            Add Offer
          </Button>
        )}
      </div>

      {showForm && (
        <div className="border border-amber-200 rounded-xl bg-amber-50/60 p-4 space-y-4">
          <h3 className="text-sm font-semibold text-stone-700">
            {editingId ? "Edit Offer" : "New Offer"}
          </h3>
          <div className="space-y-1.5">
            <Label htmlFor="offer-title">Title *</Label>
            <Input
              id="offer-title"
              data-ocid="admin.offer.title.input"
              value={form.title}
              onChange={(e) => handleFormChange("title", e.target.value)}
              placeholder="e.g. Diwali Special — 20% off on Dry Fruits"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="offer-desc">Description</Label>
            <Textarea
              id="offer-desc"
              data-ocid="admin.offer.description.textarea"
              value={form.description}
              onChange={(e) => handleFormChange("description", e.target.value)}
              placeholder="e.g. Valid till October 31st"
              rows={2}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="offer-badge">Badge Text</Label>
              <Input
                id="offer-badge"
                data-ocid="admin.offer.badge.input"
                value={form.badge}
                onChange={(e) => handleFormChange("badge", e.target.value)}
                placeholder="e.g. FESTIVAL"
                maxLength={16}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Color Theme</Label>
              <Select
                value={form.color}
                onValueChange={(v) => handleFormChange("color", v)}
              >
                <SelectTrigger data-ocid="admin.offer.color.select">
                  <SelectValue placeholder="Pick color" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(COLOR_LABELS).map(([val, label]) => (
                    <SelectItem key={val} value={val}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex gap-2 pt-1">
            <Button
              type="button"
              data-ocid="admin.offer.save_button"
              onClick={handleSave}
              className="bg-primary text-primary-foreground"
              size="sm"
            >
              {editingId ? "Update Offer" : "Save Offer"}
            </Button>
            <Button
              type="button"
              variant="outline"
              data-ocid="admin.offer.cancel_button"
              onClick={handleCancel}
              size="sm"
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {offers.length === 0 && !showForm ? (
        <div
          data-ocid="admin.offers.empty_state"
          className="text-center py-12 border border-dashed border-amber-200 rounded-xl text-muted-foreground bg-amber-50/30"
        >
          <p className="text-sm">No offers yet.</p>
          <p className="text-xs mt-1">
            Add a festival or promotional offer above.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {offers.map((offer, i) => (
            <div
              key={offer.id}
              data-ocid={`admin.offer.item.${i + 1}`}
              className="flex items-center justify-between px-4 py-3 border border-border rounded-lg hover:bg-muted/20 transition-colors"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold tracking-widest uppercase bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full shrink-0">
                    {offer.badge || "OFFER"}
                  </span>
                  <p className="text-sm font-medium text-foreground truncate">
                    {offer.title}
                  </p>
                </div>
                {offer.description && (
                  <p className="text-xs text-muted-foreground mt-0.5 truncate">
                    {offer.description}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-1.5 ml-3 shrink-0">
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  onClick={() => openEditForm(offer)}
                  className="h-7 w-7 text-muted-foreground hover:text-foreground"
                  aria-label="Edit offer"
                >
                  <Pencil className="h-3 w-3" />
                </Button>
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  data-ocid={`admin.offer.delete_button.${i + 1}`}
                  onClick={() => handleDelete(offer.id)}
                  className="h-7 w-7 text-muted-foreground hover:text-destructive"
                  aria-label="Delete offer"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Settings Tab ──────────────────────────────────────────────────────────────

function SettingsTab() {
  const [currentPin, setCurrentPin] = useState("");
  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");

  const [bank, setBank] = useState<BankDetails>(() => getBankDetails());

  function handleUpdatePin() {
    const savedPin = localStorage.getItem("tg_admin_pin") || "9999";

    if (!currentPin || !newPin || !confirmPin) {
      toast.error("Please fill in all fields");
      return;
    }
    if (currentPin !== savedPin) {
      toast.error("Current PIN is incorrect");
      return;
    }
    if (!/^\d{4}$/.test(newPin)) {
      toast.error("New PIN must be exactly 4 digits");
      return;
    }
    if (newPin !== confirmPin) {
      toast.error("New PIN and Confirm PIN do not match");
      return;
    }

    localStorage.setItem("tg_admin_pin", newPin);
    toast.success("PIN updated successfully");
    setCurrentPin("");
    setNewPin("");
    setConfirmPin("");
  }

  function handleBankChange(field: keyof BankDetails, value: string) {
    setBank((prev) => ({ ...prev, [field]: value }));
  }

  function handleSaveBankDetails() {
    localStorage.setItem(BANK_DETAILS_KEY, JSON.stringify(bank));
    toast.success("Payment details saved");
  }

  return (
    <div className="max-w-sm space-y-8">
      {/* PIN section */}
      <div>
        <div className="flex items-center gap-2 mb-6">
          <div className="h-3 w-3 rounded-full bg-primary/10 flex items-center justify-center">
            <KeyRound className="h-2.5 w-2.5 text-primary" />
          </div>
          <div>
            <h2 className="font-semibold text-foreground text-sm">
              Change Admin PIN
            </h2>
            <p className="text-xs text-muted-foreground">
              Update your 4-digit admin access PIN
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="current-pin">Current PIN</Label>
            <Input
              id="current-pin"
              data-ocid="admin.settings.current_pin.input"
              type="password"
              inputMode="numeric"
              maxLength={4}
              value={currentPin}
              onChange={(e) =>
                setCurrentPin(e.target.value.replace(/\D/g, "").slice(0, 4))
              }
              placeholder="Enter current PIN"
              className="tracking-widest max-w-xs"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="new-pin">New PIN</Label>
            <Input
              id="new-pin"
              data-ocid="admin.settings.new_pin.input"
              type="password"
              inputMode="numeric"
              maxLength={4}
              value={newPin}
              onChange={(e) =>
                setNewPin(e.target.value.replace(/\D/g, "").slice(0, 4))
              }
              placeholder="Enter new 4-digit PIN"
              className="tracking-widest max-w-xs"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="confirm-pin">Confirm New PIN</Label>
            <Input
              id="confirm-pin"
              data-ocid="admin.settings.confirm_pin.input"
              type="password"
              inputMode="numeric"
              maxLength={4}
              value={confirmPin}
              onChange={(e) =>
                setConfirmPin(e.target.value.replace(/\D/g, "").slice(0, 4))
              }
              placeholder="Re-enter new PIN"
              className="tracking-widest max-w-xs"
            />
          </div>

          <Button
            type="button"
            data-ocid="admin.settings.save_button"
            onClick={handleUpdatePin}
            className="bg-primary text-primary-foreground w-full max-w-xs"
          >
            Update PIN
          </Button>
        </div>
      </div>

      <Separator />

      {/* Bank / Payment Details section */}
      <div>
        <div className="flex items-center gap-2 mb-6">
          <div className="h-3 w-3 rounded-full bg-primary/10 flex items-center justify-center">
            <CreditCard className="h-2.5 w-2.5 text-primary" />
          </div>
          <div>
            <h2 className="font-semibold text-foreground text-sm">
              Payment Details
            </h2>
            <p className="text-xs text-muted-foreground">
              Shown to customers at checkout for bank transfer / UPI payments
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="bank-holder">Account Holder Name</Label>
            <Input
              id="bank-holder"
              data-ocid="admin.settings.bank_holder.input"
              value={bank.accountHolder}
              onChange={(e) =>
                handleBankChange("accountHolder", e.target.value)
              }
              placeholder="e.g. Tirumala Enterprises"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="bank-name">
              <Building2 className="inline h-2 w-2 mr-1" />
              Bank Name
            </Label>
            <Input
              id="bank-name"
              data-ocid="admin.settings.bank_name.input"
              value={bank.bankName}
              onChange={(e) => handleBankChange("bankName", e.target.value)}
              placeholder="e.g. State Bank of India"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="bank-account">Account Number</Label>
            <Input
              id="bank-account"
              data-ocid="admin.settings.bank_account.input"
              value={bank.accountNumber}
              onChange={(e) =>
                handleBankChange("accountNumber", e.target.value)
              }
              placeholder="e.g. 1234567890"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="bank-ifsc">IFSC Code</Label>
            <Input
              id="bank-ifsc"
              data-ocid="admin.settings.bank_ifsc.input"
              value={bank.ifsc}
              onChange={(e) =>
                handleBankChange("ifsc", e.target.value.toUpperCase())
              }
              placeholder="e.g. SBIN0001234"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="bank-upi">UPI ID</Label>
            <Input
              id="bank-upi"
              data-ocid="admin.settings.bank_upi.input"
              value={bank.upiId}
              onChange={(e) => handleBankChange("upiId", e.target.value)}
              placeholder="e.g. tirumala@upi"
            />
          </div>

          <Button
            type="button"
            data-ocid="admin.settings.save_bank_button"
            onClick={handleSaveBankDetails}
            className="bg-primary text-primary-foreground w-full max-w-xs"
          >
            Save Payment Details
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Admin Page ────────────────────────────────────────────────────────────────

export function AdminPage({
  onBack,
  onDeactivateAdmin,
}: { onBack: () => void; onDeactivateAdmin?: () => void }) {
  const { data: products, isLoading: productsLoading } = useGetAllProducts();
  const { data: categories, isLoading: catsLoading } = useGetAllCategories();
  const deleteProduct = useDeleteProduct();
  const addCategory = useAddCategory();
  const deleteCategory = useDeleteCategory();

  const [productDialogOpen, setProductDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | undefined>();
  const [dialogKey, setDialogKey] = useState(0);
  const [newCategory, setNewCategory] = useState("");

  const allCategories =
    categories && categories.length > 0 ? categories : DEFAULT_CATEGORIES;

  function openAddProduct() {
    setEditingProduct(undefined);
    setDialogKey((k) => k + 1);
    setProductDialogOpen(true);
  }

  function openEditProduct(p: Product) {
    setEditingProduct(p);
    setDialogKey((k) => k + 1);
    setProductDialogOpen(true);
  }

  async function handleDeleteProduct(p: Product) {
    try {
      await deleteProduct.mutateAsync(p.id);
      toast.success(`"${p.name}" deleted`);
    } catch {
      toast.error("Could not delete product");
    }
  }

  async function handleAddCategory() {
    const name = newCategory.trim();
    if (!name) return;
    try {
      await addCategory.mutateAsync(name);
      setNewCategory("");
      toast.success(`Category "${name}" added`);
    } catch {
      toast.error("Could not add category");
    }
  }

  async function handleDeleteCategory(name: string) {
    try {
      await deleteCategory.mutateAsync(name);
      toast.success(`Category "${name}" deleted`);
    } catch {
      toast.error("Could not delete category");
    }
  }

  const grouped = (products ?? []).reduce<Record<string, Product[]>>(
    (acc, p) => {
      if (!acc[p.category]) acc[p.category] = [];
      acc[p.category].push(p);
      return acc;
    },
    {},
  );

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="container mx-auto flex items-center justify-between h-14 px-4 md:px-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              data-ocid="admin.back_button"
              onClick={onBack}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
            >
              ← Back to Store
            </button>
            <span className="text-muted-foreground/40">|</span>
            <span className="font-display font-semibold text-foreground">
              Admin Panel
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="secondary" className="text-xs">
              Tirumala Grocery
            </Badge>
            {onDeactivateAdmin && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                data-ocid="admin.deactivate_device.button"
                onClick={onDeactivateAdmin}
                className="text-xs text-destructive border-destructive/40 hover:bg-destructive/10 hover:text-destructive gap-1.5"
              >
                <ShieldOff className="h-2.5 w-2.5" />
                Remove admin access
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto">
        <div className="container mx-auto px-4 md:px-6 py-8 max-w-4xl">
          <div className="mb-8">
            <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-1">
              Product Management
            </h1>
            <p className="text-muted-foreground text-sm">
              Add, edit, or remove products and categories.
            </p>
          </div>

          <Tabs defaultValue="products" data-ocid="admin.tabs">
            <TabsList className="mb-6">
              <TabsTrigger value="products" data-ocid="admin.products.tab">
                Products
              </TabsTrigger>
              <TabsTrigger value="categories" data-ocid="admin.categories.tab">
                Categories
              </TabsTrigger>
              <TabsTrigger value="offers" data-ocid="admin.offers.tab">
                Offers
              </TabsTrigger>
              <TabsTrigger value="settings" data-ocid="admin.settings.tab">
                Settings
              </TabsTrigger>
            </TabsList>

            <TabsContent value="products">
              <div className="flex justify-between items-center mb-5">
                <h2 className="font-semibold text-foreground">
                  All Products
                  {products && (
                    <span className="ml-2 text-muted-foreground font-normal text-sm">
                      ({products.length})
                    </span>
                  )}
                </h2>
                <Button
                  type="button"
                  data-ocid="admin.add_product.open_modal_button"
                  onClick={openAddProduct}
                  size="sm"
                  className="bg-primary text-primary-foreground gap-1.5"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add Product
                </Button>
              </div>

              {productsLoading ? (
                <div
                  data-ocid="admin.products.loading_state"
                  className="space-y-3"
                >
                  {[1, 2, 3].map((k) => (
                    <Skeleton key={k} className="h-14 w-full rounded-lg" />
                  ))}
                </div>
              ) : !products || products.length === 0 ? (
                <div
                  data-ocid="admin.products.empty_state"
                  className="text-center py-16 border border-dashed border-border rounded-xl text-muted-foreground"
                >
                  <p className="text-sm">No products yet.</p>
                  <p className="text-xs mt-1">
                    Click &ldquo;Add Product&rdquo; to get started.
                  </p>
                </div>
              ) : (
                <Accordion type="multiple" className="space-y-2">
                  {Object.entries(grouped).map(([cat, items], ci) => (
                    <AccordionItem
                      key={cat}
                      value={cat}
                      className="border border-border rounded-lg overflow-hidden"
                      data-ocid={`admin.category.panel.${ci + 1}`}
                    >
                      <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-muted/40 font-medium">
                        <span className="flex items-center gap-2">
                          {cat}
                          <Badge
                            variant="outline"
                            className="text-xs font-normal"
                          >
                            {items.length}
                          </Badge>
                        </span>
                      </AccordionTrigger>
                      <AccordionContent className="px-0 pb-0">
                        <div className="divide-y divide-border">
                          {items.map((p, pi) => (
                            <div
                              key={p.id.toString()}
                              data-ocid={`admin.product.item.${pi + 1}`}
                              className="flex items-center justify-between px-4 py-3 hover:bg-muted/20 transition-colors"
                            >
                              <div className="min-w-0 flex-1">
                                <p className="text-sm font-medium text-foreground truncate">
                                  {p.name}
                                </p>
                                <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                                  <p className="text-xs text-muted-foreground">
                                    {formatPrice(p.price)}
                                    {p.description &&
                                      ` · ${p.description.slice(0, 50)}${p.description.length > 50 ? "..." : ""}`}
                                  </p>
                                  <StockBadge stock={p.stock} />
                                </div>
                              </div>
                              <div className="flex items-center gap-2 ml-3 shrink-0">
                                <Button
                                  type="button"
                                  size="icon"
                                  variant="ghost"
                                  data-ocid={`admin.product.edit_button.${pi + 1}`}
                                  onClick={() => openEditProduct(p)}
                                  className="h-4 w-4 text-muted-foreground hover:text-foreground"
                                  aria-label="Edit product"
                                >
                                  <Pencil className="h-2.5 w-2.5" />
                                </Button>
                                <Button
                                  type="button"
                                  size="icon"
                                  variant="ghost"
                                  data-ocid={`admin.product.delete_button.${pi + 1}`}
                                  onClick={() => handleDeleteProduct(p)}
                                  disabled={deleteProduct.isPending}
                                  className="h-4 w-4 text-muted-foreground hover:text-destructive"
                                  aria-label="Delete product"
                                >
                                  <Trash2 className="h-2.5 w-2.5" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              )}
            </TabsContent>

            <TabsContent value="categories">
              <div className="mb-5">
                <h2 className="font-semibold text-foreground mb-4">
                  Categories
                </h2>
                <div className="flex gap-2">
                  <Input
                    data-ocid="admin.category.input"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    placeholder="New category name"
                    onKeyDown={(e) => e.key === "Enter" && handleAddCategory()}
                    className="max-w-xs"
                  />
                  <Button
                    type="button"
                    data-ocid="admin.category.add_button"
                    onClick={handleAddCategory}
                    disabled={addCategory.isPending || !newCategory.trim()}
                    className="bg-primary text-primary-foreground gap-1.5"
                  >
                    {addCategory.isPending ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Plus className="h-3.5 w-3.5" />
                    )}
                    Add
                  </Button>
                </div>
              </div>

              {catsLoading ? (
                <div
                  data-ocid="admin.categories.loading_state"
                  className="space-y-2"
                >
                  {[1, 2, 3].map((k) => (
                    <Skeleton key={k} className="h-12 w-full rounded-lg" />
                  ))}
                </div>
              ) : allCategories.length === 0 ? (
                <div
                  data-ocid="admin.categories.empty_state"
                  className="text-center py-12 border border-dashed border-border rounded-xl text-muted-foreground text-sm"
                >
                  No categories yet. Add one above.
                </div>
              ) : (
                <div
                  data-ocid="admin.categories.list"
                  className="border border-border rounded-lg divide-y divide-border overflow-hidden"
                >
                  {allCategories.map((cat, i) => (
                    <div
                      key={cat}
                      data-ocid={`admin.category.item.${i + 1}`}
                      className="flex items-center justify-between px-4 py-3 hover:bg-muted/20 transition-colors"
                    >
                      <span className="text-sm font-medium text-foreground">
                        {cat}
                      </span>
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        data-ocid={`admin.category.delete_button.${i + 1}`}
                        onClick={() => handleDeleteCategory(cat)}
                        disabled={deleteCategory.isPending}
                        className="h-4 w-4 text-muted-foreground hover:text-destructive"
                        aria-label={`Delete ${cat}`}
                      >
                        <Trash2 className="h-2.5 w-2.5" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="offers">
              <OffersTab />
            </TabsContent>

            <TabsContent value="settings">
              <SettingsTab />
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <ProductDialog
        key={dialogKey}
        open={productDialogOpen}
        onClose={() => setProductDialogOpen(false)}
        product={editingProduct}
        categories={allCategories}
      />
    </div>
  );
}
