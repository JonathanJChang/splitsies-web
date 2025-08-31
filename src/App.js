import React, { useState, useEffect, useRef } from 'react';
import html2canvas from 'html2canvas';
import './App.css';

function App() {
  // Load data from localStorage on initial load
  const [people, setPeople] = useState(() => {
    try {
      const savedPeople = localStorage.getItem('splitsies-people');
      return savedPeople ? JSON.parse(savedPeople) : [];
    } catch (error) {
      console.error('Error loading saved data:', error);
      return [];
    }
  });
  
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [editingItem, setEditingItem] = useState(null);
  const [editDescription, setEditDescription] = useState('');
  const [editAmount, setEditAmount] = useState('');
  const [editingPerson, setEditingPerson] = useState(null);
  const [editPersonName, setEditPersonName] = useState('');
  
  // Mobile touch states for showing action buttons
  const [mobileActiveItem, setMobileActiveItem] = useState(null);
  const [mobileActivePerson, setMobileActivePerson] = useState(null);
  
  // Ref for the exportable content
  const exportRef = useRef();

  // Save to localStorage whenever people data changes
  useEffect(() => {
    try {
      localStorage.setItem('splitsies-people', JSON.stringify(people));
    } catch (error) {
      console.error('Error saving data:', error);
    }
  }, [people]);

  // Handle amount input validation
  const handleAmountChange = (e) => {
    const value = e.target.value;
    
    // Allow empty value
    if (value === '') {
      setAmount('');
      return;
    }
    
    // Check if it's a valid number format
    if (/^\d*\.?\d{0,2}$/.test(value)) {
      setAmount(value);
    }
    // If invalid format, don't update the state (prevents typing)
  };

  // Handle edit amount input validation
  const handleEditAmountChange = (e) => {
    const value = e.target.value;
    
    // Allow empty value
    if (value === '') {
      setEditAmount('');
      return;
    }
    
    // Check if it's a valid number format
    if (/^\d*\.?\d{0,2}$/.test(value)) {
      setEditAmount(value);
    }
    // If invalid format, don't update the state (prevents typing)
  };

  // Clear all form fields
  const clearForm = () => {
    setName('');
    setAmount('');
    setDescription('');
    setErrorMessage('');
  };

  // Start editing an item
  const startEditItem = (personId, itemId) => {
    const person = people.find(p => p.id === personId);
    const item = person.items.find(i => i.id === itemId);
    setEditingItem({ personId, itemId });
    setEditDescription(item.description);
    setEditAmount(item.amount.toString());
  };

  // Cancel editing
  const cancelEdit = () => {
    setEditingItem(null);
    setEditDescription('');
    setEditAmount('');
  };

  // Save edited item
  const saveEditItem = () => {
    if (!editingItem) return;

    const trimmedDescription = editDescription.trim();
    const parsedAmount = parseFloat(editAmount) || 0;

    // Validation: if description provided, amount must be > 0
    if (trimmedDescription && parsedAmount === 0) {
      setErrorMessage('Please enter an amount for the item description you provided.');
      setTimeout(() => setErrorMessage(''), 3000);
      return;
    }

    const finalDescription = trimmedDescription || 'miscellaneous';

    const updatedPeople = people.map(person => {
      if (person.id === editingItem.personId) {
        const updatedItems = person.items.map(item => {
          if (item.id === editingItem.itemId) {
            return {
              ...item,
              description: finalDescription,
              amount: parsedAmount
            };
          }
          return item;
        });
        return { ...person, items: updatedItems };
      }
      return person;
    });

    setPeople(updatedPeople);
    cancelEdit();
  };

  // Delete an item
  const deleteItem = (personId, itemId) => {
    const updatedPeople = people.map(person => {
      if (person.id === personId) {
        const updatedItems = person.items.filter(item => item.id !== itemId);
        return { ...person, items: updatedItems };
      }
      return person;
    }).filter(person => person.items.length > 0); // Remove people with no items

    setPeople(updatedPeople);
  };

  // Start editing a person's name
  const startEditPerson = (personId) => {
    const person = people.find(p => p.id === personId);
    setEditingPerson(personId);
    setEditPersonName(person.name);
  };

  // Cancel editing person name
  const cancelEditPerson = () => {
    setEditingPerson(null);
    setEditPersonName('');
  };

  // Save edited person name
  const saveEditPerson = () => {
    if (!editingPerson || !editPersonName.trim()) return;

    const trimmedName = editPersonName.trim();
    
    // Check if another person already has this name (case-insensitive)
    const existingPerson = people.find(
      person => person.id !== editingPerson && person.name.toLowerCase() === trimmedName.toLowerCase()
    );
    
    if (existingPerson) {
      setErrorMessage('A person with this name already exists.');
      setTimeout(() => setErrorMessage(''), 3000);
      return;
    }

    const updatedPeople = people.map(person => {
      if (person.id === editingPerson) {
        return { ...person, name: trimmedName };
      }
      return person;
    });

    setPeople(updatedPeople);
    cancelEditPerson();
  };

  // Clear all data
  const clearAllData = () => {
    if (window.confirm('Are you sure you want to clear all data? This cannot be undone.')) {
      setPeople([]);
      setName('');
      setAmount('');
      setDescription('');
      setErrorMessage('');
      cancelEdit();
      cancelEditPerson();
      localStorage.removeItem('splitsies-people');
    }
  };

  // Calculate totals and splits
  const total = people.reduce((sum, person) => {
    return sum + person.items.reduce((itemSum, item) => itemSum + item.amount, 0);
  }, 0);
  const averagePerPerson = people.length > 0 ? total / people.length : 0;

  // Calculate who owes whom
  const calculateSplits = () => {
    if (people.length === 0) return [];
    
    // Calculate how much each person owes or is owed
    const balances = people.map(person => {
      const personTotal = person.items.reduce((sum, item) => sum + item.amount, 0);
      return {
        name: person.name,
        balance: personTotal - averagePerPerson
      };
    });

    // Separate debtors and creditors
    const debtors = balances.filter(person => person.balance < 0).map(person => ({
      name: person.name,
      owes: Math.abs(person.balance)
    }));
    
    const creditors = balances.filter(person => person.balance > 0).map(person => ({
      name: person.name,
      owed: person.balance
    }));

    // Calculate transfers
    const transfers = [];
    let debtorIndex = 0;
    let creditorIndex = 0;

    while (debtorIndex < debtors.length && creditorIndex < creditors.length) {
      const debtor = debtors[debtorIndex];
      const creditor = creditors[creditorIndex];
      
      const transferAmount = Math.min(debtor.owes, creditor.owed);
      
      if (transferAmount > 0.01) { // Avoid tiny amounts due to floating point precision
        transfers.push({
          from: debtor.name,
          to: creditor.name,
          amount: transferAmount
        });
      }

      debtor.owes -= transferAmount;
      creditor.owed -= transferAmount;

      if (debtor.owes < 0.01) debtorIndex++;
      if (creditor.owed < 0.01) creditorIndex++;
    }

    return transfers;
  };

  const splits = calculateSplits();

  const addPerson = (e) => {
    e.preventDefault();
    if (name.trim()) {
      // If amount is empty, assume they're a non-contributor (0)
      let contributionAmount = 0;
      
      if (amount && amount.trim() !== '') {
        const parsedAmount = parseFloat(amount);
        // Ensure amount is not negative
        if (!isNaN(parsedAmount) && parsedAmount >= 0) {
          contributionAmount = parsedAmount;
        } else if (parsedAmount < 0) {
          // Don't add if negative amount is entered
          return;
        }
      }
      
      const trimmedName = name.trim();
      const trimmedDescription = description.trim();
      
      // If description is provided but amount is 0, show error and don't add the item
      if (trimmedDescription && contributionAmount === 0) {
        setErrorMessage('Please enter an amount for the item description you provided.');
        setTimeout(() => setErrorMessage(''), 3000); // Clear after 3 seconds
        return;
      }
      
      const itemDescription = trimmedDescription || 'miscellaneous';
      
      // Check if person already exists (case-insensitive)
      const existingPersonIndex = people.findIndex(
        person => person.name.toLowerCase() === trimmedName.toLowerCase()
      );
      
      // If person exists and has contributions > 0, don't allow adding $0 items
      if (existingPersonIndex !== -1 && contributionAmount === 0) {
        const existingPerson = people[existingPersonIndex];
        const existingTotal = existingPerson.items.reduce((sum, item) => sum + item.amount, 0);
        if (existingTotal > 0) {
          setErrorMessage('Cannot add $0 items to someone who already has contributions.');
          setTimeout(() => setErrorMessage(''), 3000);
          return;
        }
      }
      
      if (existingPersonIndex !== -1) {
        // Check if item with same description already exists for this person
        const updatedPeople = [...people];
        const existingPerson = updatedPeople[existingPersonIndex];
        
        // If adding a meaningful contribution (> 0), remove any $0 items first
        if (contributionAmount > 0) {
          updatedPeople[existingPersonIndex].items = existingPerson.items.filter(item => item.amount > 0);
        }
        
        const existingItemIndex = updatedPeople[existingPersonIndex].items.findIndex(
          item => item.description.toLowerCase() === itemDescription.toLowerCase()
        );
        
        if (existingItemIndex !== -1) {
          // Update existing item amount
          updatedPeople[existingPersonIndex].items[existingItemIndex] = {
            ...updatedPeople[existingPersonIndex].items[existingItemIndex],
            amount: updatedPeople[existingPersonIndex].items[existingItemIndex].amount + contributionAmount
          };
        } else {
          // Add new item to existing person
          updatedPeople[existingPersonIndex] = {
            ...updatedPeople[existingPersonIndex],
            items: [
              ...updatedPeople[existingPersonIndex].items,
              {
                id: Date.now(),
                description: itemDescription,
                amount: contributionAmount
              }
            ]
          };
        }
        setPeople(updatedPeople);
      } else {
        // Add new person with first item
        const newPerson = {
          id: Date.now(),
          name: trimmedName,
          items: [
            {
              id: Date.now(),
              description: itemDescription,
              amount: contributionAmount
            }
          ]
        };
        setPeople([...people, newPerson]);
      }
      
      // Keep name in place, only clear amount and description
      setAmount('');
      setDescription('');
      setErrorMessage(''); // Clear any previous error messages
    }
  };

  const removePerson = (id) => {
    setPeople(people.filter(person => person.id !== id));
  };

  // Mobile touch handlers
  const handleMobileItemTouch = (personId, itemId, e) => {
    e.preventDefault();
    const itemKey = `${personId}-${itemId}`;
    
    if (mobileActiveItem === itemKey) {
      // Second tap - allow action to proceed
      return true;
    } else {
      // First tap - show buttons
      setMobileActiveItem(itemKey);
      setMobileActivePerson(null); // Hide person buttons
      return false;
    }
  };

  const handleMobilePersonTouch = (personId, e) => {
    e.preventDefault();
    
    if (mobileActivePerson === personId) {
      // Second tap - allow action to proceed
      return true;
    } else {
      // First tap - show buttons
      setMobileActivePerson(personId);
      setMobileActiveItem(null); // Hide item buttons
      return false;
    }
  };

  // Clear mobile active states when clicking elsewhere
  const clearMobileStates = () => {
    setMobileActiveItem(null);
    setMobileActivePerson(null);
  };

  // Export function

  const exportToJPG = async () => {
    if (!exportRef.current || people.length === 0) return;

    try {
      // Add capturing class to show export header
      exportRef.current.classList.add('capturing');
      
      const canvas = await html2canvas(exportRef.current, {
        backgroundColor: '#ffffff',
        scale: 2,
        useCORS: true,
        allowTaint: true
      });
      
      // Remove capturing class
      exportRef.current.classList.remove('capturing');

      // Create download link
      const link = document.createElement('a');
      const currentDate = new Date().toLocaleDateString().replace(/\//g, '-');
      link.download = `splitsies-summary-${currentDate}.jpg`;
      link.href = canvas.toDataURL('image/jpeg', 0.9);
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error generating JPG:', error);
      alert('Error generating JPG. Please try again.');
      // Make sure to remove capturing class even if there's an error
      if (exportRef.current) {
        exportRef.current.classList.remove('capturing');
      }
    }
  };

  return (
    <div className="App" onClick={clearMobileStates}>
      <div className={`container ${people.length > 0 ? 'has-summary' : ''}`}>
        <header className="header">
          <h1>💰 Splitsies</h1>
          <p>Split expenses fairly among friends</p>
        </header>

        <form onSubmit={addPerson} className="input-form">
          <div className="input-group">
            <div className="input-with-clear">
              <input
                type="text"
                placeholder="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input-field"
                required
              />
              {name && (
                <button
                  type="button"
                  onClick={clearForm}
                  className="clear-button"
                  aria-label="Clear form"
                >
                  ×
                </button>
              )}
            </div>
            <input
              type="text"
              placeholder="Item description - optional"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="input-field"
            />
            <input
              type="text"
              inputMode="decimal"
              placeholder="Amount ($) - optional"
              value={amount}
              onChange={handleAmountChange}
              className="input-field"
            />
          </div>
          <button type="submit" className="add-button">
            Add Item
          </button>
          {errorMessage && (
            <div className="error-message">
              {errorMessage}
            </div>
          )}
        </form>

        {people.length > 0 && (
          <div className="summary">
            <div className="summary-stats">
              <div className="stat">
                <span className="stat-label">Total</span>
                <span className="stat-value">${total.toFixed(2)}</span>
              </div>
              <div className="stat">
                <span className="stat-label">Per Person</span>
                <span className="stat-value">${averagePerPerson.toFixed(2)}</span>
              </div>
              <div className="stat">
                <span className="stat-label">People</span>
                <span className="stat-value">{people.length}</span>
              </div>
            </div>

          </div>
        )}

        <div ref={exportRef} className="exportable-content">
          {people.length > 0 && (
            <div className="export-header">
              <h2>💰 Splitsies - Expense Summary</h2>
              <p className="export-date">Generated on {new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}</p>
              <p className="export-time">at {new Date().toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit'
              })}</p>
              <div className="export-summary">
                <div className="export-stat">
                  <strong>Total: ${total.toFixed(2)}</strong>
                </div>
                <div className="export-stat">
                  <strong>Per Person: ${averagePerPerson.toFixed(2)}</strong>
                </div>
                <div className="export-stat">
                  <strong>People: {people.length}</strong>
                </div>
              </div>
            </div>
          )}

        {people.length > 0 && (
          <div className="people-list">
            <h3>Contributors</h3>
            {people.map(person => {
              const personTotal = person.items.reduce((sum, item) => sum + item.amount, 0);
              return (
                <div key={person.id} className="person-section">
                  <div className="person-header">
                    {editingPerson === person.id ? (
                      // Edit mode for person name
                      <div className="person-name-edit">
                        <input
                          type="text"
                          value={editPersonName}
                          onChange={(e) => setEditPersonName(e.target.value)}
                          className="edit-person-input"
                          placeholder="Person name"
                        />
                        <button 
                          onClick={saveEditPerson}
                          className="edit-save-button"
                          aria-label="Save name"
                        >
                          ✓
                        </button>
                        <button 
                          onClick={cancelEditPerson}
                          className="edit-cancel-button"
                          aria-label="Cancel editing"
                        >
                          ✗
                        </button>
                      </div>
                    ) : (
                      // Display mode for person name
                      <>
                        <div 
                          className="person-info"
                          onTouchStart={(e) => {
                            if (window.innerWidth <= 480) {
                              handleMobilePersonTouch(person.id, e);
                            }
                          }}
                        >
                          <span className="person-name">{person.name}</span>
                          <span className="person-amount">${personTotal.toFixed(2)}</span>
                        </div>
                        <div className={`person-actions ${mobileActivePerson === person.id ? 'mobile-active' : ''}`}>
                          <button 
                            onClick={(e) => {
                              if (window.innerWidth <= 480) {
                                if (!handleMobilePersonTouch(person.id, e)) return;
                              }
                              startEditPerson(person.id);
                            }}
                            className="edit-name-button"
                            aria-label="Edit name"
                          >
                            ✎
                          </button>
                          <button 
                            onClick={(e) => {
                              if (window.innerWidth <= 480) {
                                if (!handleMobilePersonTouch(person.id, e)) return;
                              }
                              removePerson(person.id);
                            }}
                            className="remove-button"
                            aria-label="Remove person"
                          >
                            ⌫
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                  <div className="person-items">
                    {person.items.map(item => (
                      <div 
                        key={item.id} 
                        className={`item-detail ${
                          editingItem && editingItem.personId === person.id && editingItem.itemId === item.id 
                            ? 'editing' 
                            : ''
                        }`}
                      >
                        {editingItem && editingItem.personId === person.id && editingItem.itemId === item.id ? (
                          // Edit mode
                          <div className="item-edit-mode">
                            <input
                              type="text"
                              value={editDescription}
                              onChange={(e) => setEditDescription(e.target.value)}
                              placeholder="Description"
                              className="edit-input edit-description"
                            />
                            <input
                              type="text"
                              inputMode="decimal"
                              value={editAmount}
                              onChange={handleEditAmountChange}
                              placeholder="Amount"
                              className="edit-input edit-amount"
                            />
                            <button 
                              onClick={saveEditItem}
                              className="edit-save-button"
                              aria-label="Save changes"
                            >
                              ✓
                            </button>
                            <button 
                              onClick={cancelEdit}
                              className="edit-cancel-button"
                              aria-label="Cancel editing"
                            >
                              ✗
                            </button>
                          </div>
                        ) : (
                          // Display mode
                          <>
                            <div 
                              className="item-content"
                              onTouchStart={(e) => {
                                if (window.innerWidth <= 480) {
                                  handleMobileItemTouch(person.id, item.id, e);
                                }
                              }}
                            >
                              <span className="item-description">{item.description}</span>
                              <span className="item-amount">${item.amount.toFixed(2)}</span>
                            </div>
                            <div className={`item-actions ${mobileActiveItem === `${person.id}-${item.id}` ? 'mobile-active' : ''}`}>
                              <button 
                                onClick={(e) => {
                                  if (window.innerWidth <= 480) {
                                    if (!handleMobileItemTouch(person.id, item.id, e)) return;
                                  }
                                  startEditItem(person.id, item.id);
                                }}
                                className="edit-button"
                                aria-label="Edit item"
                              >
                                ✎
                              </button>
                              <button 
                                onClick={(e) => {
                                  if (window.innerWidth <= 480) {
                                    if (!handleMobileItemTouch(person.id, item.id, e)) return;
                                  }
                                  deleteItem(person.id, item.id);
                                }}
                                className="delete-button"
                                aria-label="Delete item"
                              >
                                ⌫
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {splits.length > 0 && (
          <div className="splits-section">
            <h3>Who Pays Whom</h3>
            <div className="splits-list">
              {splits.map((split, index) => (
                <div key={index} className="split-item">
                  <span className="split-from">{split.from}</span>
                  <span className="split-arrow">→</span>
                  <span className="split-to">{split.to}</span>
                  <span className="split-amount">${split.amount.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        </div>

        {people.length === 0 && (
          <div className="empty-state">
            <p>Add people and their contributions to get started!</p>
          </div>
        )}

        {people.length > 0 && (
          <div className="new-session-section">
            <div className="session-actions">
              <button 
                onClick={exportToJPG}
                className="export-button"
                aria-label="Export as JPG"
              >
                🖼️ Export
              </button>
              <button 
                onClick={clearAllData}
                className="new-session-button"
                aria-label="Start new session"
              >
                New Session
              </button>
            </div>
          </div>
        )}

        <div className="version-tag">
          v1.1.1
        </div>
      </div>
    </div>
  );
}

export default App;
