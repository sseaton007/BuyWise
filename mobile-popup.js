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

function getMonthlySavings() {
  const savings = JSON.parse(localStorage.getItem('buyWiseItems')) || [];
  const now = new Date();
  const currentMonthYear = now.toLocaleString('default', { month: 'long', year: 'numeric' });
  const monthlyTotal = savings
    .filter(entry => {
      const date = new Date(entry.timestamp);
      return date.toLocaleString('default', { month: 'long', year: 'numeric' }) === currentMonthYear;
    })
    .reduce((sum, entry) => sum + entry.cost, 0);
  return monthlyTotal.toFixed(2);
}

function showMobilePopup() {
  const existingPopup = document.getElementById('buywise-mobile-popup');
  if (existingPopup) existingPopup.remove();

  const itemCategory = getItemDetails();
  const monthlySavings = getMonthlySavings();
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
    <p style="margin: 0 0 10px;">This month: $${monthlySavings} saved</p>
    <label style="display: block; margin-bottom: 5px;">How necessary? (1 = Not needed, 5 = Essential)</label>
    <div id="necessityButtons" style="display: flex; justify-content: space-between; margin-bottom: 10px;">
      <button id="necessity1" style="padding: 5px 10px; background: #e5e7eb; color: #000; border: 1px solid #ccc; cursor: pointer;">1</button>
      <button id="necessity2" style="padding: 5px 10px; background: #e5e7eb; color: #000; border: 1px solid #ccc; cursor: pointer;">2</button>
      <button id="necessity3" style="padding: 5px 10px; background: #60a5fa; color: #fff; border: 1px solid #ccc; cursor: pointer;">3</button>
      <button id="necessity4" style="padding: 5px 10px; background: #e5e7eb; color: #000; border: 1px solid #ccc; cursor: pointer;">4</button>
      <button id="necessity5" style="padding: 5px 10px; background: #e5e7eb; color: #000; border: 1px solid #ccc; cursor: pointer;">5</button>
    </div>
    <div id="necessityValue" style="text-align: center; margin-bottom: 10px;">3</div>
    <button id="checkPurchase" style="padding: 5px 10px; background: #007bff; color: white; border: none; cursor: pointer;">Check</button>
    <button id="fullCheck" style="margin-left: 10px; padding: 5px 10px; background: #007bff; color: white; border: none; cursor: pointer;">Full Check</button>
    <button id="closePopup" style="margin-left: 10px; padding: 5px 10px; background: #007bff; color: white; border: none; cursor: pointer;">No, I'm good</button>
    <p id="recommendation" style="margin-top: 10px; font-weight: bold;"></p>
  `;
  document.body.appendChild(popup);
  console.log('Mobile: Popup added with category:', itemCategory);

  let selectedNecessity = 3; // Default value
  const necessityValue = document.getElementById('necessityValue');
  const checkButton = document.getElementById('checkPurchase');
  const fullCheckButton = document.getElementById('fullCheck');
  const closeButton = document.getElementById('closePopup');

  if (!necessityValue || !checkButton || !fullCheckButton || !closeButton) {
    console.error('Mobile: Popup elements missing');
    return;
  }

  // Add click handlers for necessity buttons
  for (let i = 1; i <= 5; i++) {
    const button = document.getElementById(`necessity${i}`);
    button.addEventListener('click', () => {
      selectedNecessity = i;
      necessityValue.textContent = i;
      // Reset all buttons to default style
      for (let j = 1; j <= 5; j++) {
        document.getElementById(`necessity${j}`).style.background = '#e5e7eb';
        document.getElementById(`necessity${j}`).style.color = '#000';
      }
      // Highlight selected button
      button.style.background = '#60a5fa';
      button.style.color = '#fff';
      console.log('Mobile: Necessity selected:', i);
    });
  }

  checkButton.addEventListener('click', () => {
    const necessity = selectedNecessity;
    let recommendation = '';
    if (necessity <= 2) {
      recommendation = `You probably don’t need these ${itemCategory}. Save your money!`;
      // Save estimated cost
      const estimatedCost = 50; // Placeholder
      const savings = JSON.parse(localStorage.getItem('buyWiseItems')) || [];
      savings.push({ cost: estimatedCost, timestamp: new Date().toISOString() });
      localStorage.setItem('buyWiseItems', JSON.stringify(savings));
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
    window.history.back();
    console.log('Mobile: Close button clicked, navigating back');
  });
}

if (isCheckoutPage()) {
  showMobilePopup();
}
