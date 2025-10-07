import React from 'react';
import { cn } from '../../utils/cn.js';

const Modal = React.forwardRef(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('fixed inset-0 z-50 flex items-center justify-center p-4', className)}
    {...props}
  >
    {children}
  </div>
));
Modal.displayName = 'Modal';

const ModalOverlay = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300',
      className,
    )}
    {...props}
  />
));
ModalOverlay.displayName = 'ModalOverlay';

const ModalContent = React.forwardRef(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'relative bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-8 max-w-md w-full mx-4 transform transition-all duration-300 scale-100',
      className,
    )}
    {...props}
  >
    {children}
  </div>
));
ModalContent.displayName = 'ModalContent';

const ModalHeader = React.forwardRef(({ className, children, ...props }, ref) => (
  <div ref={ref} className={cn('flex flex-col space-y-2 text-center', className)} {...props}>
    {children}
  </div>
));
ModalHeader.displayName = 'ModalHeader';

const ModalTitle = React.forwardRef(({ className, children, ...props }, ref) => (
  <h2 ref={ref} className={cn('text-2xl font-bold text-slate-900', className)} {...props}>
    {children}
  </h2>
));
ModalTitle.displayName = 'ModalTitle';

const ModalDescription = React.forwardRef(({ className, children, ...props }, ref) => (
  <p ref={ref} className={cn('text-slate-600 leading-relaxed', className)} {...props}>
    {children}
  </p>
));
ModalDescription.displayName = 'ModalDescription';

const ModalFooter = React.forwardRef(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 mt-6', className)}
    {...props}
  >
    {children}
  </div>
));
ModalFooter.displayName = 'ModalFooter';

export {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalDescription,
  ModalFooter,
};
