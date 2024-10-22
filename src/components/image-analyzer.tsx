'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useTheme } from "next-themes"
import { Upload, Image as ImageIcon, Zap, Sun, Moon, AlertCircle, Download, ChevronLeft, ChevronRight } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { UserButton } from '@clerk/nextjs'
// @ts-ignore
import html2pdf from 'html2pdf.js'

const MAX_ANALYSES = 10
const RESET_INTERVAL = 24 * 60 * 60 * 1000
const DEFAULT_IMAGE = '/example.png' // Path to your default image

export function ImageAnalyzer() {
  const [view, setView] = useState<'initial' | 'upload'>('initial')
  const [image, setImage] = useState<string | null>(DEFAULT_IMAGE)
  const [result, setResult] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const { theme, setTheme } = useTheme()
  const [analysisCount, setAnalysisCount] = useState(0)
  const [lastImage, setLastImage] = useState<string | null>(null)
  const [lastResetTime, setLastResetTime] = useState<number>(0)
  const markdownRef = useRef<HTMLDivElement>(null)
  const [activeView, setActiveView] = useState<'image' | 'analysis'>('image')
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const storedCount = localStorage.getItem('analysisCount')
    const storedResetTime = localStorage.getItem('lastResetTime')

    if (storedCount && storedResetTime) {
      const parsedResetTime = parseInt(storedResetTime)
      const currentTime = Date.now()

      if (currentTime - parsedResetTime >= RESET_INTERVAL) {
        // Reset if 24 hours have passed
        setAnalysisCount(0)
        setLastResetTime(currentTime)
        localStorage.setItem('analysisCount', '0')
        localStorage.setItem('lastResetTime', currentTime.toString())
      } else {
        setAnalysisCount(parseInt(storedCount))
        setLastResetTime(parsedResetTime)
      }
    } else {
      // Initialize if no stored data
      const currentTime = Date.now()
      setLastResetTime(currentTime)
      localStorage.setItem('lastResetTime', currentTime.toString())
    }
  }, [])

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768) // Adjust this breakpoint as needed
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const handleImageUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        const imageData = reader.result as string
        setImage(imageData)
        setLastImage(imageData)
        localStorage.setItem('lastImage', imageData)
        setView('upload')
      }
      reader.readAsDataURL(file)
    }
  }, [])

  const useDefaultImage = useCallback(async () => {
    try {
      const response = await fetch(DEFAULT_IMAGE)
      const blob = await response.blob()
      const reader = new FileReader()
      reader.onloadend = () => {
        const base64String = reader.result as string
        setImage(base64String)
        setLastImage(base64String)
        localStorage.setItem('lastImage', base64String)
        setView('upload')
      }
      reader.readAsDataURL(blob)
    } catch (error) {
      console.error('Error loading default image:', error)
    }
  }, [])
  const analyzeImage = useCallback(async () => {
    if (analysisCount >= MAX_ANALYSES) return

    const currentTime = Date.now()
    if (currentTime - lastResetTime >= RESET_INTERVAL) {
      // Reset if 24 hours have passed
      setAnalysisCount(1)
      setLastResetTime(currentTime)
      localStorage.setItem('analysisCount', '1')
      localStorage.setItem('lastResetTime', currentTime.toString())
    } else {
      const newCount = analysisCount + 1
      setAnalysisCount(newCount)
      localStorage.setItem('analysisCount', newCount.toString())
    }

    setLoading(true)
    try {
      const response = await fetch('/api/ocr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error?.message || 'Failed to analyze image')
      }

      const data = await response.json()
      setResult(data.result)
      const newCount = analysisCount + 1
      setAnalysisCount(newCount)
      localStorage.setItem('analysisCount', newCount.toString())
    } catch (error) {
      console.error('Error analyzing image:', error)
      setResult(`Error analyzing image: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
    setLoading(false)
  }, [image, analysisCount, lastResetTime])

  const downloadAsPDF = () => {
    if (markdownRef.current) {
      const element = markdownRef.current
      const opt = {
        margin: 1,
        filename: 'analysis_result.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
      }
      html2pdf().set(opt).from(element).save()
    }
  }


  const suggestions = ['Try example image', 'Detect text in image', 'Describe image content']

  const toggleView = useCallback(() => {
    setActiveView(prev => prev === 'image' ? 'analysis' : 'image')
  }, [])

  const handleAnalyzeImage = useCallback(async () => {
    if (isMobile) {
      setActiveView('analysis')
    }
    await analyzeImage()
  }, [isMobile, analyzeImage])

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background to-secondary/10">
      <header className="p-4 border-b backdrop-blur-sm bg-background/50 sticky top-0 z-10">
        <div className="w-full mx-auto flex justify-between items-center">
          <Link href="/" className="flex items-center space-x-2">
            <Image
              src="/logo.png"
              alt="DOC OCR AI Logo"
              width={40}
              height={40}
              className="rounded-md"
            />
            <h1 className="text-2xl md:text-3xl font-bold">Docr.ai</h1>
          </Link>
          <UserButton />
        </div>
      </header>

      <main className="flex-grow flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-[120rem] mx-auto">
          {analysisCount >= MAX_ANALYSES && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg shadow-md"
            >
              <div className="flex items-center space-x-3">
                <AlertCircle className="w-6 h-6 text-amber-500" />
                <div>
                  <h3 className="font-semibold text-amber-800">Analysis Limit Reached</h3>
                  <p className="text-amber-700">
                    You've used all your free analyses. Please try again in {' '}
                    {Math.ceil((RESET_INTERVAL - (Date.now() - lastResetTime)) / (60 * 60 * 1000))} hours.
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          <AnimatePresence mode="wait">
            {view === 'initial' ? (
              <motion.div
                key="initial"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="text-center space-y-8"
              >
                <h2 className="text-3xl md:text-5xl font-bold mb-8 bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">What image can I analyze for you?</h2>
                <div className="relative group max-w-5xl mx-auto">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="image-upload"
                  />
                  <label
                    htmlFor="image-upload"
                    className="cursor-pointer bg-primary text-primary-foreground rounded-full p-4 md:p-6 text-center hover:bg-primary/90 transition-all duration-300 flex items-center justify-center space-x-3 group-hover:shadow-lg group-hover:scale-105"
                  >
                    <Upload className="w-6 h-6 md:w-8 md:h-8" />
                    <span className="text-base md:text-lg font-semibold">Upload an image to analyze</span>
                  </label>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8 max-w-5xl mx-auto">
                  {suggestions.map((suggestion, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      className="text-left py-4 md:py-6 rounded-xl hover:bg-primary/10 transition-colors duration-300"
                      onClick={useDefaultImage}
                    >
                      <ImageIcon className="w-6 h-6 md:w-8 md:h-8" />
                      {suggestion}
                    </Button>
                  ))}
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="upload"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="w-full"
              >
                <div className="grid md:grid-cols-2 gap-8 w-full">
                  <div className={`space-y-4 w-full ${activeView === 'image' ? 'block' : 'hidden md:block'}`}>
                    <Button onClick={() => setView('initial')} variant="outline" className="w-full rounded-xl py-4 md:py-6">
                      Choose a different image
                    </Button>
                    <div className="h-[calc(100vh-20rem)] w-full bg-muted rounded-2xl overflow-hidden border shadow-inner ">
                      {image && (
                        <img
                          src={image}
                          alt="Image to analyze"
                          className="w-full h-full"
                        />
                      )}
                    </div>
                  </div>
                  <div className={`overflow-auto space-y-4 w-full ${activeView === 'analysis' ? 'block' : 'hidden md:block'}`}>
                    <div className="w-full h-[calc(100vh-15.87rem)] overflow-auto border rounded-2xl p-4 md:p-6 bg-card shadow-inner">
                      {loading ? (
                        <div className="flex items-center justify-center h-full">
                          <Zap className="w-8 h-8 animate-pulse text-primary" />
                          <span className="ml-3 text-lg font-semibold">Analyzing...</span>
                        </div>
                      ) : (
                        <div ref={markdownRef} className='p-4'>
                          <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            components={{
                              h1: ({ node, ...props }) => <h1 className="text-3xl font-bold mt-6 mb-4" {...props} />,
                              h2: ({ node, ...props }) => <h2 className="text-2xl font-semibold mt-5 mb-3" {...props} />,
                              h3: ({ node, ...props }) => <h3 className="text-xl font-medium mt-4 mb-2" {...props} />,
                              h4: ({ node, ...props }) => <h4 className="text-lg font-medium mt-3 mb-2" {...props} />,
                              h5: ({ node, ...props }) => <h5 className="text-base font-medium mt-2 mb-1" {...props} />,
                              h6: ({ node, ...props }) => <h6 className="text-sm font-medium mt-2 mb-1" {...props} />,
                              ul: ({ node, ...props }) => <ul className="list-disc pl-5 mb-4" {...props} />,
                              ol: ({ node, ...props }) => <ol className="list-decimal pl-5 mb-4" {...props} />,
                              li: ({ node, ...props }) => <li className="mb-1" {...props} />,
                              table: ({ node, ...props }) => (
                                <table className="border-collapse border border-muted my-4 w-full" {...props} />
                              ),
                              thead: ({ node, ...props }) => (
                                <thead className="bg-muted/50" {...props} />
                              ),
                              th: ({ node, ...props }) => (
                                <th className="border border-muted px-4 py-2 font-bold" {...props} />
                              ),
                              td: ({ node, ...props }) => (
                                <td className="border border-muted px-4 py-2" {...props} />
                              ),
                              a: ({ node, ...props }) => (
                                <a
                                  className="text-blue-500 hover:underline"
                                  {...props}
                                />
                              ),
                            }}
                          >
                            {result}
                          </ReactMarkdown>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4 w-full mt-5">
                  <Button
                    onClick={handleAnalyzeImage}
                    disabled={!image || loading}
                    className="flex-grow rounded-xl py-4 md:py-6 text-base md:text-lg font-semibold"
                  >
                    {loading ? 'Analyzing...' : 'Analyze Image'}
                  </Button>
                  <Button
                    onClick={downloadAsPDF}
                    disabled={!result || loading}
                    className="rounded-xl py-4 md:py-6 text-base md:text-lg font-semibold"
                  >
                    <Download className="mr-2 h-4 w-4" /> Download PDF
                  </Button>
                  {isMobile && (
                    <Button onClick={toggleView} variant="outline" className="w-full rounded-xl py-4 md:py-6">
                      {activeView === 'image' ? 'View Analysis' : 'View Image'}
                    </Button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      <footer className="p-4 md:p-6 border-t backdrop-blur-sm bg-background/50">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-center text-xs md:text-sm text-muted-foreground">
          <span className="mb-2 md:mb-0 text-center md:text-left">
            Powered by Vision AI | Analyses left: {MAX_ANALYSES - analysisCount} |
            Resets in: {Math.ceil((RESET_INTERVAL - (Date.now() - lastResetTime)) / (60 * 60 * 1000))} hours
          </span>
          <div className="flex space-x-2 items-center">
            Made with ❤️ by <a href="https://alihamzakamboh.com" className="underline px-1 hover:text-primary transition-colors duration-200">ahkamboh</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
