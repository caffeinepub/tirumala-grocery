import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
  ArrowLeft,
  Building2,
  ChevronDown,
  ChevronUp,
  Copy,
  MapPin,
  Package,
  Phone,
  QrCode,
  ShieldCheck,
  User,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { usePlaceOrder } from "../hooks/useQueries";
import { getBankDetails } from "./AdminPage";

interface CustomerDetailsDialogProps {
  open: boolean;
  onClose: () => void;
  onOrderPlaced: () => void;
  itemCount: number;
  total: number;
}

interface FormData {
  name: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  pincode: string;
}

interface FormErrors {
  name?: string;
  phone?: string;
  address?: string;
  city?: string;
  pincode?: string;
}

type Step = "details" | "payment";

function validate(data: FormData): FormErrors {
  const errors: FormErrors = {};
  if (!data.name.trim()) errors.name = "Full name is required";
  if (!data.phone.trim()) {
    errors.phone = "Phone number is required";
  } else if (!/^[6-9]\d{9}$/.test(data.phone.trim())) {
    errors.phone = "Enter a valid 10-digit Indian mobile number";
  }
  if (!data.address.trim()) errors.address = "Delivery address is required";
  if (!data.city.trim()) errors.city = "City is required";
  if (!data.pincode.trim()) {
    errors.pincode = "Pincode is required";
  } else if (!/^\d{6}$/.test(data.pincode.trim())) {
    errors.pincode = "Enter a valid 6-digit pincode";
  }
  return errors;
}

function copyToClipboard(text: string, label: string) {
  navigator.clipboard.writeText(text).then(() => {
    toast.success(`${label} copied`);
  });
}

function buildUpiQrUrl(upiId: string, name: string, amount: number): string {
  const amountRupees = (amount / 100).toFixed(2);
  const upiString = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(name)}&am=${amountRupees}&cu=INR&tn=Tirumala+Grocery`;
  return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(upiString)}`;
}

function buildUpiDeepLink(
  upiId: string,
  accountHolder: string,
  totalPaise: number,
): string {
  const amountRupees = (totalPaise / 100).toFixed(2);
  return `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(accountHolder || "Tirumala Grocery")}&am=${amountRupees}&cu=INR&tn=Tirumala+Grocery`;
}

const UPI_APPS = [
  {
    id: "gpay",
    name: "GPay",
    emoji: "🔵",
    bg: "#1A73E8",
    text: "#fff",
    label: "G",
    ocid: "customer.payment.gpay.button",
  },
  {
    id: "phonepe",
    name: "PhonePe",
    emoji: "💜",
    bg: "#5f259f",
    text: "#fff",
    label: "P",
    ocid: "customer.payment.phonepe.button",
  },
  {
    id: "paytm",
    name: "Paytm",
    emoji: "💳",
    bg: "#002970",
    text: "#fff",
    label: "Pay",
    ocid: "customer.payment.paytm.button",
  },
  {
    id: "bhim",
    name: "BHIM",
    emoji: "🇮🇳",
    bg: "#FF6600",
    text: "#fff",
    label: "B",
    ocid: "customer.payment.bhim.button",
  },
  {
    id: "amazonpay",
    name: "Amazon Pay",
    emoji: "📦",
    bg: "#FF9900",
    text: "#111",
    label: "a",
    ocid: "customer.payment.amazonpay.button",
  },
];

