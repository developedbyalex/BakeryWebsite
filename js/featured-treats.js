document.addEventListener('DOMContentLoaded', function() {
    console.log('featured-treats.js loaded');
    const featuredTreatsContainer = document.getElementById('featured-treats');
    const categoryButtons = document.querySelectorAll('.category-btn');
    let featuredTreats = {};

    async function fetchFeaturedTreats() {
        console.log('Fetching featured treats...');
        try {
            const response = await fetch('http://localhost:3000/api/featured-treats');
            console.log('Response status:', response.status);
            const data = await response.json();
            console.log('Fetched data:', data);
            featuredTreats = data.featuredTreats || {};
            console.log('Featured treats:', featuredTreats);
            
            if (Object.keys(featuredTreats).length > 0) {
                const categories = Object.keys(featuredTreats);
                console.log('Available categories:', categories);
                displayFeaturedTreats(categories[0]);
                updateCategoryButtons(categories);
            } else {
                console.log('No featured treats available');
                featuredTreatsContainer.innerHTML = '<p>No featured treats available at the moment.</p>';
                hideCategoryButtons();
            }
        } catch (error) {
            console.error('Error fetching featured treats:', error);
            featuredTreatsContainer.innerHTML = '<p>Failed to load treats. Please try again later.</p>';
            hideCategoryButtons();
        }
    }

    function displayFeaturedTreats(category) {
        console.log('Displaying featured treat for category:', category);
        featuredTreatsContainer.innerHTML = '';
        const treat = featuredTreats[category];
        if (treat) {
            console.log('Treat to display:', treat);
            const treatElement = document.createElement('div');
            treatElement.className = 'menu-item';
            treatElement.innerHTML = `
                <img src="${treat.image}" alt="${treat.name}">
                <h3>${treat.name}</h3>
                <p>${treat.description}</p>
                <div class="treat-actions">
                    <span class="price">$${treat.price.toFixed(2)}</span>
                    <button class="wishlist-btn" data-id="${treat._id}">
                        <i class="fa-regular fa-heart"></i>
                    </button>
                    <button class="add-to-cart-btn" data-id="${treat._id}">Add to Cart</button>
                </div>
            `;
            featuredTreatsContainer.appendChild(treatElement);
        } else {
            console.log('No treat found for category:', category);
            featuredTreatsContainer.innerHTML = '<p>No featured treat available for this category.</p>';
        }
        updateWishlistButtonStates();
    }

    function updateCategoryButtons(categories) {
        console.log('Updating category buttons for categories:', categories);
        categoryButtons.forEach(button => {
            const category = button.dataset.category;
            if (categories.includes(category)) {
                button.style.display = 'block';
            } else {
                button.style.display = 'none';
            }
        });
        
        // Set the first category as active
        if (categories.length > 0) {
            categoryButtons.forEach(btn => btn.classList.remove('active'));
            const firstActiveButton = document.querySelector(`[data-category="${categories[0]}"]`);
            if (firstActiveButton) {
                firstActiveButton.classList.add('active');
                console.log('Set active category:', categories[0]);
            } else {
                console.log('No button found for category:', categories[0]);
            }
        }
    }

    function hideCategoryButtons() {
        categoryButtons.forEach(button => {
            button.style.display = 'none';
        });
    }

    function updateWishlistButtonStates() {
        const wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
        const wishlistButtons = document.querySelectorAll('.wishlist-btn');
        
        wishlistButtons.forEach(button => {
            const treatId = button.getAttribute('data-id');
            if (wishlist.some(item => item._id === treatId)) {
                button.classList.add('active');
                button.innerHTML = '<i class="fa-solid fa-heart"></i>';
            } else {
                button.classList.remove('active');
                button.innerHTML = '<i class="fa-regular fa-heart"></i>';
            }
        });
    }

    function toggleWishlist(treatId) {
        const category = Object.keys(featuredTreats).find(cat => 
            featuredTreats[cat]._id === treatId
        );
        const treat = featuredTreats[category];
        let wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
        
        const existingIndex = wishlist.findIndex(item => item._id === treatId);
        
        if (existingIndex > -1) {
            wishlist.splice(existingIndex, 1);
            notificationSystem.show(`${treat.name} removed from wishlist`, 'error');
        } else {
            wishlist.push(treat);
            notificationSystem.show(`${treat.name} added to wishlist`, 'success');
        }
        
        localStorage.setItem('wishlist', JSON.stringify(wishlist));
        updateWishlistButtonStates();
    }

    function addToCart(treatId) {
        const category = Object.keys(featuredTreats).find(cat => 
            featuredTreats[cat]._id === treatId
        );
        const treat = featuredTreats[category];
        let cart = JSON.parse(localStorage.getItem('cart')) || [];
        
        const existingItem = cart.find(item => item._id === treatId);
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({...treat, quantity: 1});
        }

        localStorage.setItem('cart', JSON.stringify(cart));
        notificationSystem.show(`${treat.name} added to cart!`, 'success');
    }

    categoryButtons.forEach(button => {
        button.addEventListener('click', function() {
            const category = this.dataset.category;
            if (featuredTreats[category]) {
                categoryButtons.forEach(btn => btn.classList.remove('active'));
                this.classList.add('active');
                displayFeaturedTreats(category);
            }
        });
    });

    featuredTreatsContainer.addEventListener('click', function(e) {
        const wishlistBtn = e.target.closest('.wishlist-btn');
        const addToCartBtn = e.target.closest('.add-to-cart-btn');
        
        if (wishlistBtn) {
            toggleWishlist(wishlistBtn.dataset.id);
        } else if (addToCartBtn) {
            addToCart(addToCartBtn.dataset.id);
        }
    });


    console.log('Setting up event listeners');
    categoryButtons.forEach(button => {
        button.addEventListener('click', function() {
            const category = this.dataset.category;
            console.log('Category button clicked:', category);
            if (featuredTreats[category]) {
                categoryButtons.forEach(btn => btn.classList.remove('active'));
                this.classList.add('active');
                displayFeaturedTreats(category);
            } else {
                console.log('No featured treat for category:', category);
            }
        });
    });

    
    // Fetch and display featured treats
    fetchFeaturedTreats();
});