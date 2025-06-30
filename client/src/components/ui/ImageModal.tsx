"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { X, ZoomIn, ImageIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ImageModalProps {
  imageUrl: string;
  altText: string;
}

export default function ImageModal({ imageUrl, altText }: ImageModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleSafeClose = useCallback(
    (e?: React.MouseEvent | React.KeyboardEvent) => {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }
      setIsOpen(false);
    },
    []
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        handleSafeClose();
      }
    };

    const handleOutsideClick = (e: MouseEvent) => {
      if (isOpen && e.target instanceof HTMLElement) {
        const closestForm = e.target.closest("form");
        if (closestForm) {
          e.stopPropagation();
        }
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.addEventListener("click", handleOutsideClick, true);

      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("click", handleOutsideClick, true);
      document.body.style.overflow = "auto";
    };
  }, [isOpen, handleSafeClose]);

  if (imageError) {
    return (
      <div className="w-full h-full bg-gray-100 flex items-center justify-center">
        <ImageIcon className="h-12 w-12 text-gray-400" />
        <p className="text-gray-500 ml-2">Failed to load image</p>
      </div>
    );
  }

  return (
    <>
      <motion.div
        className="relative w-full h-full group cursor-pointer"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsOpen(true);
        }}
        role="button"
        tabIndex={0}
        aria-label="Click to view full image"
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            e.stopPropagation();
            setIsOpen(true);
          }
        }}
        whileHover={{ scale: 1.02 }}
        transition={{ duration: 0.2 }}
      >
        <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity rounded-md z-10">
          <div className="bg-white/90 p-3 rounded-full shadow-lg">
            <ZoomIn className="w-6 h-6 text-gray-800" />
          </div>
          <span className="absolute bottom-4 text-white bg-black/50 px-3 py-1 rounded-full text-sm font-medium">
            Click to view
          </span>
        </div>
        <Image
          src={imageUrl}
          alt={altText}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover"
          onError={() => setImageError(true)}
          priority
        />
      </motion.div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleSafeClose(e);
            }}
          >
            <motion.div
              className="absolute inset-0"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleSafeClose(e);
              }}
              role="button"
              tabIndex={0}
              aria-label="Close image"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  e.stopPropagation();
                  handleSafeClose(e);
                }
              }}
            ></motion.div>

            <motion.div
              className="relative bg-white/10 rounded-xl overflow-hidden max-w-5xl max-h-[90vh] w-full backdrop-blur-md border border-white/20 shadow-2xl"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
            >
              <motion.button
                className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/40 rounded-full z-10 backdrop-blur-sm text-white transition-colors duration-200"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleSafeClose(e);
                }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                type="button"
              >
                <X className="w-6 h-6" />
              </motion.button>

              <div className="relative w-full h-[80vh]">
                <motion.div
                  className="absolute inset-0"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                >
                  <Image
                    src={imageUrl}
                    alt={altText}
                    fill
                    className="object-contain"
                    sizes="(max-width: 768px) 100vw, 90vw"
                    onError={() => setImageError(true)}
                    quality={90}
                    priority
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                  />
                </motion.div>
              </div>

              <div
                className="absolute bottom-0 left-0 right-0 py-4 px-6 bg-gradient-to-t from-black/60 to-transparent"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
              >
                <motion.p
                  className="text-white text-center font-medium"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                >
                  {altText}
                </motion.p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
