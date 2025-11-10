// @ts-ignore;
import React, { useCallback, useState } from 'react';
// @ts-ignore;
import { Button, useToast } from '@/components/ui';
// @ts-ignore;
import { Upload, Image as ImageIcon, Loader2 } from 'lucide-react';

export function ImageUploader({
  onImageUpload,
  className,
  onProcessingStart,
  onProcessingEnd
}) {
  const {
    toast
  } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const optimizeImage = useCallback((file, maxWidth = 1200, maxHeight = 1200, quality = 0.8) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const reader = new FileReader();
      reader.onload = e => {
        img.onload = () => {
          let width = img.width;
          let height = img.height;

          // 计算缩放比例
          if (width > maxWidth || height > maxHeight) {
            const ratio = Math.min(maxWidth / width, maxHeight / height);
            width *= ratio;
            height *= ratio;
          }

          // 创建canvas进行压缩
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);

          // 转换为blob
          canvas.toBlob(blob => {
            if (blob) {
              const optimizedFile = new File([blob], file.name, {
                type: 'image/jpeg',
                lastModified: Date.now()
              });
              resolve(optimizedFile);
            } else {
              reject(new Error('图片优化失败'));
            }
          }, 'image/jpeg', quality);
        };
        img.onerror = () => reject(new Error('图片加载失败'));
        img.src = e.target.result;
      };
      reader.onerror = () => reject(new Error('文件读取失败'));
      reader.readAsDataURL(file);
    });
  }, []);
  const handleFileChange = useCallback(async event => {
    const file = event.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast({
          title: '错误',
          description: '请选择图片文件',
          variant: 'destructive'
        });
        return;
      }

      // 检查文件大小
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        toast({
          title: '文件过大',
          description: '请选择小于10MB的图片',
          variant: 'destructive'
        });
        return;
      }
      setIsProcessing(true);
      onProcessingStart?.();
      try {
        let processedFile = file;

        // 对大图片进行优化
        if (file.size > 2 * 1024 * 1024) {
          // 大于2MB的图片进行优化
          processedFile = await optimizeImage(file);
          toast({
            title: '图片已优化',
            description: '大图片已自动优化尺寸以提高处理性能',
            variant: 'default'
          });
        }
        const reader = new FileReader();
        reader.onload = e => {
          onImageUpload(e.target.result);
          setIsProcessing(false);
          onProcessingEnd?.();
        };
        reader.onerror = () => {
          setIsProcessing(false);
          onProcessingEnd?.();
          toast({
            title: '读取失败',
            description: '无法读取图片文件',
            variant: 'destructive'
          });
        };
        reader.readAsDataURL(processedFile);
      } catch (error) {
        setIsProcessing(false);
        onProcessingEnd?.();
        toast({
          title: '处理失败',
          description: error.message,
          variant: 'destructive'
        });
      }
    }
  }, [onImageUpload, toast, optimizeImage, onProcessingStart, onProcessingEnd]);
  const handleDrop = useCallback(async event => {
    event.preventDefault();
    const files = event.dataTransfer.files;
    if (files.length > 0) {
      await handleFileChange({
        target: {
          files
        }
      });
    }
  }, [handleFileChange]);
  const handleDragOver = useCallback(event => {
    event.preventDefault();
  }, []);
  return <div className={className}>
      <div className="glass-card p-8 text-center hover:border-blue-400/30 transition-all duration-300 cursor-pointer group" onDrop={handleDrop} onDragOver={handleDragOver}>
        <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" id="image-upload" disabled={isProcessing} />
        <label htmlFor="image-upload" className="cursor-pointer">
          <div className="flex flex-col items-center space-y-4">
            {isProcessing ? <Loader2 className="h-12 w-12 text-blue-400 animate-spin" /> : <Upload className="h-12 w-12 text-blue-400/80 group-hover:text-blue-400 transition-colors" />}
            <div>
              <p className="text-lg font-medium text-white/90 group-hover:text-white transition-colors">
                {isProcessing ? '处理中...' : '拖拽图片到这里'}
              </p>
              <p className="text-sm text-white/60 group-hover:text-white/80 transition-colors">
                {isProcessing ? '正在优化图片尺寸' : '或者点击选择文件'}
              </p>
            </div>
            <Button type="button" className="gap-2 glass-input hover:bg-white/10 transition-colors" disabled={isProcessing}>
              {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImageIcon className="h-4 w-4" />}
              {isProcessing ? '处理中' : '选择图片'}
            </Button>
          </div>
        </label>
      </div>
    </div>;
}