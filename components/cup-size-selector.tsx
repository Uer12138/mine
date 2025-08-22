"use client"

interface CupSizeSelectorProps {
  value: "small" | "medium" | "large"
  onChange: (size: "small" | "medium" | "large") => void
}

export default function CupSizeSelector({ value, onChange }: CupSizeSelectorProps) {
  const sizes = [
    {
      key: "small" as const,
      name: "小杯",
      volume: "300ml",
      baseCalories: "40-80",
      description: "适合轻饮",
    },
    {
      key: "medium" as const,
      name: "中杯",
      volume: "500ml",
      baseCalories: "60-120",
      description: "标准选择",
    },
    {
      key: "large" as const,
      name: "大杯",
      volume: "700ml",
      baseCalories: "80-160",
      description: "超大满足",
    },
  ]

  return (
    <div className="grid grid-cols-3 gap-4">
      {sizes.map((size) => (
        <button
          key={size.key}
          onClick={() => onChange(size.key)}
          className={`p-4 rounded-lg border-2 transition-all text-left ${
            value === size.key
              ? "border-mint bg-mint/10 shadow-md"
              : "border-gray-200 hover:border-mint/50 hover:bg-mint/5"
          }`}
        >
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-lg">{size.name}</span>
              {value === size.key && <div className="w-3 h-3 bg-mint rounded-full" />}
            </div>
            <div className="text-sm text-gray-600">{size.volume}</div>
            <div className="text-xs text-mint-dark font-medium">{size.baseCalories} kcal</div>
            <div className="text-xs text-gray-500">{size.description}</div>
          </div>
        </button>
      ))}
    </div>
  )
}
