# Meal Mashup 🥘

[English](#english) | [Українська](#українська)

<a id="english"></a>

### English

**Project Information: Meal Mashup - Your AI-Powered Recipe Generator**

Meal Mashup is a revolutionary application that leverages the power of Artificial Intelligence to transform the way you discover and create recipes. Instead of searching through endless online databases, simply tell Meal Mashup what ingredients you have on hand, and our intelligent AI will generate unique and delicious recipes tailored to your pantry.

Whether you have leftover vegetables, a specific type of protein, or a random assortment of spices, Meal Mashup's AI can analyze your ingredients and propose creative culinary solutions. It's like having a personal chef and recipe curator powered by cutting-edge technology!

Beyond just generating recipes, Meal Mashup's AI can also adapt and modify existing recipes based on your dietary restrictions or preferences. Want to make a dish vegetarian? Need to substitute an ingredient due to allergies? The AI can intelligently adjust recipes to meet your needs.

This project showcases the potential of AI in everyday life, making cooking more accessible, creative, and fun for everyone.

**Key Features:**

- AI-powered recipe generation based on available ingredients.
- Intelligent recipe modification based on dietary needs and preferences.
- User-friendly interface for easy ingredient input and recipe browsing.
- Ability to save and manage favorite recipes.
- Integration with external APIs for ingredient and recipe data.
- Responsive design for seamless use on various devices.

**Technologies Used:**

- Artificial Intelligence/Machine Learning (OpenAI API)
- Frontend: Next.js, React, TypeScript, Tailwind CSS
- Backend: Node.js, Express.js, GraphQL
- Database: PostgreSQL (Prisma ORM)
- Authentication: NextAuth.js
- Other: Docker, Vercel

**Installation Instructions:**

1.  **Clone the repository:**

```
bash
    git clone <repository_url>
    cd meal-mashup

```

2.  **Set up environment variables:**
    Create a `.env.local` file in the `client` directory and add the following:

```
env
    DATABASE_URL="postgresql://user:password@host:port/database"
    NEXTAUTH_URL="http://localhost:3000"
    NEXTAUTH_SECRET="your_nextauth_secret"
    OPENAI_API_KEY="your_openai_api_key"

```

Replace the placeholder values with your actual database connection string, NextAuth URL, a strong secret for NextAuth, and your OpenAI API key. 3. **Install dependencies:**
Navigate to the `client` directory and install the dependencies:

```
bash
    cd client
    npm install

```

4.  **Set up the database:**
    Apply the Prisma migrations to set up your database schema:

```
bash
    npx prisma migrate dev

```

5.  **Run the development server:**

```
bash
    npm run dev

```

The application should now be running at `http://localhost:3000`.

<a id="українська"></a>

### Українська

**Інформація про проєкт: Meal Mashup - Ваш генератор рецептів на базі ШІ**

Meal Mashup - це революційний додаток, який використовує потужність Штучного Інтелекту, щоб змінити спосіб пошуку та створення рецептів. Замість того, щоб шукати в нескінченних онлайн-базах даних, просто скажіть Meal Mashup, які інгредієнти у вас є, і наш інтелектуальний ШІ створить унікальні та смачні рецепти, адаптовані до вашої комори.

Незалежно від того, чи є у вас залишки овочів, певний тип білка або випадковий набір спецій, ШІ Meal Mashup може проаналізувати ваші інгредієнти та запропонувати креативні кулінарні рішення. Це як мати особистого шеф-кухаря та куратора рецептів, що працює на передовій технології!

Окрім генерації рецептів, ШІ Meal Mashup також може адаптувати та змінювати існуючі рецепти на основі ваших дієтичних обмежень або переваг. Хочете зробити страву вегетаріанською? Потрібно замінити інгредієнт через алергію? ШІ може інтелектуально коригувати рецепти відповідно до ваших потреб.

Цей проєкт демонструє потенціал ШІ в повсякденному житті, роблячи приготування їжі більш доступним, креативним та захоплюючим для всіх.

**Основний функціонал:**

- Генерація рецептів на базі ШІ відповідно до наявних інгредієнтів.
- Інтелектуальна зміна рецептів на основі дієтичних потреб та переваг.
- Зручний інтерфейс для легкого введення інгредієнтів та перегляду рецептів.
- Можливість зберігати та керувати улюбленими рецептами.
- Інтеграція із зовнішніми API для даних про інгредієнти та рецепти.
- Адаптивний дизайн для безперебійного використання на різних пристроях.

**Використані технології:**

- Штучний Інтелект/Машинне навчання (OpenAI API)
- Зовнішній інтерфейс: Next.js, React, TypeScript, Tailwind CSS
- Внутрішній інтерфейс: Node.js, Express.js, GraphQL
- База даних: PostgreSQL (Prisma ORM)
- Автентифікація: NextAuth.js
- Інше: Docker, Vercel

**Інструкції з встановлення:**

1.  **Клонуйте репозиторій:**

```
bash
    git clone <repository_url>
    cd meal-mashup

```

2.  **Налаштуйте змінні середовища:**
    Створіть файл `.env.local` у каталозі `client` та додайте наступне:

```
env
    DATABASE_URL="postgresql://user:password@host:port/database"
    NEXTAUTH_URL="http://localhost:3000"
    NEXTAUTH_SECRET="your_nextauth_secret"
    OPENAI_API_KEY="your_openai_api_key"

```

Замініть значення заповнювачів на ваш фактичний рядок підключення до бази даних, URL NextAuth, сильний секрет для NextAuth та ваш ключ API OpenAI. 3. **Встановіть залежності:**
Перейдіть до каталогу `client` та встановіть залежності:

```
bash
    cd client
    npm install

```

4.  **Налаштуйте базу даних:**
    Застосуйте міграції Prisma, щоб налаштувати схему бази даних:

```
bash
    npx prisma migrate dev

```

5.  **Запустіть сервер розробки:**

```
bash
    npm run dev

```

Тепер додаток має працювати за адресою `http://localhost:3000`.

## Author

- Ярослав Кліменко (Yaroslav Klimenko)

### Connect with me | Зв'язатися зі мною:

[![LinkedIn](https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/klimenko-yaroslav/)
[![GitHub](https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white)](https://github.com/solipsisticstratosphere)
[![Telegram](https://img.shields.io/badge/Telegram-2CA5E0?style=for-the-badge&logo=telegram&logoColor=white)](https://t.me/nosebl33d)
