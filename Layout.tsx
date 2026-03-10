import React, { useState, useRef, useEffect, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { 
  OrbitControls, 
  Grid, 
  TransformControls, 
  PerspectiveCamera, 
  ContactShadows,
  Environment,
  Html,
  Text as Text3D,
  Line as Line3D,
  Box as Box3D,
  Circle as Circle3D,
  Plane as Plane3D
} from '@react-three/drei';
import * as THREE from 'three';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Square, 
  Circle as CircleIcon, 
  Type, 
  Eraser, 
  Download, 
  Play, 
  Palette, 
  Layout, 
  Sparkles, 
  MousePointer2, 
  Trash2, 
  DoorOpen, 
  Square as WindowIcon, 
  Bed, 
  Sofa,
  Grid3X3,
  Maximize2,
  Move,
  RotateCw,
  Scaling,
  Ruler,
  Hand,
  Search,
  Compass,
  Hexagon,
  Spline,
  Type as TextIcon,
  Minus,
  PaintBucket,
  Undo2,
  Redo2,
  Info,
  Layers,
  Box,
  Cylinder,
  Eye,
  EyeOff
} from 'lucide-react';

interface Object3D {
  id: string;
  type: 'box' | 'plane' | 'circle' | 'line' | 'furniture' | 'text' | 'cylinder';
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
  color: string;
  name?: string;
  text?: string;
  layerId?: string;
}

interface LayerInfo {
  id: string;
  name: string;
  visible: boolean;
  color: string;
}

const GRID_SIZE = 10;

