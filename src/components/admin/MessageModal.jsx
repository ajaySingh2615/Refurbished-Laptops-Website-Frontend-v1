import React from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalDescription,
  ModalFooter,
} from '../ui/Modal.jsx';
import { Button } from '../ui/Button.jsx';
import { cn } from '../../utils/cn.js';

const MessageModal = ({
  isOpen,
  onClose,
  type = 'success', // 'success', 'error', 'warning', 'info'
  title,
  message,
  buttonText = 'OK',
  onButtonClick,
  showCloseButton = true,
}) => {
  if (!isOpen) return null;

  const getIconAndColors = () => {
    switch (type) {
      case 'success':
        return {
          icon: (
            <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center mb-4 mx-auto shadow-lg shadow-emerald-500/25">
              <svg
                className="w-8 h-8 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
          ),
          titleColor: 'text-emerald-700',
          messageColor: 'text-emerald-600',
          buttonClass:
            'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 shadow-emerald-500/25 hover:shadow-emerald-500/30',
        };
      case 'error':
        return {
          icon: (
            <div className="w-16 h-16 bg-gradient-to-br from-red-400 to-rose-500 rounded-full flex items-center justify-center mb-4 mx-auto shadow-lg shadow-red-500/25">
              <svg
                className="w-8 h-8 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
          ),
          titleColor: 'text-red-700',
          messageColor: 'text-red-600',
          buttonClass:
            'bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 shadow-red-500/25 hover:shadow-red-500/30',
        };
      case 'warning':
        return {
          icon: (
            <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center mb-4 mx-auto shadow-lg shadow-amber-500/25">
              <svg
                className="w-8 h-8 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 19.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
          ),
          titleColor: 'text-amber-700',
          messageColor: 'text-amber-600',
          buttonClass:
            'bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 shadow-amber-500/25 hover:shadow-amber-500/30',
        };
      case 'info':
        return {
          icon: (
            <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center mb-4 mx-auto shadow-lg shadow-blue-500/25">
              <svg
                className="w-8 h-8 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          ),
          titleColor: 'text-blue-700',
          messageColor: 'text-blue-600',
          buttonClass:
            'bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 shadow-blue-500/25 hover:shadow-blue-500/30',
        };
      default:
        return {
          icon: (
            <div className="w-16 h-16 bg-gradient-to-br from-slate-400 to-gray-500 rounded-full flex items-center justify-center mb-4 mx-auto shadow-lg shadow-slate-500/25">
              <svg
                className="w-8 h-8 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          ),
          titleColor: 'text-slate-700',
          messageColor: 'text-slate-600',
          buttonClass:
            'bg-gradient-to-r from-slate-500 to-gray-600 hover:from-slate-600 hover:to-gray-700 shadow-slate-500/25 hover:shadow-slate-500/30',
        };
    }
  };

  const { icon, titleColor, messageColor, buttonClass } = getIconAndColors();

  const handleButtonClick = () => {
    if (onButtonClick) {
      onButtonClick();
    } else {
      onClose();
    }
  };

  return (
    <Modal>
      <ModalOverlay onClick={onClose} />
      <ModalContent className="relative overflow-hidden">
        {/* Animated background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/50 via-white/30 to-white/50 opacity-50"></div>

        {/* Content */}
        <div className="relative z-10">
          <ModalHeader>
            {icon}
            <ModalTitle className={cn('text-2xl font-bold', titleColor)}>{title}</ModalTitle>
            <ModalDescription className={cn('text-base', messageColor)}>{message}</ModalDescription>
          </ModalHeader>

          <ModalFooter>
            {showCloseButton && (
              <Button
                variant="outline"
                onClick={onClose}
                className="px-6 py-3 h-12 border-2 border-slate-200/60 hover:border-slate-300/60 hover:bg-slate-50/80 transition-all duration-300"
              >
                Close
              </Button>
            )}
            <Button
              onClick={handleButtonClick}
              className={cn(
                'px-8 py-3 h-12 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border-0 overflow-hidden group relative',
                buttonClass,
              )}
            >
              {/* Animated background effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-out"></div>

              {/* Button content */}
              <div className="relative flex items-center gap-2">
                <div className="flex items-center justify-center w-5 h-5 bg-white/20 rounded-lg group-hover:bg-white/30 transition-colors duration-300">
                  <svg
                    className="h-3 w-3 text-white group-hover:scale-110 transition-transform duration-300"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <span>{buttonText}</span>
              </div>
            </Button>
          </ModalFooter>
        </div>
      </ModalContent>
    </Modal>
  );
};

export default MessageModal;
