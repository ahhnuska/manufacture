'use client';

import { useState, useCallback } from 'react';
import Image from 'next/image';
import { analyzeImage, AIModel } from '../../lib/ai';
import { FabricAnalysis } from '../../lib/types';

interface ImageAnalyzerProps {
  onAnalysisComplete: (analysis: FabricAnalysis) => void;
  isAnalyzing: boolean;
  setIsAnalyzing: (v: boolean) => void;
}

export default function ImageAnalyzer({ onAnalysisComplete, isAnalyzing, setIsAnalyzing }: ImageAnalyzerProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState<AIModel>('gemini');

  const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  }, []);

  const handleAnalyze = useCallback(async () => {
    if (!preview) return;

    setIsAnalyzing(true);
    setError(null);

    try {
      const result = await analyzeImage(preview, selectedModel);
      onAnalysisComplete(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed');
    } finally {
      setIsAnalyzing(false);
    }
  }, [preview, onAnalysisComplete, setIsAnalyzing, selectedModel]);

  return (
    <div className="space-y-5">
      <div className="flex gap-2 p-1 bg-zinc-100 dark:bg-zinc-800/60 rounded-xl w-fit">
        {[
          { id: 'gemini', label: 'Google Gemini', icon: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z' },
          { id: 'deepseek', label: 'DeepSeek', icon: 'M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' },
        ].map((model) => (
          <button
            key={model.id}
            type="button"
            onClick={() => setSelectedModel(model.id as AIModel)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
              selectedModel === model.id
                ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 shadow-sm'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
            }`}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d={model.icon} />
            </svg>
            {model.label}
          </button>
        ))}
      </div>

      <div className="border-2 border-dashed border-zinc-200 dark:border-zinc-700 rounded-2xl p-6 text-center hover:border-amber-400 dark:hover:border-amber-600 transition-colors duration-200">
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
          id="image-upload"
        />
        <label htmlFor="image-upload" className="cursor-pointer block">
          {preview ? (
            <div className="relative">
              <Image
                src={preview}
                alt="Preview"
                width={400}
                height={224}
                unoptimized
                className="max-h-56 w-auto mx-auto rounded-xl shadow-lg"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 hover:opacity-100 transition-opacity duration-200 rounded-xl">
                <span className="text-white font-medium">Click to change</span>
              </div>
            </div>
          ) : (
            <div className="py-10">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 flex items-center justify-center">
                <svg className="w-8 h-8 text-amber-600 dark:text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <p className="text-zinc-700 dark:text-zinc-300 font-medium mb-1">
                Click to upload product image
              </p>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                AI will analyze and estimate fabric requirements
              </p>
            </div>
          )}
        </label>
      </div>

      {preview && (
        <button
          onClick={handleAnalyze}
          disabled={isAnalyzing}
          className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-purple-600 to-violet-700 hover:from-purple-700 hover:to-violet-800 disabled:from-zinc-400 disabled:to-zinc-500 text-white font-medium rounded-xl shadow-lg shadow-purple-600/20 hover:shadow-purple-600/40 transition-all duration-300 disabled:cursor-not-allowed"
        >
          {isAnalyzing ? (
            <>
              <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Analyzing with {selectedModel === 'gemini' ? 'Gemini' : 'DeepSeek'}...
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Analyze with {selectedModel === 'gemini' ? 'Gemini' : 'DeepSeek'}
            </>
          )}
        </button>
      )}

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 rounded-xl flex items-center gap-3">
          <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {error}
        </div>
      )}

      <p className="text-xs text-zinc-500 dark:text-zinc-400">
        {selectedModel === 'gemini' ? (
          <>Using Google Gemini. Get API key at <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-amber-600 dark:text-amber-400 hover:underline">Google AI Studio</a></>
        ) : (
          <>Using DeepSeek. Ensure API key is set in .env.local</>
        )}
      </p>
    </div>
  );
}
