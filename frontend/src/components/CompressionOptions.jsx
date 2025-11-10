function CompressionOptions({ options, onOptionsChange }) {
  const handleChange = (field, value) => {
    onOptionsChange({
      ...options,
      [field]: value
    })
  }

  return (
    <div>
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">Compression Options</h2>
      
      <div className="space-y-6">
        {/* Quality Slider */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Quality: {options.quality}%
          </label>
          <input
            type="range"
            min="10"
            max="100"
            value={options.quality}
            onChange={(e) => handleChange('quality', parseInt(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>Low (10%)</span>
            <span>High (100%)</span>
          </div>
        </div>

        {/* Format Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Output Format
          </label>
          <select
            value={options.format}
            onChange={(e) => handleChange('format', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="jpeg">JPEG</option>
            <option value="png">PNG</option>
            <option value="webp">WebP</option>
          </select>
        </div>

        {/* Resolution Options */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Max Width (px)
            </label>
            <input
              type="number"
              placeholder="Original width"
              value={options.maxWidth}
              onChange={(e) => handleChange('maxWidth', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Max Height (px)
            </label>
            <input
              type="number"
              placeholder="Original height"
              value={options.maxHeight}
              onChange={(e) => handleChange('maxHeight', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Target Size */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Target Size (KB) <span className="text-gray-500 text-xs">(Optional)</span>
          </label>
          <input
            type="number"
            placeholder="e.g., 500 for 500KB"
            value={options.targetSize}
            onChange={(e) => handleChange('targetSize', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
          <p className="text-xs text-gray-500 mt-1">
            The system will automatically adjust quality to meet this target size
          </p>
        </div>
      </div>
    </div>
  )
}

export default CompressionOptions

