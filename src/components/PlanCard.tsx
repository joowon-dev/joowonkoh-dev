interface Plan {
  name: string;
  price: string;
  available: boolean;
  highlight?: boolean;
  note?: string;
}

interface PlanCardProps {
  plans: Plan[];
}

export default function PlanCard({ plans = [] }: PlanCardProps) {
  if (!plans || plans.length === 0) return null;
  return (
    <div className="my-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
      {plans.map((plan) => (
        <div
          key={plan.name}
          className={`relative rounded-2xl border p-4 text-center spring-transition ${
            plan.highlight
              ? "border-accent bg-accent-soft shadow-ambient"
              : "border-border bg-card-bg"
          }`}
        >
          {plan.highlight && (
            <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 rounded-full bg-accent px-2.5 py-0.5 text-[10px] font-semibold text-white">
              추천
            </span>
          )}
          <div className="text-sm font-semibold text-text-primary">{plan.name}</div>
          <div className="mt-1 text-lg font-bold text-text-primary">{plan.price}</div>
          <div
            className={`mt-2 inline-block rounded-full px-2.5 py-0.5 text-[11px] font-medium ${
              plan.available
                ? "bg-emerald-50 text-emerald-600"
                : "bg-red-50 text-red-500"
            }`}
          >
            {plan.available ? "사용 가능" : "사용 불가"}
          </div>
          {plan.note && (
            <div className="mt-1.5 text-[11px] text-text-muted">{plan.note}</div>
          )}
        </div>
      ))}
    </div>
  );
}
