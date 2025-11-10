import { useState } from 'react'
import ImageUploader from './components/ImageUploader'
import CompressionOptions from './components/CompressionOptions'
import CompressionResult from './components/CompressionResult'
import './App.css'

function App() {
  const [selectedImage, setSelectedImage] = useState(null)
  const [compressionOptions, setCompressionOptions] = useState({
    quality: 80,
    maxWidth: '',
    maxHeight: '',
    format: 'jpeg',
    targetSize: ''
  })
  const [compressing, setCompressing] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)

  const handleImageSelect = (file) => {
    setSelectedImage(file)
    setResult(null)
    setError(null)
  }

  const handleOptionsChange = (options) => {
    setCompressionOptions(options)
  }

  const handleCompress = async () => {
    if (!selectedImage) {
      setError('Please select an image first')
      return
    }

    setCompressing(true)
    setError(null)
    setResult(null)

    try {
      const formData = new FormData()
      formData.append('image', selectedImage)
      formData.append('quality', compressionOptions.quality)
      formData.append('format', compressionOptions.format)
      
      if (compressionOptions.maxWidth) {
        formData.append('maxWidth', compressionOptions.maxWidth)
      }
      if (compressionOptions.maxHeight) {
        formData.append('maxHeight', compressionOptions.maxHeight)
      }
      if (compressionOptions.targetSize) {
        formData.append('targetSize', compressionOptions.targetSize)
      }

      const response = await fetch('/api/compress/image', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        // Check if response has content and is JSON
        const contentType = response.headers.get('content-type')
        let errorMessage = 'Compression failed'
        
        if (contentType && contentType.includes('application/json')) {
          try {
            const errorData = await response.json()
            errorMessage = errorData.error || errorData.message || errorMessage
          } catch (parseError) {
            // If JSON parsing fails, try to get text
            try {
              const text = await response.text()
              errorMessage = text || errorMessage
            } catch (textError) {
              errorMessage = `Server error: ${response.status} ${response.statusText}`
            }
          }
        } else {
          errorMessage = `Server error: ${response.status} ${response.statusText}`
        }
        
        throw new Error(errorMessage)
      }

      // Check if response is a file download (image)
      const contentType = response.headers.get('content-type')
      if (contentType && contentType.startsWith('image/')) {
        // Get the blob and create download link
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `compressed-${selectedImage.name}`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)

        setResult({
          success: true,
          message: 'Image compressed and downloaded successfully!'
        })
      } else {
        throw new Error('Unexpected response format from server')
      }
    } catch (err) {
      setError(err.message || 'Failed to compress image')
    } finally {
      setCompressing(false)
    }
  }

  const handleReset = () => {
    setSelectedImage(null)
    setResult(null)
    setError(null)
    setCompressionOptions({
      quality: 80,
      maxWidth: '',
      maxHeight: '',
      format: 'jpeg',
      targetSize: ''
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Image Compressor
          </h1>
          <p className="text-gray-600">
            Compress your images with customizable quality, size, and resolution settings
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-xl p-6 mb-6">
          <ImageUploader
            selectedImage={selectedImage}
            onImageSelect={handleImageSelect}
          />
        </div>

        {selectedImage && (
          <>
            <div className="bg-white rounded-lg shadow-xl p-6 mb-6">
              <CompressionOptions
                options={compressionOptions}
                onOptionsChange={handleOptionsChange}
              />
            </div>

            <div className="bg-white rounded-lg shadow-xl p-6 mb-6">
              <div className="flex gap-4">
                <button
                  onClick={handleCompress}
                  disabled={compressing}
                  className="flex-1 bg-indigo-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  {compressing ? 'Compressing...' : 'Compress Image'}
                </button>
                <button
                  onClick={handleReset}
                  disabled={compressing}
                  className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors"
                >
                  Reset
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                {error}
              </div>
            )}

            {result && (
              <CompressionResult result={result} />
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default App

