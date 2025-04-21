import { gql } from "@apollo/client";

export const GET_INGREDIENTS = gql`
  query GetIngredients($search: String, $category: String) {
    ingredients(search: $search, category: $category) {
      id
      name
      image_url
      category
    }
  }
`;

export const GET_POPULAR_RECIPES = gql`
  query GetPopularRecipes($limit: Int) {
    popularRecipes(limit: $limit) {
      id
      title
      ingredients {
        ingredient {
          id
          name
          image_url
        }
        quantity
      }
      cookingMethod
      preparationTime
      difficulty
      votes
      createdAt
    }
  }
`;

export const GET_RECIPE = gql`
  query GetRecipe($id: ID!) {
    recipe(id: $id) {
      id
      title
      ingredients {
        ingredient {
          id
          name
          image_url
          category
        }
        quantity
      }
      cookingMethod
      preparationTime
      difficulty
      votes
      createdAt
    }
  }
`;

export const GET_MY_RECIPES = gql`
  query GetMyRecipes {
    myRecipes {
      id
      title
      ingredients {
        ingredient {
          id
          name
          image_url
        }
        quantity
      }
      cookingMethod
      preparationTime
      difficulty
      votes
      createdAt
    }
  }
`;

export const GENERATE_RECIPE = gql`
  mutation GenerateRecipe($ingredients: [ID!]!) {
    generateRecipe(ingredients: $ingredients) {
      id
      title
      ingredients {
        ingredient {
          id
          name
          image_url
          category
        }
        quantity
      }
      cookingMethod
      preparationTime
      difficulty
      votes
      createdAt
    }
  }
`;

export const VOTE_RECIPE = gql`
  mutation VoteRecipe($recipeId: ID!, $vote: VoteType!) {
    voteRecipe(recipeId: $recipeId, vote: $vote) {
      id
      votes
    }
  }
`;

export const SAVE_RECIPE = gql`
  mutation SaveRecipe($recipeId: ID!) {
    saveRecipe(recipeId: $recipeId) {
      success
      requiresAuth
      recipe {
        id
      }
    }
  }
`;

export const REGISTER = gql`
  mutation Register($email: String!, $password: String!) {
    register(email: $email, password: $password) {
      token
      user {
        id
        email
      }
    }
  }
`;

export const LOGIN = gql`
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      token
      user {
        id
        email
      }
    }
  }
`;
