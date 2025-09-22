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
  const [showExportNotification, setShowExportNotification] = useState(false);
  const [showNoContributorsNotification, setShowNoContributorsNotification] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [editDescription, setEditDescription] = useState('');
  const [editAmount, setEditAmount] = useState('');
  const [editingPerson, setEditingPerson] = useState(null);
  const [editPersonName, setEditPersonName] = useState('');
  const [editPersonWeight, setEditPersonWeight] = useState('1');
  const [editPersonFixed, setEditPersonFixed] = useState(false);
  
  // Master edit mode state
  const [isEditMode, setIsEditMode] = useState(false);
  
  // Temporary edit states for master edit mode
  const [tempEditStates, setTempEditStates] = useState({});
  
  // Store original data when entering edit mode for potential cancellation
  const [originalDataBeforeEdit, setOriginalDataBeforeEdit] = useState(null);
  
  // Modal state for contributor details
  const [showModal, setShowModal] = useState(false);
  const [selectedContributor, setSelectedContributor] = useState(null);
  
  // Touch/swipe state for modal navigation
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  
  // JSON editor modal state
  const [showJsonEditor, setShowJsonEditor] = useState(false);
  const [jsonData, setJsonData] = useState('');
  const [jsonError, setJsonError] = useState('');
  
  // Dark mode state with localStorage persistence
  const [isDarkMode, setIsDarkMode] = useState(() => {
    try {
      const savedDarkMode = localStorage.getItem('splitsies-dark-mode');
      return savedDarkMode ? JSON.parse(savedDarkMode) : false;
    } catch (error) {
      console.error('Error loading dark mode setting:', error);
      return false;
    }
  });
  
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

  // Save dark mode setting to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('splitsies-dark-mode', JSON.stringify(isDarkMode));
    } catch (error) {
      console.error('Error saving dark mode setting:', error);
    }
  }, [isDarkMode]);

  // Update body background for dark mode
  useEffect(() => {
    if (isDarkMode) {
      document.body.style.background = 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)';
    } else {
      document.body.style.background = 'linear-gradient(135deg, #f1f3f5 0%, #dee2e6 100%)';
    }
    
    // Cleanup function to reset on unmount
    return () => {
      document.body.style.background = '';
    };
  }, [isDarkMode]);

  // Modal scroll lock effect
  useEffect(() => {
    if (showModal) {
      document.body.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
    }

    // Cleanup function to ensure class is removed when component unmounts
    return () => {
      document.body.classList.remove('modal-open');
    };
  }, [showModal]);



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

  // Close dropdown and modal when clicking outside
  const modalRef = useRef(null);
  
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (autocompleteRef.current && !autocompleteRef.current.contains(event.target)) {
        closeDropdown();
      }
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        setShowModal(false);
        setSelectedContributor(null);
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

    const finalDescription = trimmedDescription || (parsedAmount === 0 ? 'no contributions' : 'miscellaneous');

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
    setEditPersonFixed(false);
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
    let isValid = true;

    // First validate that all names are not blank
    for (const person of people) {
      const personKey = `person-${person.id}`;
      const personTemp = tempEditStates[personKey];
      const nameToCheck = personTemp?.name ?? person.name;
      
      if (!nameToCheck || !nameToCheck.trim()) {
        setErrorMessage('Person names cannot be blank. Please enter a name for all contributors.');
        setTimeout(() => setErrorMessage(''), 3000);
        isValid = false;
        break;
      }
    }

    if (!isValid) return;

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
      isValid = false;
    }

    if (!isValid) return;

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
        isValid = false;
        break;
      }
    }

    if (!isValid) return;

    // Calculate total and validate fixed amounts
    const total = people.reduce((sum, person) => 
      sum + person.items.reduce((itemSum, item) => itemSum + item.amount, 0), 0
    );

    let totalFixedAmount = 0;
    let hasSharePerson = false;

    for (const person of people) {
      const personTemp = tempEditStates[`person-${person.id}`];
      if (personTemp?.isFixed) {
        totalFixedAmount += parseFloat(personTemp.fixedAmount || 0);
        if (totalFixedAmount > total) {
          setErrorMessage('Total fixed amounts cannot exceed the total sum.');
          setTimeout(() => setErrorMessage(''), 3000);
          isValid = false;
          break;
        }
      } else {
        hasSharePerson = true;
      }
    }

    // Check if everyone is using fixed amounts
    if (!hasSharePerson) {
      setErrorMessage('At least one person must use shares.');
      setTimeout(() => setErrorMessage(''), 3000);
      isValid = false;
    }

    if (!isValid) return;

    const updatedPeople = people.map(person => {
      const personKey = `person-${person.id}`;
      const personTemp = tempEditStates[personKey];
      
      const updatedItems = person.items.map(item => {
        const itemKey = `item-${person.id}-${item.id}`;
        const itemTemp = tempEditStates[itemKey];
        
        if (itemTemp) {
          return {
            ...item,
            description: itemTemp.description.trim() || (parseFloat(itemTemp.amount) === 0 ? 'no contributions' : 'miscellaneous'),
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
            isFixed: personTemp.isFixed || false,
            fixedAmount: personTemp.fixedAmount || '0',
            items: updatedItems
          };
      }
      return { ...person, items: updatedItems };
    });

    setPeople(updatedPeople);
    setIsEditMode(false);
    setTempEditStates({});
    cancelAllEdits();
    setOriginalDataBeforeEdit(null);
  };

  // Helper function to validate fixed amounts
  const validateFixedAmounts = (currentPersonId = null) => {
    const total = people.reduce((sum, person) => 
      sum + person.items.reduce((itemSum, item) => itemSum + item.amount, 0), 0
    );

    // Calculate sum of all fixed amounts (excluding current person if editing)
    const fixedTotal = people.reduce((sum, person) => {
      if (person.id === currentPersonId) return sum;
      if (isEditMode) {
        const personTemp = tempEditStates[`person-${person.id}`];
        if (personTemp?.isFixed) {
          return sum + parseFloat(personTemp.fixedAmount || 0);
        }
      } else if (person.isFixed) {
        return sum + parseFloat(person.fixedAmount || 0);
      }
      return sum;
    }, 0);

    return { total, fixedTotal };
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

    // Validate fixed amount if using fixed mode
    let isValidFixedAmount = true;
    if (editPersonFixed) {
      const { total, fixedTotal } = validateFixedAmounts(editingPerson);
      const newFixedAmount = parseFloat(tempEditStates[`person-${editingPerson}`]?.by_amount || 0);
      if (fixedTotal + newFixedAmount > total) {
        setErrorMessage('Total fixed amounts cannot exceed the total sum.');
        setTimeout(() => setErrorMessage(''), 3000);
        isValidFixedAmount = false;
      }

      // Check if this would make everyone use fixed amounts
      const hasSharePerson = people.some(p => p.id !== editingPerson && !p.isFixed);
      if (!hasSharePerson) {
        setErrorMessage('At least one person must use shares.');
        setTimeout(() => setErrorMessage(''), 3000);
        isValidFixedAmount = false;
      }
    }

    // Only save and exit edit mode if validation passes
    if (isValidFixedAmount) {
      const updatedPeople = people.map(person => {
        if (person.id === editingPerson) {
          return { 
            ...person, 
            name: trimmedName, 
            weight: parsedWeight,
            isFixed: editPersonFixed,
            fixedAmount: editPersonFixed ? tempEditStates[`person-${editingPerson}`]?.by_amount || '0' : person.fixedAmount // Save fixedAmount if fixed mode is active
          };
        }
        return person;
      });

      setPeople(updatedPeople);
      cancelEditPerson();
    }
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
  
  // Calculate totals for display
  const sharePeople = people.filter(person => !person.isFixed);
  const fixedPeople = people.filter(person => person.isFixed);
  const fixedTotal = fixedPeople.reduce((sum, person) => sum + parseFloat(person.fixedAmount || 0), 0);
  const remainingTotal = Math.max(0, total - fixedTotal);
  
  const totalShares = sharePeople.reduce((sum, person) => {
    return sum + (person.weight || 1);
  }, 0);
  
  const costPerShare = totalShares > 0 ? remainingTotal / totalShares : 0;

  // Calculate who owes whom (weighted and fixed)
  const calculateSplits = () => {
    if (people.length === 0) return [];
    
    const total = people.reduce((sum, person) => 
      sum + person.items.reduce((itemSum, item) => itemSum + item.amount, 0), 0
    );

    // First handle fixed amount people
    const fixedPeople = people.filter(person => person.isFixed);
    const fixedTotal = fixedPeople.reduce((sum, person) => sum + parseFloat(person.fixedAmount || 0), 0);
    
    // Calculate remaining amount for share-based people
    const remainingTotal = Math.max(0, total - fixedTotal);
    const sharePeople = people.filter(person => !person.isFixed);
    const totalShares = sharePeople.reduce((sum, person) => sum + (person.weight || 1), 0);
    const costPerShare = totalShares > 0 ? remainingTotal / totalShares : 0;

    // Calculate balances for all people
    const balances = people.map(person => {
      const personTotal = person.items.reduce((sum, item) => sum + item.amount, 0);
      let personOwes;
      
      if (person.isFixed) {
        // Fixed amount people pay exactly what they specified
        personOwes = parseFloat(person.fixedAmount || 0);
      } else {
        // Share-based people split the remaining total
        const personWeight = person.weight || 1;
        personOwes = costPerShare * personWeight;
      }

      return {
        name: person.name,
        weight: person.weight || 1,
        isFixed: person.isFixed,
        fixedAmount: person.fixedAmount,
        balance: personTotal - personOwes
      };
    });

    // Separate debtors and creditors
    const debtors = balances.filter(person => person.balance < 0).map(person => ({
      name: person.name,
      weight: person.weight,
      isFixed: person.isFixed,
      fixedAmount: person.fixedAmount,
      owes: Math.abs(person.balance)
    }));
    
    const creditors = balances.filter(person => person.balance > 0).map(person => ({
      name: person.name,
      weight: person.weight,
      isFixed: person.isFixed,
      fixedAmount: person.fixedAmount,
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
          fromFixed: debtor.isFixed,
          fromFixedAmount: debtor.fixedAmount,
          to: creditor.name,
          toWeight: creditor.weight,
          toFixed: creditor.isFixed,
          toFixedAmount: creditor.fixedAmount,
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

  // Calculate individual contributor details for modal
  const getContributorDetails = (contributorName) => {
    if (!contributorName) return null;

    const contributor = people.find(person => person.name === contributorName);
    if (!contributor) return null;

    const contributorTotal = contributor.items.reduce((sum, item) => sum + item.amount, 0);
    const contributorWeight = contributor.weight || 1;
    const contributorOwes = costPerShare * contributorWeight;
    const balance = contributorTotal - contributorOwes;

    // Find all transactions involving this contributor
    const paymentsToReceive = splits.filter(split => split.to === contributorName);
    const paymentsToMake = splits.filter(split => split.from === contributorName);

    const totalReceiving = paymentsToReceive.reduce((sum, payment) => sum + payment.amount, 0);
    const totalPaying = paymentsToMake.reduce((sum, payment) => sum + payment.amount, 0);

    return {
      name: contributorName,
      weight: contributorWeight,
      items: contributor.items,
      totalContributed: contributorTotal,
      owedAmount: contributorOwes,
      balance: balance,
      paymentsToReceive: paymentsToReceive,
      paymentsToMake: paymentsToMake,
      totalReceiving: totalReceiving,
      totalPaying: totalPaying,
      isCreditor: balance > 0.01,
      isDebtor: balance < -0.01,
      isEven: Math.abs(balance) <= 0.01
    };
  };

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
      
      const itemDescription = trimmedDescription || (contributionAmount === 0 ? 'no contributions' : 'miscellaneous');
      
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
      
      // Keep name in place, only clear amount, description, and reset shares
      setAmount('');
      setDescription('');
      setWeight('1'); // Reset shares back to 1
      setErrorMessage(''); // Clear any previous error messages
    }
  };

  const removePerson = (id) => {
    setPeople(people.filter(person => person.id !== id));
  };

  // Enter edit mode
  const enterEditMode = () => {
    // Cancel any active individual edits first
    cancelAllEdits();
    
    // Store original data for potential cancellation
    setOriginalDataBeforeEdit(JSON.parse(JSON.stringify(people)));
    
    // Initialize temp edit states for all items
    const tempStates = {};
    people.forEach(person => {
      tempStates[`person-${person.id}`] = {
        name: person.name,
        weight: person.weight || 1,
        isFixed: person.isFixed || false,
        fixedAmount: person.fixedAmount || '0'
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
  };

  // Confirm and save all changes in edit mode
  const confirmEditMode = () => {
    // Save all changes and clear temp states only if validation passes
    // saveAllTempEdits will show error message but not exit edit mode if validation fails
    saveAllTempEdits();
  };

  // Cancel edit mode and revert all changes
  const cancelEditMode = () => {
    if (originalDataBeforeEdit) {
      // Revert to original data
      setPeople(originalDataBeforeEdit);
    }
    
    // Clear temp states and exit edit mode
    setTempEditStates({});
    setIsEditMode(false);
    
    // Clear original data backup
    setOriginalDataBeforeEdit(null);
  };

  // Handle contributor name click to show modal
  const handleContributorClick = (contributorName) => {
    if (!isEditMode) { // Only show modal when not in edit mode
      setSelectedContributor(contributorName);
      setShowModal(true);
    }
  };

  // Close modal
  const closeModal = () => {
    setShowModal(false);
    setSelectedContributor(null);
    setTouchStart(null);
    setTouchEnd(null);
  };

  // Navigate to next/previous contributor in modal
  const navigateToContributor = (direction) => {
    if (!selectedContributor || people.length <= 1) return;
    
    const currentIndex = people.findIndex(person => person.name === selectedContributor);
    if (currentIndex === -1) return;
    
    let newIndex;
    if (direction === 'next') {
      // Right swipe goes to next person (below in list)
      newIndex = (currentIndex + 1) % people.length;
    } else {
      // Left swipe goes to previous person (above in list)  
      newIndex = (currentIndex - 1 + people.length) % people.length;
    }
    
    setSelectedContributor(people[newIndex].name);
  };

  // Touch event handlers for swipe detection
  const handleTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;
    
    if (isLeftSwipe) {
      // Left swipe - move carousel left, revealing person on the right
      navigateToContributor('next');
    }
    if (isRightSwipe) {
      // Right swipe - move carousel right, revealing person on the left
      navigateToContributor('prev');
    }
    
    setTouchStart(null);
    setTouchEnd(null);
  };

  // Toggle dark mode
  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  // Convert people data to JSON format
  const convertToJson = () => {
    const jsonFormat = people.map(person => ({
      name: person.name,
      use_share: !person.isFixed,
      by_amount: person.isFixed ? person.fixedAmount : "0",
      by_share: person.isFixed ? 1 : (person.weight || 1),
      items: person.items.map(item => ({
        description: item.description,
        value: item.amount
      }))
    }));
    return JSON.stringify(jsonFormat, null, 2);
  };

  // Convert JSON format back to people data
  const convertFromJson = (jsonString) => {
    try {
      const parsed = JSON.parse(jsonString);
      
      // Validate structure
      if (!Array.isArray(parsed)) {
        throw new Error('Data must be an array of contributors');
      }
      
      const convertedPeople = parsed.map((contributor, index) => {
        // Validate required fields
        if (!contributor.name || typeof contributor.name !== 'string' || !contributor.name.trim()) {
          throw new Error(`Contributor ${index + 1}: name is required and must be a non-empty string`);
        }
        
        // Validate use_share
        if (typeof contributor.use_share !== 'boolean') {
          throw new Error(`Contributor ${index + 1}: use_share must be a boolean (true/false)`);
        }

        // Validate by_amount
        if (typeof contributor.by_amount !== 'string' || !/^\d+(\.\d{0,2})?$/.test(contributor.by_amount)) {
          throw new Error(`Contributor ${index + 1}: by_amount must be a valid currency amount (e.g. "0" or "12.50")`);
        }

        // Validate by_share
        if (!contributor.by_share || typeof contributor.by_share !== 'number' || contributor.by_share < 1 || contributor.by_share > 10) {
          throw new Error(`Contributor ${index + 1}: by_share must be a number between 1 and 10`);
        }
        
        if (!Array.isArray(contributor.items) || contributor.items.length === 0) {
          throw new Error(`Contributor ${index + 1}: must have at least one item`);
        }
        
        // Validate items
        const convertedItems = contributor.items.map((item, itemIndex) => {
          if (!item.description || typeof item.description !== 'string' || !item.description.trim()) {
            throw new Error(`Contributor ${index + 1}, Item ${itemIndex + 1}: description is required and must be a non-empty string`);
          }
          
          if (typeof item.value !== 'number' || item.value < 0) {
            throw new Error(`Contributor ${index + 1}, Item ${itemIndex + 1}: value must be a non-negative number`);
          }
          
          return {
            id: Date.now() + Math.random(), // Generate unique ID
            description: item.description.trim(),
            amount: item.value
          };
        });
        
        return {
          id: Date.now() + Math.random(), // Generate unique ID
          name: contributor.name.trim(),
          isFixed: !contributor.use_share,
          fixedAmount: contributor.by_amount,
          weight: contributor.by_share,
          items: convertedItems
        };
      });
      
      // Check for duplicate names
      const names = convertedPeople.map(p => p.name.toLowerCase());
      const duplicateNames = names.filter((name, index) => names.indexOf(name) !== index);
      if (duplicateNames.length > 0) {
        throw new Error(`Duplicate contributor names found: ${duplicateNames.join(', ')}`);
      }
      
      return convertedPeople;
    } catch (error) {
      throw error;
    }
  };

  // Open JSON editor
  const openJsonEditor = () => {
    setJsonData(convertToJson());
    setJsonError('');
    setShowJsonEditor(true);
    setShowMenu(false);
  };

  // Close JSON editor
  const closeJsonEditor = () => {
    setShowJsonEditor(false);
    setJsonData('');
    setJsonError('');
  };

  // Save JSON data
  const saveJsonData = () => {
    try {
      const newPeople = convertFromJson(jsonData);
      setPeople(newPeople);
      closeJsonEditor();
    } catch (error) {
      setJsonError(error.message);
    }
  };

  // Export function

  const exportToJPG = async () => {
    if (!exportRef.current) return;
    
    // Check if there are no contributors
    if (people.length === 0) {
      setShowNoContributorsNotification(true);
      setShowMenu(false); // Close the menu
      
      // Auto-hide notification after 4 seconds
      setTimeout(() => {
        setShowNoContributorsNotification(false);
      }, 4000);
      
      return; // Don't proceed with export
    }

    // Check if in edit mode and show notification
    if (isEditMode || editingItem || editingPerson) {
      setShowExportNotification(true);
      setShowMenu(false); // Close the menu
      
      // Auto-hide notification after 4 seconds
      setTimeout(() => {
        setShowExportNotification(false);
      }, 4000);
      
      return; // Don't proceed with export
    }

    try {
      // Add capturing class to show export header
      exportRef.current.classList.add('capturing');
      
      // Set appropriate background color based on dark mode
      const backgroundColor = isDarkMode ? '#2d2d2d' : '#ffffff';
      
      const canvas = await html2canvas(exportRef.current, {
        backgroundColor: backgroundColor,
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
    <div className={`App ${people.length > 0 ? 'has-content' : ''} ${isDarkMode ? 'dark-mode' : ''}`}>
      <div className={`container ${people.length > 0 ? 'has-summary' : ''}`}>
        <header className="header">
          <div className="header-content">
            <div className="header-text">
              <h1>💰 Splitsies</h1>
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
                      toggleDarkMode();
                      setShowMenu(false);
                    }}
                    className="menu-item"
                  >
                    {isDarkMode ? '☀️ Light Mode' : '🌙 Dark Mode'}
                  </button>
                  <button 
                    onClick={openJsonEditor}
                    className="menu-item"
                  >
                    📝 Edit JSON
                  </button>
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

        {showExportNotification && (
          <div className="export-notification">
            <div className="notification-content">
              <span className="notification-icon">💾</span>
              <span className="notification-text">Please save your changes before exporting</span>
              <button 
                className="notification-close"
                onClick={() => setShowExportNotification(false)}
                aria-label="Close notification"
              >
                ×
              </button>
            </div>
          </div>
        )}

        {showNoContributorsNotification && (
          <div className="export-notification">
            <div className="notification-content">
              <span className="notification-icon">👥</span>
              <span className="notification-text">Please add at least one contributor to export</span>
              <button 
                className="notification-close"
                onClick={() => setShowNoContributorsNotification(false)}
                aria-label="Close notification"
              >
                ×
              </button>
            </div>
          </div>
        )}

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
                {fixedPeople.length > 0 && (
                  <>
                    <div className="stat">
                      <span className="stat-label">Fixed amounts ({fixedPeople.length})</span>
                      <span className="stat-value">${fixedTotal.toFixed(2)}</span>
                    </div>
                    <div className="stat">
                      <span className="stat-label">Remaining to split</span>
                      <span className="stat-value">${remainingTotal.toFixed(2)}</span>
                    </div>
                  </>
                )}
                <div className="stat">
                  <span className="stat-label">Per Share ({totalShares})</span>
                  <span className="stat-value">${costPerShare.toFixed(2)}</span>
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
                {fixedPeople.length > 0 && (
                  <>
                    <div className="export-stat">
                      <strong>Fixed amounts ({fixedPeople.length}): ${fixedTotal.toFixed(2)}</strong>
                    </div>
                    <div className="export-stat">
                      <strong>Remaining to split: ${remainingTotal.toFixed(2)}</strong>
                    </div>
                  </>
                )}
                <div className="export-stat">
                  <strong>Per Share ({totalShares}): ${costPerShare.toFixed(2)}</strong>
                </div>
              </div>
            </div>
          )}

        {people.length > 0 && (
          <div className="people-list">
            <div className="contributors-header">
              <h3>Contributors</h3>
{isEditMode ? (
                // Edit mode: Show Done and Cancel buttons
                <div className="edit-mode-buttons">
                  <button 
                    onClick={confirmEditMode}
                    className="master-edit-button confirm-button"
                    aria-label="Confirm all changes"
                  >
                    ✓ Done
                  </button>
                  <button 
                    onClick={cancelEditMode}
                    className="master-edit-button cancel-button"
                    aria-label="Cancel all changes and revert"
                  >
                    ✗ Cancel
                  </button>
                </div>
              ) : (
                // Normal mode: Show Edit button
                <button 
                  onClick={enterEditMode}
                  className="master-edit-button"
                  aria-label="Edit contributors"
                >
                  ✎ Edit
                </button>
              )}
            </div>
            {people.map(person => {
              const personTotal = person.items.reduce((sum, item) => sum + item.amount, 0);
              return (
                <div 
                  key={person.id} 
                  className={`person-section ${!isEditMode ? 'clickable' : ''}`}
                  onClick={!isEditMode ? () => handleContributorClick(person.name) : undefined}
                  title={!isEditMode ? `Click to view detailed transaction breakdown for ${person.name}` : undefined}
                  aria-label={!isEditMode ? `View transaction details for ${person.name}` : undefined}
                  role={!isEditMode ? "button" : undefined}
                  tabIndex={!isEditMode ? 0 : undefined}
                  onKeyDown={!isEditMode ? (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleContributorClick(person.name);
                    }
                  } : undefined}
                >
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
                          <div className="fixed-toggle">
                            <button
                              type="button"
                              className={`split-mode-button ${
                                (isEditMode ? (tempEditStates[`person-${person.id}`]?.isFixed ?? false) : editPersonFixed)
                                  ? 'by-amount'
                                  : 'by-shares'
                              }`}
                              onClick={(e) => {
                                if (isEditMode) {
                                  const currentFixed = tempEditStates[`person-${person.id}`]?.isFixed ?? false;
                                  updateTempEditState(`person-${person.id}`, { isFixed: !currentFixed });
                                } else {
                                  setEditPersonFixed(!editPersonFixed);
                                }
                              }}
                            >
                              <span className="split-mode-text">
                                <span className="desktop-only">
                                  {(isEditMode ? (tempEditStates[`person-${person.id}`]?.isFixed ?? false) : editPersonFixed)
                                    ? 'By Amount'
                                    : 'By Shares'
                                  }
                                </span>
                                <span className="mobile-only">
                                  {(isEditMode ? (tempEditStates[`person-${person.id}`]?.isFixed ?? false) : editPersonFixed)
                                    ? '$'
                                    : '÷'
                                  }
                                </span>
                              </span>
                            </button>
                        </div>
                        {(isEditMode ? (tempEditStates[`person-${person.id}`]?.isFixed ?? false) : editPersonFixed) ? (
                          <div className="amount-input-group">
                            <input
                              type="text"
                              inputMode="decimal"
                              placeholder="0.00"
                              value={isEditMode ? (tempEditStates[`person-${person.id}`]?.by_amount ?? '0') : '0'}
                              onChange={(e) => {
                                const value = e.target.value;
                                if (value === '' || /^\d*\.?\d{0,2}$/.test(value)) {
                                  if (isEditMode) {
                                    updateTempEditState(`person-${person.id}`, { by_amount: value });
                                  } else {
                                    setEditPersonFixed(value);
                                  }
                                }
                              }}
                              className="fixed-amount-input"
                            />
                          </div>
                        ) : (
                          <div>
                            {(isEditMode ? (tempEditStates[`person-${person.id}`]?.isFixed ?? false) : editPersonFixed) ? (
                              <div className="amount-input-group">
                                <input
                                  type="text"
                                  inputMode="decimal"
                                  placeholder="0.00"
                                  value={isEditMode ? (tempEditStates[`person-${person.id}`]?.by_amount ?? '0') : '0'}
                                  onChange={(e) => {
                                    const value = e.target.value;
                                    if (value === '' || /^\d*\.?\d{0,2}$/.test(value)) {
                                      if (isEditMode) {
                                        updateTempEditState(`person-${person.id}`, { by_amount: value });
                                      } else {
                                        setEditPersonFixed(value);
                                      }
                                    }
                                  }}
                                  className="fixed-amount-input"
                                />
                              </div>
                            ) : (
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
                            )}
                          </div>
                        )}
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
                          {person.isFixed ? (
                            <span className="person-fixed-amount"> ($)</span>
                          ) : (
                            <span className="person-weight"> (×{person.weight || 1})</span>
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
                  <div className="split-info">
                    <span className="split-from">
                      {split.from}
                      {split.fromFixed ? (
                        <span className="person-fixed-amount"> ($)</span>
                      ) : (
                        <span className="person-weight"> (×{split.fromWeight || 1})</span>
                      )}
                    </span>
                    <span className="split-arrow"> → </span>
                    <span className="split-to">
                      {split.to}
                      {split.toFixed ? (
                        <span className="person-fixed-amount"> ($)</span>
                      ) : (
                        <span className="person-weight"> (×{split.toWeight || 1})</span>
                      )}
                    </span>
                  </div>
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
          v1.6.0
        </div>

        {/* JSON Editor Modal */}
        {showJsonEditor && (
          <div className="modal-overlay">
            <div className="json-editor-modal" ref={modalRef}>
              <div className="modal-header">
                <h3>📝 Edit JSON Data</h3>
                <button 
                  className="modal-close"
                  onClick={closeJsonEditor}
                  aria-label="Close modal"
                >
                  ×
                </button>
              </div>
              <div className="modal-body">
                <div className="json-editor-content">
                  <div className="json-schema-info">
                    <h4>JSON Schema:</h4>
                    <p>Each contributor should have: <code>name</code> (string), <code>use_share</code> (boolean), <code>by_amount</code> (string "0" or currency amount), <code>by_share</code> (number 1-10), and <code>items</code> (array).</p>
                    <p>Each item should have: <code>description</code> (string) and <code>value</code> (number).</p>
                  </div>
                  
                  <textarea
                    className="json-textarea"
                    value={jsonData}
                    onChange={(e) => setJsonData(e.target.value)}
                    placeholder="Enter JSON data here..."
                    rows={20}
                  />
                  
                  {jsonError && (
                    <div className="json-error">
                      <strong>Validation Error:</strong> {jsonError}
                    </div>
                  )}
                  
                  <div className="json-actions">
                    <button 
                      className="json-copy-button"
                      onClick={() => {
                        navigator.clipboard.writeText(jsonData);
                        // Could add a toast notification here
                      }}
                    >
                      📋 Copy to Clipboard
                    </button>
                    <div className="json-save-cancel">
                      <button 
                        className="json-cancel-button"
                        onClick={closeJsonEditor}
                      >
                        Cancel
                      </button>
                      <button 
                        className="json-save-button"
                        onClick={saveJsonData}
                      >
                        Save Changes
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Contributor Details Modal */}
        {showModal && selectedContributor && (
          <div className="modal-overlay">
            <div 
              className="modal-content" 
              ref={modalRef}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              <div className="modal-header">
                <div className="modal-title-section">
                  <h3>{selectedContributor} - Transaction Details</h3>
                </div>
                <button 
                  className="modal-close"
                  onClick={closeModal}
                  aria-label="Close modal"
                >
                  ×
                </button>
              </div>
              {people.length > 1 && (() => {
                const currentIndex = people.findIndex(p => p.name === selectedContributor);
                const prevIndex = (currentIndex - 1 + people.length) % people.length;
                const nextIndex = (currentIndex + 1) % people.length;
                const prevName = people[prevIndex]?.name;
                const nextName = people[nextIndex]?.name;
                
                return (
                  <div className="swipe-indicator">
                    <div 
                      className="swipe-prev clickable-nav"
                      onClick={() => navigateToContributor('prev')}
                      title={`Go to ${prevName}`}
                    >
                      ← {prevName}
                    </div>
                    <div className="contributor-counter">
                      {currentIndex + 1} of {people.length}
                    </div>
                    <div 
                      className="swipe-next clickable-nav"
                      onClick={() => navigateToContributor('next')}
                      title={`Go to ${nextName}`}
                    >
                      {nextName} →
                    </div>
                  </div>
                );
              })()}
              <div className="modal-body">
                {(() => {
                  const details = getContributorDetails(selectedContributor);
                  if (!details) return <p>No details available</p>;

                  return (
                    <div className="contributor-details">
                      {/* Contribution Summary */}
                      <div className="detail-section">
                        <h4>Contributions</h4>
                        <div className="contribution-list">
                          {details.items.map((item, index) => (
                            <div key={index} className="contribution-item">
                              <span className="contribution-description">{item.description}</span>
                              <span className="contribution-amount">${item.amount.toFixed(2)}</span>
                            </div>
                          ))}
                        </div>
                        <div className="contribution-total">
                          <strong>Total Contributed: ${details.totalContributed.toFixed(2)}</strong>
                        </div>
                      </div>

                      {/* Payments to Make */}
                      {details.paymentsToMake.length > 0 && (
                        <div className="detail-section">
                          <h4>Money to Pay</h4>
                          <div className="payment-list">
                            {details.paymentsToMake.map((payment, index) => (
                              <div key={index} className="payment-item">
                                <span className="payment-to">{payment.to}</span>
                                <span className="payment-arrow">←</span>
                                <span className="payment-amount">${payment.amount.toFixed(2)}</span>
                              </div>
                            ))}
                          </div>
                          <div className="payment-total">
                            <strong>Total Paying: ${details.totalPaying.toFixed(2)}</strong>
                          </div>
                        </div>
                      )}

                      {/* Payments to Receive */}
                      {details.paymentsToReceive.length > 0 && (
                        <div className="detail-section">
                          <h4>Money to Receive</h4>
                          <div className="payment-list">
                            {details.paymentsToReceive.map((payment, index) => (
                              <div key={index} className="payment-item">
                                <span className="payment-from">
                                  {payment.from}
                                  {payment.fromFixed ? (
                                    <span className="person-fixed-amount"> ($)</span>
                                  ) : (
                                    <span className="person-weight"> (×{payment.fromWeight || 1})</span>
                                  )}
                                </span>
                                <span className="payment-arrow">→</span>
                                <span className="payment-amount">${payment.amount.toFixed(2)}</span>
                              </div>
                            ))}
                          </div>
                          <div className="payment-total">
                            <strong>Total Receiving: ${details.totalReceiving.toFixed(2)}</strong>
                          </div>
                        </div>
                      )}

                      {/* Balance Information */}
                      <div className="detail-section">
                        <h4>Balance Summary</h4>
                        <div className="share-info">
                          <p>Total contributed: ${details.totalContributed.toFixed(2)}</p>
                          {details.totalPaying > 0 && (
                            <p>Total paying: +${details.totalPaying.toFixed(2)}</p>
                          )}
                          {details.totalReceiving > 0 && (
                            <p>Total receiving: -${details.totalReceiving.toFixed(2)}</p>
                          )}
                          <hr className="share-divider" />
                          <p><strong>Total cost: ${details.owedAmount.toFixed(2)}</strong></p>
                        </div>
                      </div>

                      {/* Share Information */}
                      <div className="detail-section">
                        <h4>Share Details</h4>
                        <div className="share-info">
                          <p>Cost per share: ${costPerShare.toFixed(2)}</p>
                          <p>Share multiplier: ×{details.weight}</p>
                          <hr className="share-divider" />
                          <p><strong>Total cost: ${details.owedAmount.toFixed(2)}</strong></p>
                        </div>
                      </div>


                    </div>
                  );
                })()}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
