import { Star, Utensils, ThumbsUp, ThumbsDown, Bookmark } from "lucide-react";
import { cn } from "../../lib/utils";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useMutation } from "@apollo/client";
import { VOTE_RECIPE, SAVE_RECIPE } from "@/lib/graphql";
import { toast } from "sonner";
import { useRecipeStore } from "@/store/recipeStore";
import { DifficultyLevel } from "@/lib/types";

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
  showLikeDislikeButtons?: boolean;
  isClickable?: boolean;
  isSaved?: boolean;
  showSaveButton?: boolean;
  recipeRating?: number | null;
  description?: string;
  user_id?: string;
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
  showLikeDislikeButtons = true,
  isClickable = true,
  isSaved = false,
  showSaveButton = true,
  recipeRating,
  description,
  // user_id,
}: FoodCardProps) {
  const [imageError, setImageError] = useState(false);
  const [currentUserVote, setCurrentUserVote] = useState(userVote);
  const [currentLikes, setCurrentLikes] = useState(likes);
  const [currentDislikes, setCurrentDislikes] = useState(dislikes);
  const [isRecipeSaved, setIsRecipeSaved] = useState(isSaved);
  const [isSaving, setIsSaving] = useState(false);
  // const [authorInfo, setAuthorInfo] = useState<{
  //   name?: string;
  //   image_url?: string;
  // } | null>(null);
  const { status } = useSession();
  const isAuthenticated = status === "authenticated";
  const href = from ? `/recipes/${id}?from=${from}` : `/recipes/${id}`;

  const totalVotes = Math.max(0, rating || currentLikes - currentDislikes);
  const displayRating =
    recipeRating !== undefined && recipeRating !== null
      ? recipeRating
      : totalVotes;

  const {
    votedRecipes,
    voteRecipe: storeVoteRecipe,
    saveRecipe: storeSaveRecipe,
    removeSavedRecipe,
  } = useRecipeStore();
  const [voteRecipeMutation] = useMutation(VOTE_RECIPE);
  const [saveRecipeMutation] = useMutation(SAVE_RECIPE);

  // const { data: authorData, loading: authorLoading } = useQuery(
  //   GET_USER_BY_ID,
  //   {
  //     variables: { userId: user_id },
  //     skip: !user_id,
  //     fetchPolicy: "cache-and-network",
  //     nextFetchPolicy: "cache-first",
  //     notifyOnNetworkStatusChange: true,
  //     onError: (error) => {
  //       console.error("Error fetching author info:", error);
  //     },
  //   }
  // );

  // const author = authorData?.user;

  // useEffect(() => {
  //   if (author) {
  //     setAuthorInfo(author);
  //   }
  // }, [author]);

  useEffect(() => {
    if (status === "unauthenticated") {
      setCurrentUserVote(null);
    }
  }, [status]);

  useEffect(() => {
    if (id) {
      if (isAuthenticated && votedRecipes[id] !== undefined) {
        setCurrentUserVote(votedRecipes[id]);
      } else if (isAuthenticated && userVote) {
        storeVoteRecipe(id, userVote);
        setCurrentUserVote(userVote);
      }
    }
  }, [id, userVote, votedRecipes, storeVoteRecipe, isAuthenticated]);

  useEffect(() => {
    setCurrentLikes(likes);
    setCurrentDislikes(dislikes);
    setIsRecipeSaved(isSaved);
  }, [likes, dislikes, isSaved]);

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
      toast.error("Please log in to vote for recipes", {
        description: "Create an account or log in to save your preferences",
        action: {
          label: "Login",
          onClick: () => (window.location.href = "/auth/login"),
        },
      });
      return;
    }

    const voteToSend = currentUserVote === vote ? "UNVOTE" : vote;

    const oldUserVote = currentUserVote;
    const oldLikes = currentLikes;
    const oldDislikes = currentDislikes;

    if (voteToSend === "UNVOTE") {
      if (oldUserVote === "like") setCurrentLikes((prev) => prev - 1);
      if (oldUserVote === "dislike") setCurrentDislikes((prev) => prev - 1);
      setCurrentUserVote(null);
    } else {
      if (oldUserVote === "like") setCurrentLikes((prev) => prev - 1);
      if (oldUserVote === "dislike") setCurrentDislikes((prev) => prev - 1);

      if (voteToSend === "like") setCurrentLikes((prev) => prev + 1);
      if (voteToSend === "dislike") setCurrentDislikes((prev) => prev + 1);
      setCurrentUserVote(voteToSend);
    }

    storeVoteRecipe(id, voteToSend === "UNVOTE" ? null : voteToSend);

    try {
      const { data } = await voteRecipeMutation({
        variables: { recipeId: id, vote: voteToSend },
      });

      if (data?.voteRecipe) {
        const serverUserVote = data.voteRecipe.userVote;
        const serverLikes = data.voteRecipe.likes;
        const serverDislikes = data.voteRecipe.dislikes;

        setCurrentUserVote(serverUserVote);
        storeVoteRecipe(id, serverUserVote);

        if (serverLikes !== undefined) {
          setCurrentLikes(serverLikes);
        }
        if (serverDislikes !== undefined) {
          setCurrentDislikes(serverDislikes);
        }

        toast.success(
          `${voteToSend !== "UNVOTE" ? "Vote recorded" : "Vote removed"}`
        );
      }
    } catch (error) {
      console.error("Error voting for recipe:", error);
      toast.error("Failed to record your vote");

      setCurrentUserVote(oldUserVote);
      storeVoteRecipe(id, oldUserVote);
      setCurrentLikes(oldLikes);
      setCurrentDislikes(oldDislikes);
    }
  };

  const handleSave = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      toast.error("Please log in to save recipes", {
        action: {
          label: "Login",
          onClick: () => (window.location.href = "/auth/login"),
        },
      });
      return;
    }

    setIsSaving(true);
    try {
      const { data } = await saveRecipeMutation({
        variables: { recipeId: id },
      });

      if (data?.saveRecipe?.success) {
        const newSavedState = !isRecipeSaved;
        setIsRecipeSaved(newSavedState);

        if (newSavedState) {
          const recipe = {
            id,
            title,
            image_url: image,
            tags,
            votes: rating,
            likes: currentLikes,
            dislikes: currentDislikes,
            userVote: currentUserVote,
            isSaved: true,

            cookingMethod: "",
            preparationTime: 0,
            difficulty: "Medium" as DifficultyLevel,
            ingredients: [],
            createdAt: new Date(),
          };
          storeSaveRecipe(recipe);
          toast.success("Recipe saved!");
        } else {
          removeSavedRecipe(id);
          toast.success("Recipe unsaved.");
        }
      } else if (data?.saveRecipe?.requiresAuth) {
        toast.error("Authentication required to save recipes.");
      } else {
        toast.error("Failed to update saved state.");
      }
    } catch (error) {
      console.error("Error saving/unsaving recipe:", error);
      toast.error("An error occurred. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="block">
      <div
        className={cn(
          "group rounded-xl overflow-hidden bg-white shadow-lg hover:shadow-xl transition-all duration-300 ",
          featured ? "md:scale-105 ring-2 ring-rose-200" : ""
        )}
      >
        {isClickable ? (
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
        ) : (
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
        )}

        <div className="p-4">
          <h3 className="text-lg font-bold text-gray-800 truncate group-hover:text-amber-500 transition-colors">
            {title}
          </h3>
          <p className="text-sm text-gray-600 mt-1 h-10 overflow-hidden text-ellipsis">
            {description?.trim() ? description : "No description available."}
          </p>

          <div className="mt-2 flex items-center justify-between">
            <div className="flex items-center">
              <Star className="w-5 h-5 text-amber-400" />
              <span className="ml-1 text-sm font-medium">{displayRating}</span>
              <span className="ml-2 text-xs text-slate-500">
                ({currentLikes} likes, {currentDislikes} dislikes)
              </span>
            </div>

            <div className="flex items-center gap-2">
              {showLikeDislikeButtons && (
                <>
                  <button
                    onClick={(e) => handleVote(e, "like")}
                    className={cn(
                      "p-1.5 rounded-full transition-all",
                      currentUserVote === "like"
                        ? "bg-green-100 text-green-600"
                        : "text-slate-400 hover:text-green-600 hover:bg-green-50"
                    )}
                    aria-label="Like recipe"
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
                    aria-label="Dislike recipe"
                  >
                    <ThumbsDown className="w-4 h-4" />
                  </button>
                </>
              )}

              {showSaveButton && (
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className={cn(
                    "p-1.5 rounded-full transition-all",
                    isRecipeSaved
                      ? "bg-blue-100 text-blue-600"
                      : "text-slate-400 hover:text-blue-600 hover:bg-blue-50"
                  )}
                  aria-label={isRecipeSaved ? "Unsave recipe" : "Save recipe"}
                >
                  <Bookmark
                    className={cn(
                      "w-4 h-4",
                      isRecipeSaved ? "fill-blue-600" : ""
                    )}
                  />
                </button>
              )}
            </div>
          </div>

          {/* Author info */}
          {/* {user_id && (
            <div className="mt-3 pt-3 border-t border-gray-100 flex items-center">
              <div className="relative w-5 h-5 rounded-full overflow-hidden mr-2 border border-gray-200">
                {authorLoading ? (
                  <div className="w-full h-full bg-gray-100 animate-pulse"></div>
                ) : authorInfo?.image_url ? (
                  <Image
                    src={authorInfo.image_url}
                    alt={authorInfo.name || "Recipe author"}
                    fill
                    sizes="20px"
                    className="object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = "none";
                    }}
                  />
                ) : (
                  <div className="w-full h-full bg-blue-100 flex items-center justify-center">
                    <User className="w-3 h-3 text-blue-600" />
                  </div>
                )}
              </div>
              <span className="text-xs text-gray-500 truncate max-w-[150px]">
                {authorLoading ? (
                  <div className="w-16 h-3 bg-gray-100 rounded animate-pulse"></div>
                ) : (
                  authorInfo?.name || author?.name || "Unknown Chef"
                )}
              </span>
            </div>
          )} */}
        </div>
      </div>
    </div>
  );
}
