document.addEventListener('DOMContentLoaded', function() {
  // Initialize variables
  let expenses = JSON.parse(localStorage.getItem('expenses')) || [];
  let total = 0;
  
  // DOM Elements
  const expenseForm = document.getElementById('expenseForm');
  const expenseName = document.getElementById('expenseName');
  const expenseAmount = document.getElementById('expenseAmount');
  const totalAmountElement = document.getElementById('totalAmount');
  const expenseHistory = document.getElementById('expenseHistory');
  const ctx = document.getElementById('expenseChart').getContext('2d');
  
  // Initialize Chart
  let expenseChart = new Chart(ctx, {
    type: 'pie',
    data: {
      labels: [],
      datasets: [{
        data: [],
        backgroundColor: [
          '#4361ee', '#3f37c9', '#4cc9f0', '#4895ef', 
          '#f72585', '#b5179e', '#7209b7', '#560bad',
          '#480ca8', '#3a0ca3', '#3f37c9', '#4361ee'
        ],
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'right',
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              let label = context.label || '';
              if (label) {
                label += ': ';
              }
              label += '$' + context.raw.toFixed(2);
              return label;
            }
          }
        }
      },
      animation: {
        animateScale: true,
        animateRotate: true
      }
    }
  });
  
  // Load initial data
  updateUI();
  animateGridLines();
  
  // Form submission
  expenseForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const name = expenseName.value.trim();
    const amount = parseFloat(expenseAmount.value);
    
    if (name && !isNaN(amount)) {
      const expense = {
        id: Date.now(),
        name,
        amount
      };
      
      expenses.push(expense);
      saveToLocalStorage();
      updateUI();
      
      // Reset form
      expenseForm.reset();
      expenseName.focus();
      
      // Add animation to new expense
      animateNewExpense(expense.id);
    }
  });
  
  // Handle all expense item actions
  expenseHistory.addEventListener('click', function(e) {
    const expenseItem = e.target.closest('.expense-item');
    if (!expenseItem) return;

    const expenseId = parseInt(expenseItem.dataset.id);
    const expense = expenses.find(exp => exp.id === expenseId);

    // Delete Functionality
    if (e.target.classList.contains('delete-btn')) {
      expenses = expenses.filter(exp => exp.id !== expenseId);
      saveToLocalStorage();
      updateUI();
      animateRemoval(expenseItem);
    }

    // Edit Functionality
    if (e.target.classList.contains('edit-btn')) {
      enableEditMode(expenseItem, expense);
    }

    // Save Edit
    if (e.target.classList.contains('save-btn')) {
      const newName = expenseItem.querySelector('.edit-category').value.trim();
      const newAmount = parseFloat(expenseItem.querySelector('.edit-amount').value);
      
      if (newName && !isNaN(newAmount)) {
        expense.name = newName;
        expense.amount = newAmount;
        saveToLocalStorage();
        updateUI();
      }
    }

    // Cancel Edit
    if (e.target.classList.contains('cancel-btn')) {
      renderExpenseList();
    }
  });

  /* ========== HELPER FUNCTIONS ========== */

  function updateTotal() {
    total = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    totalAmountElement.textContent = `$${total.toFixed(2)}`;
    
    // Animate total update
    anime({
      targets: '#totalAmount',
      scale: [1.2, 1],
      duration: 500,
      easing: 'easeOutElastic(1, .5)'
    });
  }
  
  function renderExpenseList() {
    expenseHistory.innerHTML = '';
    
    if (expenses.length === 0) {
      expenseHistory.innerHTML = '<p class="empty-message">No expenses added yet</p>';
      return;
    }
    
    expenses.forEach(expense => {
      const expenseItem = document.createElement('div');
      expenseItem.className = 'expense-item';
      expenseItem.dataset.id = expense.id;
      expenseItem.innerHTML = `
        <span class="expense-category">${expense.name}</span>
        <span class="expense-amount">$${expense.amount.toFixed(2)}</span>
        <div class="expense-actions">
          <button class="edit-btn">✏️</button>
          <button class="delete-btn">🗑️</button>
        </div>
      `;
      expenseHistory.appendChild(expenseItem);
    });
  }
  
  function updateChart() {
    const categories = {};
    
    expenses.forEach(expense => {
      if (categories[expense.name]) {
        categories[expense.name] += expense.amount;
      } else {
        categories[expense.name] = expense.amount;
      }
    });
    
    expenseChart.data.labels = Object.keys(categories);
    expenseChart.data.datasets[0].data = Object.values(categories);
    expenseChart.update();
  }

  function enableEditMode(item, expense) {
    item.classList.add('editing');
    item.innerHTML = `
      <div class="edit-fields">
        <input type="text" class="edit-category" value="${expense.name}" required>
        <input type="number" class="edit-amount" value="${expense.amount}" step="0.01" min="0" required>
      </div>
      <div class="edit-actions">
        <button class="save-btn">💾</button>
        <button class="cancel-btn">❌</button>
      </div>
    `;
  }

  function animateRemoval(element) {
    anime({
      targets: element,
      opacity: 0,
      height: 0,
      marginBottom: 0,
      duration: 300,
      easing: 'easeInOutQuad',
      complete: () => element.remove()
    });
  }

  function animateNewExpense(id) {
    const expenseItem = document.querySelector(`.expense-item[data-id="${id}"]`);
    if (expenseItem) {
      anime({
        targets: expenseItem,
        translateX: [-50, 0],
        opacity: [0, 1],
        duration: 600,
        easing: 'easeOutExpo'
      });
    }
  }

  function saveToLocalStorage() {
    localStorage.setItem('expenses', JSON.stringify(expenses));
  }

  function updateUI() {
    updateTotal();
    renderExpenseList();
    updateChart();
  }

  function animateGridLines() {
    anime({
      targets: '.vertical-lines',
      backgroundPosition: ['0% 0%', '100% 0%'],
      duration: 20000,
      easing: 'linear',
      loop: true
    });
    
    anime({
      targets: '.horizontal-lines',
      backgroundPosition: ['0% 0%', '0% 100%'],
      duration: 20000,
      easing: 'linear',
      loop: true
    });
  }
});