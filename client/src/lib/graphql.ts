import { gql } from "@apollo/client";

export const GET_INGREDIENTS = gql`
  query GetIngredients($search: String, $category: String) {
    ingredients(search: $search, category: $category) {
      id
      name
      image_url
      category
      unit_of_measure
    }
  }
`;

export const GET_POPULAR_RECIPES = gql`
  query GetPopularRecipes(
    $limit: Int
    $offset: Int
    $difficulty: [String]
    $maxPrepTime: Int
    $minRating: Float
    $ingredients: [ID!] # When multiple IDs are provided, recipes must contain ALL these ingredients (AND logic)
  ) {
    popularRecipes(
      limit: $limit
      offset: $offset
      difficulty: $difficulty
      maxPrepTime: $maxPrepTime
      minRating: $minRating
      ingredients: $ingredients
    ) {
      id
      title
      image_url
      ingredients {
        ingredient {
          id
          name
          image_url
          unit_of_measure
        }
        quantity
      }
      cookingMethod
      preparationTime
      difficulty
      votes
      likes
      dislikes
      createdAt
      tags
      userVote
      isSaved
      rating
      description
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
          unit_of_measure
        }
        quantity
      }
      cookingMethod
      preparationTime
      difficulty
      votes
      likes
      dislikes
      createdAt
      user_id
      userVote
      isSaved
      rating
    }
  }
`;

export const GET_MY_RECIPES = gql`
  query GetMyRecipes {
    myRecipes {
      id
      title
      image_url
      ingredients {
        ingredient {
          id
          name
          image_url
          unit_of_measure
        }
        quantity
      }
      cookingMethod
      preparationTime
      difficulty
      votes
      likes
      dislikes
      createdAt
      tags
      userVote
      isSaved
      rating
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
          unit_of_measure
        }
        quantity
      }
      cookingMethod
      preparationTime
      difficulty
      votes
      likes
      dislikes
      createdAt
      tags
      userVote
      isSaved
      rating
    }
  }
`;

export const VOTE_RECIPE = gql`
  mutation VoteRecipe($recipeId: ID!, $vote: VoteType!) {
    voteRecipe(recipeId: $recipeId, vote: $vote) {
      id
      votes
      userVote
      likes
      dislikes
      rating
    }
  }
`;

export const SAVE_RECIPE = gql`
  mutation SaveRecipe($recipeId: ID!) {
    saveRecipe(recipeId: $recipeId) {
      success
      requiresAuth # To let the client know if the action failed due to auth
      recipe {
        id # Or any other fields you want to return about the saved recipe
      }
      message # Optional: for success or error messages from the backend
    }
  }
`;

export const SIGNUP = gql`
  mutation Signup($email: String!, $password: String!, $name: String) {
    signup(email: $email, password: $password, name: $name) {
      success
      message
      user {
        id
        email
        name
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
        name
        role
        image_url
      }
    }
  }
`;

export const CURRENT_USER = gql`
  query CurrentUser {
    me {
      id
      email
      name
      role
      image_url
    }
  }
`;

export const UPDATE_PROFILE = gql`
  mutation UpdateProfile($name: String, $image_url: String) {
    updateProfile(name: $name, image_url: $image_url) {
      id
      name
      email
      image_url
    }
  }
`;

export const CHANGE_PASSWORD = gql`
  mutation ChangePassword($currentPassword: String!, $newPassword: String!) {
    changePassword(
      currentPassword: $currentPassword
      newPassword: $newPassword
    ) {
      success
      message
    }
  }
`;

export const FORGOT_PASSWORD = gql`
  mutation ForgotPassword($email: String!) {
    forgotPassword(email: $email) {
      success
      message
    }
  }
`;

export const RESET_PASSWORD = gql`
  mutation ResetPassword($token: String!, $password: String!) {
    resetPassword(token: $token, password: $password) {
      success
      message
    }
  }
`;

export const DELETE_RECIPE = gql`
  mutation DeleteRecipe($id: ID!) {
    deleteRecipe(id: $id) {
      success
      message
    }
  }
`;

export const UPDATE_RECIPE = gql`
  mutation UpdateRecipe($id: ID!, $recipe: RecipeInput!) {
    updateRecipe(id: $id, recipe: $recipe) {
      id
      title
      description
      preparationTime
      difficulty
      cookingMethod
      ingredients {
        ingredient {
          id
          name
          image_url
          category
          unit_of_measure
        }
        quantity
      }
    }
  }
`;

export const GET_RECIPE_VOTES = gql`
  query GetRecipeVotes($recipeId: ID!) {
    recipeVotes(recipeId: $recipeId) {
      likes
      dislikes
      userVote
    }
  }
`;

export const GET_SAVED_RECIPES = gql`
  query GetSavedRecipes {
    savedRecipes {
      id
      title
      image_url
      ingredients {
        ingredient {
          id
          name
          image_url
          unit_of_measure
        }
        quantity
      }
      cookingMethod
      preparationTime
      difficulty
      votes
      likes
      dislikes
      createdAt
      tags
      userVote
      isSaved
      rating
    }
  }
`;
