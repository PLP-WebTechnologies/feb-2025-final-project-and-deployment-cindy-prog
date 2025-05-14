document.addEventListener('DOMContentLoaded', function() {
    const searchBtn = document.getElementById('search-btn');
    const searchInput = document.getElementById('search-input');
    const resultsContainer = document.getElementById('results-container');
    
    // Known Kenyan meal IDs in TheMealDB
    const KENYAN_MEAL_IDS = ["52917", "52886", "52948"]; // Pilau, Chapati, Nyama Choma
    const KENYAN_DISH_KEYWORDS = [
        "pilau", "ugali", "nyama choma", "sukuma wiki", 
        "chapati", "githeri", "mandazi", "matoke"
    ];

    // Load popular Kenyan meals on startup
    loadPopularKenyanMeals();
    
    searchBtn.addEventListener('click', searchRecipes);
    searchInput.addEventListener('keypress', (e) => e.key === 'Enter' && searchRecipes());
    
    // ====== MAIN SEARCH FUNCTION ======
    async function searchRecipes() {
        const ingredient = searchInput.value.trim().toLowerCase();
        
        if (!ingredient) {
            alert('Please enter an ingredient (e.g., beef, maize, coconut)');
            return;
        }
        
        showLoading();
        
        try {
            // First try searching TheMealDB by ingredient
            const response = await fetch(`https://www.themealdb.com/api/json/v1/1/filter.php?i=${ingredient}`);
            const data = await response.json();
            
            if (data.meals) {
                // Filter for Kenyan dishes
                const kenyanMeals = data.meals.filter(meal => 
                    KENYAN_DISH_KEYWORDS.some(keyword => 
                        meal.strMeal.toLowerCase().includes(keyword)
                    )
                );
                
                if (kenyanMeals.length > 0) {
                    displayMeals(kenyanMeals);
                } else {
                    // If no Kenyan meals found, try our backup Kenyan meals
                    tryBackupSearch(ingredient);
                }
            } else {
                tryBackupSearch(ingredient);
            }
        } catch (error) {
            showError();
            console.error("Search error:", error);
        }
    }
    
    // ====== BACKUP SEARCH (WHEN NO RESULTS) ======
    async function tryBackupSearch(ingredient) {
        // Check if ingredient matches any Kenyan dishes we know about
        const matchingDishes = KENYAN_DISH_KEYWORDS.filter(keyword => 
            keyword.includes(ingredient) || ingredient.includes(keyword)
        );
        
        if (matchingDishes.length > 0) {
            // Fetch details for these dishes
            const requests = KENYAN_MEAL_IDS.map(id => 
                fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${id}`)
                    .then(res => res.json())
            );
            
            const responses = await Promise.all(requests);
            const meals = responses.flatMap(res => res.meals || []);
            
            const filteredMeals = meals.filter(meal => 
                matchingDishes.some(dish => 
                    meal.strMeal.toLowerCase().includes(dish)
                )
            );
            
            if (filteredMeals.length > 0) {
                displayMeals(filteredMeals);
            } else {
                showNoResults(ingredient);
            }
        } else {
            showNoResults(ingredient);
        }
    }
    
    // ====== LOAD POPULAR KENYAN MEALS ======
    async function loadPopularKenyanMeals() {
        showLoading();
        
        try {
            const requests = KENYAN_MEAL_IDS.map(id => 
                fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${id}`)
                    .then(res => res.json())
            );
            
            const responses = await Promise.all(requests);
            const meals = responses.flatMap(res => res.meals || []);
            
            displayMeals(meals);
        } catch (error) {
            showError();
            console.error("Loading error:", error);
        }
    }
    
    // ====== DISPLAY FUNCTIONS ======
    function displayMeals(meals) {
        resultsContainer.innerHTML = '';
        
        if (meals.length === 0) {
            showNoResults();
            return;
        }
        
        meals.forEach(meal => {
            const recipeCard = createRecipeCard(meal);
            resultsContainer.appendChild(recipeCard);
        });
    }
    
    function createRecipeCard(meal) {
        const card = document.createElement('div');
        card.className = 'recipe-card';
        card.innerHTML = `
            <img src="${meal.strMealThumb}" alt="${meal.strMeal}" class="recipe-img">
            <div class="recipe-content">
                <h3 class="recipe-title">${meal.strMeal}</h3>
                <span class="recipe-category">${meal.strCategory}</span>
                <a href="#" class="view-recipe-btn" data-id="${meal.idMeal}">View Recipe</a>
            </div>
        `;
        
        card.querySelector('.view-recipe-btn').addEventListener('click', (e) => {
            e.preventDefault();
            showRecipeDetails(meal.idMeal);
        });
        
        return card;
    }
    
    async function showRecipeDetails(mealId) {
        try {
            document.body.style.cursor = 'wait';
            const response = await fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${mealId}`);
            const data = await response.json();
            
            if (data.meals) {
                showModal(data.meals[0]);
            }
        } catch (error) {
            alert("Failed to load recipe details");
        } finally {
            document.body.style.cursor = 'default';
        }
    }
    
    function showModal(meal) {
        const modal = document.createElement('div');
        modal.className = 'modal';
        
        // Prepare ingredients list
        let ingredients = '';
        for (let i = 1; i <= 20; i++) {
            const ingredient = meal[`strIngredient${i}`];
            if (ingredient && ingredient.trim()) {
                ingredients += `<li>${meal[`strMeasure${i}`]} ${ingredient}</li>`;
            }
        }
        
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <img src="${meal.strMealThumb}" alt="${meal.strMeal}" class="modal-img">
                    <button class="close-btn">&times;</button>
                </div>
                <div class="modal-body">
                    <h2>${meal.strMeal}</h2>
                    <p class="modal-category">${meal.strCategory}</p>
                    <div class="ingredients">
                        <h3>Ingredients</h3>
                        <ul>${ingredients}</ul>
                    </div>
                    <div class="instructions">
                        <h3>Instructions</h3>
                        <p>${meal.strInstructions}</p>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        modal.querySelector('.close-btn').addEventListener('click', () => modal.remove());
        modal.addEventListener('click', (e) => e.target === modal && modal.remove());
    }
    
    // ====== UI HELPER FUNCTIONS ======
    function showLoading() {
        resultsContainer.innerHTML = `
            <div class="loading">
                <i class="fas fa-spinner fa-spin"></i> 
                Searching Kenyan recipes...
            </div>
        `;
    }
    
    function showNoResults(ingredient = '') {
        resultsContainer.innerHTML = `
            <div class="no-results">
                <i class="fas fa-utensils"></i>
                <h3>No Kenyan recipes found</h3>
                <p>Try searching for: beef, maize, chicken, or coconut</p>
                <button id="try-popular" class="retry-btn">Show Popular Kenyan Dishes</button>
            </div>
        `;
        
        document.getElementById('try-popular').addEventListener('click', loadPopularKenyanMeals);
    }
    
    function showError() {
        resultsContainer.innerHTML = `
            <div class="error">
                <i class="fas fa-exclamation-triangle"></i>
                <h3>Connection Error</h3>
                <p>Failed to fetch recipes. Please try again later.</p>
                <button id="retry-btn" class="retry-btn">Retry</button>
            </div>
        `;
        
        document.getElementById('retry-btn').addEventListener('click', () => {
            if (searchInput.value.trim()) {
                searchRecipes();
            } else {
                loadPopularKenyanMeals();
            }
        });
    }
});