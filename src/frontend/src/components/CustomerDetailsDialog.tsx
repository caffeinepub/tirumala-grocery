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
  Building2,
  Copy,
  CreditCard,
  MapPin,
  Package,
  Phone,
  QrCode,
  Smartphone,
  User,
  Wallet,
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

type PaymentMode = "upi" | "bank";

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
  // UPI deep link format
  const amountRupees = (amount / 100).toFixed(2);
  const upiString = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(name)}&am=${amountRupees}&cu=INR`;
  // Use Google Charts QR code generator
  return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(upiString)}`;
}

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

  const defaultMode: PaymentMode = hasUpi ? "upi" : "bank";
  const [paymentMode, setPaymentMode] = useState<PaymentMode>(defaultMode);

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

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate(form);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    placeOrder.mutate(undefined, {
      onSuccess: () => {
        toast.success("Order placed successfully! We'll contact you shortly.", {
          duration: 5000,
        });
        setForm({
          name: "",
          phone: "",
          email: "",
          address: "",
          city: "",
          pincode: "",
        });
        setErrors({});
        onOrderPlaced();
      },
      onError: () => {
        toast.error("Something went wrong. Please try again.");
      },
    });
  }

  function handleCancel() {
    setErrors({});
    onClose();
  }

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
              Complete Your Order
            </DialogTitle>
          </DialogHeader>
          <div className="mt-3 flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              {itemCount} {itemCount === 1 ? "item" : "items"} in cart
            </span>
            <span className="font-display font-bold text-lg text-foreground">
              ₹{(total / 100).toFixed(2)}
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-5">
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
                  <p className="text-xs text-destructive mt-1">{errors.name}</p>
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
                      className={`pl-9 ${errors.phone ? "border-destructive" : ""}`}
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
                  <Label htmlFor="cust-pincode" className="text-sm font-medium">
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

          {/* Payment Section */}
          {hasBankDetails && (
            <>
              <Separator />
              <div data-ocid="customer.payment.panel">
                <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <CreditCard className="h-3.5 w-3.5" />
                  Payment Mode
                </h3>

                {/* Payment mode tabs */}
                {hasUpi && hasBank && (
                  <div className="flex rounded-lg border border-border overflow-hidden mb-4">
                    <button
                      type="button"
                      data-ocid="customer.payment.upi.tab"
                      onClick={() => setPaymentMode("upi")}
                      className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium transition-colors ${
                        paymentMode === "upi"
                          ? "bg-primary text-primary-foreground"
                          : "bg-background text-muted-foreground hover:bg-muted"
                      }`}
                    >
                      <Smartphone className="h-4 w-4" />
                      UPI / QR Code
                    </button>
                    <button
                      type="button"
                      data-ocid="customer.payment.bank.tab"
                      onClick={() => setPaymentMode("bank")}
                      className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium transition-colors ${
                        paymentMode === "bank"
                          ? "bg-primary text-primary-foreground"
                          : "bg-background text-muted-foreground hover:bg-muted"
                      }`}
                    >
                      <Wallet className="h-4 w-4" />
                      Bank Transfer
                    </button>
                  </div>
                )}

                {/* UPI Payment panel */}
                {(paymentMode === "upi" || !hasBank) && hasUpi && (
                  <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-4">
                    <p className="text-xs text-muted-foreground">
                      Scan the QR code using any UPI app (GPay, PhonePe, Paytm,
                      etc.) to pay ₹{(total / 100).toFixed(2)}.
                    </p>

                    {/* QR Code */}
                    <div className="flex flex-col items-center gap-3">
                      <div
                        data-ocid="customer.payment.qr.card"
                        className="bg-white p-3 rounded-xl border border-border shadow-sm"
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
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <QrCode className="h-3.5 w-3.5" />
                        Scan with any UPI app
                      </div>
                    </div>

                    {/* UPI ID with copy */}
                    <div className="flex items-center justify-between gap-2 bg-background rounded-md px-3 py-2 border border-border">
                      <div>
                        <p className="text-xs text-muted-foreground">UPI ID</p>
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
                        className="text-muted-foreground hover:text-foreground p-1.5 rounded hover:bg-muted"
                        aria-label="Copy UPI ID"
                      >
                        <Copy className="h-4 w-4" />
                      </button>
                    </div>

                    {bankDetails.accountHolder && (
                      <div className="flex items-center justify-between gap-2 text-sm">
                        <span className="text-muted-foreground">Pay to</span>
                        <span className="font-medium text-foreground">
                          {bankDetails.accountHolder}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {/* Bank Transfer panel */}
                {(paymentMode === "bank" || !hasUpi) && hasBank && (
                  <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-3 text-sm">
                    <p className="text-xs text-muted-foreground mb-1">
                      Transfer ₹{(total / 100).toFixed(2)} to the following
                      account and share the reference number when we contact
                      you.
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
                        <span className="text-muted-foreground flex items-center gap-1">
                          <Building2 className="h-3 w-3" /> Bank
                        </span>
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
            </>
          )}

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
              {placeOrder.isPending ? "Placing Order..." : "Place Order"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
