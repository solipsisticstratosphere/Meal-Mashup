import { Star, Utensils, ThumbsUp, ThumbsDown } from "lucide-react";
import { cn } from "../../lib/utils";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { useMutation } from "@apollo/client";
import { VOTE_RECIPE } from "@/lib/graphql";
import { toast } from "sonner";

interface FoodCardProps {
  id: string;
  title: string;
  image: string;
  tags: string[];
  rating: number;
  featured?: boolean;
  from?: string;
  userVote?: "like" | "dislike" | null;
  likes?: number;
  dislikes?: number;
}

export function FoodCard({
  id,
  title,
  image,
  tags,
  rating,
  featured = false,
  from,
  userVote = null,
  likes = 0,
  dislikes = 0,
}: FoodCardProps) {
  const [imageError, setImageError] = useState(false);
  const [currentUserVote, setCurrentUserVote] = useState(userVote);
  const { status } = useSession();
  const isAuthenticated = status === "authenticated";
  const href = from ? `/recipes/${id}?from=${from}` : `/recipes/${id}`;

  const totalVotes = rating || likes - dislikes;

  const [voteRecipeMutation] = useMutation(VOTE_RECIPE);

  const gradients = [
    "from-amber-200 to-orange-400",
    "from-rose-300 to-fuchsia-500",
    "from-blue-300 to-cyan-500",
    "from-emerald-300 to-teal-500",
    "from-indigo-300 to-purple-500",
  ];

  const gradientIndex = id
    ? parseInt(id.replace(/\D/g, "").slice(0, 4), 10) % gradients.length
    : Math.floor(Math.random() * gradients.length);

  const backgroundGradient = gradients[gradientIndex];

  const handleVote = async (e: React.MouseEvent, vote: "like" | "dislike") => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      toast.error("You need to be logged in to vote");
      return;
    }

    try {
      const voteToSend = currentUserVote === vote ? null : vote;

      const { data } = await voteRecipeMutation({
        variables: { recipeId: id, vote: voteToSend },
      });

      if (data?.voteRecipe) {
        setCurrentUserVote(data.voteRecipe.userVote);
        toast.success(`${voteToSend ? "Vote recorded" : "Vote removed"}`);
      }
    } catch (error) {
      console.error("Error voting for recipe:", error);
      toast.error("Failed to record your vote");
    }
  };

  return (
    <div className="block">
      <div
        className={cn(
          "group rounded-xl overflow-hidden bg-white shadow-lg hover:shadow-xl transition-all duration-300",
          featured ? "md:scale-105 ring-2 ring-rose-200" : ""
        )}
      >
        <Link href={href} className="block">
          <div className="relative h-48 overflow-hidden">
            {image && !imageError ? (
              <Image
                src={image}
                alt={title}
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                className="object-cover"
                onError={() => setImageError(true)}
              />
            ) : (
              <div
                className={`w-full h-full bg-gradient-to-r ${backgroundGradient} flex items-center justify-center`}
              >
                <Utensils className="w-12 h-12 text-white opacity-75" />
              </div>
            )}
          </div>
        </Link>

        <div className="p-5">
          <Link href={href}>
            <h3 className="font-bold text-lg mb-2">{title}</h3>
          </Link>

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

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
              <span className="ml-1 text-sm font-medium">{totalVotes}</span>
              <span className="ml-2 text-xs text-slate-500">
                ({likes} likes, {dislikes} dislikes)
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={(e) => handleVote(e, "like")}
                className={cn(
                  "p-1.5 rounded-full transition-all",
                  currentUserVote === "like"
                    ? "bg-green-100 text-green-600"
                    : "text-slate-400 hover:text-green-600 hover:bg-green-50"
                )}
              >
                <ThumbsUp className="w-4 h-4" />
              </button>

              <button
                onClick={(e) => handleVote(e, "dislike")}
                className={cn(
                  "p-1.5 rounded-full transition-all",
                  currentUserVote === "dislike"
                    ? "bg-red-100 text-red-600"
                    : "text-slate-400 hover:text-red-600 hover:bg-red-50"
                )}
              >
                <ThumbsDown className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
