import React, { useState, useRef, useEffect } from 'react';
import { Stage, Layer, Line, Rect, Circle, Text, Group, RegularPolygon, Arc as KonvaArc, Arrow } from 'react-konva';
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
  Hexagon,
  Spline,
  Type as TextIcon,
  Minus,
  PaintBucket,
  Undo2,
  Redo2,
  Info,
  Layers,
  Box
} from 'lucide-react';

interface Shape {
  id: string;
  type: 'line' | 'rect' | 'circle' | 'furniture' | 'polygon' | 'arc' | 'text';
  points?: number[];
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  color: string;
  name?: string;
  rotation?: number;
  sides?: number;
  radius?: number;
  text?: string;
  fontSize?: number;
  layerId?: string;
  zHeight?: number;
}

interface LayerInfo {
  id: string;
  name: string;
  visible: boolean;
  color: string;
}

const GRID_SIZE = 20;

export default function DesignStudio() {
  const [tool, setTool] = useState<'select' | 'pen' | 'rect' | 'circle' | 'eraser' | 'furniture' | 'polygon' | 'arc' | 'text' | 'measure' | 'pan' | 'move' | 'pushpull' | 'paint'>('pen');
  const [shapes, setShapes] = useState<Shape[]>([]);
  const [history, setHistory] = useState<Shape[][]>([[]]);
  const [historyStep, setHistoryStep] = useState(0);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [color, setColor] = useState('#8B4513');
  const [activeFurniture, setActiveFurniture] = useState<string | null>(null);
  const [showGrid, setShowGrid] = useState(true);
  const [snapToGrid, setSnapToGrid] = useState(true);
  const [layers, setLayers] = useState<LayerInfo[]>([
    { id: 'default', name: 'Untagged', visible: true, color: '#3b82f6' }
  ]);
  const [activeLayerId, setActiveLayerId] = useState('default');
  
  // Stage state
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  
  // Measurement state
  const [measurePoints, setMeasurePoints] = useState<number[] | null>(null);
  const [measurement, setMeasurement] = useState<string>('');
  const [vcbValue, setVcbValue] = useState<string>('');
  const [contextMenu, setContextMenu] = useState<{ x: number, y: number, visible: boolean } | null>(null);
  
  const isDrawing = useRef(false);
  const stageRef = useRef<any>(null);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return;
      
      switch (e.key.toLowerCase()) {
        case ' ': e.preventDefault(); setTool('select'); break;
        case 'e': setTool('eraser'); break;
        case 'b': setTool('paint'); break;
        case 'l': setTool('pen'); break;
        case 'a': setTool('arc'); break;
        case 'r': setTool('rect'); break;
        case 'c': setTool('circle'); break;
        case 'p': setTool('pushpull'); break;
        case 'f': offsetSelected(10); break;
        case 'm': setTool('move'); break;
        case 'q': rotateSelected(); break;
        case 's': scaleSelected(1.1); break;
        case 't': setTool('measure'); break;
        case 'h': setTool('pan'); break;
        case 'z': setTool('pan'); break; // SketchUp uses Z for zoom but often toggles pan/zoom
        case 'delete':
        case 'backspace': deleteSelected(); break;
        case 'z': if (e.ctrlKey || e.metaKey) { e.preventDefault(); undo(); } break;
        case 'y': if (e.ctrlKey || e.metaKey) { e.preventDefault(); redo(); } break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [tool, selectedId, shapes, historyStep]);

  const saveToHistory = (newShapes: Shape[]) => {
    const newHistory = history.slice(0, historyStep + 1);
    newHistory.push(newShapes);
    setHistory(newHistory);
    setHistoryStep(newHistory.length - 1);
    setShapes(newShapes);
  };

  const undo = () => {
    if (historyStep > 0) {
      setHistoryStep(historyStep - 1);
      setShapes(history[historyStep - 1]);
      setSelectedId(null);
    }
  };

  const redo = () => {
    if (historyStep < history.length - 1) {
      setHistoryStep(historyStep + 1);
      setShapes(history[historyStep + 1]);
      setSelectedId(null);
    }
  };

  const selectedShape = shapes.find(s => s.id === selectedId);

  const snap = (val: number) => {
    return snapToGrid ? Math.round(val / GRID_SIZE) * GRID_SIZE : val;
  };

  const getRelativePointerPosition = (stage: any) => {
    const transform = stage.getAbsoluteTransform().copy().invert();
    const pos = stage.getPointerPosition();
    return transform.point(pos);
  };

  const handleMouseDown = (e: any) => {
    const stage = e.target.getStage();
    const pos = getRelativePointerPosition(stage);
    const snappedPos = { x: snap(pos.x), y: snap(pos.y) };

    if (tool === 'pan') {
      isDrawing.current = true;
      return;
    }

    if (tool === 'select' || tool === 'move') {
      const clickedOnEmpty = e.target === stage;
      if (clickedOnEmpty) {
        setSelectedId(null);
      }
      return;
    }

    if (tool === 'measure') {
      setMeasurePoints([snappedPos.x, snappedPos.y, snappedPos.x, snappedPos.y]);
      isDrawing.current = true;
      return;
    }

    if (tool === 'furniture' && activeFurniture) {
      const newShape: Shape = {
        id: Date.now().toString(),
        type: 'furniture',
        x: snappedPos.x,
        y: snappedPos.y,
        name: activeFurniture,
        color,
        rotation: 0
      };
      saveToHistory([...shapes, newShape]);
      setSelectedId(newShape.id);
      return;
    }

    if (tool === 'text') {
      const text = prompt('Enter text:');
      if (text) {
        const newShape: Shape = {
          id: Date.now().toString(),
          type: 'text',
          x: snappedPos.x,
          y: snappedPos.y,
          text,
          color,
          fontSize: 20
        };
        saveToHistory([...shapes, newShape]);
        setSelectedId(newShape.id);
      }
      return;
    }

    isDrawing.current = true;
    
    const baseShape = {
      id: Date.now().toString(),
      color,
      x: snappedPos.x,
      y: snappedPos.y,
      layerId: activeLayerId,
      zHeight: 0,
    };

    if (tool === 'pen') {
      setShapes([...shapes, { ...baseShape, type: 'line', points: [snappedPos.x, snappedPos.y] }]);
    } else if (tool === 'rect') {
      setShapes([...shapes, { ...baseShape, type: 'rect', width: 0, height: 0 }]);
    } else if (tool === 'circle') {
      setShapes([...shapes, { ...baseShape, type: 'circle', radius: 0 }]);
    } else if (tool === 'polygon') {
      setShapes([...shapes, { ...baseShape, type: 'polygon', radius: 0, sides: 6 }]);
    } else if (tool === 'arc') {
      setShapes([...shapes, { ...baseShape, type: 'arc', radius: 0, rotation: 0 }]);
    }
    
    setSelectedId(baseShape.id);
  };

  const handleMouseMove = (e: any) => {
    const stage = e.target.getStage();
    const pos = getRelativePointerPosition(stage);
    const snappedPos = { x: snap(pos.x), y: snap(pos.y) };

    // Update measurement display in status bar
    setMeasurement(`${snappedPos.x.toFixed(0)}, ${snappedPos.y.toFixed(0)}`);

    if (!isDrawing.current) return;
    
    if (tool === 'pan') {
      const dx = e.evt.movementX;
      const dy = e.evt.movementY;
      setPosition({ x: position.x + dx, y: position.y + dy });
      return;
    }

    if (tool === 'measure') {
      setMeasurePoints([measurePoints![0], measurePoints![1], snappedPos.x, snappedPos.y]);
      return;
    }
    
    const newShapes = shapes.slice();
    const lastShape = newShapes[newShapes.length - 1];
    if (!lastShape) return;

    if (tool === 'pen') {
      lastShape.points = lastShape.points!.concat([snappedPos.x, snappedPos.y]);
    } else if (tool === 'rect') {
      lastShape.width = snappedPos.x - lastShape.x!;
      lastShape.height = snappedPos.y - lastShape.y!;
    } else if (tool === 'circle' || tool === 'polygon' || tool === 'arc') {
      const radius = Math.sqrt(
        Math.pow(snappedPos.x - lastShape.x!, 2) + 
        Math.pow(snappedPos.y - lastShape.y!, 2)
      );
      lastShape.radius = radius;
      if (tool === 'arc') {
        const angle = Math.atan2(snappedPos.y - lastShape.y!, snappedPos.x - lastShape.x!) * (180 / Math.PI);
        lastShape.rotation = angle;
      }
    } else if (tool === 'pushpull' && selectedId) {
      const shapeToPush = newShapes.find(s => s.id === selectedId);
      if (shapeToPush) {
        const dy = Math.abs(snappedPos.y - (shapeToPush.y || 0));
        shapeToPush.zHeight = dy;
      }
    }

    setShapes(newShapes);
  };

  const handleMouseUp = () => {
    if (isDrawing.current && tool !== 'pan' && tool !== 'measure') {
      saveToHistory(shapes);
    }
    isDrawing.current = false;
  };

  const handleShapeClick = (id: string) => {
    if (tool === 'eraser') {
      saveToHistory(shapes.filter(s => s.id !== id));
      setSelectedId(null);
    } else if (tool === 'paint') {
      saveToHistory(shapes.map(s => s.id === id ? { ...s, color } : s));
    } else {
      setSelectedId(id);
    }
  };

  const handleWheel = (e: any) => {
    e.evt.preventDefault();
    const scaleBy = 1.1;
    const stage = stageRef.current;
    const oldScale = stage.scaleX();
    const mousePointTo = {
      x: stage.getPointerPosition().x / oldScale - stage.x() / oldScale,
      y: stage.getPointerPosition().y / oldScale - stage.y() / oldScale,
    };

    const newScale = e.evt.deltaY < 0 ? oldScale * scaleBy : oldScale / scaleBy;
    setScale(newScale);
    setPosition({
      x: -(mousePointTo.x - stage.getPointerPosition().x / newScale) * newScale,
      y: -(mousePointTo.y - stage.getPointerPosition().y / newScale) * newScale,
    });
  };

  const rotateSelected = () => {
    if (selectedId) {
      saveToHistory(shapes.map(s => s.id === selectedId ? { ...s, rotation: (s.rotation || 0) + 45 } : s));
    }
  };

  const scaleSelected = (factor: number) => {
    if (selectedId) {
      saveToHistory(shapes.map(s => {
        if (s.id === selectedId) {
          if (s.type === 'rect') return { ...s, width: (s.width || 0) * factor, height: (s.height || 0) * factor };
          if (s.radius) return { ...s, radius: s.radius * factor };
          if (s.fontSize) return { ...s, fontSize: s.fontSize * factor };
        }
        return s;
      }));
    }
  };

  const deleteSelected = () => {
    if (selectedId) {
      saveToHistory(shapes.filter(s => s.id !== selectedId));
      setSelectedId(null);
    }
  };

  const clearCanvas = () => {
    saveToHistory([]);
    setSelectedId(null);
    setMeasurePoints(null);
  };

  const exportImage = () => {
    const uri = stageRef.current.toDataURL();
    const link = document.createElement('a');
    link.download = 'sketch-plan.png';
    link.href = uri;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const [isVideoGenerating, setIsVideoGenerating] = useState(false);

  const generateVideo = () => {
    setIsVideoGenerating(true);
    setTimeout(() => {
      setIsVideoGenerating(false);
      alert('3D Walkthrough Video Generated! (Simulation)');
    }, 5000);
  };

  const handleVcbSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedId || !vcbValue) return;

    const val = parseFloat(vcbValue);
    if (isNaN(val)) return;

    saveToHistory(shapes.map(s => {
      if (s.id === selectedId) {
        if (s.type === 'rect') return { ...s, width: val * 20, height: val * 20 }; // Assuming meters to pixels
        if (s.type === 'circle' || s.type === 'polygon') return { ...s, radius: val * 20 };
        if (tool === 'pushpull') return { ...s, zHeight: val * 10 };
      }
      return s;
    }));
    setVcbValue('');
  };

  const pushPullSelected = (amount: number) => {
    if (selectedId) {
      saveToHistory(shapes.map(s => s.id === selectedId ? { ...s, zHeight: (s.zHeight || 0) + amount } : s));
    }
  };

  const addLayer = () => {
    const name = prompt('Layer Name:');
    if (name) {
      const newLayer = { id: Date.now().toString(), name, visible: true, color: '#' + Math.floor(Math.random()*16777215).toString(16) };
      setLayers([...layers, newLayer]);
    }
  };

  const toggleLayerVisibility = (id: string) => {
    setLayers(layers.map(l => l.id === id ? { ...l, visible: !l.visible } : l));
  };

  const offsetSelected = (offset: number) => {
    if (selectedId) {
      const shape = shapes.find(s => s.id === selectedId);
      if (!shape) return;
      
      const newShape: Shape = {
        ...shape,
        id: Date.now().toString(),
      };

      if (shape.type === 'rect') {
        newShape.x = (shape.x || 0) - offset;
        newShape.y = (shape.y || 0) - offset;
        newShape.width = (shape.width || 0) + offset * 2;
        newShape.height = (shape.height || 0) + offset * 2;
      } else if (shape.radius) {
        newShape.radius = shape.radius + offset;
      }

      saveToHistory([...shapes, newShape]);
      setSelectedId(newShape.id);
    }
  };

  const duplicateSelected = () => {
    if (selectedId) {
      const shape = shapes.find(s => s.id === selectedId);
      if (shape) {
        const newShape = { ...shape, id: Date.now().toString(), x: (shape.x || 0) + 20, y: (shape.y || 0) + 20 };
        saveToHistory([...shapes, newShape]);
        setSelectedId(newShape.id);
      }
    }
  };

  const furnitureList = [
    { name: 'Door', icon: DoorOpen },
    { name: 'Window', icon: WindowIcon },
    { name: 'Bed', icon: Bed },
    { name: 'Sofa', icon: Sofa },
  ];

  const calculateDistance = (pts: number[]) => {
    const d = Math.sqrt(Math.pow(pts[2] - pts[0], 2) + Math.pow(pts[3] - pts[1], 2));
    return (d / 20).toFixed(2) + 'm';
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] bg-[#F0F0F0] overflow-hidden rounded-xl border border-gray-300 shadow-xl font-sans">
      {/* Top Bar (SketchUp Style) */}
      <div className="bg-[#1A1A1A] text-white px-4 py-2 flex items-center justify-between h-12">
        <div className="flex items-center gap-4">
          <div className="bg-blue-500 p-1 rounded">
            <Box size={20} className="text-white" />
          </div>
          <span className="font-bold text-sm tracking-tight">SketchUp Studio</span>
          <div className="h-6 w-px bg-gray-700 mx-2" />
          <div className="flex gap-4 text-xs font-medium text-gray-300">
            <button className="hover:text-white transition-colors">Home</button>
            <button className="hover:text-white transition-colors">Open</button>
            <button onClick={exportImage} className="hover:text-white transition-colors">Save</button>
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
        
        {/* Left Vertical Toolbar (SketchUp Style) */}
        <div className="w-12 bg-[#F5F5F5] border-r border-gray-300 flex flex-col items-center py-2 gap-1 z-10 shadow-sm">
          <ToolButton active={tool === 'select'} onClick={() => setTool('select')} icon={MousePointer2} title="Select (Space)" shortcut="Space" />
          <ToolButton active={tool === 'eraser'} onClick={() => setTool('eraser')} icon={Eraser} title="Eraser (E)" shortcut="E" />
          <ToolButton active={tool === 'paint'} onClick={() => setTool('paint')} icon={PaintBucket} title="Paint Bucket (B)" shortcut="B" />
          <div className="w-8 h-px bg-gray-300 my-1" />
          <ToolButton active={tool === 'pen'} onClick={() => setTool('pen')} icon={Spline} title="Line (L)" shortcut="L" />
          <ToolButton active={tool === 'arc'} onClick={() => setTool('arc')} icon={RotateCw} title="Arc (A)" shortcut="A" />
          <ToolButton active={tool === 'rect'} onClick={() => setTool('rect')} icon={Square} title="Rectangle (R)" shortcut="R" />
          <ToolButton active={tool === 'circle'} onClick={() => setTool('circle')} icon={CircleIcon} title="Circle (C)" shortcut="C" />
          <ToolButton active={tool === 'polygon'} onClick={() => setTool('polygon')} icon={Hexagon} title="Polygon" />
          <div className="w-8 h-px bg-gray-300 my-1" />
          <ToolButton active={tool === 'pushpull'} onClick={() => setTool('pushpull')} icon={Maximize2} title="Push/Pull (P)" shortcut="P" />
          <ToolButton active={false} onClick={() => offsetSelected(10)} icon={Minus} title="Offset (F)" shortcut="F" />
          <div className="w-8 h-px bg-gray-300 my-1" />
          <ToolButton active={tool === 'move'} onClick={() => setTool('move')} icon={Move} title="Move (M)" shortcut="M" />
          <ToolButton active={false} onClick={rotateSelected} icon={RotateCw} title="Rotate (Q)" shortcut="Q" />
          <ToolButton active={false} onClick={() => scaleSelected(1.1)} icon={Scaling} title="Scale (S)" shortcut="S" />
          <div className="w-8 h-px bg-gray-300 my-1" />
          <ToolButton active={tool === 'measure'} onClick={() => setTool('measure')} icon={Ruler} title="Tape Measure (T)" shortcut="T" />
          <ToolButton active={tool === 'text'} onClick={() => setTool('text')} icon={TextIcon} title="Text" />
          <div className="w-8 h-px bg-gray-300 my-1" />
          <ToolButton active={tool === 'pan'} onClick={() => setTool('pan')} icon={Hand} title="Pan (H)" shortcut="H" />
          <ToolButton active={false} onClick={() => setScale(scale * 1.2)} icon={Search} title="Zoom (Z)" shortcut="Z" />
          <ToolButton active={false} onClick={() => setScale(1)} icon={Maximize2} title="Zoom Extents" />
        </div>

        {/* Canvas Area */}
        <div className="flex-1 relative bg-white overflow-hidden">
          <Stage
            width={window.innerWidth}
            height={window.innerHeight}
            onMouseDown={handleMouseDown}
            onMousemove={handleMouseMove}
            onMouseup={handleMouseUp}
            onWheel={handleWheel}
            scaleX={scale}
            scaleY={scale}
            x={position.x}
            y={position.y}
            ref={stageRef}
            className={`${tool === 'pan' ? 'cursor-grab active:cursor-grabbing' : 'cursor-crosshair'}`}
            onContextMenu={(e) => {
              e.evt.preventDefault();
              if (selectedId) {
                setContextMenu({ x: e.evt.clientX, y: e.evt.clientY, visible: true });
              }
            }}
            onClick={() => setContextMenu(null)}
          >
            <Layer>
              {/* Grid Lines */}
              {showGrid && Array.from({ length: 100 }).map((_, i) => (
                <Line key={`v-${i}`} points={[(i - 50) * 100, -5000, (i - 50) * 100, 5000]} stroke="#E0E0E0" strokeWidth={1 / scale} />
              ))}
              {showGrid && Array.from({ length: 100 }).map((_, i) => (
                <Line key={`h-${i}`} points={[-5000, (i - 50) * 100, 5000, (i - 50) * 100]} stroke="#E0E0E0" strokeWidth={1 / scale} />
              ))}

              {shapes.filter(s => layers.find(l => l.id === s.layerId)?.visible !== false).map((shape) => {
                const isSelected = selectedId === shape.id;
                const hasHeight = (shape.zHeight || 0) > 0;
                const commonProps = {
                  key: shape.id,
                  onClick: () => handleShapeClick(shape.id),
                  draggable: tool === 'select' || tool === 'move',
                  onDragEnd: (e: any) => {
                    saveToHistory(shapes.map(s => s.id === shape.id ? { ...s, x: e.target.x(), y: e.target.y() } : s));
                  },
                  shadowBlur: isSelected ? 5 : (hasHeight ? 10 : 0),
                  shadowColor: isSelected ? "#0078D7" : "rgba(0,0,0,0.3)",
                  shadowOffset: hasHeight ? { x: shape.zHeight! / 2, y: shape.zHeight! / 2 } : { x: 0, y: 0 },
                  rotation: shape.rotation || 0,
                  stroke: isSelected ? "#0078D7" : shape.color,
                  strokeWidth: (isSelected ? 6 : 4) / scale,
                };

                if (shape.type === 'line') {
                  return (
                    <Line
                      {...commonProps}
                      points={shape.points}
                      tension={0.5}
                      lineCap="round"
                      lineJoin="round"
                    />
                  );
                }
                if (shape.type === 'rect') {
                  return (
                    <Rect
                      {...commonProps}
                      x={shape.x}
                      y={shape.y}
                      width={shape.width}
                      height={shape.height}
                      fill={shape.color + '22'}
                    />
                  );
                }
                if (shape.type === 'circle') {
                  return (
                    <Circle
                      {...commonProps}
                      x={shape.x}
                      y={shape.y}
                      radius={shape.radius}
                      fill={shape.color + '22'}
                    />
                  );
                }
                if (shape.type === 'polygon') {
                  return (
                    <RegularPolygon
                      {...commonProps}
                      x={shape.x}
                      y={shape.y}
                      sides={shape.sides || 6}
                      radius={shape.radius || 0}
                      fill={shape.color + '22'}
                    />
                  );
                }
                if (shape.type === 'arc') {
                  return (
                    <KonvaArc
                      {...commonProps}
                      x={shape.x}
                      y={shape.y}
                      innerRadius={shape.radius! * 0.8}
                      outerRadius={shape.radius!}
                      angle={180}
                      fill={shape.color + '44'}
                    />
                  );
                }
                if (shape.type === 'text') {
                  return (
                    <Text
                      {...commonProps}
                      x={shape.x}
                      y={shape.y}
                      text={shape.text}
                      fontSize={shape.fontSize || 20}
                      fill={shape.color}
                      fontStyle="bold"
                    />
                  );
                }
                if (shape.type === 'furniture') {
                  return (
                    <Group
                      {...commonProps}
                      x={shape.x}
                      y={shape.y}
                    >
                      <Rect 
                        width={40} 
                        height={40} 
                        fill="#F5DEB3" 
                        stroke={isSelected ? "#0078D7" : shape.color} 
                        strokeWidth={2 / scale} 
                        cornerRadius={4}
                      />
                      <Text 
                        text={shape.name} 
                        fontSize={10} 
                        width={40} 
                        align="center" 
                        y={15} 
                        fontStyle="bold"
                        fill="#8B4513"
                      />
                    </Group>
                  );
                }
                return null;
              })}

              {/* Measurement Tool Visual */}
              {measurePoints && (
                <Group>
                  <Arrow
                    points={measurePoints}
                    stroke="#FF0000"
                    fill="#FF0000"
                    strokeWidth={2 / scale}
                    pointerLength={10 / scale}
                    pointerWidth={10 / scale}
                  />
                  <Text
                    x={(measurePoints[0] + measurePoints[2]) / 2}
                    y={(measurePoints[1] + measurePoints[3]) / 2 - 20 / scale}
                    text={calculateDistance(measurePoints)}
                    fontSize={16 / scale}
                    fill="#FF0000"
                    fontStyle="bold"
                  />
                </Group>
              )}
            </Layer>
          </Stage>

          {/* Canvas Controls (Floating) */}
          <div className="absolute bottom-4 left-4 flex flex-col gap-2">
            <button onClick={() => setShowGrid(!showGrid)} className={`p-2 rounded-full shadow-lg ${showGrid ? 'bg-[#8B4513] text-white' : 'bg-white text-[#8B4513]'}`} title="Toggle Grid"><Grid3X3 size={20} /></button>
            <button onClick={() => setSnapToGrid(!snapToGrid)} className={`p-2 rounded-full shadow-lg ${snapToGrid ? 'bg-[#8B4513] text-white' : 'bg-white text-[#8B4513]'}`} title="Toggle Snap"><Maximize2 size={20} /></button>
          </div>
        </div>

        {/* Right Panel (Default Tray) */}
        <div className="w-64 bg-[#F5F5F5] border-l border-gray-400 flex flex-col overflow-y-auto">
          <div className="p-2 bg-[#EAEAEA] border-b border-gray-400 font-bold text-xs text-gray-700">Default Tray</div>
          
          {/* Entity Info */}
          <TraySection title="Entity Info" icon={Info}>
            {selectedShape ? (
              <div className="space-y-2 text-[10px]">
                <div className="flex justify-between">
                  <span className="text-gray-500">Type:</span>
                  <span className="font-bold uppercase">{selectedShape.type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">ID:</span>
                  <span className="font-mono">{selectedShape.id.slice(-4)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Color:</span>
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: selectedShape.color }} />
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

          {/* Materials / Colors */}
          <TraySection title="Materials" icon={Palette}>
            <div className="grid grid-cols-4 gap-1">
              {['#8B4513', '#D2691E', '#CD853F', '#DEB887', '#000000', '#FF0000', '#FFFFFF', '#808080'].map(c => (
                <button 
                  key={c} 
                  onClick={() => setColor(c)}
                  className={`w-full aspect-square rounded border ${color === c ? 'ring-2 ring-blue-500' : 'border-gray-300'}`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </TraySection>

          {/* Components / Furniture */}
          <TraySection title="Components" icon={Box}>
            <div className="grid grid-cols-2 gap-2">
              {furnitureList.map((item) => (
                <button
                  key={item.name}
                  onClick={() => {
                    setTool('furniture');
                    setActiveFurniture(item.name);
                  }}
                  className={`flex flex-col items-center gap-1 p-2 rounded border transition-all ${
                    tool === 'furniture' && activeFurniture === item.name 
                      ? 'bg-blue-50 border-blue-400 text-blue-700' 
                      : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <item.icon size={16} />
                  <span className="text-[8px] font-bold uppercase">{item.name}</span>
                </button>
              ))}
            </div>
          </TraySection>

          {/* Layers / Tags */}
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
                    onClick={(e) => { e.stopPropagation(); toggleLayerVisibility(layer.id); }}
                    className="p-0.5 hover:bg-gray-200 rounded"
                  >
                    {layer.visible ? '👁️' : '🚫'}
                  </button>
                </div>
              ))}
              <button 
                onClick={addLayer}
                className="w-full mt-2 p-1 text-[8px] font-bold uppercase border border-dashed border-gray-400 text-gray-500 hover:bg-gray-50 rounded"
              >
                + Add Tag
              </button>
            </div>
          </TraySection>
        </div>
      </div>

      {/* Bottom Status Bar (SketchUp Style) */}
      <div className="bg-[#EAEAEA] border-t border-gray-400 px-4 py-1 flex items-center justify-between text-[10px] text-gray-600 h-8">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500" />
            <span className="font-medium">Ready</span>
          </div>
          <div className="h-3 w-px bg-gray-400" />
          <span>{tool === 'select' ? 'Select objects. Shift to extend select. Drag to window select.' : `Tool: ${tool.toUpperCase()}`}</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white border border-gray-300 px-2 py-0.5 rounded shadow-inner">
            <span className="text-gray-400 font-bold">Measurements</span>
            <form onSubmit={handleVcbSubmit} className="flex items-center">
              <input 
                type="text" 
                value={vcbValue || measurement}
                onChange={(e) => setVcbValue(e.target.value)}
                placeholder="0.00m"
                className="w-20 bg-transparent border-none outline-none text-right font-mono text-gray-800"
              />
            </form>
          </div>
          <div className="flex gap-1">
            <button onClick={undo} className="p-1 hover:bg-gray-300 rounded disabled:opacity-30" title="Undo" disabled={historyStep === 0}><Undo2 size={12} /></button>
            <button onClick={redo} className="p-1 hover:bg-gray-300 rounded disabled:opacity-30" title="Redo" disabled={historyStep === history.length - 1}><Redo2 size={12} /></button>
          </div>
        </div>
      </div>

      {/* Context Menu */}
      {contextMenu && contextMenu.visible && (
        <div 
          className="fixed z-[200] bg-white border border-gray-300 shadow-xl rounded py-1 min-w-[120px]"
          style={{ top: contextMenu.y, left: contextMenu.x }}
        >
          <button onClick={() => { duplicateSelected(); setContextMenu(null); }} className="w-full text-left px-3 py-1.5 text-[10px] hover:bg-gray-100 flex items-center gap-2">
            <Sparkles size={12} /> Duplicate
          </button>
          <button onClick={() => { rotateSelected(); setContextMenu(null); }} className="w-full text-left px-3 py-1.5 text-[10px] hover:bg-gray-100 flex items-center gap-2">
            <RotateCw size={12} /> Rotate 45°
          </button>
          <button onClick={() => { deleteSelected(); setContextMenu(null); }} className="w-full text-left px-3 py-1.5 text-[10px] hover:bg-red-50 text-red-600 flex items-center gap-2">
            <Trash2 size={12} /> Delete
          </button>
        </div>
      )}

      {/* Video Generation Overlay */}
      <AnimatePresence>
        {isVideoGenerating && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-xl flex items-center justify-center p-8"
          >
            <div className="text-center space-y-8 max-w-md">
              <div className="relative">
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
                  className="w-32 h-32 border-4 border-t-[#8B4513] border-r-transparent border-b-[#D2691E] border-l-transparent rounded-full mx-auto"
                />
                <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white" size={32} />
              </div>
              <div className="space-y-2">
                <h2 className="text-3xl font-bold text-white">Generating 3D Walkthrough</h2>
                <p className="text-white/60">Our AI is rendering your construction plan into an immersive cinematic experience...</p>
              </div>
              <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 5 }}
                  className="h-full bg-gradient-to-r from-[#8B4513] to-[#D2691E]"
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ToolButton({ active, onClick, icon: Icon, title, shortcut }: { active: boolean, onClick: () => void, icon: any, title: string, shortcut?: string }) {
  return (
    <button 
      onClick={onClick}
      title={`${title}${shortcut ? ` (${shortcut})` : ''}`}
      className={`p-2 rounded transition-all group relative ${active ? 'bg-blue-100 text-blue-600 shadow-inner' : 'hover:bg-gray-200 text-gray-600'}`}
    >
      <Icon size={18} />
      <div className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50">
        {title} {shortcut && <span className="text-gray-400 ml-1">[{shortcut}]</span>}
      </div>
    </button>
  );
}

function TraySection({ title, icon: Icon, children }: { title: string, icon: any, children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(true);
  return (
    <div className="border-b border-gray-300">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-2 bg-[#F0F0F0] hover:bg-[#EAEAEA] transition-colors"
      >
        <div className="flex items-center gap-2">
          <Icon size={12} className="text-gray-600" />
          <span className="text-[10px] font-bold text-gray-700">{title}</span>
        </div>
        <span className="text-[10px] text-gray-500">{isOpen ? '▼' : '▶'}</span>
      </button>
      {isOpen && (
        <div className="p-3 bg-white">
          {children}
        </div>
      )}
    </div>
  );
}
