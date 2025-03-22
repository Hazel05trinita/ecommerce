// Cart System - Comprehensive Solution

// Initialize cart when page loads
document.addEventListener('DOMContentLoaded', function() {
    initializeCart();
    setupBuyNowButtons();
});

// Initialize the cart
function initializeCart() {
    // Create cart in localStorage if it doesn't exist
    if (!localStorage.getItem('cart')) {
        localStorage.setItem('cart', JSON.stringify([]));
    }
    
    // Add cart styles
    addCartStyles();
    
    // Update cart count
    updateCartCount();
}

// Add necessary styles for cart elements
function addCartStyles() {
    const styleElement = document.createElement('style');
    styleElement.textContent = `
        .cart-count {
            background-color: #ff4444;
            color: white;
            border-radius: 50%;
            padding: 0.2rem 0.5rem;
            font-size: 0.8rem;
            position: absolute;
            top: -8px;
            right: -8px;
            font-weight: bold;
        }
        
        .cart-notification {
            position: fixed;
            bottom: 20px;
            right: 20px;
            background-color: #4CAF50;
            color: white;
            padding: 15px 20px;
            border-radius: 5px;
            z-index: 1000;
            box-shadow: 0 2px 10px rgba(0,0,0,0.2);
            display: flex;
            align-items: center;
            transition: all 0.3s ease;
            opacity: 0;
            transform: translateY(20px);
        }
        
        .cart-notification.show {
            opacity: 1;
            transform: translateY(0);
        }
        
        .cart-notification-icon {
            margin-right: 10px;
        }
    `;
    document.head.appendChild(styleElement);
}

// Set up event listeners for all Buy Now buttons
function setupBuyNowButtons() {
    // Find all elements that might be Buy Now buttons
    const potentialButtons = document.querySelectorAll('button, a, .btn, .button');
    
    potentialButtons.forEach(button => {
        // Check if the button text contains "Buy Now" (case insensitive)
        if (button.textContent.trim().toLowerCase().includes('buy now')) {
            // Make sure we don't add multiple listeners to the same button
            button.removeEventListener('click', handleBuyNowClick);
            button.addEventListener('click', handleBuyNowClick);
            
            // Add a data attribute to mark this as a buy button
            button.setAttribute('data-buy-button', 'true');
            
            // Log for debugging
            console.log('Buy Now button found and event listener attached:', button);
        }
    });
}

// Handle Buy Now button click
function handleBuyNowClick(event) {
    event.preventDefault();
    console.log('Buy Now button clicked');
    
    // Find the product container
    const button = event.currentTarget;
    const productContainer = findProductContainer(button);
    
    if (!productContainer) {
        console.error('Could not find product container');
        return;
    }
    
    // Extract product details
    const product = extractProductDetails(productContainer);
    console.log('Product details extracted:', product);
    
    // Add to cart
    addProductToCart(product);
}

// Find the product container from a button
function findProductContainer(button) {
    // Try different common container selectors
    const possibleContainers = [
        button.closest('.product'),
        button.closest('.product-card'),
        button.closest('.product-item'),
        button.closest('article'),
        button.closest('.card'),
        button.closest('section'),
        button.closest('.featured-product-section'),
        button.closest('.featured-product')
    ];
    
    // Return the first valid container found
    for (const container of possibleContainers) {
        if (container) return container;
    }
    
    // If no container found, use the parent element of the button
    return button.parentElement;
}

// Extract product details from container
function extractProductDetails(container) {
    // Try different selectors for product name
    const nameSelectors = ['h1', 'h2', 'h3', '.product-title', '.title', '.name'];
    let productName = 'Product';
    for (const selector of nameSelectors) {
        const nameElement = container.querySelector(selector);
        if (nameElement) {
            productName = nameElement.textContent.trim();
            break;
        }
    }
    
    // Try different selectors for product price
    const priceSelectors = ['.price', '.product-price', '.amount', 'p:contains($)'];
    let productPrice = '$99.99';
    for (const selector of priceSelectors) {
        const priceElement = container.querySelector(selector);
        if (priceElement) {
            productPrice = priceElement.textContent.trim();
            break;
        }
    }
    
    // Get product image
    const imgElement = container.querySelector('img');
    const productImage = imgElement ? imgElement.src : '';
    
    // Generate a unique ID for the product
    const productId = container.id || 'product_' + Math.random().toString(36).substr(2, 9);
    
    return {
        id: productId,
        name: productName,
        price: productPrice,
        image: productImage,
        quantity: 1
    };
}

// Add product to cart
function addProductToCart(product) {
    // Get current cart
    const cart = JSON.parse(localStorage.getItem('cart'));
    
    // Check if product already exists in cart
    const existingProductIndex = cart.findIndex(item => item.id === product.id);
    
    if (existingProductIndex > -1) {
        // Increment quantity if product already in cart
        cart[existingProductIndex].quantity += 1;
    } else {
        // Add new product to cart
        cart.push(product);
    }
    
    // Save updated cart
    localStorage.setItem('cart', JSON.stringify(cart));
    console.log('Cart updated:', cart);
    
    // Update cart count
    updateCartCount();
    
    // Show notification
    showCartNotification(product.name);
}

// Update cart count display
function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem('cart'));
    const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
    
    // Find or create cart count element
    let cartCountElement = document.querySelector('.cart-count');
    
    if (!cartCountElement) {
        // Try to find cart icon or link
        const cartLink = findCartLink();
        
        if (cartLink) {
            // Make sure the cart link has position relative
            if (getComputedStyle(cartLink).position === 'static') {
                cartLink.style.position = 'relative';
            }
            
            // Create count element
            cartCountElement = document.createElement('span');
            cartCountElement.className = 'cart-count';
            cartLink.appendChild(cartCountElement);
        }
    }
    
    // Update count if element exists
    if (cartCountElement) {
        cartCountElement.textContent = cartCount;
        cartCountElement.style.display = cartCount > 0 ? 'inline-block' : 'none';
    }
}

// Find cart link or icon
function findCartLink() {
    // Try different selectors that might be the cart link
    const selectors = [
        'a[href*="cart"]',
        'a[href*="basket"]',
        '.cart-icon',
        '.cart',
        '.shopping-cart',
        'header a:last-child',
        'nav a:last-child'
    ];
    
    for (const selector of selectors) {
        const element = document.querySelector(selector);
        if (element) return element;
    }
    
    return null;
}

// Show notification when product is added to cart
function showCartNotification(productName) {
    // Remove any existing notification
    const existingNotification = document.querySelector('.cart-notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = 'cart-notification';
    notification.innerHTML = `
        <div class="cart-notification-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="white">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
            </svg>
        </div>
        <div>
            <div style="font-weight: bold;">${productName}</div>
            <div>Added to cart successfully!</div>
        </div>
    `;
    
    // Add to document
    document.body.appendChild(notification);
    
    // Show with animation
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    // Hide after 3 seconds
    setTimeout(() => {
        notification.classList.remove('show');
        
        // Remove from DOM after animation completes
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

// For debugging - log cart contents to console
console.log('Current cart:', JSON.parse(localStorage.getItem('cart') || '[]'));
