// @ts-ignore;
import React from 'react';
// @ts-ignore;
import { Label, Slider, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Tabs, TabsContent, TabsList, TabsTrigger, Switch } from '@/components/ui';
// @ts-ignore;
import { Settings, Palette, Filter, Zap, Sparkles } from 'lucide-react';

export function ParameterControls({
  enablePixelation,
  onEnablePixelationChange,
  pixelDensity,
  onPixelDensityChange,
  colorMode,
  onColorModeChange,
  pixelType,
  onPixelTypeChange,
  brightness,
  onBrightnessChange,
  contrast,
  onContrastChange,
  saturation,
  onSaturationChange,
  filterType,
  onFilterTypeChange,
  edgeDetection,
  onEdgeDetectionChange,
  artisticEffect,
  onArtisticEffectChange
}) {
  return <div className="space-y-6">
      <Tabs defaultValue="pixel" className="w-full">
        <TabsList className="grid grid-cols-5 mb-4 glass p-1">
          <TabsTrigger value="pixel" className="flex items-center gap-1 data-[state=active]:bg-white/10 data-[state=active]:text-blue-400 transition-all">
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">像素</span>
          </TabsTrigger>
          <TabsTrigger value="color" className="flex items-center gap-1 data-[state=active]:bg-white/10 data-[state=active]:text-blue-400 transition-all">
            <Palette className="h-4 w-4" />
            <span className="hidden sm:inline">色彩</span>
          </TabsTrigger>
          <TabsTrigger value="filter" className="flex items-center gap-1 data-[state=active]:bg-white/10 data-[state=active]:text-blue-400 transition-all">
            <Filter className="h-4 w-4" />
            <span className="hidden sm:inline">滤镜</span>
          </TabsTrigger>
          <TabsTrigger value="edge" className="flex items-center gap-1 data-[state=active]:bg-white/10 data-[state=active]:text-blue-400 transition-all">
            <Zap className="h-4 w-4" />
            <span className="hidden sm:inline">边缘</span>
          </TabsTrigger>
          <TabsTrigger value="artistic" className="flex items-center gap-1 data-[state=active]:bg-white/10 data-[state=active]:text-blue-400 transition-all">
            <Sparkles className="h-4 w-4" />
            <span className="hidden sm:inline">艺术</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pixel" className="space-y-4">
          <div className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-blue-400" />
            <h3 className="text-lg font-semibold text-white/90">像素化设置</h3>
          </div>

          <div className="flex items-center justify-between glass-card p-4">
            <Label htmlFor="enable-pixelation" className="text-sm font-medium text-white/90">
              启用像素化
            </Label>
            <Switch id="enable-pixelation" checked={enablePixelation} onCheckedChange={onEnablePixelationChange} />
          </div>

          {enablePixelation && <div className="space-y-4 border-l-2 border-blue-400/30 pl-4 ml-2">
              <div className="glass-card p-4">
                <Label htmlFor="pixel-density" className="text-sm font-medium text-white/90">
                  像素密度: {pixelDensity}px
                </Label>
                <Slider id="pixel-density" value={[pixelDensity]} onValueChange={value => onPixelDensityChange(value[0])} min={2} max={50} step={1} className="mt-2" />
                <p className="text-xs text-white/60 mt-1">
                  控制像素块的大小，数值越小细节越丰富
                </p>
              </div>

              <div className="glass-card p-4">
                <Label htmlFor="color-mode" className="text-sm font-medium text-white/90">
                  色彩模式
                </Label>
                <Select value={colorMode} onValueChange={onColorModeChange}>
                  <SelectTrigger id="color-mode" className="mt-1 glass-input">
                    <SelectValue placeholder="选择色彩模式" />
                  </SelectTrigger>
                  <SelectContent className="glass border-white/10">
                    <SelectItem value="rgb">RGB 全彩</SelectItem>
                    <SelectItem value="limited">限制色彩</SelectItem>
                    <SelectItem value="grayscale">灰度</SelectItem>
                    <SelectItem value="monochrome">单色</SelectItem>
                    <SelectItem value="sepia">复古棕褐色</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="glass-card p-4">
                <Label htmlFor="pixel-type" className="text-sm font-medium text-white/90">
                  像素类型
                </Label>
                <Select value={pixelType} onValueChange={onPixelTypeChange}>
                  <SelectTrigger id="pixel-type" className="mt-1 glass-input">
                    <SelectValue placeholder="选择像素类型" />
                  </SelectTrigger>
                  <SelectContent className="glass border-white/10">
                    <SelectItem value="square">方形像素</SelectItem>
                    <SelectItem value="circle">圆形像素</SelectItem>
                    <SelectItem value="diamond">菱形像素</SelectItem>
                    <SelectItem value="hexagon">六边形像素</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>}
        </TabsContent>

        <TabsContent value="color" className="space-y-4">
          <div className="flex items-center gap-2">
            <Palette className="h-5 w-5 text-blue-400" />
            <h3 className="text-lg font-semibold text-white/90">色彩调整</h3>
          </div>

          <div className="glass-card p-4">
            <Label htmlFor="brightness" className="text-sm font-medium text-white/90">
              亮度: {brightness}%
            </Label>
            <Slider id="brightness" value={[brightness]} onValueChange={value => onBrightnessChange(value[0])} min={-100} max={100} step={1} className="mt-2" />
          </div>

          <div className="glass-card p-4">
            <Label htmlFor="contrast" className="text-sm font-medium text-white/90">
              对比度: {contrast}%
            </Label>
            <Slider id="contrast" value={[contrast]} onValueChange={value => onContrastChange(value[0])} min={-100} max={100} step={1} className="mt-2" />
          </div>

          <div className="glass-card p-4">
            <Label htmlFor="saturation" className="text-sm font-medium text-white/90">
              饱和度: {saturation}%
            </Label>
            <Slider id="saturation" value={[saturation]} onValueChange={value => onSaturationChange(value[0])} min={-100} max={100} step={1} className="mt-2" />
          </div>
        </TabsContent>

        <TabsContent value="filter" className="space-y-4">
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-blue-400" />
            <h3 className="text-lg font-semibold text-white/90">滤镜效果</h3>
          </div>

          <div className="glass-card p-4">
            <Label htmlFor="filter-type" className="text-sm font-medium text-white/90">
              滤镜类型
            </Label>
            <Select value={filterType} onValueChange={onFilterTypeChange}>
              <SelectTrigger id="filter-type" className="mt-1 glass-input">
                <SelectValue placeholder="选择滤镜效果" />
              </SelectTrigger>
              <SelectContent className="glass border-white/10">
                <SelectItem value="none">无滤镜</SelectItem>
                <SelectItem value="blur">模糊</SelectItem>
                <SelectItem value="sharpen">锐化</SelectItem>
                <SelectItem value="invert">反色</SelectItem>
                <SelectItem value="vintage">复古</SelectItem>
                <SelectItem value="noise">噪点</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </TabsContent>

        <TabsContent value="edge" className="space-y-4">
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-blue-400" />
            <h3 className="text-lg font-semibold text-white/90">边缘检测</h3>
          </div>

          <div className="glass-card p-4">
            <Label htmlFor="edge-detection" className="text-sm font-medium text-white/90">
              边缘检测算法
            </Label>
            <Select value={edgeDetection} onValueChange={onEdgeDetectionChange}>
              <SelectTrigger id="edge-detection" className="mt-1 glass-input">
                <SelectValue placeholder="选择边缘检测" />
              </SelectTrigger>
              <SelectContent className="glass border-white/10">
                <SelectItem value="none">无边缘检测</SelectItem>
                <SelectItem value="sobel">Sobel算子</SelectItem>
                <SelectItem value="canny">Canny算子</SelectItem>
                <SelectItem value="laplacian">拉普拉斯算子</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </TabsContent>

        <TabsContent value="artistic" className="space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-blue-400" />
            <h3 className="text-lg font-semibold text-white/90">艺术效果</h3>
          </div>

          <div className="glass-card p-4">
            <Label htmlFor="artistic-effect" className="text-sm font-medium text-white/90">
              艺术风格
            </Label>
            <Select value={artisticEffect} onValueChange={onArtisticEffectChange}>
              <SelectTrigger id="artistic-effect" className="mt-1 glass-input">
                <SelectValue placeholder="选择艺术效果" />
              </SelectTrigger>
              <SelectContent className="glass border-white/10">
                <SelectItem value="none">无效果</SelectItem>
                <SelectItem value="oil-painting">油画效果</SelectItem>
                <SelectItem value="sketch">素描效果</SelectItem>
                <SelectItem value="cartoon">卡通化</SelectItem>
                <SelectItem value="pointillism">点彩画</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </TabsContent>
      </Tabs>
    </div>;
}