export default function DesignStudio3D() {
  const [tool, setTool] = useState<'select' | 'box' | 'plane' | 'circle' | 'line' | 'eraser' | 'move' | 'rotate' | 'scale' | 'paint' | 'measure' | 'cylinder'>('select');
  const [objects, setObjects] = useState<Object3D[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [color, setColor] = useState('#8B4513');
  const [layers, setLayers] = useState<LayerInfo[]>([
    { id: 'default', name: 'Untagged', visible: true, color: '#3b82f6' }
  ]);
  const [activeLayerId, setActiveLayerId] = useState('default');
  const [vcbValue, setVcbValue] = useState<string>('');
  const [showGrid, setShowGrid] = useState(true);
  const [showAxes, setShowAxes] = useState(true);

  // History for undo/redo
  const [history, setHistory] = useState<Object3D[][]>([[]]);
  const [historyStep, setHistoryStep] = useState(0);

  const saveToHistory = (newObjects: Object3D[]) => {
    const newHistory = history.slice(0, historyStep + 1);
    newHistory.push(newObjects);
    setHistory(newHistory);
    setHistoryStep(newHistory.length - 1);
    setObjects(newObjects);
  };

  const undo = () => {
    if (historyStep > 0) {
      setHistoryStep(historyStep - 1);
      setObjects(history[historyStep - 1]);
      setSelectedId(null);
    }
  };

  const redo = () => {
    if (historyStep < history.length - 1) {
      setHistoryStep(historyStep + 1);
      setObjects(history[historyStep + 1]);
      setSelectedId(null);
    }
  };

  const deleteSelected = () => {
    if (selectedId) {
      saveToHistory(objects.filter(o => o.id !== selectedId));
      setSelectedId(null);
    }
  };

  const addObject = (type: Object3D['type'], pos: [number, number, number] = [0, 0, 0]) => {
    const newObj: Object3D = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      position: pos,
      rotation: [0, 0, 0],
      scale: [1, 1, 1],
      color,
      layerId: activeLayerId
    };
    saveToHistory([...objects, newObj]);
    setSelectedId(newObj.id);
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return;
      
      switch (e.key.toLowerCase()) {
        case ' ': e.preventDefault(); setTool('select'); break;
        case 'e': setTool('eraser'); break;
        case 'b': setTool('paint'); break;
        case 'm': setTool('move'); break;
        case 'q': setTool('rotate'); break;
        case 's': setTool('scale'); break;
        case 'r': addObject('box'); break;
        case 'c': addObject('circle'); break;
        case 'delete':
        case 'backspace': deleteSelected(); break;
        case 'z': if (e.ctrlKey || e.metaKey) { e.preventDefault(); undo(); } break;
        case 'y': if (e.ctrlKey || e.metaKey) { e.preventDefault(); redo(); } break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [tool, selectedId, objects, historyStep]);

  const selectedObject = objects.find(o => o.id === selectedId);

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] bg-[#F0F0F0] overflow-hidden rounded-xl border border-gray-300 shadow-xl font-sans">
      {/* Top Bar */}
      <div className="bg-[#1A1A1A] text-white px-4 py-2 flex items-center justify-between h-12">
        <div className="flex items-center gap-4">
          <div className="bg-blue-500 p-1 rounded">
            <Box size={20} className="text-white" />
          </div>
          <span className="font-bold text-sm tracking-tight">SketchUp 3D Studio</span>
          <div className="h-6 w-px bg-gray-700 mx-2" />
          <div className="flex gap-4 text-xs font-medium text-gray-300">
            <button className="hover:text-white transition-colors">Home</button>
            <button className="hover:text-white transition-colors">Open</button>
            <button className="hover:text-white transition-colors">Save</button>
            <button onClick={undo} className="hover:text-white transition-colors flex items-center gap-1"><Undo2 size={12} /> Undo</button>
            <button onClick={redo} className="hover:text-white transition-colors flex items-center gap-1"><Redo2 size={12} /> Redo</button>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search size={14} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search tools..." 
              className="bg-gray-800 border-none rounded-full py-1 pl-8 pr-4 text-xs w-48 focus:ring-1 focus:ring-blue-500 outline-none"
            />
          </div>
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-xs font-bold">
            SK
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden relative">
        
        {/* Left Vertical Toolbar */}
        <div className="w-12 bg-[#F5F5F5] border-r border-gray-300 flex flex-col items-center py-2 gap-1 z-10 shadow-sm">
          <ToolButton active={tool === 'select'} onClick={() => setTool('select')} icon={MousePointer2} title="Select (Space)" shortcut="Space" />
          <ToolButton active={tool === 'eraser'} onClick={() => setTool('eraser')} icon={Eraser} title="Eraser (E)" shortcut="E" />
          <ToolButton active={tool === 'paint'} onClick={() => setTool('paint')} icon={PaintBucket} title="Paint Bucket (B)" shortcut="B" />
          <div className="w-8 h-px bg-gray-300 my-1" />
          <ToolButton active={tool === 'box'} onClick={() => addObject('box')} icon={Box} title="Box (R)" shortcut="R" />
          <ToolButton active={tool === 'circle'} onClick={() => addObject('circle')} icon={CircleIcon} title="Circle (C)" shortcut="C" />
          <ToolButton active={tool === 'cylinder'} onClick={() => addObject('cylinder')} icon={Cylinder} title="Cylinder" />
          <div className="w-8 h-px bg-gray-300 my-1" />
          <ToolButton active={tool === 'move'} onClick={() => setTool('move')} icon={Move} title="Move (M)" shortcut="M" />
          <ToolButton active={tool === 'rotate'} onClick={() => setTool('rotate')} icon={RotateCw} title="Rotate (Q)" shortcut="Q" />
          <ToolButton active={tool === 'scale'} onClick={() => setTool('scale')} icon={Scaling} title="Scale (S)" shortcut="S" />
          <div className="w-8 h-px bg-gray-300 my-1" />
          <ToolButton active={tool === 'measure'} onClick={() => setTool('measure')} icon={Ruler} title="Tape Measure (T)" shortcut="T" />
          <div className="w-8 h-px bg-gray-300 my-1" />
          <ToolButton active={false} onClick={() => setShowGrid(!showGrid)} icon={Grid3X3} title="Toggle Grid" />
          <ToolButton active={showAxes} onClick={() => setShowAxes(!showAxes)} icon={Compass} title="Toggle Axes" />
        </div>

        {/* 3D Canvas Area */}
        <div className="flex-1 relative bg-[#E5E5E5]">
          <Canvas shadows dpr={[1, 2]}>
            <PerspectiveCamera makeDefault position={[10, 10, 10]} fov={50} />
            <OrbitControls 
              makeDefault 
              enabled={tool === 'select' || tool === 'eraser' || tool === 'paint'} 
              minPolarAngle={0} 
              maxPolarAngle={Math.PI / 1.75} 
            />
            
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} intensity={1} castShadow />
            <directionalLight 
              position={[-5, 5, 5]} 
              intensity={0.5} 
              castShadow 
              shadow-mapSize={[1024, 1024]}
            />

            <Suspense fallback={null}>
              <Scene 
                objects={objects} 
                selectedId={selectedId} 
                setSelectedId={setSelectedId}
                tool={tool}
                color={color}
                onUpdate={(id, updates) => {
                  saveToHistory(objects.map(o => o.id === id ? { ...o, ...updates } : o));
                }}
                layers={layers}
              />
              {showGrid && <Grid infiniteGrid fadeDistance={50} sectionSize={1} sectionColor="#999" cellColor="#ccc" />}
              {showAxes && <CustomAxes />}
              <ContactShadows position={[0, -0.01, 0]} opacity={0.4} scale={20} blur={2} far={4.5} />
              <Environment preset="city" />
            </Suspense>
          </Canvas>

          {/* Floating Controls */}
          <div className="absolute bottom-4 left-4 flex flex-col gap-2">
            <div className="bg-white/80 backdrop-blur p-2 rounded-lg shadow-md text-[10px] font-bold text-gray-600">
              Orbit: Left Click | Pan: Shift + Left Click | Zoom: Scroll
            </div>
          </div>
        </div>

        {/* Right Panel */}
        <div className="w-64 bg-[#F5F5F5] border-l border-gray-400 flex flex-col overflow-y-auto">
          <div className="p-2 bg-[#EAEAEA] border-b border-gray-400 font-bold text-xs text-gray-700">Default Tray</div>
          
          <TraySection title="Entity Info" icon={Info}>
            {selectedObject ? (
              <div className="space-y-2 text-[10px]">
                <div className="flex justify-between">
                  <span className="text-gray-500">Type:</span>
                  <span className="font-bold uppercase">{selectedObject.type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Position:</span>
                  <span className="font-mono">
                    {selectedObject.position.map(p => p.toFixed(1)).join(', ')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Color:</span>
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: selectedObject.color }} />
                </div>
                <button 
                  onClick={deleteSelected}
                  className="w-full mt-2 p-1.5 bg-red-50 text-red-600 rounded border border-red-200 hover:bg-red-100 flex items-center justify-center gap-1"
                >
                  <Trash2 size={12} /> Delete Entity
                </button>
              </div>
            ) : (
              <p className="text-[10px] text-gray-400 italic">No selection</p>
            )}
          </TraySection>

          <TraySection title="Materials" icon={Palette}>
            <div className="grid grid-cols-4 gap-1">
              {['#8B4513', '#D2691E', '#CD853F', '#DEB887', '#000000', '#FF0000', '#FFFFFF', '#808080', '#3b82f6', '#10b981', '#f59e0b', '#ef4444'].map(c => (
                <button 
                  key={c} 
                  onClick={() => setColor(c)}
                  className={`w-full aspect-square rounded border ${color === c ? 'ring-2 ring-blue-500' : 'border-gray-300'}`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </TraySection>

          <TraySection title="Tags" icon={Layers}>
            <div className="space-y-1">
              {layers.map(layer => (
                <div 
                  key={layer.id}
                  onClick={() => setActiveLayerId(layer.id)}
                  className={`flex items-center justify-between p-1 border rounded text-[10px] cursor-pointer ${activeLayerId === layer.id ? 'bg-blue-50 border-blue-300' : 'bg-white border-gray-300 hover:bg-gray-50'}`}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: layer.color }} />
                    <span className={layer.visible ? '' : 'text-gray-400 line-through'}>{layer.name}</span>
                  </div>
                  <button 
                    onClick={(e) => { e.stopPropagation(); setLayers(layers.map(l => l.id === layer.id ? { ...l, visible: !l.visible } : l)); }}
                    className="p-0.5 hover:bg-gray-200 rounded"
                  >
                    {layer.visible ? <Eye size={12} /> : <EyeOff size={12} />}
                  </button>
                </div>
              ))}
            </div>
          </TraySection>
        </div>
      </div>

      {/* Status Bar */}
      <div className="bg-[#F0F0F0] border-t border-gray-300 h-8 flex items-center justify-between px-3 text-[10px] text-gray-600">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-green-500" />
            <span>Ready</span>
          </div>
          <div className="h-4 w-px bg-gray-300" />
          <span>{tool === 'select' ? 'Select objects to modify them.' : `Tool: ${tool.toUpperCase()}`}</span>
        </div>
        
        <div className="flex items-center gap-2">
          <span>Measurements</span>
          <form onSubmit={(e) => { e.preventDefault(); setVcbValue(''); }} className="flex items-center">
            <input 
              type="text" 
              value={vcbValue}
              onChange={(e) => setVcbValue(e.target.value)}
              placeholder="0.00m"
              className="bg-white border border-gray-400 px-2 py-0.5 w-24 text-right outline-none focus:border-blue-500"
            />
          </form>
        </div>
      </div>
    </div>
  );
}

function CustomAxes() {
  return (
    <group>
      {/* X Axis - Red */}
      <Line3D points={[[-100, 0, 0], [100, 0, 0]]} color="#ff4444" lineWidth={1} transparent opacity={0.3} />
      <Text3D position={[5, 0.2, 0]} fontSize={0.4} color="#ff4444" anchorX="center" anchorY="middle">X</Text3D>
      
      {/* Y Axis - Green */}
      <Line3D points={[[0, -100, 0], [0, 100, 0]]} color="#44ff44" lineWidth={1} transparent opacity={0.3} />
      <Text3D position={[0.2, 5, 0]} fontSize={0.4} color="#44ff44" anchorX="center" anchorY="middle">Y</Text3D>
      
      {/* Z Axis - Blue */}
      <Line3D points={[[0, 0, -100], [0, 0, 100]]} color="#4444ff" lineWidth={1} transparent opacity={0.3} />
      <Text3D position={[0, 0.2, 5]} fontSize={0.4} color="#4444ff" anchorX="center" anchorY="middle">Z</Text3D>

      {/* Origin indicator */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[0.05, 16, 16]} />
        <meshBasicMaterial color="white" />
      </mesh>
    </group>
  );
}

function Scene({ objects, selectedId, setSelectedId, tool, color, onUpdate, layers }: any) {
  const { scene } = useThree();

  return (
    <>
      {objects.map((obj: Object3D) => {
        const isVisible = layers.find((l: any) => l.id === obj.layerId)?.visible !== false;
        if (!isVisible) return null;

        return (
          <ObjectItem 
            key={obj.id} 
            obj={obj} 
            isSelected={selectedId === obj.id} 
            onClick={() => {
              if (tool === 'eraser') {
                // Handled in parent
              } else if (tool === 'paint') {
                onUpdate(obj.id, { color });
              } else {
                setSelectedId(obj.id);
              }
            }}
            tool={tool}
            onUpdate={onUpdate}
          />
        );
      })}
      
      {selectedId && (tool === 'move' || tool === 'rotate' || tool === 'scale') && (
        <TransformControls 
          object={scene.getObjectByName(selectedId)} 
          mode={tool as any} 
          onMouseUp={() => {
            const obj = scene.getObjectByName(selectedId);
            if (obj) {
              onUpdate(selectedId, {
                position: [obj.position.x, obj.position.y, obj.position.z],
                rotation: [obj.rotation.x, obj.rotation.y, obj.rotation.z],
                scale: [obj.scale.x, obj.scale.y, obj.scale.z]
              });
            }
          }}
        />
      )}
    </>
  );
}

function ObjectItem({ obj, isSelected, onClick, tool, onUpdate }: any) {
  const meshRef = useRef<THREE.Mesh>(null);

  return (
    <mesh
      ref={meshRef}
      name={obj.id}
      position={obj.position}
      rotation={obj.rotation}
      scale={obj.scale}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      castShadow
      receiveShadow
    >
      {obj.type === 'box' && <boxGeometry args={[1, 1, 1]} />}
      {obj.type === 'circle' && <sphereGeometry args={[0.5, 32, 32]} />}
      {obj.type === 'cylinder' && <cylinderGeometry args={[0.5, 0.5, 1, 32]} />}
      {obj.type === 'plane' && <planeGeometry args={[1, 1]} />}
      
      <meshStandardMaterial 
        color={obj.color} 
        emissive={isSelected ? obj.color : 'black'}
        emissiveIntensity={isSelected ? 0.5 : 0}
        transparent={obj.type === 'plane'}
        opacity={obj.type === 'plane' ? 0.5 : 1}
      />
      
      {isSelected && (
        <mesh scale={[1.05, 1.05, 1.05]}>
          {obj.type === 'box' && <boxGeometry args={[1, 1, 1]} />}
          {obj.type === 'circle' && <sphereGeometry args={[0.5, 32, 32]} />}
          {obj.type === 'cylinder' && <cylinderGeometry args={[0.5, 0.5, 1, 32]} />}
          <meshBasicMaterial color="#3b82f6" wireframe />
        </mesh>
      )}
    </mesh>
  );
}

function ToolButton({ active, onClick, icon: Icon, title, shortcut }: any) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={`w-10 h-10 flex flex-col items-center justify-center rounded transition-all relative group ${
        active ? 'bg-blue-100 text-blue-700 shadow-inner' : 'text-gray-600 hover:bg-gray-200'
      }`}
    >
      <Icon size={18} />
      {shortcut && (
        <div className="absolute left-12 bg-gray-800 text-white text-[8px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
          {title} ({shortcut})
        </div>
      )}
    </button>
  );
}

function TraySection({ title, icon: Icon, children }: any) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="border-b border-gray-300">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-2 hover:bg-gray-200 transition-colors"
      >
        <div className="flex items-center gap-2 text-[10px] font-bold text-gray-600">
          <Icon size={12} />
          <span>{title}</span>
        </div>
        <span className="text-[10px]">{isOpen ? '▼' : '▶'}</span>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden bg-white"
          >
            <div className="p-3">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
