"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { FoodCard } from "../components/main/food-card";
import { HeroPattern } from "../components/main/hero-pattern";
import { FeatureCard } from "../components/main/feature-card";
import Button from "../components/ui/Button";
import { motion } from "framer-motion";

export default function Home() {
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 },
    },
  };

  const staggerChildren = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50 to-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-8 md:pt-10 lg:pt-16">
        <HeroPattern />

        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            className="flex flex-col items-center text-center max-w-4xl mx-auto"
            initial="hidden"
            animate="visible"
            variants={fadeIn}
          >
            <motion.h1
              className="text-5xl md:text-6xl lg:text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-500 via-pink-400 to-orange-400 mb-6"
              variants={{
                hidden: { opacity: 0, y: -20 },
                visible: {
                  opacity: 1,
                  y: 0,
                  transition: { duration: 0.7, ease: "easeOut" },
                },
              }}
            >
              Meal Mashup
            </motion.h1>

            <motion.p
              className="text-xl md:text-2xl text-slate-700 mb-10 max-w-2xl"
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: { duration: 0.7, delay: 0.2 },
                },
              }}
            >
              Transform your random ingredients into unexpected recipe
              combinations with our AI-powered kitchen assistant.
            </motion.p>

            <motion.div
              className="flex flex-col sm:flex-row gap-4 w-full max-w-md"
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: {
                  opacity: 1,
                  y: 0,
                  transition: { duration: 0.5, delay: 0.4 },
                },
              }}
            >
              <Link href="/auth/login" className="w-full sm:w-auto">
                <Button
                  variant="primary"
                  size="lg"
                  className="shadow-md shadow-rose-100 w-full"
                  icon={<ArrowRight className="w-5 h-5" />}
                >
                  Get Started
                </Button>
              </Link>

              <Link href="/popular" className="w-full sm:w-auto">
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full"
                  icon={<ArrowRight className="w-5 h-5" />}
                >
                  Browse Popular
                </Button>
              </Link>
            </motion.div>
          </motion.div>

          <motion.div
            className="mb-[112px] mt-16 md:mt-24 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto"
            initial="hidden"
            animate="visible"
            variants={staggerChildren}
          >
            <motion.div variants={cardVariants}>
              <FoodCard
                id="example-recipe-1"
                title="Avocado Chocolate Mousse"
                image="/img/choco.jpg"
                tags={["Dessert", "Healthy", "Quick"]}
                rating={4.8}
                likes={12}
                dislikes={1}
                showLikeDislikeButtons={false}
                isClickable={false}
                isSaved={false}
                showSaveButton={false}
              />
            </motion.div>
            <motion.div variants={cardVariants}>
              <FoodCard
                id="example-recipe-2"
                title="Pineapple Curry Stir-Fry"
                image="/img/carrot.png"
                tags={["Dinner", "Fusion", "Spicy"]}
                rating={4.5}
                featured
                likes={15}
                dislikes={2}
                showLikeDislikeButtons={false}
                isClickable={false}
                isSaved={false}
                showSaveButton={false}
              />
            </motion.div>
            <motion.div variants={cardVariants}>
              <FoodCard
                id="example-recipe-3"
                title="Banana Bread Pancakes"
                image="/img/pancakes.png"
                tags={["Breakfast", "Sweet", "Easy"]}
                rating={4.7}
                likes={10}
                dislikes={0}
                showLikeDislikeButtons={false}
                isClickable={false}
                isSaved={false}
                showSaveButton={false}
              />
            </motion.div>
          </motion.div>
        </div>
      </section>

      <motion.section
        className="py-16 md:py-20 lg:py-28"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true, margin: "-100px" }}
      >
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center mb-12 md:mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl lg:text-4xl font-bold mb-4 px-4">
              How It Works
            </h2>
            <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto px-4">
              Creating unexpected culinary masterpieces has never been easier
            </p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 lg:gap-8 max-w-6xl mx-auto"
            initial="hidden"
            whileInView="visible"
            variants={staggerChildren}
            viewport={{ once: true, margin: "-50px" }}
          >
            <motion.div
              variants={cardVariants}
              className="md:max-w-2xl md:mx-auto lg:max-w-none"
            >
              <FeatureCard
                icon="Utensils"
                title="Select Ingredients"
                description="Choose from your available ingredients or whatever you have in your pantry"
                step={1}
              />
            </motion.div>
            <motion.div
              variants={cardVariants}
              className="md:max-w-2xl md:mx-auto lg:max-w-none"
            >
              <FeatureCard
                icon="Sparkles"
                title="Generate Recipe"
                description="Our AI combines your ingredients in unexpected and delicious ways"
                step={2}
              />
            </motion.div>
            <motion.div
              variants={cardVariants}
              className="md:max-w-2xl md:mx-auto lg:max-w-none"
            >
              <FeatureCard
                icon="Trophy"
                title="Share & Rate"
                description="Cook, enjoy, and share your creation with our community"
                step={3}
              />
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      <motion.section
        className="py-16 md:py-24 bg-gradient-to-br from-fuchsia-50 to-rose-50"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true, margin: "-100px" }}
      >
        <div className="container mx-auto px-4">
          <motion.div
            className="bg-white rounded-2xl shadow-xl p-8 md:p-12 max-w-4xl mx-auto relative overflow-hidden"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true }}
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-rose-200 to-fuchsia-200 rounded-full -mr-20 -mt-20 opacity-50"></div>

            <div className="relative z-10">
              <motion.h2
                className="text-3xl md:text-4xl font-bold mb-4"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                viewport={{ once: true }}
              >
                Ready to get creative in the kitchen?
              </motion.h2>
              <motion.p
                className="text-lg text-slate-600 mb-8 max-w-2xl"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                viewport={{ once: true }}
              >
                Start transforming your random ingredients into delicious meals
                today. No more food waste, just culinary innovation!
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                viewport={{ once: true }}
              >
                <Link href="/create-recipe">
                  <Button
                    variant="secondary"
                    size="lg"
                    className="shadow-md shadow-fuchsia-100"
                    icon={<ArrowRight className="w-5 h-5" />}
                  >
                    Start Creating Now
                  </Button>
                </Link>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </motion.section>
    </div>
  );
}
