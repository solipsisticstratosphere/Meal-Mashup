import { Utensils, Sparkles, Trophy } from "lucide-react";

interface FeatureCardProps {
  icon: string;
  title: string;
  description: string;
  step: number;
}

export function FeatureCard({
  icon,
  title,
  description,
  step,
}: FeatureCardProps) {
  const getIcon = () => {
    switch (icon) {
      case "Utensils":
        return <Utensils className="w-6 h-6 text-white" />;
      case "Sparkles":
        return <Sparkles className="w-6 h-6 text-white" />;
      case "Trophy":
        return <Trophy className="w-6 h-6 text-white" />;
      default:
        return <Utensils className="w-6 h-6 text-white" />;
    }
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 relative">
      <div className="absolute -top-4 -left-4 w-12 h-12 rounded-full bg-gradient-to-br from-rose-500 to-fuchsia-500 flex items-center justify-center shadow-md">
        <span className="text-white font-bold">{step}</span>
      </div>

      <div className="mb-5 w-12 h-12 rounded-lg bg-gradient-to-br from-rose-500 to-fuchsia-500 flex items-center justify-center">
        {getIcon()}
      </div>

      <h3 className="text-xl font-bold mb-3">{title}</h3>
      <p className="text-slate-600">{description}</p>
    </div>
  );
}
