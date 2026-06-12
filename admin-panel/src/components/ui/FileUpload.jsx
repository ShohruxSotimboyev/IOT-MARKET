import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, X, Image as ImageIcon, File, Check, AlertCircle } from 'lucide-react'
import './FileUpload.css'

const FileUpload = ({ 
  onFileSelect, 
  accept = 'image/*', 
  multiple = false,
  maxSize = 5 * 1024 * 1024, // 5MB
  maxFiles = 5,
  className = ''
}) => {
  const [files, setFiles] = useState([])
  const [dragActive, setDragActive] = useState(false)
  const [error, setError] = useState('')
  const inputRef = useRef(null)

  const validateFile = (file) => {
    if (file.size > maxSize) {
      setError(`Fayl hajmi ${maxSize / 1024 / 1024}MB dan oshmasligi kerak`)
      return false
    }
    setError('')
    return true
  }

  const handleFiles = (newFiles) => {
    const validFiles = Array.from(newFiles).filter(validateFile)
    
    if (multiple) {
      const totalFiles = files.length + validFiles.length
      if (totalFiles > maxFiles) {
        setError(`Maksimum ${maxFiles} ta fayl yuklash mumkin`)
        return
      }
      setFiles(prev => [...prev, ...validFiles])
    } else {
      setFiles(validFiles.slice(0, 1))
    }
    
    if (onFileSelect) {
      onFileSelect(multiple ? validFiles : validFiles[0])
    }
  }

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    handleFiles(e.dataTransfer.files)
  }

  const handleChange = (e) => {
    handleFiles(e.target.files)
  }

  const removeFile = (index) => {
    const newFiles = files.filter((_, i) => i !== index)
    setFiles(newFiles)
    if (onFileSelect) {
      onFileSelect(multiple ? newFiles : newFiles[0] || null)
    }
  }

  const openFileDialog = () => {
    inputRef.current?.click()
  }

  const getFileIcon = (file) => {
    if (file.type.startsWith('image/')) {
      return <ImageIcon size={24} />
    }
    return <File size={24} />
  }

  const getFilePreview = (file) => {
    if (file.type.startsWith('image/')) {
      return URL.createObjectURL(file)
    }
    return null
  }

  return (
    <div className={`file-upload ${className}`}>
      <div
        className={`upload-zone ${dragActive ? 'drag-active' : ''} ${error ? 'error' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={openFileDialog}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleChange}
          className="hidden-input"
        />
        
        <div className="upload-content">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="upload-icon"
          >
            <Upload size={48} />
          </motion.div>
          <p className="upload-text">
            {dragActive ? 'Faylni tashlang' : 'Faylni bu yerga tashlang yoki tanlang'}
          </p>
          <p className="upload-hint">
            {accept === 'image/*' ? 'Rasm fayllari' : 'Fayllar'} • Maksimum {maxSize / 1024 / 1024}MB
          </p>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="upload-error"
          >
            <AlertCircle size={16} />
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      {files.length > 0 && (
        <div className="file-list">
          <AnimatePresence mode="popLayout">
            {files.map((file, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="file-item"
              >
                <div className="file-preview">
                  {getFilePreview(file) ? (
                    <img src={getFilePreview(file)} alt={file.name} />
                  ) : (
                    <div className="file-icon-placeholder">
                      {getFileIcon(file)}
                    </div>
                  )}
                </div>
                <div className="file-info">
                  <p className="file-name">{file.name}</p>
                  <p className="file-size">
                    {(file.size / 1024).toFixed(2)} KB
                  </p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    removeFile(index)
                  }}
                  className="remove-file-btn"
                >
                  <X size={16} />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}

export default FileUpload
