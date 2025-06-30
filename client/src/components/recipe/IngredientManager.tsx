import { useState } from "react";
import { useQuery } from "@apollo/client";
import { GET_INGREDIENTS } from "@/lib/graphql";
import { Ingredient } from "@/lib/types";
import { Search, X, Trash, PlusCircle, Edit } from "lucide-react";
import { toast } from "sonner";

interface IngredientWithQuantity {
  ingredientId: string;
  quantity: string;
  ingredient: {
    id: string;
    name: string;
    unit_of_measure: string;
  };
}

interface IngredientManagerProps {
  ingredients: IngredientWithQuantity[];
  onChange: (ingredients: IngredientWithQuantity[]) => void;
}

export default function IngredientManager({
  ingredients,
  onChange,
}: IngredientManagerProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedIngredient, setSelectedIngredient] =
    useState<Ingredient | null>(null);
  const [quantity, setQuantity] = useState("");
  const [editingIngredient, setEditingIngredient] = useState<string | null>(
    null
  );
  const [editQuantity, setEditQuantity] = useState("");

  const { data: ingredientsData } = useQuery(GET_INGREDIENTS, {
    variables: { search: searchTerm },
    skip: !searchTerm,
  });

  const handleAddIngredient = () => {
    if (!selectedIngredient || !quantity.trim()) {
      toast.error("Please select an ingredient and specify quantity");
      return;
    }

    if (
      ingredients.some((item) => item.ingredientId === selectedIngredient.id)
    ) {
      toast.error(`${selectedIngredient.name} is already in the recipe`);
      return;
    }

    const newIngredient = {
      ingredientId: selectedIngredient.id,
      quantity,
      ingredient: {
        id: selectedIngredient.id,
        name: selectedIngredient.name,
        unit_of_measure: selectedIngredient.unit_of_measure || "",
      },
    };

    onChange([...ingredients, newIngredient]);
    setSelectedIngredient(null);
    setQuantity("");
    setSearchTerm("");

    toast.success(`Added ${selectedIngredient.name} to recipe`);
  };

  const handleRemoveIngredient = (id: string) => {
    onChange(ingredients.filter((item) => item.ingredientId !== id));
    toast.success("Ingredient removed");
  };

  const startEditIngredient = (ingredient: IngredientWithQuantity) => {
    setEditingIngredient(ingredient.ingredientId);
    setEditQuantity(ingredient.quantity);
  };

  const saveEditIngredient = () => {
    if (!editingIngredient || !editQuantity.trim()) {
      toast.error("Please specify a valid quantity");
      return;
    }

    const updatedIngredients = ingredients.map((item) => {
      if (item.ingredientId === editingIngredient) {
        return { ...item, quantity: editQuantity };
      }
      return item;
    });

    onChange(updatedIngredients);
    setEditingIngredient(null);
    setEditQuantity("");
    toast.success("Quantity updated");
  };

  return (
    <div className="border-t pt-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">
        Recipe Ingredients
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-6">
        {/* Search and ingredient selection */}
        <div className="md:col-span-7">
          <label
            htmlFor="ingredientSearch"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Search for ingredient
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search className="w-4 h-4 text-gray-400" />
            </div>
            <input
              type="text"
              id="ingredientSearch"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              placeholder="Search ingredients..."
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm("")}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {searchTerm && ingredientsData?.ingredients && (
            <div className="mt-1 p-2 bg-white border border-gray-300 rounded-lg shadow-sm max-h-40 overflow-y-auto">
              {ingredientsData.ingredients.map((ingredient: Ingredient) => (
                <div
                  key={ingredient.id}
                  className={`p-2 hover:bg-gray-100 cursor-pointer rounded-lg ${
                    selectedIngredient?.id === ingredient.id
                      ? "bg-amber-50 border border-amber-200"
                      : ""
                  }`}
                  onClick={() => {
                    setSelectedIngredient(ingredient);
                    setSearchTerm(ingredient.name);
                  }}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{ingredient.name}</span>
                    <span className="text-xs text-gray-500">
                      {ingredient.unit_of_measure || "unit"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quantity input */}
        <div className="md:col-span-3">
          <label
            htmlFor="quantity"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Quantity
          </label>
          <input
            type="text"
            id="quantity"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            className="block w-full px-3 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            placeholder="e.g. 100"
          />
        </div>

        {/* Unit display */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Unit
          </label>
          <div className="flex items-center h-[46px] px-3 py-3 border border-gray-200 bg-gray-50 rounded-lg">
            <span className="text-gray-600">
              {selectedIngredient?.unit_of_measure || "unit"}
            </span>
          </div>
        </div>

        {/* Add button */}
        <div className="md:col-span-12">
          <button
            type="button"
            onClick={handleAddIngredient}
            disabled={!selectedIngredient || !quantity.trim()}
            className="w-full mt-2 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-500 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center"
          >
            <PlusCircle className="w-4 h-4 mr-2" />
            Add Ingredient
          </button>
        </div>
      </div>

      {/* Ingredients list */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="text-sm font-medium text-gray-700 mb-2">
          Current Ingredients
        </h4>
        {ingredients.length === 0 ? (
          <p className="text-gray-500 italic py-4 text-center">
            No ingredients added yet
          </p>
        ) : (
          <ul className="divide-y divide-gray-200">
            {ingredients.map((item) => (
              <li
                key={item.ingredientId}
                className="py-3 flex flex-wrap md:flex-nowrap justify-between items-center"
              >
                {editingIngredient === item.ingredientId ? (
                  <div className="flex w-full items-center space-x-2">
                    <div className="w-1/3">
                      <span className="font-medium">
                        {item.ingredient.name}
                      </span>
                    </div>
                    <div className="w-1/3">
                      <input
                        type="text"
                        value={editQuantity}
                        onChange={(e) => setEditQuantity(e.target.value)}
                        className="w-full px-2 py-1 border border-amber-300 rounded focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                    </div>
                    <div className="w-1/6 text-gray-600">
                      {item.ingredient.unit_of_measure || "unit"}
                    </div>
                    <div className="flex space-x-2">
                      <button
                        type="button"
                        onClick={saveEditIngredient}
                        className="p-1 text-green-600 hover:text-green-800 hover:bg-green-100 rounded"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="lucide lucide-check"
                        >
                          <path d="M20 6 9 17l-5-5" />
                        </svg>
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingIngredient(null)}
                        className="p-1 text-red-600 hover:text-red-800 hover:bg-red-100 rounded"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center">
                      <span className="font-medium">
                        {item.ingredient.name}
                      </span>
                      <span className="ml-2 text-gray-600">
                        ({item.quantity}{" "}
                        {item.ingredient.unit_of_measure || "unit"})
                      </span>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        type="button"
                        onClick={() => startEditIngredient(item)}
                        className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          handleRemoveIngredient(item.ingredientId)
                        }
                        className="p-1 text-red-600 hover:text-red-800 hover:bg-red-100 rounded"
                      >
                        <Trash className="w-4 h-4" />
                      </button>
                    </div>
                  </>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
