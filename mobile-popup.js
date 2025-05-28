function isCheckoutPage() {
  const url = window.location.href.toLowerCase();
  const checkoutKeywords = ['checkout', 'cart', 'payment', 'order', 'buy', 'purchase'];
  const buttonKeywords = ['buy now', 'add to cart', 'purchase', 'proceed to checkout', 'place order'];

  if (checkoutKeywords.some(keyword => url.includes(keyword))) {
    console.log('Mobile: Checkout page detected via URL:', url);
    return true;
  }

  const buttons = document.querySelectorAll('button, input[type="button"], input[type="submit"]');
  for (let button of buttons) {
    const text = button.textContent.toLowerCase();
    if (buttonKeywords.some(keyword => text.includes(keyword))) {
      console.log('Mobile: Checkout page detected via button:', text);
      return true;
    }
  }

  console.log('Mobile: Not a checkout page');
  return false;
}

function getItemDetails() {
  let itemName = 'this purchase';
  const host = window.location.hostname.toLowerCase();

  const selectors = [
    '.cart-item-title',
    '.product-name',
    '.item-title',
    '.cart-product-name',
    '[data-testid="cart-item-title"]',
    'span[itemprop="name"]',
    '.cart-item-details h3',
    '.product-info .title'
  ];

  for (const selector of selectors) {
    const elements = document.querySelectorAll(selector);
    if (elements.length > 0) {
      itemName = elements[0].textContent.trim();
      break;
    }
  }

  let category = itemName;
  if (host.includes('ulta.com')) {
    if (itemName.toLowerCase().includes('skin') || itemName.toLowerCase().includes('serum') || itemName.toLowerCase().includes('cream')) {
      category = 'skin care products';
    } else if (itemName.toLowerCase().includes('makeup') || itemName.toLowerCase().includes('lipstick') || itemName.toLowerCase().includes('foundation')) {
      category = 'makeup products';
    } else {
      category = 'beauty products';
    }
  } else if (host.includes('amazon.com')) {
    if (itemName.toLowerCase().includes('book')) {
      category = 'books';
    } else if (itemName.toLowerCase().includes('electronics') || itemName.toLowerCase().includes('phone')) {
      category = 'electronics';
    } else {
      category = 'items';
    }
  } else if (host.includes('walmart.com')) {
    category = 'products';
  }

  console.log('Mobile: Detected item:', itemName, 'Category:', category);
  return category;
}

function showMobilePopup() {
  const existingPopup = document.getElementById('buywise-mobile-popup');
  if (existingPopup) existingPopup.remove();

  const itemCategory = getItemDetails();
  const popup = document.createElement('div');
  popup.id = 'buywise-mobile-popup';
  popup.style.position = 'fixed';
  popup.style.top = '10px';
  popup.style.right = '10px';
  popup.style.background = '#fff';
  popup.style.border = '1px solid #ccc';
  popup.style.padding = '15px';
  popup.style.zIndex = '10000';
  popup.style.boxShadow = '0 0 10px rgba(0,0,0,0.2)';
  popup.style.fontFamily = 'Arial, sans-serif';
  popup.style.maxWidth = '90%';
  popup.style.fontSize = '14px';
  popup.innerHTML = `
    <h3 style="margin: 0 0 10px; font-size: 16px;">BuyWise</h3>
    <p style="margin: 0 0 10px;">Do you really need these ${itemCategory}?</p>
    <label style="display: block; margin-bottom: 5px;" for="necessity">How necessary? (1 = Not needed, 5 = Essential)</label>
    <input type="range" id="necessity" min="1" max="5" value="3" style="width: 100%;">
    <div id="necessityValue" style="text-align: center; margin-bottom: 10px;">3</div>
    <button id="checkPurchase" style="padding: 5px 10px; background: #007bff; color: white; border: none; cursor: pointer;">Check</button>
    <button id="fullCheck" style="margin-left: 10px; padding: 5px 10px; background: #007bff; color: white; border: none; cursor: pointer;">Full Check</button>
    <button id="closePopup" style="margin-left: 10px; padding: 5px 10px; background: #007bff; color: white; border: none; cursor: pointer;">No, I'm good</button>
    <p id="recommendation" style="margin-top: 10px; font-weight: bold;"></p>
  `;
  document.body.appendChild(popup);
  console.log('Mobile: Popup added with category:', itemCategory);

  const necessityInput = document.getElementById('necessity');
  const necessityValue = document.getElementById('necessityValue');
  const checkButton = document.getElementById('checkPurchase');
  const fullCheckButton = document.getElementById('fullCheck');
  const closeButton = document.getElementById('closePopup');

  if (!necessityInput || !necessityValue || !checkButton || !fullCheckButton || !closeButton) {
    console.error('Mobile: Popup elements missing');
    return;
  }

  necessityInput.addEventListener('input', () => {
    necessityValue.textContent = necessityInput.value;
    console.log('Mobile: Necessity updated:', necessityInput.value);
  });

  checkButton.addEventListener('click', () => {
    const necessity = parseInt(necessityInput.value);
    let recommendation = '';
    if (necessity <= 2) {
      recommendation = `You probably don’t need these ${itemCategory}. Save your money!`;
    } else if (necessity === 3) {
      recommendation = `Think it over. Do you have similar ${itemCategory}?`;
    } else {
      recommendation = `These ${itemCategory} seem necessary, but can you find a deal?`;
    }
    document.getElementById('recommendation').textContent = recommendation;
    console.log('Mobile: Check button clicked, recommendation:', recommendation);
  });

  fullCheckButton.addEventListener('click', () => {
    window.open('https://sseaton007.github.io/BuyWise/', '_blank');
    popup.remove();
    console.log('Mobile: Full Check button clicked');
  });

  closeButton.addEventListener('click', () => {
    popup.remove();
    console.log('Mobile: Close button clicked');
  });
}

if (isCheckoutPage()) {
  showMobilePopup();
}