export function CustomerDetailsDialog({
  open,
  onClose,
  onOrderPlaced,
  itemCount,
  total,
}: CustomerDetailsDialogProps) {
  const placeOrder = usePlaceOrder();
  const bankDetails = getBankDetails();
  const hasBankDetails =
    bankDetails.accountNumber || bankDetails.upiId || bankDetails.accountHolder;
  const hasUpi = !!bankDetails.upiId;
  const hasBank = !!bankDetails.accountNumber;

  const [step, setStep] = useState<Step>("details");
  const [showBankTransfer, setShowBankTransfer] = useState(false);

  const [form, setForm] = useState<FormData>({
    name: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    pincode: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});

  function handleChange(field: keyof FormData, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  }

  function handleDetailsSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate(form);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    // If no payment details configured, place order directly
    if (!hasBankDetails) {
      doPlaceOrder();
    } else {
      setStep("payment");
    }
  }

  function doPlaceOrder() {
    placeOrder.mutate(undefined, {
      onSuccess: () => {
        toast.success("Order placed successfully! We'll contact you shortly.", {
          duration: 5000,
        });
        resetForm();
        onOrderPlaced();
      },
      onError: () => {
        toast.error("Something went wrong. Please try again.");
      },
    });
  }

  function resetForm() {
    setForm({
      name: "",
      phone: "",
      email: "",
      address: "",
      city: "",
      pincode: "",
    });
    setErrors({});
    setStep("details");
    setShowBankTransfer(false);
  }

  function handleCancel() {
    resetForm();
    onClose();
  }

  const amountDisplay = (total / 100).toFixed(2);
  const upiDeepLink = hasUpi
    ? buildUpiDeepLink(
        bankDetails.upiId,
        bankDetails.accountHolder || "Tirumala Grocery",
        total,
      )
    : "";

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleCancel()}>
      <DialogContent
        data-ocid="customer.dialog"
        className="max-w-lg w-full max-h-[90vh] overflow-y-auto p-0 gap-0"
      >
        {/* Order summary header */}
        <div className="bg-gradient-to-br from-primary/10 to-accent/10 px-6 pt-6 pb-4 border-b border-border">
          <DialogHeader>
            <DialogTitle className="font-display text-xl font-bold text-foreground flex items-center gap-2">
              <Package className="h-5 w-5 text-primary" />
              {step === "details" ? "Complete Your Order" : "Choose Payment"}
            </DialogTitle>
          </DialogHeader>
          <div className="mt-3 flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              {itemCount} {itemCount === 1 ? "item" : "items"} in cart
            </span>
            <span className="font-display font-bold text-lg text-foreground">
              ₹{amountDisplay}
            </span>
          </div>
          {/* Step indicator */}
          {hasBankDetails && (
            <div className="mt-3 flex items-center gap-2">
              <div
                className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full transition-colors ${
                  step === "details"
                    ? "bg-primary text-primary-foreground"
                    : "bg-primary/20 text-primary"
                }`}
              >
                <span
                  className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${
                    step === "payment"
                      ? "bg-primary text-primary-foreground"
                      : "bg-primary-foreground/30"
                  }`}
                >
                  {step === "payment" ? "✓" : "1"}
                </span>
                Details
              </div>
              <div className="flex-1 h-px bg-border" />
              <div
                className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full transition-colors ${
                  step === "payment"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                <span className="w-4 h-4 rounded-full bg-current/20 flex items-center justify-center text-[10px] font-bold">
                  2
                </span>
                Payment
              </div>
            </div>
          )}
        </div>

        {/* STEP 1: Details Form */}
        {step === "details" && (
          <form onSubmit={handleDetailsSubmit} className="px-6 py-5 space-y-5">
            <div>
              <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <User className="h-3.5 w-3.5" />
                Personal Details
              </h3>
              <div className="space-y-3">
                <div>
                  <Label htmlFor="cust-name" className="text-sm font-medium">
                    Full Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="cust-name"
                    data-ocid="customer.name_input"
                    placeholder="e.g. Ramesh Kumar"
                    value={form.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    className={errors.name ? "border-destructive" : ""}
                  />
                  {errors.name && (
                    <p className="text-xs text-destructive mt-1">
                      {errors.name}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="cust-phone" className="text-sm font-medium">
                      Phone <span className="text-destructive">*</span>
                    </Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                      <Input
                        id="cust-phone"
                        data-ocid="customer.phone_input"
                        placeholder="9876543210"
                        value={form.phone}
                        onChange={(e) => handleChange("phone", e.target.value)}
                        maxLength={10}
                        className={`pl-9 ${
                          errors.phone ? "border-destructive" : ""
                        }`}
                      />
                    </div>
                    {errors.phone && (
                      <p className="text-xs text-destructive mt-1">
                        {errors.phone}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="cust-email" className="text-sm font-medium">
                      Email{" "}
                      <span className="text-muted-foreground text-xs">
                        (optional)
                      </span>
                    </Label>
                    <Input
                      id="cust-email"
                      data-ocid="customer.email_input"
                      type="email"
                      placeholder="you@example.com"
                      value={form.email}
                      onChange={(e) => handleChange("email", e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            <div>
              <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5" />
                Delivery Address
              </h3>
              <div className="space-y-3">
                <div>
                  <Label htmlFor="cust-address" className="text-sm font-medium">
                    Street / Area <span className="text-destructive">*</span>
                  </Label>
                  <Textarea
                    id="cust-address"
                    data-ocid="customer.address_textarea"
                    placeholder="House no., street, area, landmark..."
                    value={form.address}
                    onChange={(e) => handleChange("address", e.target.value)}
                    rows={3}
                    className={errors.address ? "border-destructive" : ""}
                  />
                  {errors.address && (
                    <p className="text-xs text-destructive mt-1">
                      {errors.address}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="cust-city" className="text-sm font-medium">
                      City <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="cust-city"
                      data-ocid="customer.city_input"
                      placeholder="e.g. Hyderabad"
                      value={form.city}
                      onChange={(e) => handleChange("city", e.target.value)}
                      className={errors.city ? "border-destructive" : ""}
                    />
                    {errors.city && (
                      <p className="text-xs text-destructive mt-1">
                        {errors.city}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label
                      htmlFor="cust-pincode"
                      className="text-sm font-medium"
                    >
                      Pincode <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="cust-pincode"
                      data-ocid="customer.pincode_input"
                      placeholder="500001"
                      value={form.pincode}
                      onChange={(e) => handleChange("pincode", e.target.value)}
                      maxLength={6}
                      className={errors.pincode ? "border-destructive" : ""}
                    />
                    {errors.pincode && (
                      <p className="text-xs text-destructive mt-1">
                        {errors.pincode}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                data-ocid="customer.cancel_button"
                type="button"
                variant="outline"
                className="flex-1"
                onClick={handleCancel}
              >
                Back to Cart
              </Button>
              <Button
                data-ocid="customer.submit_button"
                type="submit"
                className="flex-1 bg-primary text-primary-foreground font-semibold"
                disabled={placeOrder.isPending}
              >
                {hasBankDetails ? "Proceed to Payment →" : "Place Order"}
              </Button>
            </div>
          </form>
        )}

        {/* STEP 2: Payment */}
        {step === "payment" && (
          <div className="px-6 py-5 space-y-5">
            {/* Amount summary */}
            <div className="rounded-xl bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 p-4 flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                  Amount to Pay
                </p>
                <p className="text-2xl font-bold text-foreground font-display">
                  ₹{amountDisplay}
                </p>
              </div>
              <ShieldCheck className="h-8 w-8 text-primary opacity-60" />
            </div>

            {/* UPI App Buttons */}
            {hasUpi && (
              <div>
                <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider mb-3">
                  Pay with UPI App
                </h3>
                <div className="grid grid-cols-5 gap-2">
                  {UPI_APPS.map((app) => (
                    <a
                      key={app.id}
                      href={upiDeepLink}
                      data-ocid={app.ocid}
                      onClick={(e) => {
                        e.preventDefault();
                        window.open(upiDeepLink, "_blank");
                      }}
                      className="flex flex-col items-center gap-1.5 group cursor-pointer"
                      aria-label={`Pay with ${app.name}`}
                    >
                      <div
                        className="w-12 h-12 rounded-2xl flex items-center justify-center text-lg font-bold shadow-sm group-hover:scale-110 transition-transform"
                        style={{
                          backgroundColor: app.bg,
                          color: app.text,
                        }}
                      >
                        {app.label}
                      </div>
                      <span className="text-[10px] text-muted-foreground font-medium text-center leading-tight">
                        {app.name}
                      </span>
                    </a>
                  ))}
                </div>

                <Separator className="my-4" />

                {/* QR Code section */}
                <div>
                  <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    <QrCode className="h-3.5 w-3.5" />
                    Or Scan QR Code
                  </h4>
                  <div className="flex flex-col items-center gap-3">
                    <div
                      data-ocid="customer.payment.qr.card"
                      className="bg-white p-3 rounded-2xl border border-border shadow-md"
                    >
                      <img
                        src={buildUpiQrUrl(
                          bankDetails.upiId,
                          bankDetails.accountHolder || "Tirumala Grocery",
                          total,
                        )}
                        alt="UPI QR Code"
                        width={180}
                        height={180}
                        className="block"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Scan with GPay, PhonePe, Paytm, or any UPI app
                    </p>
                  </div>

                  {/* UPI ID with copy */}
                  <div className="mt-3 flex items-center justify-between gap-2 bg-muted/50 rounded-xl px-4 py-2.5 border border-border">
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wide">
                        UPI ID
                      </p>
                      <p className="font-mono font-semibold text-sm text-foreground">
                        {bankDetails.upiId}
                      </p>
                    </div>
                    <button
                      type="button"
                      data-ocid="customer.payment.copy_upi.button"
                      onClick={() =>
                        copyToClipboard(bankDetails.upiId, "UPI ID")
                      }
                      className="text-muted-foreground hover:text-foreground p-1.5 rounded-lg hover:bg-muted transition-colors"
                      aria-label="Copy UPI ID"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                  </div>

                  {bankDetails.accountHolder && (
                    <div className="mt-2 flex items-center justify-between gap-2 text-sm px-1">
                      <span className="text-muted-foreground">Pay to</span>
                      <span className="font-medium text-foreground">
                        {bankDetails.accountHolder}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Bank Transfer - collapsible */}
            {hasBank && (
              <div className="rounded-xl border border-border overflow-hidden">
                <button
                  type="button"
                  onClick={() => setShowBankTransfer((v) => !v)}
                  className="w-full flex items-center justify-between px-4 py-3 bg-muted/30 hover:bg-muted/50 transition-colors text-sm font-medium"
                >
                  <span className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    Bank Transfer
                  </span>
                  {showBankTransfer ? (
                    <ChevronUp className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  )}
                </button>
                {showBankTransfer && (
                  <div className="px-4 py-3 space-y-2 text-sm bg-background">
                    <p className="text-xs text-muted-foreground mb-2">
                      Transfer ₹{amountDisplay} and share the reference when we
                      contact you.
                    </p>
                    {bankDetails.accountHolder && (
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-muted-foreground">
                          Account Holder
                        </span>
                        <span className="font-medium text-foreground">
                          {bankDetails.accountHolder}
                        </span>
                      </div>
                    )}
                    {bankDetails.bankName && (
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-muted-foreground">Bank</span>
                        <span className="font-medium text-foreground">
                          {bankDetails.bankName}
                        </span>
                      </div>
                    )}
                    {bankDetails.accountNumber && (
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-muted-foreground">
                          Account No.
                        </span>
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-semibold text-foreground">
                            {bankDetails.accountNumber}
                          </span>
                          <button
                            type="button"
                            data-ocid="customer.payment.copy_account.button"
                            onClick={() =>
                              copyToClipboard(
                                bankDetails.accountNumber,
                                "Account number",
                              )
                            }
                            className="text-muted-foreground hover:text-foreground"
                            aria-label="Copy account number"
                          >
                            <Copy className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    )}
                    {bankDetails.ifsc && (
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-muted-foreground">IFSC</span>
                        <span className="font-mono font-semibold text-foreground">
                          {bankDetails.ifsc}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-1">
              <Button
                data-ocid="customer.payment.back.button"
                type="button"
                variant="outline"
                className="flex-1 gap-2"
                onClick={() => setStep("details")}
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
              <Button
                data-ocid="customer.payment.confirm.button"
                type="button"
                className="flex-1 bg-primary text-primary-foreground font-semibold gap-2"
                disabled={placeOrder.isPending}
                onClick={doPlaceOrder}
              >
                {placeOrder.isPending ? (
                  "Placing Order..."
                ) : (
                  <>
                    <ShieldCheck className="h-4 w-4" />
                    Confirm &amp; Place Order
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
