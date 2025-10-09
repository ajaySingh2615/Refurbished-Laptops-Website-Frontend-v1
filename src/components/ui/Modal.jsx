import React from 'react';
import { cn } from '../../utils/cn.js';

const ModalContext = React.createContext({ onClose: undefined });

const Modal = React.forwardRef(({ className, children, onClose, ...props }, ref) => {
  React.useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape' && onClose) onClose();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <ModalContext.Provider value={{ onClose }}>
      <div
        ref={ref}
        className={cn('fixed inset-0 z-50 flex items-center justify-center p-4', className)}
        {...props}
      >
        {children}
      </div>
    </ModalContext.Provider>
  );
});
Modal.displayName = 'Modal';

const ModalOverlay = React.forwardRef(({ className, ...props }, ref) => {
  const { onClose } = React.useContext(ModalContext);
  return (
    <div
      ref={ref}
      className={cn(
        'fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300',
        className,
      )}
      onClick={(e) => {
        if (e.target === e.currentTarget && onClose) onClose();
      }}
      {...props}
    />
  );
});
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

const ModalBody = React.forwardRef(({ className, children, ...props }, ref) => (
  <div ref={ref} className={cn('py-4', className)} {...props}>
    {children}
  </div>
));
ModalBody.displayName = 'ModalBody';

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
  ModalBody,
  ModalFooter,
};
