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
  const [weight, setWeight] = useState('1');
  const [errorMessage, setErrorMessage] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [filteredNames, setFilteredNames] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [showMenu, setShowMenu] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [editDescription, setEditDescription] = useState('');
  const [editAmount, setEditAmount] = useState('');
  const [editingPerson, setEditingPerson] = useState(null);
  const [editPersonName, setEditPersonName] = useState('');
  const [editPersonWeight, setEditPersonWeight] = useState('1');
  
  // Master edit mode state
  const [isEditMode, setIsEditMode] = useState(false);
  
  // Temporary edit states for master edit mode
  const [tempEditStates, setTempEditStates] = useState({});
  
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

  // Handle name input changes with autocomplete
  const handleNameChange = (e) => {
    const value = e.target.value;
    setName(value);
    setSelectedIndex(-1); // Reset selection when typing
    
    // Filter existing contributor names
    if (value.trim()) {
      const existing = people.map(person => person.name);
      const filtered = existing.filter(existingName => 
        existingName.toLowerCase().includes(value.toLowerCase().trim()) &&
        existingName.toLowerCase() !== value.toLowerCase().trim()
      );
      setFilteredNames(filtered);
      setShowDropdown(filtered.length > 0);
    } else {
      setFilteredNames([]);
      setShowDropdown(false);
    }
  };

  const selectName = (selectedName) => {
    setName(selectedName);
    setShowDropdown(false);
    setFilteredNames([]);
  };

  const closeDropdown = () => {
    setShowDropdown(false);
    setFilteredNames([]);
    setSelectedIndex(-1);
  };

  const handleKeyDown = (e) => {
    if (!showDropdown || filteredNames.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < filteredNames.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : filteredNames.length - 1
        );
        break;
      case 'Enter':
        if (selectedIndex >= 0) {
          e.preventDefault();
          selectName(filteredNames[selectedIndex]);
        }
        break;
      case 'Escape':
        closeDropdown();
        break;
      default:
        break;
    }
  };

  const autocompleteRef = useRef(null);
  const menuRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (autocompleteRef.current && !autocompleteRef.current.contains(event.target)) {
        closeDropdown();
      }
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

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

  // Handle weight input validation
  const handleWeightChange = (e) => {
    const value = e.target.value;
    setWeight(value);
  };

  // Handle edit weight input validation
  const handleEditWeightChange = (e) => {
    const value = e.target.value;
    setEditPersonWeight(value);
  };

  // Clear all form fields
  const clearForm = () => {
    setName('');
    setAmount('');
    setDescription('');
    setWeight('1');
    setErrorMessage('');
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



  // Cancel editing person name and weight
  const cancelEditPerson = () => {
    setEditingPerson(null);
    setEditPersonName('');
    setEditPersonWeight('1');
  };

  // Cancel all active edits (helper function)
  const cancelAllEdits = () => {
    if (editingItem) {
      cancelEdit();
    }
    if (editingPerson) {
      cancelEditPerson();
    }
  };

  // Update temporary edit state
  const updateTempEditState = (key, updates) => {
    setTempEditStates(prev => ({
      ...prev,
      [key]: { ...prev[key], ...updates }
    }));
  };

  // Check if an item description is duplicate within a person
  const isItemDescriptionDuplicate = (personId, currentItemId, description) => {
    if (!isEditMode || !description || !description.trim()) return false;
    
    const person = people.find(p => p.id === personId);
    if (!person) return false;
    
    const normalizedDesc = description.trim().toLowerCase();
    const otherItems = person.items.filter(item => item.id !== currentItemId);
    
    return otherItems.some(item => {
      const itemKey = `item-${personId}-${item.id}`;
      const itemTemp = tempEditStates[itemKey];
      const itemDesc = (itemTemp?.description ?? item.description).trim().toLowerCase();
      return (itemDesc || 'miscellaneous') === (normalizedDesc || 'miscellaneous');
    });
  };

  // Save all temporary edits to the main state
  const saveAllTempEdits = () => {
    // First validate that all names are not blank
    for (const person of people) {
      const personKey = `person-${person.id}`;
      const personTemp = tempEditStates[personKey];
      const nameToCheck = personTemp?.name ?? person.name;
      
      if (!nameToCheck || !nameToCheck.trim()) {
        setErrorMessage('Person names cannot be blank. Please enter a name for all contributors.');
        setTimeout(() => setErrorMessage(''), 3000);
        return; // Don't save if validation fails
      }
    }

    // Check for duplicate names
    const names = people.map(person => {
      const personKey = `person-${person.id}`;
      const personTemp = tempEditStates[personKey];
      return (personTemp?.name ?? person.name).trim().toLowerCase();
    });
    
    const duplicateNames = names.filter((name, index) => names.indexOf(name) !== index);
    if (duplicateNames.length > 0) {
      setErrorMessage('Duplicate names are not allowed. Please ensure all contributors have unique names.');
      setTimeout(() => setErrorMessage(''), 3000);
      return; // Don't save if validation fails
    }

    // Check for duplicate item descriptions within each contributor
    for (const person of people) {
      const itemDescriptions = person.items.map(item => {
        const itemKey = `item-${person.id}-${item.id}`;
        const itemTemp = tempEditStates[itemKey];
        const description = (itemTemp?.description ?? item.description).trim().toLowerCase();
        return description || 'miscellaneous'; // Default to 'miscellaneous' if empty
      });
      
      const duplicateItems = itemDescriptions.filter((desc, index) => itemDescriptions.indexOf(desc) !== index);
      if (duplicateItems.length > 0) {
        const personKey = `person-${person.id}`;
        const personTemp = tempEditStates[personKey];
        const personName = personTemp?.name ?? person.name;
        setErrorMessage(`Duplicate item descriptions found for ${personName}. Please ensure all items have unique descriptions.`);
        setTimeout(() => setErrorMessage(''), 3000);
        return; // Don't save if validation fails
      }
    }

    const updatedPeople = people.map(person => {
      const personKey = `person-${person.id}`;
      const personTemp = tempEditStates[personKey];
      
      const updatedItems = person.items.map(item => {
        const itemKey = `item-${person.id}-${item.id}`;
        const itemTemp = tempEditStates[itemKey];
        
        if (itemTemp) {
          return {
            ...item,
            description: itemTemp.description.trim() || 'miscellaneous',
            amount: parseFloat(itemTemp.amount) || 0
          };
        }
        return item;
      });

      if (personTemp) {
        return {
          ...person,
          name: personTemp.name.trim(),
          weight: parseInt(personTemp.weight) || 1,
          items: updatedItems
        };
      }
      return { ...person, items: updatedItems };
    });

    setPeople(updatedPeople);
  };

  // Save edited person name and weight
  const saveEditPerson = () => {
    if (!editingPerson || !editPersonName.trim() || !editPersonWeight) return;

    const trimmedName = editPersonName.trim();
    const parsedWeight = parseInt(editPersonWeight);
    
    // Validate weight
    if (isNaN(parsedWeight) || parsedWeight < 1) {
      setErrorMessage('Shares must be a whole number of 1 or greater.');
      setTimeout(() => setErrorMessage(''), 3000);
      return;
    }
    
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
        return { ...person, name: trimmedName, weight: parsedWeight };
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
      setWeight('1');
      setErrorMessage('');
      cancelAllEdits();
      localStorage.removeItem('splitsies-people');
    }
  };

  // Calculate totals and weighted splits
  const total = people.reduce((sum, person) => {
    return sum + person.items.reduce((itemSum, item) => itemSum + item.amount, 0);
  }, 0);
  
  const totalShares = people.reduce((sum, person) => {
    return sum + (person.weight || 1);
  }, 0);
  
  const costPerShare = totalShares > 0 ? total / totalShares : 0;

  // Calculate who owes whom (weighted)
  const calculateSplits = () => {
    if (people.length === 0) return [];
    
    // Calculate how much each person owes or is owed based on their weight
    const balances = people.map(person => {
      const personTotal = person.items.reduce((sum, item) => sum + item.amount, 0);
      const personWeight = person.weight || 1;
      const personOwes = costPerShare * personWeight;
      return {
        name: person.name,
        weight: personWeight,
        balance: personTotal - personOwes
      };
    });

    // Separate debtors and creditors
    const debtors = balances.filter(person => person.balance < 0).map(person => ({
      name: person.name,
      weight: person.weight,
      owes: Math.abs(person.balance)
    }));
    
    const creditors = balances.filter(person => person.balance > 0).map(person => ({
      name: person.name,
      weight: person.weight,
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
          fromWeight: debtor.weight,
          to: creditor.name,
          toWeight: creditor.weight,
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
      const parsedWeight = parseInt(weight) || 1;
      
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
          weight: parsedWeight,
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

  // Toggle master edit mode
  const toggleEditMode = () => {
    if (isEditMode) {
      // Exiting edit mode - save all changes and clear temp states
      saveAllTempEdits();
      setTempEditStates({});
      cancelAllEdits();
      setIsEditMode(false);
    } else {
      // Entering edit mode - initialize temp edit states for all items
      const tempStates = {};
      people.forEach(person => {
        tempStates[`person-${person.id}`] = {
          name: person.name,
          weight: person.weight || 1
        };
        person.items.forEach(item => {
          tempStates[`item-${person.id}-${item.id}`] = {
            description: item.description,
            amount: item.amount.toString()
          };
        });
      });
      setTempEditStates(tempStates);
      setIsEditMode(true);
    }
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
    <div className={`App ${people.length > 0 ? 'has-content' : ''}`}>
      <div className={`container ${people.length > 0 ? 'has-summary' : ''}`}>
        <header className="header">
          <div className="header-content">
            <div className="header-text">
              <h1>💰 Splitsies</h1>
              <p>Split expenses fairly among friends</p>
            </div>
            <div className="header-actions" ref={menuRef}>
              <button 
                className="menu-toggle"
                onClick={() => setShowMenu(!showMenu)}
                aria-label="Open menu"
              >
                ⋮
              </button>
              {showMenu && (
                <div className="action-menu">
                  <button 
                    onClick={() => {
                      exportToJPG();
                      setShowMenu(false);
                    }}
                    className="menu-item"
                  >
                    📤 Export JPG
                  </button>
                  <button 
                    onClick={() => {
                      clearAllData();
                      setShowMenu(false);
                    }}
                    className="menu-item menu-item-danger"
                  >
                    🗑️ New Session
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <form onSubmit={addPerson} className="input-form">
          <div className="input-group">
            <div className="input-with-clear autocomplete-container" ref={autocompleteRef}>
              <input
                type="text"
                placeholder="Name"
                value={name}
                onChange={handleNameChange}
                onKeyDown={handleKeyDown}
                onFocus={() => {
                  if (filteredNames.length > 0) {
                    setShowDropdown(true);
                  }
                }}
                className="input-field"
                required
              />
              {name && (
                <button
                  type="button"
                  onClick={() => {
                    clearForm();
                    closeDropdown();
                  }}
                  className="clear-button"
                  aria-label="Clear form"
                >
                  ×
                </button>
              )}
              {showDropdown && filteredNames.length > 0 && (
                <div className="autocomplete-dropdown">
                  {filteredNames.map((existingName, index) => (
                    <div
                      key={index}
                      className={`autocomplete-item ${index === selectedIndex ? 'selected' : ''}`}
                      onClick={() => selectName(existingName)}
                      onMouseEnter={() => setSelectedIndex(index)}
                    >
                      {existingName}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <input
              type="text"
              placeholder="Item description - optional"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="input-field"
            />
            <div className="amount-input-group">
              <input
                type="text"
                inputMode="decimal"
                placeholder="0.00"
                value={amount}
                onChange={handleAmountChange}
                className="input-field"
              />
            </div>
            <div className="weight-input-group">
              <div className="weight-controls">
                <button
                  type="button"
                  className="weight-button weight-decrease"
                  onClick={() => setWeight(Math.max(1, parseInt(weight) - 1 || 1))}
                  disabled={parseInt(weight) <= 1}
                >
                  −
                </button>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={weight}
                  onChange={handleWeightChange}
                  className="weight-input"
                  readOnly
                />
                <button
                  type="button"
                  className="weight-button weight-increase"
                  onClick={() => setWeight(Math.min(10, parseInt(weight) + 1 || 1))}
                  disabled={parseInt(weight) >= 10}
                >
                  +
                </button>
              </div>
            </div>
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
                <span className="stat-label">Per Share</span>
                <span className="stat-value">${costPerShare.toFixed(2)}</span>
              </div>
              <div className="stat">
                <span className="stat-label">Total Shares</span>
                <span className="stat-value">{totalShares}</span>
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
                  <strong>Per Share: ${costPerShare.toFixed(2)}</strong>
                </div>
                <div className="export-stat">
                  <strong>Total Shares: {totalShares}</strong>
                </div>
              </div>
            </div>
          )}

        {people.length > 0 && (
          <div className="people-list">
            <div className="contributors-header">
              <h3>Contributors</h3>
              <button 
                onClick={toggleEditMode}
                className={`master-edit-button ${isEditMode ? 'active' : ''}`}
                aria-label={isEditMode ? 'Confirm changes' : 'Edit contributors'}
              >
                {isEditMode ? '✓ Done' : '✎ Edit'}
              </button>
            </div>
            {people.map(person => {
              const personTotal = person.items.reduce((sum, item) => sum + item.amount, 0);
              return (
                <div key={person.id} className="person-section">
                  <div className="person-header">
                    {(editingPerson === person.id || isEditMode) ? (
                      // Edit mode for person name
                      <div className="person-name-edit">
                        <input
                          type="text"
                          value={isEditMode ? (tempEditStates[`person-${person.id}`]?.name ?? person.name) : editPersonName}
                          onChange={(e) => {
                            if (isEditMode) {
                              updateTempEditState(`person-${person.id}`, { name: e.target.value });
                            } else {
                              setEditPersonName(e.target.value);
                            }
                          }}
                          className={`edit-person-input ${
                            isEditMode && !(tempEditStates[`person-${person.id}`]?.name ?? person.name).trim() 
                              ? 'invalid' 
                              : ''
                          }`}
                          placeholder="Person name"
                        />
                        <div className="edit-weight-controls">
                          <button
                            type="button"
                            className="weight-button weight-decrease"
                            onClick={() => {
                              if (isEditMode) {
                                const currentWeight = tempEditStates[`person-${person.id}`]?.weight ?? person.weight ?? 1;
                                updateTempEditState(`person-${person.id}`, { weight: Math.max(1, currentWeight - 1) });
                              } else {
                                setEditPersonWeight(Math.max(1, parseInt(editPersonWeight) - 1 || 1));
                              }
                            }}
                            disabled={isEditMode ? (tempEditStates[`person-${person.id}`]?.weight ?? person.weight ?? 1) <= 1 : parseInt(editPersonWeight) <= 1}
                          >
                            −
                          </button>
                          <input
                            type="number"
                            min="1"
                            max="10"
                                                          value={isEditMode ? (tempEditStates[`person-${person.id}`]?.weight ?? person.weight ?? 1) : editPersonWeight}
                            onChange={handleEditWeightChange}
                            className="edit-weight-input"
                            readOnly
                          />
                          <button
                            type="button"
                            className="weight-button weight-increase"
                            onClick={() => {
                              if (isEditMode) {
                                const currentWeight = tempEditStates[`person-${person.id}`]?.weight ?? person.weight ?? 1;
                                updateTempEditState(`person-${person.id}`, { weight: Math.min(10, currentWeight + 1) });
                              } else {
                                setEditPersonWeight(Math.min(10, parseInt(editPersonWeight) + 1 || 1));
                              }
                            }}
                            disabled={isEditMode ? (tempEditStates[`person-${person.id}`]?.weight ?? person.weight ?? 1) >= 10 : parseInt(editPersonWeight) >= 10}
                          >
                            +
                          </button>
                        </div>
                        {!isEditMode && (
                          <>
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
                          </>
                        )}
                        {isEditMode && (
                          <button 
                            onClick={() => removePerson(person.id)}
                            className="remove-button"
                            aria-label="Remove person"
                          >
                            ⌫
                          </button>
                        )}
                      </div>
                    ) : (
                      // Display mode for person name (only shown when not in edit mode)
                      <div className="person-info">
                        <span className="person-name">
                          {person.name} 
                          {person.weight && person.weight !== 1 && (
                            <span className="person-weight"> (×{person.weight})</span>
                          )}
                        </span>
                        <span className="person-amount">${personTotal.toFixed(2)}</span>
                      </div>
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
                        {(editingItem && editingItem.personId === person.id && editingItem.itemId === item.id) || isEditMode ? (
                          // Edit mode
                          <div className="item-edit-mode">
                            <input
                              type="text"
                              value={isEditMode ? (tempEditStates[`item-${person.id}-${item.id}`]?.description ?? item.description) : editDescription}
                              onChange={(e) => {
                                if (isEditMode) {
                                  updateTempEditState(`item-${person.id}-${item.id}`, { description: e.target.value });
                                } else {
                                  setEditDescription(e.target.value);
                                }
                              }}
                              placeholder="Description"
                              className={`edit-input edit-description ${
                                isEditMode && isItemDescriptionDuplicate(
                                  person.id, 
                                  item.id, 
                                  tempEditStates[`item-${person.id}-${item.id}`]?.description ?? item.description
                                ) ? 'invalid' : ''
                              }`}
                            />
                            <div className="amount-input-group">
                              <input
                                type="text"
                                inputMode="decimal"
                                value={isEditMode ? (tempEditStates[`item-${person.id}-${item.id}`]?.amount ?? item.amount.toString()) : editAmount}
                                onChange={(e) => {
                                  if (isEditMode) {
                                    // Apply same decimal validation as handleEditAmountChange
                                    if (e.target.value === '' || /^\d*\.?\d{0,2}$/.test(e.target.value)) {
                                      updateTempEditState(`item-${person.id}-${item.id}`, { amount: e.target.value });
                                    }
                                  } else {
                                    handleEditAmountChange(e);
                                  }
                                }}
                                placeholder="0.00"
                                className="edit-input edit-amount"
                              />
                            </div>
                            {!isEditMode && (
                              <>
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
                              </>
                            )}
                            {isEditMode && (
                              <button 
                                onClick={() => deleteItem(person.id, item.id)}
                                className="delete-button"
                                aria-label="Delete item"
                              >
                                ⌫
                              </button>
                            )}
                          </div>
                        ) : (
                          // Display mode (only shown when not in edit mode)
                          <div className="item-content">
                            <span className="item-description">{item.description}</span>
                            <span className="item-amount">${item.amount.toFixed(2)}</span>
                          </div>
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
                  <span className="split-from">
                    {split.from}
                    {split.fromWeight > 1 && (
                      <span className="split-weight"> (×{split.fromWeight})</span>
                    )}
                  </span>
                  <span className="split-arrow">→</span>
                  <span className="split-to">
                    {split.to}
                    {split.toWeight > 1 && (
                      <span className="split-weight"> (×{split.toWeight})</span>
                    )}
                  </span>
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



        <div className="version-tag">
          v1.3.1
        </div>
      </div>
    </div>
  );
}

export default App;
