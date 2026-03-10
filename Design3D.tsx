import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Calculator, IndianRupee, PieChart, TrendingUp, Building, Package, Users } from 'lucide-react';
import { BudgetItem } from '../types';

export default function BudgetPlanner() {
  const [totalBudget, setTotalBudget] = useState(5000000);
  const [items, setItems] = useState<BudgetItem[]>([
    { id: '1', name: 'Cement & Concrete', amount: 1200000, category: 'material' },
    { id: '2', name: 'Steel Reinforcement', amount: 800000, category: 'material' },
    { id: '3', name: 'Labor Costs', amount: 1500000, category: 'labor' },
    { id: '4', name: 'Interior & Finishing', amount: 1000000, category: 'other' },
  ]);

  const [newItem, setNewItem] = useState({ name: '', amount: '', category: 'material' as BudgetItem['category'] });
  const [isEditingBudget, setIsEditingBudget] = useState(false);
  const [tempBudget, setTempBudget] = useState(totalBudget.toString());

  const totalSpent = items.reduce((acc, item) => acc + item.amount, 0);
  const remaining = totalBudget - totalSpent;

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.name || !newItem.amount) return;
    
    const item: BudgetItem = {
      id: Math.random().toString(36).substr(2, 9),
      name: newItem.name,
      amount: parseFloat(newItem.amount),
      category: newItem.category
    };
    
    setItems([...items, item]);
    setNewItem({ name: '', amount: '', category: 'material' });
  };

  const handleUpdateBudget = () => {
    const val = parseFloat(tempBudget);
    if (!isNaN(val)) {
      setTotalBudget(val);
      setIsEditingBudget(false);
    }
  };

  const deleteItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  return (
    <div className="space-y-12">
      <header className="flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="space-y-2">
          <h1 className="text-4xl font-extrabold text-[#5D4037]">Budget & Resource Planning</h1>
          <p className="text-[#8B4513] opacity-80">Track your construction expenses and optimize resource allocation.</p>
        </div>
        <div className="bg-white/90 backdrop-blur-md p-6 rounded-3xl shadow-2xl border border-[#D2B48C] flex items-center gap-6">
          <div className="p-4 bg-[#F5DEB3] rounded-2xl text-[#8B4513]">
            <IndianRupee size={32} />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold uppercase tracking-wider text-[#8B4513] opacity-60">Total Budget</span>
            {isEditingBudget ? (
              <div className="flex items-center gap-2 mt-1">
                <input 
                  type="number" 
                  value={tempBudget}
                  onChange={(e) => setTempBudget(e.target.value)}
                  className="w-32 bg-[#FFF8DC] border border-[#D2B48C] rounded-lg px-2 py-1 text-xl font-bold text-[#5D4037] focus:outline-none focus:ring-2 focus:ring-[#8B4513]"
                />
                <button 
                  onClick={handleUpdateBudget}
                  className="bg-[#8B4513] text-white p-1 rounded-lg hover:bg-[#5D4037] transition-colors"
                >
                  Save
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <div className="text-3xl font-black text-[#5D4037]">₹{totalBudget.toLocaleString()}</div>
                <button 
                  onClick={() => setIsEditingBudget(true)}
                  className="text-xs font-bold text-[#8B4513] hover:underline"
                >
                  Edit
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Budget Breakdown */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white/90 backdrop-blur-md rounded-3xl p-8 shadow-2xl border border-[#D2B48C]">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-bold text-[#5D4037] flex items-center gap-2">
                <PieChart className="text-[#8B4513]" /> Expense Breakdown
              </h2>
              <div className="text-right">
                <div className="text-sm font-bold text-[#8B4513] opacity-60">REMAINING</div>
                <div className={`text-xl font-black ${remaining < 0 ? 'text-red-600' : 'text-green-600'}`}>
                  ₹{remaining.toLocaleString()}
                </div>
              </div>
            </div>

            <form onSubmit={handleAddItem} className="mb-10 grid grid-cols-1 md:grid-cols-4 gap-4 p-6 bg-[#FFF8DC] rounded-2xl border border-[#D2B48C]">
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#8B4513] uppercase">Item Name</label>
                <input 
                  type="text"
                  placeholder="e.g. Bricks"
                  value={newItem.name}
                  onChange={(e) => setNewItem({...newItem, name: e.target.value})}
                  className="w-full bg-white border border-[#D2B48C] rounded-xl px-4 py-2 text-[#5D4037] focus:outline-none focus:ring-2 focus:ring-[#8B4513]"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#8B4513] uppercase">Amount (₹)</label>
                <input 
                  type="number"
                  placeholder="0"
                  value={newItem.amount}
                  onChange={(e) => setNewItem({...newItem, amount: e.target.value})}
                  className="w-full bg-white border border-[#D2B48C] rounded-xl px-4 py-2 text-[#5D4037] focus:outline-none focus:ring-2 focus:ring-[#8B4513]"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#8B4513] uppercase">Category</label>
                <select 
                  value={newItem.category}
                  onChange={(e) => setNewItem({...newItem, category: e.target.value as BudgetItem['category']})}
                  className="w-full bg-white border border-[#D2B48C] rounded-xl px-4 py-2 text-[#5D4037] focus:outline-none focus:ring-2 focus:ring-[#8B4513]"
                >
                  <option value="material">Material</option>
                  <option value="labor">Labor</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="flex items-end">
                <button 
                  type="submit"
                  className="w-full bg-[#8B4513] text-white font-bold py-2 rounded-xl hover:bg-[#5D4037] transition-all shadow-lg"
                >
                  Add Expense
                </button>
              </div>
            </form>

            <div className="space-y-6">
              {items.map((item) => (
                <div key={item.id} className="space-y-2 group">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-[#5D4037]">{item.name}</span>
                      <button 
                        onClick={() => deleteItem(item.id)}
                        className="text-red-500 opacity-0 group-hover:opacity-100 transition-opacity text-xs font-bold"
                      >
                        Remove
                      </button>
                    </div>
                    <span className="font-bold text-[#8B4513]">₹{item.amount.toLocaleString()}</span>
                  </div>
                  <div className="w-full h-4 bg-[#FFF8DC] rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(100, (item.amount / totalBudget) * 100)}%` }}
                      className={`h-full rounded-full shadow-inner ${remaining < 0 ? 'bg-red-500' : 'bg-[#8B4513]'}`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-[#8B4513] text-white p-8 rounded-3xl shadow-2xl space-y-4">
              <div className="flex items-center gap-3">
                <TrendingUp size={24} />
                <h3 className="text-xl font-bold">Optimization Tips</h3>
              </div>
              <p className="opacity-80 leading-relaxed">
                Based on current market rates in India, you can save up to 15% on steel by sourcing from local distributors in bulk.
              </p>
              <button className="w-full bg-white/20 hover:bg-white/30 p-3 rounded-xl font-bold transition-all">
                View Detailed Report
              </button>
            </div>
            <div className="bg-[#D2691E] text-white p-8 rounded-3xl shadow-2xl space-y-4">
              <div className="flex items-center gap-3">
                <Building size={24} />
                <h3 className="text-xl font-bold">Best Companies</h3>
              </div>
              <p className="opacity-80 leading-relaxed">
                Top rated construction firms within your budget: L&T Construction, Tata Projects, and Shapoorji Pallonji.
              </p>
              <button className="w-full bg-white/20 hover:bg-white/30 p-3 rounded-xl font-bold transition-all">
                Get Quotes
              </button>
            </div>
          </div>
        </div>

        {/* Resource Suggestions */}
        <div className="space-y-8">
          <div className="bg-white/90 backdrop-blur-md rounded-3xl p-8 shadow-2xl border border-[#D2B48C] space-y-6">
            <h2 className="text-2xl font-bold text-[#5D4037] flex items-center gap-2">
              <Package className="text-[#8B4513]" /> Raw Materials
            </h2>
            <div className="space-y-4">
              <MaterialCard name="Birla Shakti Cement" price="₹450/bag" rating={4.8} />
              <MaterialCard name="JSW Neosteel" price="₹65,000/ton" rating={4.9} />
              <MaterialCard name="Asian Paints Ultima" price="₹8,500/20L" rating={4.7} />
            </div>
          </div>

          <div className="bg-white/90 backdrop-blur-md rounded-3xl p-8 shadow-2xl border border-[#D2B48C] space-y-6">
            <h2 className="text-2xl font-bold text-[#5D4037] flex items-center gap-2">
              <Users className="text-[#8B4513]" /> Expert Architects
            </h2>
            <div className="space-y-4">
              <ExpertCard name="Ar. Rajesh Kumar" specialty="Vastu Specialist" rating={4.9} />
              <ExpertCard name="Ar. Priya Sharma" specialty="Modern Sustainable" rating={4.8} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MaterialCard({ name, price, rating }: { name: string, price: string, rating: number }) {
  return (
    <div className="p-4 bg-[#FFF8DC] rounded-2xl border border-[#D2B48C] hover:shadow-lg transition-all cursor-pointer">
      <div className="font-bold text-[#5D4037]">{name}</div>
      <div className="flex justify-between items-center mt-1">
        <span className="text-sm text-[#8B4513] font-bold">{price}</span>
        <span className="text-xs bg-[#8B4513] text-white px-2 py-1 rounded-lg">★ {rating}</span>
      </div>
    </div>
  );
}

function ExpertCard({ name, specialty, rating }: { name: string, specialty: string, rating: number }) {
  return (
    <div className="p-4 bg-[#F5DEB3] rounded-2xl border border-[#D2B48C] hover:shadow-lg transition-all cursor-pointer flex items-center gap-4">
      <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-[#8B4513] font-bold">
        {name[4]}
      </div>
      <div className="flex-1">
        <div className="font-bold text-[#5D4037]">{name}</div>
        <div className="text-xs text-[#8B4513]">{specialty}</div>
      </div>
      <span className="text-xs font-bold text-[#8B4513]">★ {rating}</span>
    </div>
  );
}
