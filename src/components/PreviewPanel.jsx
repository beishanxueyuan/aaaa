// @ts-ignore;
import React from 'react';
// @ts-ignore;
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
// @ts-ignore;
import { Image as ImageIcon } from 'lucide-react';

export function PreviewPanel({
  originalImage,
  pixelatedImage,
  isLoading
}) {
  return <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card className="glass-card border-white/10">
        <CardHeader className="flex flex-row items-center gap-2">
          <ImageIcon className="h-5 w-5 text-blue-400" />
          <CardTitle className="text-lg text-white/90">原图</CardTitle>
        </CardHeader>
        <CardContent>
          {originalImage ? <img src={originalImage} alt="原始图片" className="w-full h-auto rounded-lg border border-white/10" /> : <div className="flex items-center justify-center h-48 bg-white/5 rounded-lg border border-white/10">
              <p className="text-white/60">请上传图片</p>
            </div>}
        </CardContent>
      </Card>

      <Card className="glass-card border-white/10">
        <CardHeader className="flex flex-row items-center gap-2">
          <ImageIcon className="h-5 w-5 text-green-400" />
          <CardTitle className="text-lg text-white/90">处理效果</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? <div className="flex items-center justify-center h-48">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
            </div> : pixelatedImage ? <img src={pixelatedImage} alt="处理效果" className="w-full h-auto rounded-lg border border-white/10" /> : <div className="flex items-center justify-center h-48 bg-white/5 rounded-lg border border-white/10">
              <p className="text-white/60">等待处理</p>
            </div>}
        </CardContent>
      </Card>
    </div>;
}