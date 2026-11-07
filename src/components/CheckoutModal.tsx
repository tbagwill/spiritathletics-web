'use client';

import { useState } from 'react';
import { Lock, ShoppingBag } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/Button';
import { Checkbox } from '@/components/ui/Checkbox';
import { Field, FormAlert, Input } from '@/components/ui/Field';
import { Sheet, SheetMeta } from '@/components/ui/Sheet';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const FORM_ID = 'shop-checkout-form';
const money = (cents: number) => `$${(cents / 100).toFixed(2)}`;

export default function CheckoutModal({ isOpen, onClose }: CheckoutModalProps) {
  const { state, getTotalItems, getTotalPrice, clearCart } = useCart();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    agreeToTerms: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.email.trim()) {
      newErrors.email = 'Enter your email.';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Enter a valid email.';
    }

    if (!formData.name.trim()) {
      newErrors.name = 'Enter your name.';
    }

    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = 'Please confirm you understand this is a preorder.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const cartItems = state.items.map((item) => ({
        productId: item.productId,
        sizeId: item.sizeId,
        quantity: item.quantity,
      }));

      const response = await fetch('/api/shop/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cartItems,
          customerEmail: formData.email,
          customerName: formData.name.trim() || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Checkout failed');
      }

      // Clear cart and redirect to Stripe
      clearCart();
      onClose();
      window.location.href = data.url;
    } catch (error) {
      console.error('Checkout error:', error);
      setSubmitError(
        `${error instanceof Error ? error.message : 'Checkout failed'}. Please try again.`,
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const itemCount = getTotalItems();

  return (
    <Sheet
      open={isOpen}
      onOpenChange={(next) => {
        if (!next && !isSubmitting) onClose();
      }}
      eyebrow="Pop-up shop"
      title="Checkout"
      meta={
        <SheetMeta icon={<ShoppingBag />}>
          {itemCount} item{itemCount === 1 ? '' : 's'}
        </SheetMeta>
      }
      footer={
        <>
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="text-xs text-slate-500">Total</div>
              <div className="text-2xl font-semibold tabular-nums tracking-tight">{money(getTotalPrice())}</div>
            </div>
            <Button
              type="submit"
              form={FORM_ID}
              size="lg"
              loading={isSubmitting}
              disabled={itemCount === 0}
              className="px-6"
            >
              {isSubmitting ? 'One moment…' : 'Continue to payment'}
            </Button>
          </div>
          <p className="mt-3 flex items-center gap-1.5 text-xs text-slate-500">
            <Lock className="size-3.5 shrink-0" aria-hidden />
            Secure checkout with Stripe. Cards, Apple Pay and Google Pay.
          </p>
        </>
      }
    >
      <form id={FORM_ID} onSubmit={handleSubmit} noValidate className="grid gap-6">
        <ul className="divide-y divide-slate-100 rounded-2xl bg-slate-50 px-4 ring-1 ring-inset ring-slate-200">
          {state.items.map((item) => (
            <li key={`${item.productId}-${item.sizeId}`} className="flex items-center justify-between gap-3 py-3 text-sm">
              <span className="min-w-0">
                <span className="block truncate font-medium text-slate-900">{item.productName}</span>
                <span className="text-slate-500">
                  {item.sizeName} · Qty {item.quantity}
                </span>
              </span>
              <span className="shrink-0 font-semibold tabular-nums">{money(item.price * item.quantity)}</span>
            </li>
          ))}
        </ul>

        <div className="grid gap-4">
          <Field label="Full name" error={errors.name || null}>
            {(id) => (
              <Input
                id={id}
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                autoComplete="name"
                disabled={isSubmitting}
                invalid={!!errors.name}
              />
            )}
          </Field>
          <Field label="Email" hint="Your receipt and order updates are sent here." error={errors.email || null}>
            {(id) => (
              <Input
                id={id}
                type="email"
                inputMode="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                autoComplete="email"
                disabled={isSubmitting}
                invalid={!!errors.email}
              />
            )}
          </Field>
        </div>

        <div>
          <Checkbox
            checked={formData.agreeToTerms}
            onCheckedChange={(checked) => handleInputChange('agreeToTerms', checked)}
            disabled={isSubmitting}
            invalid={!!errors.agreeToTerms}
          >
            I understand this is a preorder. Items are ordered in bulk when the campaign closes and ship within 2–3
            weeks.
          </Checkbox>
          {errors.agreeToTerms ? (
            <p role="alert" className="mt-1.5 pl-8 text-xs font-medium text-red-600">
              {errors.agreeToTerms}
            </p>
          ) : null}
        </div>

        {submitError ? <FormAlert>{submitError}</FormAlert> : null}
      </form>
    </Sheet>
  );
}
