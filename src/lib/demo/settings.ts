import type { BusinessDay, PaymentFee } from "@/shared/api/settings";

// Demo data of the panel routes of the settings module (decision 0055): the
// initial values of supabase/seed.sql (RN013, RN012).

const CLOSED_DAY = {
  isOpen: false,
  opensAt: null,
  closesAt: null,
  breakStartsAt: null,
  breakEndsAt: null,
} as const;

function weekday(day: number): BusinessDay {
  // Monday to Friday: 08:00 to 18:00, with the lunch break.
  if (day >= 1 && day <= 5) {
    return {
      weekday: day,
      isOpen: true,
      opensAt: "08:00",
      closesAt: "18:00",
      breakStartsAt: "12:00",
      breakEndsAt: "13:00",
    };
  }
  // Saturday: 08:00 to 12:00, no break.
  if (day === 6) {
    return {
      weekday: day,
      isOpen: true,
      opensAt: "08:00",
      closesAt: "12:00",
      breakStartsAt: null,
      breakEndsAt: null,
    };
  }
  return { weekday: day, ...CLOSED_DAY };
}

const BUSINESS_HOURS: BusinessDay[] = [0, 1, 2, 3, 4, 5, 6].map(weekday);

// In the order of docs/configuracoes/rotas.md.
const PAYMENT_FEES: PaymentFee[] = [
  { paymentMethod: "credit", percent: 0 },
  { paymentMethod: "debit", percent: 0 },
  { paymentMethod: "pix", percent: 0 },
  { paymentMethod: "cash", percent: 0 },
];

// GET /api/admin/settings/business-hours (UC23): the seven days, from Sunday.
export function answerBusinessHours(): BusinessDay[] {
  return BUSINESS_HOURS;
}

// GET /api/admin/settings/payment-fees (UC24): the four methods, no
// adjustment.
export function answerPaymentFees(): PaymentFee[] {
  return PAYMENT_FEES;
}
