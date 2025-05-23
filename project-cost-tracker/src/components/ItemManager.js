import React, { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setItems, addItem, deleteItem } from '../store/itemsSlice';
import { collection, addDoc, deleteDoc, doc, updateDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import styled from 'styled-components';
import debounce from 'lodash.debounce';
import Select from 'react-select';
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

const ManagerContainer = styled.div`
  max-width: 900px;
  margin: 40px auto;
  padding: 40px 45px 50px 45px;
  background: linear-gradient(135deg, #fdf6e3, #e6ccb2, #b87f3f);
  border-radius: 16px;
  box-shadow:
    0 8px 20px rgba(184, 127, 63, 0.5),
    inset 0 0 20px #fff8e7;
  font-family: 'Palatino Linotype', 'Georgia', serif;
  color: #4a2c0a;
  user-select: none;
  transition: background 0.3s ease;
`;

const Input = styled.input`
  margin: 12px 0 14px 0;
  padding: 14px 16px;
  border-radius: 12px;
  border: 2px solid #c2a07b;
  font-size: 17px;
  font-weight: 500;
  background: #fff7e6;
  box-shadow: inset 2px 2px 8px #d9c1a0;
  outline: none;
  transition: all 0.25s ease;

  &:focus {
    border-color: #8c5a20;
    background: #fff9f0;
    box-shadow: 0 0 8px #c7a469;
  }
`;

const Button = styled.button`
  background-color: #9e6d26;
  color: #fff8e2;
  border: none;
  padding: 13px 22px;
  margin: 14px 8px 12px 0;
  border-radius: 14px;
  font-family: 'Georgia', serif;
  font-weight: 600;
  font-size: 16px;
  cursor: pointer;
  box-shadow:
    0 4px 10px rgba(158, 109, 38, 0.7);
  transition: all 0.25s ease;

  &:hover {
    background-color: #b37e32;
    box-shadow:
      0 6px 15px rgba(179, 126, 50, 0.85);
    transform: translateY(-2px);
  }

  &:active {
    transform: translateY(0);
    box-shadow: 0 3px 8px rgba(150, 90, 20, 0.6);
  }
`;

const ItemList = styled.ul`
  list-style: none;
  padding: 0;
  margin-top: 28px;
`;

const Item = styled.li`
  background-color: #fef7e1;
  border-left: 6px solid #b87f3f;
  padding: 18px 24px;
  margin-bottom: 14px;
  border-radius: 14px;
  box-shadow:
    2px 4px 12px rgba(184, 127, 63, 0.18);
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 17px;
  color: #5a3e10;
  letter-spacing: 0.04em;

  & > div:first-child {
    flex: 1 1 70%;
    line-height: 1.3;
  }

  small {
    font-size: 13px;
    color: #88672f;
    display: block;
    margin-top: 4px;
    font-style: italic;
  }
`;

const TotalCost = styled.h3`
  text-align: right;
  font-weight: 700;
  margin-top: 30px;
  color: #7a4f09;
  font-size: 22px;
  letter-spacing: 0.05em;
  font-family: 'Palatino Linotype', serif;
  user-select: text;
`;

const SearchBar = styled(Input)`
  border-style: dashed;
  background-color: #fff8d4;
  font-weight: 700;
  letter-spacing: 0.04em;
  color: #815c18;
`;

const SelectWrapper = styled.div`
  margin: 16px 0 20px 0;
  font-family: 'Georgia', serif;
  font-weight: 600;
`;

const ChartWrapper = styled.div`
  width: 90%;
  height: 380px;
  margin-top: 48px;
  margin-right:180px;
  background: #fff6df;
  border-radius: 18px;
  padding: 28px 28px 36px 28px;
  box-shadow:
    inset 2px 3px 12px #f0e3c8,
    2px 6px 18px rgba(184, 127, 63, 0.4);
`;

const categories = [
  { value: '', label: 'All Project Types' },
  { value: 'web_dev', label: 'Web Development' },
  { value: 'mobile_app', label: 'Mobile Application' },
  { value: 'data_science', label: 'Data Science' },
  { value: 'embedded_systems', label: 'Embedded Systems' },
  { value: 'ai_ml', label: 'AI / Machine Learning' },
  { value: 'cloud_infra', label: 'Cloud Infrastructure' },
  { value: 'blockchain', label: 'Blockchain' },
  { value: 'game_dev', label: 'Game Development' },
  { value: 'others', label: 'Others' },
];


const tagOptions = [
  { value: 'high_priority', label: 'High Priority' },
  { value: 'client_project', label: 'Client Project' },
  { value: 'personal', label: 'Personal' },
  { value: 'research', label: 'Research' },
  { value: 'collaboration', label: 'Collaboration' },
  { value: 'prototype', label: 'Prototype' },
];


const COLORS = ['#FFBB28', '#FF8042', '#0088FE', '#00C49F', '#AA336A', '#3399AA'];



const ItemManager = () => {
  const [newItem, setNewItem] = useState({ name: '', cost: '', category: '', tags: [] });
  const [editMode, setEditMode] = useState(null);
  const [rawSearch, setRawSearch] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterTags, setFilterTags] = useState([]);

  const items = useSelector(state => state.items.list);
  const totalCost = useSelector(state => state.items.totalCost);
  const dispatch = useDispatch();

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'items'), snapshot => {
      const itemsData = snapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id,
        timestamp: doc.data().timestamp?.toDate?.() || new Date()
      }));
      dispatch(setItems(itemsData));
    });
    return () => unsub();
  }, [dispatch]);

  const handleAddOrUpdateItem = async () => {
    const cost = Number(newItem.cost);
    if (!newItem.name.trim() || isNaN(cost) || cost < 0) {
      alert('Please enter valid name and positive cost');
      return;
    }

    const itemPayload = {
      name: newItem.name.trim(),
      cost,
      category: newItem.category,
      tags: newItem.tags,
      timestamp: new Date(),
    };

    try {
      if (editMode) {
        const itemRef = doc(db, 'items', editMode);
        await updateDoc(itemRef, itemPayload);
        setEditMode(null);
      } else {
        const docRef = await addDoc(collection(db, 'items'), itemPayload);
        dispatch(addItem({ ...itemPayload, id: docRef.id }));
      }
      setNewItem({ name: '', cost: '', category: '', tags: [] });
    } catch (err) {
      console.error('Error adding/updating item:', err);
    }
  };

  const handleDeleteItem = async (id) => {
    try {
      await deleteDoc(doc(db, 'items', id));
      dispatch(deleteItem(id));
      if (editMode === id) {
        setEditMode(null);
        setNewItem({ name: '', cost: '', category: '', tags: [] });
      }
    } catch (err) {
      console.error('Error deleting item:', err);
    }
  };

  const handleEditItem = (item) => {
    setNewItem({
      name: item.name,
      cost: item.cost.toString(),
      category: item.category || '',
      tags: item.tags || [],
    });
    setEditMode(item.id);
  };

  const debouncedSearch = useMemo(() => debounce(q => setSearchQuery(q), 300), []);
  useEffect(() => {
    debouncedSearch(rawSearch);
    return () => debouncedSearch.cancel();
  }, [rawSearch]);

  const filteredItems = useMemo(() => {
    return items
      .filter(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()))
      .filter(item => (filterCategory ? item.category === filterCategory : true))
      .filter(item => {
        if (!filterTags.length) return true;
        return filterTags.every(tag => item.tags?.includes(tag));
      })
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [items, searchQuery, filterCategory, filterTags]);

  // Prepare data for pie chart by summing costs per category
  const pieData = useMemo(() => {
    const dataMap = {};
    filteredItems.forEach(({ category, cost }) => {
      const cat = category || 'Uncategorized';
      dataMap[cat] = (dataMap[cat] || 0) + cost;
    });
    return Object.entries(dataMap).map(([name, value]) => ({ name, value }));
  }, [filteredItems]);

  return (
    <ManagerContainer>
      <SearchBar
        type="text"
        value={rawSearch}
        onChange={e => setRawSearch(e.target.value)}
        placeholder="Search Items"
      />

      {/* Filter by Category */}
      <SelectWrapper>
        <Select
          options={categories}
          value={categories.find(c => c.value === filterCategory)}
          onChange={selected => setFilterCategory(selected?.value || '')}
          isClearable={false}
        />
      </SelectWrapper>

      {/* Filter by Tags */}
      <SelectWrapper>
        <Select
          options={tagOptions}
          isMulti
          value={tagOptions.filter(t => filterTags.includes(t.value))}
          onChange={selected => setFilterTags(selected ? selected.map(s => s.value) : [])}
          placeholder="Filter by tags..."
        />
      </SelectWrapper>

      {/* Add/Edit form */}
      <Input
        type="text"
        value={newItem.name}
        onChange={e => setNewItem({ ...newItem, name: e.target.value })}
        placeholder="Project Name"
      />
      <Input
        type="number"
        min="0"
        value={newItem.cost}
        onChange={e => setNewItem({ ...newItem, cost: e.target.value })}
        placeholder="Cost"
      />

      <SelectWrapper>
        <Select
          options={categories.filter(c => c.value)} // no "All Categories" in input
          value={categories.find(c => c.value === newItem.category)}
          onChange={selected => setNewItem({ ...newItem, category: selected?.value || '' })}
          placeholder="Select Category"
          isClearable
        />
      </SelectWrapper>

      <SelectWrapper>
        <Select
          options={tagOptions}
          isMulti
          value={tagOptions.filter(t => newItem.tags.includes(t.value))}
          onChange={selected => setNewItem({ ...newItem, tags: selected ? selected.map(s => s.value) : [] })}
          placeholder="Select Tags"
        />
      </SelectWrapper>

      <Button onClick={handleAddOrUpdateItem}>
        {editMode ? 'Update Item' : 'Add Item'}
      </Button>

      <ItemList>
        {filteredItems.map(item => (
          <Item key={item.id}>
            <div>
              <strong>{item.name}</strong> - ₹{item.cost} <br />
              <small>Category: {item.category || 'N/A'}</small>
              <small>Tags: {item.tags?.join(', ') || 'None'}</small>
              <small>Last updated: {new Date(item.timestamp).toLocaleString('en-IN')}</small>
            </div>
            <div>
              <Button onClick={() => handleEditItem(item)}>Edit</Button>
              <Button onClick={() => handleDeleteItem(item.id)}>Delete</Button>
            </div>
          </Item>
        ))}
      </ItemList>

      <TotalCost>Total Cost: ₹{totalCost}</TotalCost>

      {/* Chart */}
      <ChartWrapper>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={pieData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={100}
              label
            >
              {pieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value) => `₹${value}`} />
            <Legend verticalAlign="bottom" height={36} />
          </PieChart>
        </ResponsiveContainer>
      </ChartWrapper>
    </ManagerContainer>
  );
};

export default ItemManager;
