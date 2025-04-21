import Link from "next/link";
import { ChevronRight, ArrowRight } from "lucide-react";
import { FoodCard } from "../components/main/food-card";
import { HeroPattern } from "../components/main/hero-pattern";
import { FeatureCard } from "../components/main/feature-card";
import Button from "../components/ui/Button";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50 to-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-8 md:pt-10 lg:pt-16">
        <HeroPattern />

        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-rose-600 via-fuchsia-500 to-orange-500 mb-6">
              Meal Mashup
            </h1>

            <p className="text-xl md:text-2xl text-slate-700 mb-10 max-w-2xl">
              Transform your random ingredients into unexpected recipe
              combinations with our AI-powered kitchen assistant.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
              <Link href="/create-recipe">
                <Button
                  variant="primary"
                  size="lg"
                  className="shadow-lg shadow-blue-200 group w-full sm:w-auto"
                  icon={
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  }
                >
                  Create Recipe
                </Button>
              </Link>

              <Link href="/popular">
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full sm:w-auto"
                  icon={<ChevronRight className="w-5 h-5" />}
                >
                  Browse Popular
                </Button>
              </Link>
            </div>
          </div>

          <div className="mb-[112px] mt-16 md:mt-24 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <FoodCard
              title="Avocado Chocolate Mousse"
              image="/placeholder.svg?height=200&width=300"
              tags={["Dessert", "Healthy", "Quick"]}
              rating={4.8}
            />
            <FoodCard
              title="Pineapple Curry Stir-Fry"
              image="/placeholder.svg?height=200&width=300"
              tags={["Dinner", "Fusion", "Spicy"]}
              rating={4.5}
              featured
            />
            <FoodCard
              title="Banana Bread Pancakes"
              image="/placeholder.svg?height=200&width=300"
              tags={["Breakfast", "Sweet", "Easy"]}
              rating={4.7}
            />
          </div>
        </div>
      </section>

      <section className="py-20 md:py-28">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              How It Works
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Creating unexpected culinary masterpieces has never been easier
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <FeatureCard
              icon="Utensils"
              title="Select Ingredients"
              description="Choose from your available ingredients or whatever you have in your pantry"
              step={1}
            />
            <FeatureCard
              icon="Sparkles"
              title="Generate Recipe"
              description="Our AI combines your ingredients in unexpected and delicious ways"
              step={2}
            />
            <FeatureCard
              icon="Trophy"
              title="Share & Rate"
              description="Cook, enjoy, and share your creation with our community"
              step={3}
            />
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-gradient-to-br from-fuchsia-50 to-rose-50">
        <div className="container mx-auto px-4">
          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 max-w-4xl mx-auto relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-rose-200 to-fuchsia-200 rounded-full -mr-20 -mt-20 opacity-50"></div>

            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Ready to get creative in the kitchen?
              </h2>
              <p className="text-lg text-slate-600 mb-8 max-w-2xl">
                Start transforming your random ingredients into delicious meals
                today. No more food waste, just culinary innovation!
              </p>

              <Link href="/create-recipe">
                <Button
                  variant="secondary"
                  size="lg"
                  className="shadow-lg shadow-green-200 group"
                  icon={
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  }
                >
                  Start Creating Now
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
