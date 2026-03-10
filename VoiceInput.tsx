import React from 'react';
import { motion } from 'motion/react';
import { Home, Building2, Building, Factory, Hospital, School, Briefcase, Sparkles } from 'lucide-react';
import { PlanCategory } from '../types';

const categories: PlanCategory[] = [
  { id: '1', name: 'Independent House', description: 'Traditional and modern Indian home designs.', image: 'https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&q=80&w=800' },
  { id: '2', name: 'Apartment Complex', description: 'Multi-story residential planning with modern amenities.', image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&q=80&w=800' },
  { id: '3', name: 'Shopping Mall', description: 'Large scale commercial and retail space design.', image: 'https://images.unsplash.com/photo-1519567241046-7f570eee3ce6?auto=format&fit=crop&q=80&w=800' },
  { id: '4', name: 'Industrial Building', description: 'Functional and efficient factory and warehouse layouts.', image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=800' },
  { id: '5', name: 'Hospital', description: 'Specialized healthcare facility planning and design.', image: 'https://images.unsplash.com/photo-1586773860418-d3b9a8ec81c2?auto=format&fit=crop&q=80&w=800' },
  { id: '6', name: 'School', description: 'Educational environments designed for learning and growth.', image: 'https://images.unsplash.com/photo-1523050335392-9affa74744ad?auto=format&fit=crop&q=80&w=800' },
  { id: '7', name: 'Corporate Office', description: 'Modern workspace planning for productivity and collaboration.', image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=800' },
];

export default function HomeDashboard() {
  return (
    <div className="space-y-12">
      <header className="text-center space-y-4">
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-5xl font-extrabold text-[#5D4037] tracking-tight"
        >
          Explore 3D Construction Plans
        </motion.h1>
        <p className="text-xl text-[#8B4513] max-w-2xl mx-auto opacity-80">
          Select a category to start planning your dream project with AI-powered insights and Indian architectural wisdom.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {categories.map((category, index) => (
          <motion.div
            key={category.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ y: -10 }}
            className="bg-white/90 backdrop-blur-sm rounded-3xl overflow-hidden shadow-2xl border border-[#D2B48C] group cursor-pointer"
          >
            <div className="h-48 overflow-hidden relative">
              <img 
                src={category.image} 
                alt={category.name} 
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
                <span className="text-white font-bold text-lg">View 3D Model</span>
              </div>
            </div>
            <div className="p-6 space-y-2">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[#F5DEB3] rounded-lg text-[#8B4513]">
                  {getIcon(category.name)}
                </div>
                <h3 className="text-2xl font-bold text-[#5D4037]">{category.name}</h3>
              </div>
              <p className="text-[#8B4513] opacity-80 leading-relaxed">
                {category.description}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Vastu Tips Section */}
      <section className="bg-[#8B4513] text-white p-12 rounded-[3rem] shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl" />
        <div className="relative z-10 space-y-8">
          <div className="flex items-center gap-4">
            <Sparkles className="text-[#FFD700]" size={32} />
            <h2 className="text-4xl font-black">Vastu Shastra Insights</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <VastuTip 
              title="Entrance Direction" 
              tip="The main entrance should ideally face North, East, or North-East to invite positive energy (Prana) into the home."
            />
            <VastuTip 
              title="Kitchen Placement" 
              tip="The South-East corner is the best place for the kitchen, as it is the direction of Agni (Fire)."
            />
            <VastuTip 
              title="Master Bedroom" 
              tip="The South-West corner is ideal for the master bedroom to ensure stability and prosperity for the head of the family."
            />
          </div>
        </div>
      </section>
    </div>
  );
}

function VastuTip({ title, tip }: { title: string, tip: string }) {
  return (
    <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/20 space-y-2">
      <h4 className="text-xl font-bold text-[#FFD700]">{title}</h4>
      <p className="text-sm opacity-80 leading-relaxed">{tip}</p>
    </div>
  );
}

function getIcon(name: string) {
  switch (name) {
    case 'Independent House': return <Home size={24} />;
    case 'Apartment Complex': return <Building2 size={24} />;
    case 'Shopping Mall': return <Building size={24} />;
    case 'Industrial Building': return <Factory size={24} />;
    case 'Hospital': return <Hospital size={24} />;
    case 'School': return <School size={24} />;
    case 'Corporate Office': return <Briefcase size={24} />;
    default: return <Home size={24} />;
  }
}
