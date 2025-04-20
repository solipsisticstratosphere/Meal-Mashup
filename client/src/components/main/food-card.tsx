import { Star } from "lucide-react";
import { cn } from "../../lib/utils";

interface FoodCardProps {
  title: string;
  image: string;
  tags: string[];
  rating: number;
  featured?: boolean;
}

export function FoodCard({
  title,
  image,
  tags,
  rating,
  featured = false,
}: FoodCardProps) {
  return (
    <div
      className={cn(
        "group rounded-xl overflow-hidden bg-white shadow-lg hover:shadow-xl transition-all duration-300",
        featured ? "md:scale-105 ring-2 ring-rose-200" : ""
      )}
    >
      <div className="relative">
        <img
          src={image || "/placeholder.svg"}
          alt={title}
          className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {featured && (
          <div className="absolute top-3 right-3 bg-rose-500 text-white text-xs font-bold px-2 py-1 rounded-full">
            Popular
          </div>
        )}
      </div>

      <div className="p-5">
        <h3 className="font-bold text-lg mb-2">{title}</h3>

        <div className="flex flex-wrap gap-2 mb-3">
          {tags.map((tag) => (
            <span
              key={tag}
              className="text-xs bg-slate-100 text-slate-700 px-2 py-1 rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>

        <div className="flex items-center">
          <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
          <span className="ml-1 text-sm font-medium">{rating}</span>
        </div>
      </div>
    </div>
  );
}
