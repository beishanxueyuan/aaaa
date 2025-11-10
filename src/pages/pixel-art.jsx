// @ts-ignore;
import React, { useState, useCallback, useRef, useEffect } from 'react';
// @ts-ignore;
import { Button, Card, CardContent, CardHeader, CardTitle, useToast } from '@/components/ui';
// @ts-ignore;
import { Download, RotateCcw, Wand2, AlertCircle } from 'lucide-react';

import { ImageUploader } from '@/components/ImageUploader';
import { ParameterControls } from '@/components/ParameterControls';
import { PreviewPanel } from '@/components/PreviewPanel';
export default function PixelArtConverter(props) {
  const {
    $w
  } = props;
  const {
    toast
  } = useToast();
  const canvasRef = useRef(null);
  const [originalImage, setOriginalImage] = useState(null);
  const [processedImage, setProcessedImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessingUpload, setIsProcessingUpload] = useState(false);
  const [performanceWarning, setPerformanceWarning] = useState('');
  const [parameters, setParameters] = useState({
    enablePixelation: true,
    pixelDensity: 10,
    colorMode: 'rgb',
    pixelType: 'square',
    brightness: 0,
    contrast: 0,
    saturation: 0,
    filterType: 'none',
    edgeDetection: 'none',
    artisticEffect: 'none'
  });

  // 添加 useEffect 来监听参数变化并重新处理图片
  useEffect(() => {
    if (originalImage) {
      processImage(originalImage);
    }
  }, [parameters, originalImage]);
  const checkPerformanceImpact = useCallback((width, height, effects) => {
    const totalPixels = width * height;
    let warning = '';

    // 高性能消耗的效果检查
    const highPerformanceEffects = ['sketch', 'pointillism', 'sobel', 'canny', 'laplacian'];
    const hasHighPerfEffect = highPerformanceEffects.some(effect => effects.includes(effect));
    if (totalPixels > 2000000) {
      // 200万像素以上
      warning = '大图片处理可能需要较长时间';
    } else if (totalPixels > 1000000 && hasHighPerfEffect) {
      warning = '复杂效果在大图片上处理较慢';
    }
    setPerformanceWarning(warning);
  }, []);
  const applyColorAdjustments = useCallback((data, width, height, ctx) => {
    const adjustedData = new Uint8ClampedArray(data);

    // 应用亮度调整
    if (parameters.brightness !== 0) {
      const brightnessFactor = parameters.brightness / 100;
      for (let i = 0; i < adjustedData.length; i += 4) {
        adjustedData[i] = Math.min(255, Math.max(0, adjustedData[i] + brightnessFactor * 255));
        adjustedData[i + 1] = Math.min(255, Math.max(0, adjustedData[i + 1] + brightnessFactor * 255));
        adjustedData[i + 2] = Math.min(255, Math.max(0, adjustedData[i + 2] + brightnessFactor * 255));
      }
    }

    // 应用对比度调整
    if (parameters.contrast !== 0) {
      const contrastFactor = (parameters.contrast + 100) / 100;
      for (let i = 0; i < adjustedData.length; i += 4) {
        adjustedData[i] = Math.min(255, Math.max(0, (adjustedData[i] - 128) * contrastFactor + 128));
        adjustedData[i + 1] = Math.min(255, Math.max(0, (adjustedData[i + 1] - 128) * contrastFactor + 128));
        adjustedData[i + 2] = Math.min(255, Math.max(0, (adjustedData[i + 2] - 128) * contrastFactor + 128));
      }
    }

    // 应用饱和度调整
    if (parameters.saturation !== 0) {
      const saturationFactor = parameters.saturation / 100 + 1;
      for (let i = 0; i < adjustedData.length; i += 4) {
        const r = adjustedData[i];
        const g = adjustedData[i + 1];
        const b = adjustedData[i + 2];
        const gray = 0.299 * r + 0.587 * g + 0.114 * b;
        adjustedData[i] = Math.min(255, Math.max(0, gray + (r - gray) * saturationFactor));
        adjustedData[i + 1] = Math.min(255, Math.max(0, gray + (g - gray) * saturationFactor));
        adjustedData[i + 2] = Math.min(255, Math.max(0, gray + (b - gray) * saturationFactor));
      }
    }
    return adjustedData;
  }, [parameters]);
  const applyFilter = useCallback((data, width, height, ctx) => {
    switch (parameters.filterType) {
      case 'blur':
        // 简单模糊效果
        ctx.filter = 'blur(2px)';
        break;
      case 'sharpen':
        // 优化锐化效果，使用更轻量的方式
        ctx.filter = 'contrast(1.1) brightness(1.05)';
        break;
      case 'invert':
        const imageData = ctx.getImageData(0, 0, width, height);
        const invertData = imageData.data;
        for (let i = 0; i < invertData.length; i += 4) {
          invertData[i] = 255 - invertData[i];
          invertData[i + 1] = 255 - invertData[i + 1];
          invertData[i + 2] = 255 - invertData[i + 2];
        }
        ctx.putImageData(imageData, 0, 0);
        break;
      case 'vintage':
        ctx.fillStyle = 'rgba(112, 66, 20, 0.3)';
        ctx.fillRect(0, 0, width, height);
        break;
      case 'noise':
        const noiseData = ctx.getImageData(0, 0, width, height);
        for (let i = 0; i < noiseData.data.length; i += 4) {
          const noise = Math.random() * 50 - 25;
          noiseData.data[i] = Math.min(255, Math.max(0, noiseData.data[i] + noise));
          noiseData.data[i + 1] = Math.min(255, Math.max(0, noiseData.data[i + 1] + noise));
          noiseData.data[i + 2] = Math.min(255, Math.max(0, noiseData.data[i + 2] + noise));
        }
        ctx.putImageData(noiseData, 0, 0);
        break;
    }
  }, [parameters]);
  const applyEdgeDetection = useCallback((data, width, height, ctx) => {
    if (parameters.edgeDetection === 'none') return;

    // 性能检查
    const activeEffects = [];
    if (parameters.edgeDetection !== 'none') activeEffects.push(parameters.edgeDetection);
    checkPerformanceImpact(width, height, activeEffects);

    // 限制处理尺寸以提高性能
    const maxSize = 1000;
    let scale = 1;
    if (width > maxSize || height > maxSize) {
      scale = Math.min(maxSize / width, maxSize / height);
      const tempCanvas = document.createElement('canvas');
      const tempCtx = tempCanvas.getContext('2d');
      tempCanvas.width = width * scale;
      tempCanvas.height = height * scale;
      tempCtx.drawImage(ctx.canvas, 0, 0, width * scale, height * scale);
      ctx.clearRect(0, 0, width, height);
      ctx.drawImage(tempCanvas, 0, 0, width, height);
    }
    const grayData = new Uint8ClampedArray(width * height);
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = (y * width + x) * 4;
        grayData[y * width + x] = 0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2];
      }
    }
    const edgeData = new Uint8ClampedArray(width * height * 4);
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        let gradient = 0;
        if (parameters.edgeDetection === 'sobel') {
          const gx = -grayData[(y - 1) * width + (x - 1)] - 2 * grayData[y * width + (x - 1)] - grayData[(y + 1) * width + (x - 1)] + grayData[(y - 1) * width + (x + 1)] + 2 * grayData[y * width + (x + 1)] + grayData[(y + 1) * width + (x + 1)];
          const gy = -grayData[(y - 1) * width + (x - 1)] - 2 * grayData[(y - 1) * width + x] - grayData[(y - 1) * width + (x + 1)] + grayData[(y + 1) * width + (x - 1)] + 2 * grayData[(y + 1) * width + x] + grayData[(y + 1) * width + (x + 1)];
          gradient = Math.sqrt(gx * gx + gy * gy);
        } else if (parameters.edgeDetection === 'canny') {
          // 简化的Canny边缘检测
          gradient = Math.abs(grayData[y * width + x] - grayData[y * width + (x + 1)]) + Math.abs(grayData[y * width + x] - grayData[(y + 1) * width + x]);
        }
        const edgeValue = Math.min(255, gradient);
        const idx = (y * width + x) * 4;
        edgeData[idx] = edgeValue;
        edgeData[idx + 1] = edgeValue;
        edgeData[idx + 2] = edgeValue;
        edgeData[idx + 3] = 255;
      }
    }
    const imageData = new ImageData(edgeData, width, height);
    ctx.putImageData(imageData, 0, 0);
  }, [parameters, checkPerformanceImpact]);
  const applyArtisticEffect = useCallback((data, width, height, ctx) => {
    if (parameters.artisticEffect === 'none') return;

    // 性能检查
    const activeEffects = [];
    if (parameters.artisticEffect !== 'none') activeEffects.push(parameters.artisticEffect);
    checkPerformanceImpact(width, height, activeEffects);

    // 限制处理尺寸以提高性能
    const maxSize = 1000;
    if (width > maxSize || height > maxSize) {
      const scale = Math.min(maxSize / width, maxSize / height);
      const tempCanvas = document.createElement('canvas');
      const tempCtx = tempCanvas.getContext('2d');
      tempCanvas.width = width * scale;
      tempCanvas.height = height * scale;
      tempCtx.drawImage(ctx.canvas, 0, 0, width * scale, height * scale);
      ctx.clearRect(0, 0, width, height);
      ctx.drawImage(tempCanvas, 0, 0, width, height);
    }
    switch (parameters.artisticEffect) {
      case 'oil-painting':
        // 简化的油画效果，使用滤镜代替复杂的像素处理
        ctx.filter = 'contrast(1.3) saturate(1.2) blur(1px)';
        break;
      case 'sketch':
        // 简化的素描效果 - 优化性能
        const sketchData = ctx.getImageData(0, 0, width, height);
        // 使用更高效的阈值处理
        for (let i = 0; i < sketchData.data.length; i += 4) {
          const avg = (sketchData.data[i] + sketchData.data[i + 1] + sketchData.data[i + 2]) / 3;
          const sketchValue = avg > 128 ? 255 : 0;
          sketchData.data[i] = sketchValue;
          sketchData.data[i + 1] = sketchValue;
          sketchData.data[i + 2] = sketchValue;
        }
        ctx.putImageData(sketchData, 0, 0);
        break;
      case 'cartoon':
        // 简化的卡通化效果
        ctx.filter = 'contrast(1.5) brightness(1.1) saturate(1.2)';
        break;
      case 'pointillism':
        // 优化的点彩画效果 - 减少点数提高性能
        const pointData = ctx.getImageData(0, 0, width, height);
        ctx.clearRect(0, 0, width, height);
        const step = Math.max(6, Math.floor(width / 100)); // 动态调整点数
        for (let y = 0; y < height; y += step) {
          for (let x = 0; x < width; x += step) {
            const idx = (y * width + x) * 4;
            if (idx < pointData.data.length) {
              ctx.fillStyle = `rgb(${pointData.data[idx]}, ${pointData.data[idx + 1]}, ${pointData.data[idx + 2]})`;
              ctx.beginPath();
              ctx.arc(x + step / 2, y + step / 2, step / 3, 0, 2 * Math.PI);
              ctx.fill();
            }
          }
        }
        break;
    }
  }, [parameters, checkPerformanceImpact]);
  const applyPixelation = useCallback((data, width, height, ctx) => {
    if (!parameters.enablePixelation) return;

    // 限制处理尺寸以提高性能
    const maxSize = 1200;
    if (width > maxSize || height > maxSize) {
      const scale = Math.min(maxSize / width, maxSize / height);
      const tempCanvas = document.createElement('canvas');
      const tempCtx = tempCanvas.getContext('2d');
      tempCanvas.width = width * scale;
      tempCanvas.height = height * scale;
      tempCtx.drawImage(ctx.canvas, 0, 0, width * scale, height * scale);
      ctx.clearRect(0, 0, width, height);
      ctx.drawImage(tempCanvas, 0, 0, width, height);
    }
    const pixelData = ctx.getImageData(0, 0, width, height);
    const pixelDataArray = pixelData.data;
    ctx.clearRect(0, 0, width, height);
    const {
      pixelDensity,
      colorMode
    } = parameters;
    for (let y = 0; y < height; y += pixelDensity) {
      for (let x = 0; x < width; x += pixelDensity) {
        const pixelIndex = (y * width + x) * 4;
        let r = pixelDataArray[pixelIndex];
        let g = pixelDataArray[pixelIndex + 1];
        let b = pixelDataArray[pixelIndex + 2];

        // 应用色彩模式
        switch (colorMode) {
          case 'limited':
            r = Math.round(r / 32) * 32;
            g = Math.round(g / 32) * 32;
            b = Math.round(b / 32) * 32;
            break;
          case 'grayscale':
            const gray = 0.299 * r + 0.587 * g + 0.114 * b;
            r = g = b = gray;
            break;
          case 'monochrome':
            const brightness = (r + g + b) / 3;
            r = g = b = brightness > 128 ? 255 : 0;
            break;
          case 'sepia':
            const tr = 0.393 * r + 0.769 * g + 0.189 * b;
            const tg = 0.349 * r + 0.686 * g + 0.168 * b;
            const tb = 0.272 * r + 0.534 * g + 0.131 * b;
            r = Math.min(255, tr);
            g = Math.min(255, tg);
            b = Math.min(255, tb);
            break;
        }
        ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;

        // 绘制像素
        switch (parameters.pixelType) {
          case 'square':
            ctx.fillRect(x, y, pixelDensity, pixelDensity);
            break;
          case 'circle':
            ctx.beginPath();
            ctx.arc(x + pixelDensity / 2, y + pixelDensity / 2, pixelDensity / 2, 0, 2 * Math.PI);
            ctx.fill();
            break;
          case 'diamond':
            ctx.beginPath();
            ctx.moveTo(x + pixelDensity / 2, y);
            ctx.lineTo(x + pixelDensity, y + pixelDensity / 2);
            ctx.lineTo(x + pixelDensity / 2, y + pixelDensity);
            ctx.lineTo(x, y + pixelDensity / 2);
            ctx.closePath();
            ctx.fill();
            break;
          case 'hexagon':
            ctx.beginPath();
            ctx.moveTo(x + pixelDensity / 2, y);
            ctx.lineTo(x + pixelDensity, y + pixelDensity / 4);
            ctx.lineTo(x + pixelDensity, y + 3 * pixelDensity / 4);
            ctx.lineTo(x + pixelDensity / 2, y + pixelDensity);
            ctx.lineTo(x, y + 3 * pixelDensity / 4);
            ctx.lineTo(x, y + pixelDensity / 4);
            ctx.closePath();
            ctx.fill();
            break;
        }
      }
    }
  }, [parameters]);
  const processImage = useCallback(async imageSrc => {
    if (!imageSrc) return;
    setIsLoading(true);
    setPerformanceWarning('');
    try {
      const img = new Image();
      img.onload = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');

        // 设置canvas尺寸
        canvas.width = img.width;
        canvas.height = img.height;

        // 性能检查
        const activeEffects = [];
        if (parameters.filterType !== 'none') activeEffects.push(parameters.filterType);
        if (parameters.edgeDetection !== 'none') activeEffects.push(parameters.edgeDetection);
        if (parameters.artisticEffect !== 'none') activeEffects.push(parameters.artisticEffect);
        if (parameters.enablePixelation) activeEffects.push('pixelation');
        checkPerformanceImpact(img.width, img.height, activeEffects);

        // 绘制原图
        ctx.drawImage(img, 0, 0);

        // 获取图像数据
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        // 清空canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // 应用色彩调整
        let processedData = data;
        if (parameters.brightness !== 0 || parameters.contrast !== 0 || parameters.saturation !== 0) {
          processedData = applyColorAdjustments(data, canvas.width, canvas.height, ctx);
        }

        // 重新绘制调整后的图像
        const adjustedImageData = new ImageData(processedData, canvas.width, canvas.height);
        ctx.putImageData(adjustedImageData, 0, 0);

        // 应用滤镜效果
        applyFilter(processedData, canvas.width, canvas.height, ctx);

        // 应用边缘检测
        applyEdgeDetection(processedData, canvas.width, canvas.height, ctx);

        // 应用艺术效果
        applyArtisticEffect(processedData, canvas.width, canvas.height, ctx);

        // 应用像素化处理（如果启用）
        applyPixelation(processedData, canvas.width, canvas.height, ctx);

        // 获取处理后的图片
        const finalImage = canvas.toDataURL('image/png');
        setProcessedImage(finalImage);
        setIsLoading(false);
      };
      img.onerror = () => {
        setIsLoading(false);
        toast({
          title: '处理失败',
          description: '无法加载图片',
          variant: 'destructive'
        });
      };
      img.src = imageSrc;
    } catch (error) {
      setIsLoading(false);
      toast({
        title: '处理错误',
        description: error.message,
        variant: 'destructive'
      });
    }
  }, [parameters, applyColorAdjustments, applyFilter, applyEdgeDetection, applyArtisticEffect, applyPixelation, toast, checkPerformanceImpact]);
  const handleImageUpload = useCallback(imageData => {
    setOriginalImage(imageData);
    processImage(imageData);
  }, [processImage]);
  const handleProcessingStart = useCallback(() => {
    setIsProcessingUpload(true);
  }, []);
  const handleProcessingEnd = useCallback(() => {
    setIsProcessingUpload(false);
  }, []);
  const handleParameterChange = useCallback(newParams => {
    setParameters(newParams);
  }, []);
  const handleDownload = useCallback(() => {
    if (!processedImage) {
      toast({
        title: '无法下载',
        description: '请先处理图片',
        variant: 'destructive'
      });
      return;
    }
    const link = document.createElement('a');
    link.download = 'processed-image.png';
    link.href = processedImage;
    link.click();
  }, [processedImage, toast]);
  const handleReset = useCallback(() => {
    setOriginalImage(null);
    setProcessedImage(null);
    setPerformanceWarning('');
    setParameters({
      enablePixelation: true,
      pixelDensity: 10,
      colorMode: 'rgb',
      pixelType: 'square',
      brightness: 0,
      contrast: 0,
      saturation: 0,
      filterType: 'none',
      edgeDetection: 'none',
      artisticEffect: 'none'
    });
  }, []);
  const handleAutoEnhance = useCallback(() => {
    if (!originalImage) {
      toast({
        title: '无法增强',
        description: '请先上传图片',
        variant: 'destructive'
      });
      return;
    }
    setParameters(prev => ({
      ...prev,
      brightness: 10,
      contrast: 15,
      saturation: 20,
      filterType: 'sharpen'
    }));
  }, [originalImage, toast]);
  return <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white/90 mb-2">高级图片处理器</h1>
          <p className="text-white/60">支持像素化、滤镜、色彩调整等多种图片处理功能</p>
        </div>

        {/* 性能警告提示 */}
        {performanceWarning && <div className="mb-6 glass-card p-4 border-yellow-400/30 bg-yellow-400/10">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-yellow-400" />
              <p className="text-yellow-400 text-sm">{performanceWarning}</p>
            </div>
          </div>}

        {/* 顶部操作区域 - 横向排列 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* 图片上传区域 */}
          <Card className="glass-card border-white/10">
            <CardHeader>
              <CardTitle className="text-white/90">图片操作</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <ImageUploader onImageUpload={handleImageUpload} onProcessingStart={handleProcessingStart} onProcessingEnd={handleProcessingEnd} />
              
              <div className="flex gap-3">
                <Button onClick={handleDownload} disabled={!processedImage || isLoading} className="flex-1 gap-2 glass-input hover:bg-white/10 transition-colors">
                  <Download className="h-4 w-4" />
                  导出图片
                </Button>
                <Button variant="outline" onClick={handleReset} disabled={isLoading} className="gap-2 glass-input hover:bg-white/10 transition-colors">
                  <RotateCcw className="h-4 w-4" />
                  重置
                </Button>
                <Button variant="secondary" onClick={handleAutoEnhance} disabled={!originalImage || isLoading} className="gap-2 glass-input hover:bg-white/10 transition-colors">
                  <Wand2 className="h-4 w-4" />
                  增强
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* 参数设置区域 */}
          <Card className="glass-card border-white/10">
            <CardHeader>
              <CardTitle className="text-white/90">处理设置</CardTitle>
            </CardHeader>
            <CardContent>
              <ParameterControls enablePixelation={parameters.enablePixelation} onEnablePixelationChange={value => handleParameterChange({
              ...parameters,
              enablePixelation: value
            })} pixelDensity={parameters.pixelDensity} onPixelDensityChange={value => handleParameterChange({
              ...parameters,
              pixelDensity: value
            })} colorMode={parameters.colorMode} onColorModeChange={value => handleParameterChange({
              ...parameters,
              colorMode: value
            })} pixelType={parameters.pixelType} onPixelTypeChange={value => handleParameterChange({
              ...parameters,
              pixelType: value
            })} brightness={parameters.brightness} onBrightnessChange={value => handleParameterChange({
              ...parameters,
              brightness: value
            })} contrast={parameters.contrast} onContrastChange={value => handleParameterChange({
              ...parameters,
              contrast: value
            })} saturation={parameters.saturation} onSaturationChange={value => handleParameterChange({
              ...parameters,
              saturation: value
            })} filterType={parameters.filterType} onFilterTypeChange={value => handleParameterChange({
              ...parameters,
              filterType: value
            })} edgeDetection={parameters.edgeDetection} onEdgeDetectionChange={value => handleParameterChange({
              ...parameters,
              edgeDetection: value
            })} artisticEffect={parameters.artisticEffect} onArtisticEffectChange={value => handleParameterChange({
              ...parameters,
              artisticEffect: value
            })} />
            </CardContent>
          </Card>
        </div>

        {/* 底部预览区域 */}
        <div className="lg:col-span-2">
          <Card className="glass-card border-white/10">
            <CardHeader>
              <CardTitle className="text-white/90">预览效果</CardTitle>
            </CardHeader>
            <CardContent>
              <PreviewPanel originalImage={originalImage} pixelatedImage={processedImage} isLoading={isLoading} />
            </CardContent>
          </Card>
        </div>

        {/* 隐藏的canvas用于图像处理 */}
        <canvas ref={canvasRef} className="hidden" />
      </div>
    </div>;
}